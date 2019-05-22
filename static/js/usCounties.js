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

info.update = function(props) {
      this._div.innerHTML = "<h4>" + (props ? props.NAME + " County</h4>" +
        "<table><tr><td>R&B</td><td>" + props.value + "</td></tr>" +
        "</table>" +
        "<small>(click to zoom)</small>" : '<h4>Hover over a county</h4>')
    }

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
  usVenues.draw(genre)
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

function getData(genre) {
  //Loading in genre data
  const params = jQuery.param({
    genre: genre,
    level: 'county'
  });

  var request_url = "genre?" + params;

  d3.json(request_url, function(error, data) {
    if (error) console.log(error);
    data = data['data']

    // joining genre data to counties geoJSON
    counties_geo.features.forEach(function(element) {
      data.find(function(newElement) {
        if (element.properties.NAME == newElement.county_name) {
          if (genre == "top") {
            element.properties.value = newElement.dom_genre;
          } else {
            element.properties.value = newElement.ranking;
          }
        };
      })
    });
  });

  return counties_geo;
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
  var choropleth = L.choropleth(getData(genre), {
    valueProperty: "value",
    scale: ["white", GENRES[genre].color],
    steps: 10,
    mode: "q", // q for quantile
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

function getCategorical(genre) {
  var categorical = L.geoJson(getData(genre), {
    style: cat_style,
    onEachFeature: onEachFeature
  });
  return categorical;
}

var usCounties = {};

usCounties.draw = function(bbox, genre) {
  // resetting geo_level
  geo_level = "county";
  removeLayers();
  countyMap.fitBounds(bbox);

  console.log("draw: " + genre)

  if (genre != "top") {
    var choropleth = getChoropleth(genre);
    choropleth.addTo(countyMap);
  } else {
    var categorical = getCategorical(genre);
    categorical.addTo(countyMap);
  }

  var stateLines = getStateLines();
  stateLines.addTo(countyMap);

  info.addTo(countyMap)

}

usCounties.recalculateGenres = function(genre) {

  removeLayers();

  console.log("recalculate: " + genre)

  if (genre != "top") {
    var choropleth = getChoropleth(genre);
    choropleth.addTo(countyMap);
  } else {
    var categorical = getCategorical(genre);
    categorical.addTo(countyMap);
  }

  var stateLines = getStateLines();
  stateLines.addTo(countyMap);

  info.addTo(countyMap)

}

this.usCounties = usCounties
