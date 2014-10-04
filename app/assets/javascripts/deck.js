$(window).ready(function(){

  var deck = {
    id: $("#deck h1").attr("deck-id"),
    exp: $("#deck h1").attr("expansion"),
    cards: {},
    name: $("#deck h1").text()
  }

  var Card = Backbone.Model.extend({
    initialize: function(card) {
      this.cid = card.multiverseid
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
      // deck.cards = _.map(data.cards, function(card){
      //   return new Card(card);
      // })
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

    var Player = function(deck, name) {
      this.name = name
      this.deck = deck
      this.hand = []
      this.life = 20
      this.cardsInPlay = []
    }

    Player.prototype = {
      draw: function(n) {
        this.hand = this.hand.concat(this.deck.draw(n))
      },

      shuffle: function() {
        this.deck.shuffleCards();
      },

      castCard: function() {

      },

      manaPool: function() {

      }
    }

    var Game = function(playerOne, playerTwo) {
      this.gameboard = []
      this.playerOne = playerOne
      this.playerTwo = playerTwo
    }

    Game.prototype = {
      placeLibrary: function() {
        this.playerOne.shuffle()
        this.playerTwo.shuffle()

        
      }
    }
    var playerOne = new Player(deck, "Matt")
    var playerTwo = new Player(otherDeck, "Wismer")
    var game = new Game(playerOne, playerTwo)

    game.showHands();

    debugger
  })
})