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
}

function getColor(d,genre){
  if(d!=0){
    return GENRES[genre].color
  } else {
    return "#555a66"
  }
}

function getMarkers(data, genre) {

  var venues = L.geoJson(data, {

    pointToLayer: function(feature, latlng) {
      if (genre != "top") {
        var geojsonMarkerOptions = {
          radius: 10,
          color: getColor(feature.properties.value, genre),
          fillColor: getColor(feature.properties.value, genre),

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
    console.log(data)

    var venue_geo = makegeoJSON(data)
    var venues = getMarkers(venue_geo, genre)
    venues.addTo(countyMap)

  });
};

this.usVenues = usVenues;
