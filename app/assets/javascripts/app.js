// Globals
var tripifyMap;
var lastChosenPlace = {
  lat: null,
  long: null,
  placeName: null
};
var myPlaces =[];

// Map display & turn autocomplete on
$(document).ready(function() {
  L.mapbox.accessToken = mapAccessKey;
  tripifyMap = L.mapbox.map('map', 'mapbox.streets').setView([0, 0], 2);
  $("#placefinder").easyAutocomplete(options);
  $('#addplace').on('click', addPlace);
});

//date picker widget
$(function() {
  $("#datepicker").datepicker({
  dateFormat: "dd-mm-yy",
  changeMonth: true,
  changeYear: true
  })
});

var addPin = function(map) {
  var geojson = [
  {
    "type": "FeatureCollection",
    "features": [ {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [ lastChosenPlace.lat, lastChosenPlace.long ]
        },
        "properties": {
          "marker-symbol": "airport",
          "marker-size": "medium",
          "marker-color": "#FF0000",
          "title": lastChosenPlace.placeName
        }
    }]
  }];

  var pinLayer = L.mapbox.featureLayer().addTo(map);
  pinLayer.setGeoJSON(geojson);
};



//autocomplete place names
var options = {
  url: function(input) {
    return "https://api.mapbox.com/geocoding/v5/mapbox.places/" + input +
    ".json?types=place%2Ccountry%2Cregion&access_token=" + mapAccessKey;
  },

  getValue: "place_name",

  ajaxSettings: {
      dataType: "json"
  },

  listLocation: "features",

  requestDelay: 300,

  theme: "round",

  placeholder: "Enter a place",

  list: {
    onChooseEvent: function() {
      var coords = $('#placefinder').getSelectedItemData().center;
      var placeName = $('#placefinder').getSelectedItemData().place_name;

      lastChosenPlace.lat = coords[0];
      lastChosenPlace.long = coords[1];
      lastChosenPlace.placeName = placeName;
    }
  }
};



var addPlace = function(event) {
  //create a trip if first stop - make a check

  var settings = {
    url: '/trip/new',
    method: 'post'
  }
  $.ajax(settings).done(function(response) {
    console.log(response);
  })

  //add a stop 

  var $newPlace = $('<p>').text($('#placefinder').val());
  var $newDate = $('<span>').text(' ' + $('#datepicker').val());
  $newPlace.append($newDate);
  $('#tripform').append($newPlace);

  var obj = {};
  obj['date'] = $('#datepicker').val();
  obj['country']= $('#placefinder').val();
  myPlaces.push(obj);
  makePieChart();
  addPin(tripifyMap);
  $('#placefinder').val('');
  $('#datepicker').val('');
};


var makePieChart = function() {
  // clears chart every time a new city is added
  $('#chart').empty();
  var newarray =[];
  for(var i=0;i<myPlaces.length;i++) {
    var oneDay = 24*60*60*1000;
    // creates date object
    firstDate = myPlaces[i].date.split("-").reverse().join("-");
    firstDateObj = new Date(firstDate);
    var object = {};
    if (myPlaces[i+1] == undefined) {
      var today = new Date();
      var secondDate = today.getDate()+"-" + (today.getMonth()+1)+"-" + today.getFullYear();
      var newSecondDate = secondDate.split("-").reverse().join("-");
      var secondDateObj = new Date(newSecondDate);
    }
    else {
      var secondDate = myPlaces[i+1].date.split("-").reverse().join("-");
      var secondDateObj = new Date(secondDate);
      // calculate no. of days
    }
    var diffDays = Math.round(Math.abs((secondDateObj.getTime() - firstDateObj.getTime())/(oneDay)));
    object['country'] = myPlaces[i].country;
    object['count'] = diffDays;
    newarray.push(object);
    console.log(newarray);
  }
    var width = 360;
    var height = 360;
    var radius = Math.min(width, height) / 2;
    var color = d3.scale.ordinal().range(['#A60F2B', '#648C85', '#B3F2C9', '#528C18', '#C3F25C']);
    var svg = d3.select('#chart')
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')');
    var arc = d3.svg.arc().outerRadius(radius);
    var pie = d3.layout.pie().value(function(d) { return d.count; });
    var path = svg.selectAll('path')
                  .data(pie(newarray))
                  .enter()
                  .append('path')
                  .attr('d', arc)
                  .attr('fill', function(d, i) {
                    return color(d.data.country);
                  });
    var circle = d3.select("body")
                   .append("svg")
                   .attr('width', 100)
                   .attr('height', 100)
                   .selectAll('g')
                   .data(newarray)
                   .enter()
                   .append('g')
                   .append('circle')
                   .attr('cx',20)
                   .attr('cy',20)
                   .attr('r',5)
                   .attr('fill', function(d) {
                     console.log(d);
                     return color(d.country); })
                   .text(function(d) {
                     return d.country;
                   });

}
