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

<<<<<<< HEAD
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
=======
function onEachFeatureClosure(genre) {
  return function onEachFeature_venue(feature, layer) {
    layer.myTag = "myVenues"

    var label = (genre == 'top') ? "Top Genre: " : GENRES[genre].label + ": ";
    
    var value = "";
    if (genre == 'top') {
      if (feature.properties.dom_genre) {
        value = GENRES[feature.properties.dom_genre].label;
      } else {
        value = "No dominant genre";
      }
    } else {
      value = feature.properties.value + " " + GENRES[genre].label + " shows playing at this venue";
    }
      

    var popupVenue = "<h4>" + feature.properties.venue + "</h4>" +
      "<table><tr><td>" + label + "</td><td>" + value + "</td></tr>" +
      "</table>" +
      "<small>(click to zoom)</small>"

    layer.bindPopup(popupVenue, {
      'className': 'venue-info'
    }, );
  }
>>>>>>> master
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
    onEachFeature: onEachFeatureClosure(genre)
  })

  return venues;
}


var usVenues = {};

usVenues.draw = function(genre) {
  // resetting geo_level
  geo_level = "venue"
  removeLayers()

  const params = jQuery.param({ genre: genre });
  var request_url = "venues?" + params;

  d3.json(request_url, function(error, d) {
    if (error) console.log(error);
    data = d['data']

    var venue_geo = makegeoJSON(data)
    var venues = getMarkers(venue_geo, genre)
    venues.addTo(countyMap)

  });
};

this.usVenues = usVenues;
