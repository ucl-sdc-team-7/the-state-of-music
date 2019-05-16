var usCounties = {};
// initialize county map
var countyMap = L.map('mapCanvas')

const url = "http://{s}tile.stamen.com/toner-lite/{z}/{x}/{y}.png";
const basemap = L.tileLayer(url, {
  subdomains: ['', 'a.', 'b.', 'c.', 'd.'],
  minZoom: 0,
  format: 'png',
  opacity: 1,
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
});

//add base map to div
basemap.addTo(countyMap)

counties_geo.features.forEach(function(element) {
  countyData.find(function(newElement) {
    if (element.properties.NAME == newElement.county_name) {
      element.properties.value = newElement.value;
    };
  })
});

function style() {
  return {
    color: "#ddd", // border color
    weight: 1,
    fillOpacity: 0.7,
  }
}

function highlightFeature(e) {
  var layer = e.target;
  layer.openPopup()
}

function zoomToFeature(e) {
  countyMap.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
  layer.myTag = "myCounties"

  var popupContent = "<h4>" + feature.properties.NAME + " County</h4>" +
    "<table><tr><td>R&B</td><td>" + feature.properties.value * 100 + "%</td></tr>" +
    "</table>" +
    "<small>(click to zoom)</small>"

  layer.bindPopup(popupContent, {
    closeButton: false,
    'className': 'custom'
  }, );

  function resetHighlight(e) {
    var layer = e.target;
    layer.closePopup()
  }

  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature,
  });
}

function getChoropleth(genre) {
  return L.choropleth(counties_geo, {
    valueProperty: "value",
    scale: ["white", GENRES[genre].color], //color to change with genre-icon click
    steps: 10,
    mode: "q", // q for quantile
    style: style,
    onEachFeature: onEachFeature
  })
}

usCounties.recalculateGenres = function(genre) {
  countyMap.eachLayer(function(layer) {
    if (layer.myTag && layer.myTag === "myCounties") {
      countyMap.removeLayer(layer)
    }
  });

  var choropleth = getChoropleth(genre);

  choropleth.addTo(countyMap);
}

usCounties.removeChoropleth = function(genre) {

}

usCounties.draw = function(bbox, genre) {

  countyMap.fitBounds(bbox);
  var choropleth = getChoropleth(genre);
  choropleth.addTo(countyMap);

  //drawing state map over counties doesn't allow for hovers and clicks

  /*
  L.geoJson(states_geo, {
      style: {
        color: 'white',
        weight: 5,
        fillOpacity: 0,
      }
    })
    .addTo(countyMap);
  */

}

this.usCounties = usCounties
