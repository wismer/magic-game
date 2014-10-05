$(window).ready(function(){

  var deck = {
    id: $("#deck h1").attr("deck-id"),
    exp: $("#deck h1").attr("expansion"),
    cards: {},
    name: $("#deck h1").text()
  }

  var manaSymbol = function(mana, line) {
    function convert(sym) {
      var symLink;
      if (sym === "T" || sym === "Q") {
        symLink = "'http://mtgimage.com/symbol/other/"
      } else {
        symLink = "'http://mtgimage.com/symbol/mana/"
      }
      return "<span class='mana'><img src=" + symLink + sym + "/64.gif' height='15' width='15'/></span>"
    }

    var symbols = _.map(mana, function(m){
      return convert(m[1])
    }).join("")

    return line.replace(mana.join(""), symbols)
  }

  var Card = Backbone.Model.extend({
    initialize: function(card) {
      this.cid = card.multiverseid
      this.formatText(card.text, card.name)
    },

    img: function() {
      var attrs = this.attributes
      var tag = "<li><img src='http://mtgimage.com/multiverseid/" + this.cid + ".jpg' "
      return tag + "multiverseid='" + this.cid + "' height='180' width='120' /></li>"
    },

    formatText: function(text, name) {
      if (text) {

        var textLines = text.split("\n")
        var result = "";
        var result = _.map(textLines, function(line){
          var mana = line.match(/\{(\w)\}/g)
          if (mana !== null) {
            line = manaSymbol(mana, line);
          }

          return line
        }).join("\n")

        this.set({text: result})
      }
    }
  })

  $.ajax({
    url: "http://mtgjson.com/json/" + deck.exp + ".json",
    dataType: "json",
    data: { deck_id: deck.exp },
    async: false,
    success: function(data, status, xhr) {
      _.each(data.cards, function(card){
        card = new Card(card);
        deck.cards[card.cid] = card
      })
    }
  })

  var mergeCards = function(cardData) {
    var cards = {};

    function add(n, card) {
      var count = []
      for(i = 0; i < n; i++) {
        count.push(card);
      }

      return count;
    }

    _.each(cardData, function(d){
      var card = deck.cards[d.multiverseid]
      cards[card.cid] = add(d.card_count, card)
    })

    return cards
  }


  var collectCards = function() {
    return $.getJSON("/decks/" + deck.id + "/cards", { deck_id: deck.id })
  }

  var Deck = Backbone.Model.extend({
    initialize: function() {
      var cards = this.get("cards")
      var collection = []
      _.each(cards, function(card,k){
        collection = collection.concat(card)
      })

      this.set({library: collection})
    },

    shuffleCards: function(hand, graveyard, game) {
      var library = this.get("library")
      var shuffled = new Array(library.length)
      while (library.length > 0) {
        i = Math.floor(Math.random() * shuffled.length)
        if (typeof shuffled[i] !== "object") {
          shuffled[i] = library.pop()
        }
      }

      this.set({library: shuffled})
    },

    draw: function(n) {
      var library = this.get('library')
      var hand = []
      for(i = 0; i < n; i++) {
        card = library.pop()
        hand.push(card)
      }

      return hand
    }
  })

  collectCards().done(function(data){
    var cards = mergeCards(data)

    var deck = new Deck({
      cards: cards
    })

    var otherDeck = new Deck({
      cards: cards
    })

    var displayHand = function(player) {
      var hand = _.map(player.hand, function(card){
        return card.img()
      }).join("\n")

      player.el.children("div.hand").html(hand)

      $("li img")
        .mouseenter(function(){
          var that = $(this)
          var card = _.find(player.hand, function(c){
            { return c.cid === parseInt(that.attr("multiverseid")) }
          })
          $("div.img-zoom").html("<img src='" + that.attr("src") + "' height='300' width='260'>")
          if (card.has("text")) {
            $("div.card-text").html(card.get("text"))
          }
        })
        .mouseleave(function(){
          $("div.img-zoom").html();
        })
    }

    var Player = function(deck, name, n) {
      this.name = name
      this.deck = deck
      this.hand = []
      this.life = 20
      this.cardsInPlay = []
      this.el = $("#player-" + n)
    }

    Player.prototype = {
      draw: function(n) {
        this.hand = this.hand.concat(this.deck.draw(n))
        displayHand(this)
      },

      shuffle: function() {
        this.deck.shuffleCards();
      },

      castCard: function() {

      },

      manaPool: function() {

      },

      turn: function() {
        this.el.children("div.hand img").on("click", function(){

        })
      }
    }

    var Game = function(playerOne, playerTwo) {
      this.gameboard = []
      this.playerOne = playerOne
      this.playerTwo = playerTwo
    }

    Game.prototype = {
      placeLibraries: function() {
        this.playerOne.shuffle()
        // this.playerTwo.shuffle()

        function img(player, src) {
          return $("<img>",{
            src: src || "http://mtgimage.com/card/cardback.jpg",
            height: 180,
            width: 120,
            name: player.el.attr('id')
          })
        }

        $("#player-one div.deck").append(img(playerOne))
        $("#player-two div.deck").append(img(playerTwo))

        this.playerOne.draw(7)
        // this.playerTwo.draw(7)
      }
    }

    var playerOne = new Player(deck, "Matt", "one")
    var playerTwo = new Player(otherDeck, "Wismer", "two")
    var game = new Game(playerOne, playerTwo)

    game.placeLibraries();
    $("div.deck").on("click", function(){})
  })
})