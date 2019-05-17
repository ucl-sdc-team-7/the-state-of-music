function cityMap(color){

  function marker_colors(d){
    return d > 0.9 ? 0.9 :
         d > 0.8  ? 0.8 :
         d > 0.7  ? 0.7 :
         d > 0.6  ? 0.6 :
         d > 0.5   ? 0.5 :
         d > 0.4   ? 0.4 :
         d > 0.4   ? 0.3 :
                    0.2;
  }

  function onEachFeature_city(feature, layer) {
    var popupCity = "<h4>" + feature.properties.address + "</h4>" +
    "<table><tr><td>R&B</td><td>" + feature.properties.value * 100 + "%</td></tr>" +
    "</table>" +
    "<small>(click to zoom)</small>"

  layer.bindPopup(popupCity, {
      'className': 'custom'
    }, );
  }

  var venues = L.geoJson(venue_geo, {
    pointToLayer: function (feature, latlng) {
      var geojsonMarkerOptions = {
        radius: 10,
        fillColor: color,
        weight: 0,
        fillOpacity: marker_colors(feature.properties.value),
      };
    return L.circleMarker(latlng, geojsonMarkerOptions);
    },
    onEachFeature: onEachFeature_city
  }).addTo(countyMap);
};

function zoomToFeature(e) {
  window.choropleth.remove()
  countyMap.fitBounds(e.target.getBounds());
  //add base map to div
  basemap.addTo(countyMap);

  return cityMap("#4a2777")
}

function onEachFeature_county(feature, layer) {

  var popupCounty = "<h4>" + feature.properties.NAME + " County</h4>" +
    "<table><tr><td>R&B</td><td>" + feature.properties.value * 100 + "%</td></tr>" +
    "</table>" +
    "<small>(click to zoom)</small>"

  layer.bindPopup(popupCounty, {
    closeButton: false,
    'className': 'custom'
  }, );

  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature,
  });
}






var usVenues = {};

usVenues.draw = function(color){

function marker_colors(d){
  return d > 0.9 ? 0.9 :
       d > 0.8  ? 0.8 :
       d > 0.7  ? 0.7 :
       d > 0.6  ? 0.6 :
       d > 0.5   ? 0.5 :
       d > 0.4   ? 0.4 :
       d > 0.4   ? 0.3 :
                  0.2;
}

var venues = L.geoJson(venue_geo, {
pointToLayer: function (feature, latlng) {
  var geojsonMarkerOptions = {
  radius: 8,
  fillColor: color,
  weight: 0,
  fillOpacity: marker_colors(feature.properties.value)
  };
  return L.circleMarker(latlng, geojsonMarkerOptions);
  }
}).addTo(countyMap);

var popupCity = "<h4>" + feature.properties.name + " County</h4>" +
  "<table><tr><td>R&B</td><td>" + feature.properties.value * 100 + "%</td></tr>" +
  "</table>" +
  "<small>(click to zoom)</small>"

};

this.usVenues = usVenues;
