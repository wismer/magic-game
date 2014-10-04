requirejs.config({
  baseUrl: "js/lib",
  paths: {
    app: "../app",
    jquery: "//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min",
    d3: "http://d3js.org/d3.v3.min",
    underscore: "../lib/underscore-min",
    backbone: "../lib/backbone-min",
    handlebars: "../lib/handlebars-v2.0.0"
  }
})

requirejs(['jquery', 'd3', 'underscore', 'backbone', 'handlebars'], function($, d3, _, backbone, Handlebars){

  var spellTypes = ["Creature", "Instant", "Enchantment", "Sorcery", "Land", "Artifact", "Tribal", "Artifact Creature"]
  var cardColors = {White: "W", Black: "B", Red: "R", Blue: "U", Green: "G", Artifact: null, Multi: null }
  var cardSymbols = { W: "White", B: "Black", R: "Red", U: "Blue", G: "Green" }


  var collector = function (set, category) {
    var items = {}
    var cards = set.get("cards")

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


  var cmcSymbol = function(n) {
    return "<img src='http://mtgimage.com/symbol/mana/" + n + ".svg' height=50 width=50>"
  }

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

  var Draft = Backbone.Model.extend({
    initialize: function(draft) {
      cards: draft.cards
      type: draft.type
    },

    display: function(category) { 
      var categories = collector(this, category)
      var section = $("#" + this.get("type"))
      // var source = $("#hello").html()
      // var template = Handlebars.compile(source)
      // var tempData = {subtitles: categories}
      // debugger
      // $("body").html(template(tempData))

      _.each(categories, function(subcat, cat){
        var subsection = $("<div>", {class: cat}).appendTo(section)
        subsection.append("<h1>" + cat + "</h1>")
        _.each(subcat, function(subset, cid){
          card = subset[0]
          $("." + cat).append(card.tag(subset.length, section.attr("id")))
        })
      })
    },

    teardown: function() {
      $("#" + this.get("type")).empty();
    },

    addCard: function(card) {
      var cards = this.get("cards")
      if (cards[card.cid]) {
        cards[card.cid].push(card)
      } else {
        cards[card.cid] = [card]
      }
    },

    removeCard: function(cid) {
      var cards = this.get("cards")
      var card = cards[cid].pop()
      if (cards[cid].length === 0) {
        delete cards[cid]
        // card.removeLink(this.get("type"));
      }
      return card;
    }
  })

  var List = Backbone.Collection.extend({
    model: Card
  })

  var getList = function (name, setList) {
    $.getJSON("http://mtgjson.com/json/" + name, function(data){
    }).done(function(data){
      setList(data);
    })
  }

  var loadList = function() {
    getList("SetList.json", function(list){
      $("#deckSelection option:selected").remove()
      _.each(list, function(set){
        $("#deckSelection").append("<option name='" + set["code"] + "'>" + set["name"] + "</option>")
      })
    })
  }

  var randomizeBooster = function(booster, n, list) {
    cards = []
    i = 0
    for (i = 0; i < n; i++) {
      random = _.map(booster, function(b){
        while (typeof b === "string") {
          card = list.sample()
          if (card.hasFrequency(b)) {
            return card;
          }
        }
      })

      cards.push(random)
    }


    cards = _.flatten(cards)
    return sortCards(cards);
  }

  var sortCards = function(cards) {
    var obj = {}

    _.each(cards, function(card){
      if (obj[card.cid]) {
        obj[card.cid].push(card)
      } else {
        obj[card.cid] = [card]
      }
    })

    return obj;
  }

  var setView = function(player, sideboard) {
    var category = $("#types option:selected").val()

    var rebuild = function() {
      _.each([player, sideboard], function(set){
        set.teardown()
        set.display(category)
      })
    }

    debugger

    var moveCard = function(cid, klass) {
      if (klass === "sideboard") {
        card = sideboard.removeCard(cid);
        player.addCard(card)
      } else {
        card = player.removeCard(cid);
        sideboard.addCard(card)
      }

      rebuild();
    }


    rebuild();

    $("a").on("mouseenter", function(e){
      var id = $(this).attr("multiverse")
      tag = $("<img>", {src: "http://mtgimage.com/multiverseid/" + id + ".jpg", height: 320, width: 240})
      $("div.img").empty()
      $("div.img").append(tag)
    })

    $("a").on("click", function(e){
      e.preventDefault();
      moveCard($(this).attr("multiverse"), $(this).attr("class"))
    })
  }

  // var Carousel = Backbone.View.extend({
  //   tagName: "li",
  //   className: "carousel",
  //   events: {
  //     "click .move-right",
  //     "click .move-left"
  //   }
  // })


  $("#profile button").on("click", function(e){
    profileName = $("#profile input").val()
    var profile = new Profile({name: profileName})
    loadList();


    profile.insertToDB(function(key){
      var cardSet;
      $("#deckSelection").on("change", function(e){
        e.preventDefault();
        set = $("#deckSelection option:selected").attr("name");

        var request = function() {
          return $.getJSON("http://mtgjson.com/json/" + set + ".json")
        }

        var list = new List();

        request().done(function(data){
          _.each(data.cards, function(card){
            card.link = $("<a>", {href: "#", multiverse: card.multiverseid, text: card.name })
            card = new Card(card)
            card.cid = card.get("multiverseid")
            list.add(card)
          })

          var emptyCards = function(cards) {
            _.each(cards, function(card){ card = []})
          }

          var set = randomizeBooster(data.booster, 6, list)
          var sideboard = new Draft({cards: set, type: 'sideboard'})
          var player = new Draft({cards: {}, type: 'player'})

          sideboard.on({
            "change:cards": alert("FUCK")
          })

          setView(player, sideboard)
          // $("#types").on("change", function(e){
          //   e.preventDefault();
          //   setView(player, sideboard)
          // })
        })
      })
    })
  })
})
