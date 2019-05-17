// joining genre data to counties geoJSON
counties_geo.features.forEach(function(element) {
  countyData.find(function(newElement) {
    if (element.properties.NAME == newElement.county_name) {
      element.properties.value = newElement.value;
    };
  })
});

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
basemap.addTo(countyMap)

// defining style for state boundaries
function state_style() {
  return {
    color: "#fff",
    weight: 3,
  }
}

// defining style for county polygons
function county_style() {
  return {
    color: "#fff",
    weight: 1,
    fillOpacity: 0.7,
  }
}

function county_mouseover(e) {
  var layer = e.target;
  layer.setStyle({
    fillOpacity: 1
  });
  layer.openPopup()
}

function county_mouseout(e) {
  var layer = e.target;
  layer.setStyle({
    fillOpacity: 0.7
  });
  layer.closePopup()
}

// function to remove counties and states when zoom to city
function removeLayers() {
  return countyMap.eachLayer(function(layer) {
    if (layer.myTag && layer.myTag === "myCounties") {
      countyMap.removeLayer(layer)
    }
    if (layer.myTag && layer.myTag === "myStates") {
      countyMap.removeLayer(layer)
    }
  });
}


function zoomToCity(e) {
  countyMap.fitBounds(e.target.getBounds());
  removeLayers()
}

// defining popups and county style on hover
function onEachFeature(feature, layer, genre) {
  layer.myTag = "myCounties" // tagging county polygons for removeLayers() function

  var popupContent = "<h4>" + feature.properties.NAME + " County</h4>" +
    "<table><tr><td>R&B</td><td>" + feature.properties.value * 100 + "%</td></tr>" +
    "</table>" +
    "<small>(click to zoom)</small>"

  layer.bindPopup(popupContent, {
    closeButton: false,
    'className': 'custom'
  }, );

  layer.on({
    mouseover: county_mouseover,
    mouseout: county_mouseout,
    click: zoomToCity,
  });
}

function getChoropleth(genre) {
  return L.choropleth(counties_geo, {
    valueProperty: "value",
    scale: ["white", GENRES[genre].color],
    steps: 10,
    mode: "q", // q for quantile
    style: county_style,
    onEachFeature: onEachFeature
  })
}

var usCounties = {};

usCounties.draw = function(bbox, genre) {

  countyMap.fitBounds(bbox);
  var choropleth = getChoropleth(genre);
  choropleth.addTo(countyMap);
  L.geoJson(states_geo, {
    style: state_style,
    onEachFeature: function(feature, layer) {
      layer.myTag = "myStates" // tagging state polylines for removeLayers() function
    }
  }).addTo(countyMap);

}


usCounties.recalculateGenres = function(genre) {

  removeLayers();

  var choropleth = getChoropleth(genre);
  choropleth.addTo(countyMap);
  L.geoJson(states_geo, {
    style: state_style,
    onEachFeature: function(feature, layer) {
      layer.myTag = "myStates"
    }
  }).addTo(countyMap);

}

this.usCounties = usCounties
