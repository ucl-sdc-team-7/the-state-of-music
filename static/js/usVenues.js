function marker_opacity(d) {
  return d > 0.9 ? 0.9 :
    d > 0.8 ? 0.8 :
    d > 0.7 ? 0.7 :
    d > 0.6 ? 0.6 :
    d > 0.5 ? 0.5 :
    d > 0.4 ? 0.4 :
    d > 0.4 ? 0.3 :
    0.2;
}

function onEachFeature_venue(feature, layer) {
  layer.myTag = "myVenues"
  var popupVenue = "<h4>" + feature.properties.address + "</h4>" +
    "<table><tr><td>R&B</td><td>" + feature.properties.value * 100 + "%</td></tr>" +
    "</table>" +
    "<small>(click to zoom)</small>"

  layer.bindPopup(popupVenue, {
    'className': 'venue-info'
  }, );
}

function getMarkers(genre) {
  var venues = L.geoJson(venue_geo, {
    pointToLayer: function(feature, latlng) {
      var geojsonMarkerOptions = {
        radius: 10,
        color: GENRES[genre].color,
        fillColor: GENRES[genre].color,
        weight: 2,
        fillOpacity: marker_opacity(feature.properties.value),
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    },
    onEachFeature: onEachFeature_venue
  })

  return venues;
}

var usVenues = {};

usVenues.draw = function(genre) {
  // resetting geo_level
  geo_level = "venue"

  var venues = getMarkers(genre)
  venues.addTo(countyMap)

};

usVenues.recalculateGenres = function(genre) {
  removeLayers();

  var venues = getMarkers(genre)
  venues.addTo(countyMap)
}

this.usVenues = usVenues;
