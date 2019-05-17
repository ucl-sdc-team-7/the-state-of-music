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
