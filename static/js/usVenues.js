function marker_colors(d) {
  return d > 0.9 ? 0.9 :
    d > 0.8 ? 0.8 :
    d > 0.7 ? 0.7 :
    d > 0.6 ? 0.6 :
    d > 0.5 ? 0.5 :
    d > 0.4 ? 0.4 :
    d > 0.4 ? 0.3 :
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


var usVenues = {};

usVenues.draw = function(genre) {

  var venues = L.geoJson(venue_geo, {
    pointToLayer: function(feature, latlng) {
      var geojsonMarkerOptions = {
        radius: 10,
        color: genre,
        fillColor: genre,
        weight: 2,
        fillOpacity: marker_colors(feature.properties.value),
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    },
    onEachFeature: onEachFeature_city
  }).addTo(countyMap);

};

this.usVenues = usVenues;
