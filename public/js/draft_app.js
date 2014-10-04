requirejs.config({
  baseUrl: "js/lib",
  paths: {
    app: "../app",
    jquery: "//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min",
    d3: "http://d3js.org/d3.v3.min",
    underscore: "../lib/underscore-min",
    backbone: "../lib/backbone-min"
  }
})

requirejs(['jquery', 'd3', 'underscore', 'backbone'], function($, d3, _, backbone){
  var spellTypes = ["Creature", "Instant", "Enchantment", "Sorcery", "Land", "Tribal"]
  var cardColors = {White: "W", Black: "B", Red: "R", Blue: "U", Green: "G"}
  var cardSymbols = { W: "White", B: "Black", R: "Red", U: "Blue", G: "Green" }


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

  // var CardSet = Backbone.Model.extend({
  //   initialize: function (set) {
  //     code: set.code
  //     year: set.year
  //   },

  //   convertToDraft: function(cards) {
  //     this.set("cards", cards)
  //   },

  //   displayCosts: function(cmcSymbol) {
  //     cards = this.convertedManaCost();
  //     $("div.card-placeholder div").remove()
  //     $("div.card-placeholder").append("<div class='costs'><h3>Converted Mana Cost</h3></div>")
  //     _.each(_.keys(cards), function(n){
  //       $("div.costs").append(cmcSymbol(n))
  //       _.each(cards[n], function(c){
  //         $("div.costs").append(c.imgName("sideboard"))
  //       })
  //     })
  //   },

  //   displayColors: function() {
  //     cards = this.uniqueCards();

  //     colors = _.map(_.keys(cardColors), function(color){ return color.toLowerCase() })
  //     $("div.card-placeholder").empty()

  //     colors.push("artifact")
  //     colors.push("multi-colored")

  //     _.each(colors, function(color){
  //       $("div.card-placeholder").append("<div id='" + color + "'><h3>" + color + "</h3></div>")
  //     })

  //     _.each(cards, function(card){
  //       if (card.isMonoColor()){
  //         color = card.get("colors")[0]
  //         $("#" + color.toLowerCase()).append(card.imgName("sideboard"))
  //       } else if (card.isArtifact()) {
  //         $("#artifact").append(card.imgName("sideboard"))
  //       } else {
  //         $("#multi-colored").append(card.imgName("sideboard"))
  //       }
  //     })
  //   },

  //   uniqueCards: function() {
  //     cards = this.get("draft")
  //     uniqueSet = [];

  //     _.each(cards, function(card){
  //       if (!_.contains(uniqueSet, card)) { uniqueSet.push(card) }
  //     })

  //     return uniqueSet;
  //   },

  //   displayTypes: function() {
  //     cards = this.uniqueCards();
  //     $("div.card-placeholder").empty()
  //     _.each(spellTypes, function(type){
  //       $("div.card-placeholder").append("<div id='" + type.toLowerCase() + "'><h3>" + type + "</h3></div>")
  //       _.each(cards, function(card){
  //         if (card.isOfType(type)) { $("#" + type.toLowerCase()).append(card.imgName("sideboard")) }
  //       })
  //     })
  //   },

  //   multiColorCards: function() {
  //     return _.filter(this.get("cards"), function(card){ return card.isMulti(); })
  //   },

  //   artifactCards: function() {
  //     return _.filter(this.get("cards"), function(card){ return card.isSpell("Artifact") } )
  //   },

  //   convertedManaCost: function() {
  //     tally = {}

  //     if (this.has("draft")) {
  //       cards = this.uniqueCards();
  //     } else {
  //       cards = this.get("cards")
  //     }


  //     _.each(cards, function(card) {
  //       if (card.has("cmc")) {
  //         cost = card.get("cmc")

  //         if (tally.hasOwnProperty(cost)) {
  //           tally[cost].push(card);
  //         } else {
  //           tally[cost] = [card]
  //         }
  //       }
  //     })

  //     return tally;
  //   },

  //   subtypeCount: function() {
  //     tally = {}
  //     keywords = this.keyWords()
  //     _.each(keywords, function(word){
  //       if (tally.hasOwnProperty(word)) {
  //         tally[word] += 1;
  //       } else {
  //         tally[word] = 1;
  //       }
  //     })

  //     return tally;
  //   },

  //   subtypeLinks: function(makeLink) {
  //     cards = this.subtypeCount()
  //     keys = _.keys(cards)
  //     _.each(keys, function(key){
  //       makeLink(key, key + ": " + cards[key])
  //     })
  //   },

  //   costLayout: function() {
  //     var cards = this.get("cards")
  //     colors = _.map(colors, function(color){
  //       return _.filter(cards, function(card){
  //         return card.get("colors") === color;
  //       })
  //     })

  //     var cost = 0

  //     _.each(cards, function(card){
  //       if (card.has("cmc")) {
  //         if (cost <= card.get("cmc")) {
  //           cost = card.get("cmc")
  //         }
  //       }
  //     })
  //   },

  //   initializeCards: function() {
  //     cards = this.get("cards")

  //     cards = _.map(cards, function(card){
  //       return new Card(card)
  //     })

  //     this.set("cards", cards)
  //   },

  //   landCards: function(colors) {
  //   },

  //   showDraft: function() {
  //     console.log(this.get("booster"))
  //   },

  //   randomizeBooster: function(n) {
  //     cards = this.get("cards")
  //     booster = this.get("booster")
  //     var deck = [];
  //     for (step = 0; step < n; step++) {
  //       set = _.map(booster, function(slot){
  //         while (typeof slot === "string") {
  //           i = Math.floor(Math.random() * (cards.length - 1));
  //           if (cards[i].hasFrequency(slot)) {
  //             return cards[i];
  //           }
  //         }
  //       })
  //       deck.push(set)
  //     }

  //     return _.flatten(deck)
  //   },

  //   cardsByColor: function(color) {
  //     return _.filter(this.get("cards"), function(card) {
  //       return card.isOfColor(color)
  //     })
  //   },

  //   getScoreAverage: function() {
  //     cards = _.filter(this.get('cards'), function(card){
  //       return card.isMonoColor();
  //     })

  //     scores = _.map(cards, function(card){
  //       return card.cardScore();
  //     })

  //     return _.reduce(scores, function(l,r) { return l + r; }) / scores.length;
  //   },

  //   keyWords: function() {
  //     cards = _.filter(this.get("cards"), function(card) {
  //       return !card.isLand();
  //     })

  //     var keywords = [];

  //     _.each(cards, function(card){
  //       keywords = keywords.concat(card.cardTypes())
  //     })

  //     return keywords;
  //   },

  //   getScoresByColor: function(color) {
  //     cards = this.cardsByColor(color)
  //     scores = _.map(cards, function(card) { return card.cardScore(); })
  //     // average score for each color for each spell type
  //     // against average score for ALL cards, which show which color/spell was
  //     // above or below average?

  //     setAverage = _.reduce(scores, function(l, r){ return l + r; }) / scores.length

  //     return setAverage;
  //   },

  //   setAverages: function() {
  //     var cardColors = {}
  //     var cardSet = this
  //     _.each(["Blue", "Red", "Green", "Black", "White"], function(color){
  //       if (!cardColors.hasOwnProperty(color)) { cardColors[color] = 0 }
  //       averageScoreByColor = cardSet.getScoresByColor(color)
  //       averageScore = cardSet.getScoreAverage();
  //       differential = averageScoreByColor - averageScore
  //       cardSet.set("averageScore", averageScore)
  //       cardSet.set(color, averageScoreByColor)
  //       cardSet.set("differential" + color, differential)
  //     })

  //     return cardSet;
  //   },

  //   findCard: function(multiverseid) {
  //     return _.find(this.get("draft"), function(card){ return card.get("multiverseid") === parseInt(multiverseid) })
  //   },

  //   cardsWithKeyword: function(keyword) {
  //     cards = this.get("cards")

  //     return _.filter(cards, function(card){
  //       return card.hasKeyword(keyword)
  //     })
  //   },

  //   cardsOfColor: function(color) {
  //     return _.filter(this.get("cards"), function(card) { return card.isOfColor(color) })
  //   }
  // })

  var Draft = Backbone.Model.extend({
    initialize: function(pack) {
      sideboard: pack.sideboard;
      player: pack.player
    },

    addCard: function(card, set) {
      cards = this.get(set)
      if (cards[card.cid]) {
        cards[card.cid].push(card)
      } else {
        cards[card.cid] = [card]
      }
    },

    removeCard: function(card, set) {
      cards = this.get(set)
      if (cards[card.cid]) {
        cards[card.cid].pop()
      }
    },

    populateList: function(set) {
      cards = this.get(set);
      ids = _.keys(cards)

      _.each(ids, function(id){
        size = cards[id].length

        tag = nameTag(size, cards[id][0])
        $(set).append(tag)
      })
    },

    display: function(set, category) {
      if (category === "CMC") {

      } else if (category === "Spell") {

      } else {

      }
    }
  })

  var List = Backbone.Collection.extend({
    model: Card,

    randomizeBooster: function(booster, n) {
      cards = []
      i = 0
      for (i = 0; i < n; i++) {
        _.map(booster, function(b){
          while(b)
        })
      }
    }
  })

  var DraftCards = Backbone.Collection.extend({
    model: Card
  })
  // return an object - each key is the sub-category, each value is the card
  var categories = function(cards, category) {
  }

  var nameTag = function(n, card) {
    span = "<span>" + n + "</span>"
    return "<li>" + span + "<a href='#' name='" + card.get("name") + "'></li>"
  }

  var Card = Backbone.Model.extend({
    initialize: function(card) {
      card: card
      img: this.imgTag()
      tapped: false
    },

    allocate: function(side) {
      count = this.get("cardCount");

      if (side === "dashboard") {
        // move card to dashboard

      } else if (side === "player") {
        // move to player side
      } else {
        // remove card from draft selection?
      }


    },

    hasKeyword: function(keyword) {
      return _.some(this.cardTypes(), function(type){ return type === keyword })
    },

    cardTypes: function() {
      keywords = []

      if (this.has("subtypes")) {
        keywords = keywords.concat(this.get("subtypes"))
      }

      if (this.has("supertypes")) {
        keywords = keywords.concat(this.get("supertypes"))
      }

      // keywords = keywords.concat(this.get("types"))
      return keywords
    },

    cardScore: function() {
      if (this.has("cmc")) {
        solid = this.getSolidCost()
        return (this.get("cmc") + (solid * 1.15)) * this.spellModifier()
      }

      return 0;
    },

    castCard: function(manaPool) {
      mana = manaPool();
      _.find
    },

    spellModifier: function() {
      types = this.get("types")
      var card = this
      score = 0
      _.each(types, function(type){
        switch(type) {
          case "Creature":
            score += card.creatureScore()
            break;
          case "Instant":
            score += 0.85
            break;
          case "Sorcery":
            score += 1.15
            break;
          case "Enchantment":
            score += card.enchantmentScore()
            break;
          default:
            score += 1.0
        }
      })

      return score;
    },

    creatureScore: function() {
      power = parseInt(this.get("power"))
      tough = parseInt(this.get("toughness"))

      if (isNaN(power) || isNaN(tough)) {
        return 1;
      } else {
        return (power * 0.15) + (tough * 0.075)
      }
    },

    enchantmentScore: function() {
      enchant = this.get("type")

      if (enchant === "Enchantment - Aura") {
        return 0.85;
      } else {
        return 1.15;
      }
    },

    getSolidCost: function() {
      manaCost = this.get("manaCost").split(/[^\w]/)
      cost = 0

      _.each(manaCost, function(mana){
        if (cardSymbols[mana]) {
          cost++;
        }
      })

      return cost;
    },

    isArtifact: function() {
      if (this.has("colors")) {
        return false
      } else {
        return true;
      }
    },

    hasFrequency: function(freq) {
      return (this.get("rarity").toLowerCase()) === freq;
    },

    imgTag: function() {
      site = "'http://mtgimage.com/multiverseid/" + this.get("multiverseid") + ".jpg'"
      size = " width='225' height='300'"
      return "<img src=" + site + size + ">"
    },

    inSet: function() {
      return this.get("cardCount").inSet > 1
    },

    inSideboard: function() {
      return this.get("cardCount").inDeck > 1
    },

    // imgName: function(side) {
    //   name = this.get("multiverseid")
    //   if (side === "sideboard") {
    //     num = "<span>" + this.get("cardCount").inSet + "</span>"
    //   } else if (side === "player") {
    //     num = "<span>" + this.get("cardCount").inDeck + "</span>"
    //   }

    //   side = " class='" + side + "'"
    //   return "<li" + side + "><a" + side +" href='" + "#" + "' name='" + name + "'>" + num + "x " + this.get("name") + "</a></li>"
    // },

    containsColor: function(color) {
      colors = this.get("colors")
      return _.some(colors, function(c){
        return c === color;
      });
    },

    isMonoColor: function() {
      if (this.has("colors")) {
        return this.get("colors").length === 1;
      } else {
        return false;
      }
    },

    isOfColor: function(color) {
      if (this.has("colors")) {
        return this.get("colors").indexOf(color) === 0 && this.isMonoColor(color);
      } else {
        return false;
      }
    },

    inSet: function() {
      return this.get("cardCount").inSet > 1;
    },

    swap: function(key) {
      count = this.get("cardCount")
      if (key === "inSet") {
        count.inSet += 1;
        count.inDeck -= 1;
      } else {
        count.inSet -= 1;
        count.inDeck += 1;
      }

      this.set("cardCount", count)
    },

    isOfType: function(type) {
      return _.some(this.get("types"), function(cardType) { return cardType === type })
    },

    isLand: function() {
      return this.get("type") === "Land" || _.some(this.get("types"), function(type){return type === "Land"})
    },

    isArtifactCreature: function() {
      return this.get("types") === ["Artifact", "Creature"]
    },

    isSpell: function(spell) {
      return _.some(this.get("types"), function(type){
        return type === spell;
      })
    },

    isMulti: function() {
      if (this.has("colors")) {
        return this.get("colors").length > 1
      } else {
        return false;
      }
    },

    calculateCost: function(color) {
      manaSymbols = this.get("manaCost").split(/[^\w]/)
      manaCost = 0
      _.each(manaSymbols, function(c){
        if (c !== "" && c !== "X") {
          if (c === cardColors[color]) {
            manaCost += 1.5
          } else {
            manaCost += parseInt(c)
          }
        } else {

        }
      })

      return manaCost;
    }
  })

  var getList = function (name, setList) {
    $.getJSON("http://mtgjson.com/json/" + name, function(data){
    }).done(function(data){
      setList(data);
    })
  }

  var getAllCards = function (setList, complete) {
    var collection = [];

    for (i = 0; i < setList.length; i++) {
      getList(setList[i].code + ".json", function(cardSet){
        collection.push(cardSet)
        if (collection.length === setList.length) {
          complete(collection);
        }
      })
    }
  }

  var constructDeck = function(deck, filter, profileKey) {
    changeView(deck, filter)

    $("#decks").on("submit", function(e){
      e.preventDefault();

      customDeck.foreignKey(profile.get("foreignKey"))
      window.customDeck = customDeck
      $.ajax({
        url: "/cards/draft",
        data: JSON.stringify(customDeck),
        headers: {"Content-Type": "application/json"},
        type: "POST",
        dataType: "json",
        success: function(data, xhr, error) {
          console.log(data)
        }
      })
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

  var cardTicker = function(elem, n) {
    count = parseInt(elem.children("span").text())

    if (count === 1) {
      elem.remove()
    } else {
      elem.children("span").text(n)
    }

    return count;
  }


  var changeView = function(deck, filter) {

    if (filter === "CMC") {
      deck.displayCosts(cmcSymbol)
    } else if (filter === "Color") {
      deck.displayColors()
    } else if (filter === "Spell") {
      deck.displayTypes()
    } else {
      $("div.card-placeholder").empty()
    }

    $("a").on("mouseenter", function(e) {
      card = deck.findCard($(this).attr("name"))
      img = card.imgTag()
      $("div.img img").remove()
      $("div.img").show()
      $("div.img").append(img)
    })
  }

  $("#profile button").on("click", function(e){
    profileName = $("#profile input").val()
    var profile = new Profile({name: profileName})
    loadList();


    profile.insertToDB(function(key){
      var cardSet;
      $("#deckSelection").on("change", function(e){
        e.preventDefault();
        set = $("#deckSelection option:selected").attr("name");
        // cardSet = new CardSet({code: set})

        var request = function() {
          return $.getJSON("http://mtgjson.com/json/" + set + ".json")
        }

        window.list = new List()

        request().done(function(data){
          booster = data.booster
          _.each(data.cards, function(card){
            card = new Card(card)
            list.add(card);
          })

          // cardSet.set("cards", data.cards)
          // cardSet.set("booster", data.booster)
          // cardSet.initializeCards();
          // window.cards = cardSet.get("cards")
          // deck = new Draft({sideboard: {}, player: {}})
          // _.each(cardSet.randomizeBooster(6), function(card) { deck.addCard(card, "sideboard") })
          // initial = $("#types option:selected").val()
          // changeView(deck, initial)

          // $("a").on("click", function(e){
          // })



          // $("#types").on("change", function(e){
          //   filter = $("#types option:selected").val()
          //   // constructDeck(cardSet, filter, key)
          // })
        })
      })
    })
  })

  var moveToPlayer = function(card, link) {

    // playerCards = _.map($("div.player a"), function(card) {
    //   return card.attr('name');
    // })


  }

  var removeFromPlayerDashboard = function(card) {
    $("div.player").append(card.imgTag())
  }

  var addToPlayerDashboard = function(card) {
    // cardIDs = _.map($("div.player a"), function(link){return link.attr("name")})

    // if (_.any(cardIDs, card.get("multiverseid")) {
    //   text = $("div.player a[name='" + card.get("multiverseid") + "']").text()
    // }
  }

  var visualizeMe = function (data) {
    data = _.sortBy(data, function(d){ return d.releaseDate })

    var margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = 1800 - margin.left - margin.right,
        height = 1000 - margin.top - margin.bottom;

    var x = d3.time.scale()
      .range([0, width]);

    var y = d3.scale.linear()
      .range([height, 0]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

    var line = d3.svg.line()
      .interpolate("basis")
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(+d.diff); });

    var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var colors = _.map(["White", "Red", "Blue", "Green", "Black"], function(color){
      diffs = _.map(data, function(set){
        return { diff: set["differential" + color], date: set.releaseDate }
      })

      return { color: color, diffs: diffs }
    })

    var dates = _.map(data, function(d) { return d.releaseDate })

    x.domain(d3.extent(dates, function(d) { return d; }));
    y.domain([-2, 2])

    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Cost Differential")
      .attr("stroke", "black")




    var set = svg.selectAll(".sets")
      .data(colors)
      .enter()
      .append("g")
      .attr("class", "sets")

    set.append("path")
      .attr("class", "line")
      .attr("d", function(d){
        return line(d.diffs)
      })
      .style("stroke", function(d){
        if (d.color === "White") {
          color = d3.scale.category10();
          return color(d);
        } else {
          return d.color;
        }
      })
  }
})
