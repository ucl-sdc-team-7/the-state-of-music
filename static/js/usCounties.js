// initializing county map
var countyMap = L.map('countymap')

// defining basemap
const url = "http://{s}tile.stamen.com/toner-lite/{z}/{x}/{y}.png";
const basemap = L.tileLayer(url, {
  subdomains: ['', 'a.', 'b.', 'c.', 'd.'],
  minZoom: 0,
  format: 'png',
  opacity: 1,
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

//adding base map to div
basemap.addTo(countyMap);

//creating info box
var info = L.control();

info.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'county-info');
  this.update();
  return this._div;
}

<<<<<<< HEAD
info.update = function (props) {
  console.log(props)
  this._div.innerHTML = "<h4>" + (props ? "<h4 class='state-head'>" +
   props.NAME + " " + props.LSAD + ", " + "state abbr?" + "</h4>" +
  "<table><tr><th>Rank:</th><td>" + "x" + " out of 51</td></tr>"+
"<th>Number of upcoming "+ current_genre +" shows</th><td>x</td></table>" +
  "<small>(click to zoom)</small>":'<h4>Hover over a county</h4>')
}
=======
info.update = function(props) {
      this._div.innerHTML = "<h4>" + (props ? props.NAME + " County</h4>" +
        "<table><tr><td>R&B</td><td>" + props.value + "</td></tr>" +
        "</table>" +
        "<small>(click to zoom)</small>" : '<h4>Hover over a county</h4>')
    }
>>>>>>> master

// defining style for state boundaries
function state_style() {
  return {
    color: "#fff",
    weight: 3,
  }
}

// creating state boundaries
function getStateLines() {
  return L.geoJson(states_geo, {
    style: state_style,
    onEachFeature: function(feature, layer) {
      layer.myTag = "myStates"
    }
  });
}


function county_mouseover(e) {
  var layer = e.target;
  layer.setStyle({
    fillOpacity: 1
  });
  info.update(layer.feature.properties)
}

function county_mouseout(e) {
  var layer = e.target;
  layer.setStyle({
    fillOpacity: 0.7
  });
  info.update()
}

// function to remove counties and states when zoom to city
function removeLayers() {
  return countyMap.eachLayer(function(layer) {
    if (layer.myTag === "myCounties" || layer.myTag === "myStates" || layer.myTag === "myVenues") {
      countyMap.removeLayer(layer)
    }

  });
}


function zoomToCity(e, genre) {
  genre = current_genre

  countyMap.fitBounds(e.target.getBounds());
  countyMap.removeControl(info)

  removeLayers()
  d3.selectAll("svg#stats > *").remove();
  usVenues.draw(genre)
  stats.draw(genre)
}

// defining popups and county style on hover
function onEachFeature(feature, layer, genre) {
  layer.myTag = "myCounties" // tagging county polygons for removeLayers() function

  layer.on({
    mouseover: county_mouseover,
    mouseout: county_mouseout,
    click: zoomToCity,
  });
}

// defining style for county choropleth
function county_style(genre) {
  return {
    color: GENRES[genre].color,
    weight: 1,
    fillOpacity: 0.7,
  }
}

function getChoropleth(genre) {
  var choropleth = L.choropleth(counties_geo, {
    valueProperty: "value",
    fillColor: "#aaadb2",
    scale: [GENRES[genre].color, "white"],
    steps: 10,
    mode: "e", // e for equidistant
    style: county_style(genre),
    onEachFeature: onEachFeature
  });
  return choropleth;
}

function cat_style(feature) {
  return {
    fillColor: domgenre_colors(feature.properties.value), // refer helpers.js
    weight: 1,
    color: "#fff",
    fillOpacity: 0.7
  }
}

function getCategorical() {
  var categorical = L.geoJson(counties_geo, {
    style: function(feature) { return cat_style(feature) },
    onEachFeature: onEachFeature
  });
  return categorical;
}

var usCounties = {};

function drawLayers(genre) {
  const params = jQuery.param({ genre: genre });
  var request_url = "counties?" + params;

  d3.json(request_url, function(error, data) {  
    if (error) console.log(error);
    data = data['data']

    for (var i = 0; i < data.length; i++) {
      var counties_geo_index = counties_geo.features.findIndex(function(f) {
        return +f.properties.STATE == data[i].state_code && 
               +f.properties.COUNTY == data[i].county_code } 
      );

      if (counties_geo_index != -1) {
        if (genre == "top") {
          counties_geo.features[counties_geo_index].properties.value = data[i].dom_genre;
        } else {
          counties_geo.features[counties_geo_index].properties.value = data[i].ranking;
        }  
      }
    }

    if (genre != "top") {
      var choropleth = getChoropleth(genre);
      choropleth.addTo(countyMap);
    } else {
      var categorical = getCategorical();
      categorical.addTo(countyMap);
    }

    var stateLines = getStateLines();
    stateLines.addTo(countyMap);

    info.addTo(countyMap)

  });
}

usCounties.draw = function(bbox, genre) {
  // resetting geo_level
  geo_level = "county";
  removeLayers();
  countyMap.fitBounds(bbox);

  drawLayers(genre);
}

usCounties.recalculateGenres = function(genre) {

  removeLayers();
  drawLayers(genre);
}

this.usCounties = usCounties
