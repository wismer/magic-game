$(window).ready(function(){
  var collector = function (cards, category) {
    var items = {}

    var setKey = function(subcat) {
      if (!items[subcat]) { items[subcat] = {} }
    }

    var sorter = function(subset, cid) {
      var card = subset[0]
      var key = card.subCategory(category) // .bind(card)
      setKey(key)
      items[key][cid] = subset
    }

    _.each(cards, sorter)
    return items;
  }

  var Card = Backbone.Model.extend({
    initialize: function(card) {
      card: card
    },

    isBasicLand: function() {
      return this.get("rarity") === "Basic Land"
    },

    getType: function() {
      var types = this.get("types")
      return types.length > 1 ? types.join(" ") : types[0]
    },

    getColor: function() {
      var colors = this.get("colors")
      if (colors) {
        return colors.length > 1 ? "Multi" : colors[0]
      } else if (this.isArtifact()) {
        return "Artifact"
      } else {
        return "Land"
      }
    },

    getCost: function() {
      var cost = this.get("cmc")

      if (cost) {
        return cost
      } else {
        return "Land"
      }
    },

    subCategory: function(category) {
      if (category === "types") {
        return this.getType()
      } else if (category === "cmc") {
        return this.getCost()
      } else {
        return this.getColor()
      }
    },

    removeLink: function(section) {
      $("#" + section + " a[multiverse=" + this.get("multiverseid") +"]").remove()
    },

    tag: function(n, section) {
      link = this.get("link").attr("class", section)
      return $("<li><span>" + n + "</span>x </li>").append(this.get("link"))
    },

    hasFrequency: function(freq) {
      return this.get("rarity").toLowerCase() === freq;
    },

    isArtifact: function() {
      return this.has("cmc") && (!this.has("colors"))
    }
  })

  var Profile = Backbone.Model.extend({
    initialize: function() {
      name: name
    },

    insertToDB: function(profile) {
      var model = this;
      if (!model.has("foreignKey")) {
        $.ajax({
          url: "/profile",
          type: "POST",
          data: {name: model.get("name")},
          success: function(data, xhr, error) {
            model.set("foreignKey", parseInt(data))
            profile(data);
          }
        })
      }
    }
  })

  var Deck = Backbone.Model.extend({

  })

  var Draft = Backbone.Model.extend({
    swapCard: function(cid, side) {
      var player = this.get("player")
      var sideboard = this.get("sideboard")

      function removeCard (set) {
        var card = set[cid].pop()
        if (set[cid].length === 0) {
          delete set[cid]
        }

        return card
      }

      function addCard(card, set) {
        if (set[cid]) {
          set[cid].push(card)
        } else {
          set[cid] = [card]
        }
      }
      if (side === "player") {
        addCard(removeCard(player), sideboard)
      } else {
        addCard(removeCard(sideboard), player)
      }
    }
  })

  var randomizeBooster = function(booster, list) {
    function addBasicLands () {
      var lands = []
      var basic = _.filter(list.models, function(card){
        return card.isBasicLand()
      })

      _.each(_.uniq(basic), function(card){
        for (i = 0; i < 20; i++) { lands.push(card) }
      })

      return lands
    }

    function isNormal(freq) {
      return freq === "uncommon" || freq === "rare" || freq === "common";
    }

    booster = _.filter(_.flatten(booster), function(freq){ return isNormal(freq) })
    // just in case the booster has an array as an element. ex. ['uncommon', ['mythic rare', 'rare']] or has the marketing card
    var n = booster.length === 15 ? 6 : 10
    var cards = []
    i = 0
    for (i = 0; i < n; i++) {
      var random = _.map(booster, function(b){
        while (typeof b === "string") {
          card = list.sample()
          if (card.hasFrequency(b)) {
            return card;
          }
        }
      })
      cards.push(random)
    }

    var toObj = function(obj) {
      cards = _.flatten(cards).concat(addBasicLands())
      _.each(cards, function(card){
        if (obj[card.cid]) {
          obj[card.cid].push(card)
        } else {
          obj[card.cid] = [card]
        }
      })
      return obj;
    }
    return toObj({});
  }

  var DraftView = Backbone.View.extend({
    el: $("#types option:selected"),
    events: {
      "click #types": "doThisThing"
    },

    render: function(clickLink) {
      var category = $("#types option:selected").val()
      var player = collector(this.model.get("player"), category)
      var sideboard = collector(this.model.get("sideboard"), category)
      var cardLink = function(card, n, side) {
        var attr = "<a href='#' class='" + side + "' cid='" + card.cid + "' img-id='" + card.get("multiverseid") + "'>"
        return "<li>" + attr + "<span>" + n + "</span>x " + card.get("name") + "</a></li>"
      }

      function renderSide(side, section) {
        var side = _.map(side, function(cards,subcat){
          links = _.map(cards, function(card,cid){
            return cardLink(card[0], card.length, section)
          }).join("\n")
          return "<h1>" + subcat + "</h1>" + links;
        })

        $("#" + section).html(side)
      }

      renderSide(player, "player")
      renderSide(sideboard, "sideboard")
      clickLink();
    }
  })

  var CardList = Backbone.Collection.extend({
    model: Card
  })

  var expansionList = function(list) {
    var expansions = _.map(list, function(exp){
      return "<option code='" + exp.code + "'>" + exp.name + "</option>"
    }).join("\n")
    $(".deckSelection").html(expansions);
  };

  var createDraft = function(set) {
    var list = new CardList(set.cards);
    return randomizeBooster(set.booster, list);
  };

  var request = function(mtg) {
    var result;
    $.ajax({
      url: "http://mtgjson.com/json/" + mtg.name + ".json",
      async: false,
      dataType: "json",
      success: function(json) {
        result = json
      }
    })

    if (mtg.name === "SetList") {
      expansionList(result);
    } else {
      return createDraft(result);
    }
  };

  request({name: "SetList"});

  $(".deckSelection").on("change", function(){
    var expansion = $(".deckSelection option:selected").attr("code")
    var cards = request({name: expansion})
    var draft = new Draft({player: {}, sideboard: cards, expansion: expansion});
    var draftView = new DraftView({model: draft})

    function clickLink () {
      $("a").on("click", function(e){
        e.preventDefault();
        draft.swapCard($(this).attr("cid"), $(this).attr("class"))
        draft.trigger("change")
      })

      $("a").on("mouseenter", function(){
        var id = $(this).attr("img-id")
        $(".img").html("<img src='http://mtgimage.com/multiverseid/" + id + ".jpg'>")
      })

      $("#profile button").on("click", function(e){
        function toNamedParams(playerCards) {
          return _.map(playerCards, function(c,k){
            return {
              multiverseid: c[0].get("multiverseid"),
              card_count: c.length
            }
          })
        }

        e.preventDefault();
        draft.off("change")
        draft.set({name: $("#profile input").val()})
        var cards = toNamedParams(draft.get("player"))
        var deck = new Deck({
          deck: {
            name: draft.get("name"),
            expansion: draft.get("expansion")
          },

          cards: cards
        })
        Backbone.sync("create", deck, {url: "/decks"})
      })
    };

    draft.on("change", function(){
      draftView.render(clickLink);
    });

    draft.trigger("change")


    $("#types").on("change", function(e){
      draft.trigger("change")
    });
  })
})
