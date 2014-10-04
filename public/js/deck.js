requirejs.config({
  baseUrl: "js/lib",
  paths: {
    app: "../deck",
    jquery: "//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min",
    d3: "http://d3js.org/d3.v3.min",
    underscore: "../lib/underscore-min",
    backbone: "../lib/backbone-min",
    handlebars: "../lib/handlebars-v2.0.0"
  }
})

requirejs(['jquery', 'underscore', 'backbone'], function($, _, Backbone){
  alert('testing')
})

