function makegeoJSON(data) {

  var jsonFeatures = [];

  data.forEach(function(point) {
    var lat = point.venue_lat;
    var lon = point.venue_long;

    var feature = {
      type: 'Feature',
      properties: point,
      geometry: {
        type: 'Point',
        coordinates: [lon, lat]
      }
    };

    jsonFeatures.push(feature);
  });

  var geoJSON = {
    type: 'FeatureCollection',
    features: jsonFeatures
  };
  return geoJSON;
}

function onEachFeature_venue(feature, layer) {
  layer.myTag = "myVenues"
  console.log(feature.properties)
  var popupVenue = "<h4>" + feature.properties.venue + " ("+feature.properties.state_abbr+")" + "</h4>" +
  "<table><tr><td> Top Genre:</td><td>" + "top_genre" + "</td></tr>" +
"<tr><th class='center'>Genre</th><th class='center'>No. of Venues</th></tr>"+
"<tr><td class='left'><div class='legend-color pop'></div>Pop</td><td>x</td></tr>"+
"<tr><td class='left'><div class='legend-color rock'></div>Rock</td><td>x</td></tr>"+
"<tr><td class='left'><div class='legend-color hip-hop'></div>Hip Hop</td><td>x</td></tr>"+
"<tr><td class='left'><div class='legend-color rnb'></div>R&B</td><td>x</td></tr>"+
"<tr><td class='left'><div class='legend-color classical_jazz'></div>Classical & Jazz</td><td>x</td></tr>"+
"<tr><td class='left'><div class='legend-color electronic'></div>Electronic</td><td>x</td></tr>"+
"<tr><td class='left'><div class='legend-color country_folk'></div>Country & Folk</td><td>x</td></tr>"+
  "</table>" +
  "<small>(click to zoom)</small>"

  layer.bindPopup(popupVenue, {
    'className': 'venue-info'
  }, );
}

function getMarkers(data, genre) {

  var venues = L.geoJson(data, {

    pointToLayer: function(feature, latlng) {
      if (genre != "top") {
        var geojsonMarkerOptions = {
          radius: 10,
          color: GENRES[genre].color,
          fillColor: GENRES[genre].color,
          weight: 2,
          fillOpacity: marker_opacity(feature.properties.value),
        }
      } else {
        var geojsonMarkerOptions = {
          radius: 10,
          color: domgenre_colors(feature.properties.dom_genre),
          fillColor: domgenre_colors(feature.properties.dom_genre),
          weight: 2,
          fillOpacity: 0.7,
        };
      }
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
  removeLayers()

  var request_url = getrequestURL(genre)

  d3.json(request_url, function(error, d) {
    if (error) console.log(error);
    data = d['data']

    var venue_geo = makegeoJSON(data)
    var venues = getMarkers(venue_geo, genre)
    venues.addTo(countyMap)

  });
};

this.usVenues = usVenues;
