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

var venueInfo = L.control();

//adding venue level info box
venueInfo.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'county-info');
  this.update();
  return this._div;
}

venueInfo.update = function(props) {
  if (current_genre == 'top') {
      this._div.innerHTML = (props ? "<h4 class='titleCase'>" + props.venue + "</h4>" +
      "<table><tr><td> Top Genre:</td><td class='titleCase'>" + props.dom_genre_label + "</td></tr>" +
      "<tr><th class='center'>Genre</th><th class='center'>No. of Venues</th></tr>" +
      "<tr><td class='left'><div class='legend-color pop'></div>Pop</td><td>" + props.pop_num + "</td></tr>" +
      "<tr><td class='left'><div class='legend-color rock'></div>Rock</td><td>" + props.rock_num + "</td></tr>" +
      "<tr><td class='left'><div class='legend-color hip-hop'></div>Hip Hop</td><td>" + props.hip_hop_num + "</td></tr>" +
      "<tr><td class='left'><div class='legend-color rnb'></div>R&B</td><td>" + props.rnb_num + "</td></tr>" +
      "<tr><td class='left'><div class='legend-color classical_jazz'></div>Classical & Jazz</td><td>" + props.classical_and_jazz_num + "</td></tr>" +
      "<tr><td class='left'><div class='legend-color electronic'></div>Electronic</td><td>" + props.electronic_num + "</td></tr>" +
      "<tr><td class='left'><div class='legend-color country_folk'></div>Country & Folk</td><td>" + props.country_and_folk_num + "</td></tr>" +
      "</table>" :
      '<h4>Hover over a venue</h4>')
  } else {
    this._div.innerHTML = (props ? "<h4>" + props.venue + "</h4>" +
      "<table><th>Number of upcoming " + GENRES[current_genre].label + " shows </th><td> </td><td>" + props.value + "</td></table>" :
      '<h4>Hover over a venue</h4>')
  };
}
//end of infobox

function venue_mouseover(e) {
  var layer = e.target;

  venueInfo.update(layer.feature.properties);
}

function venue_mouseout(e) {
  var layer = e.target;
  venueInfo.update()
}


function onEachFeatureClosure(genre) {
  return function onEachFeature_venue(feature, layer) {
    layer.myTag = "myVenues"

    layer.on({
      mouseover: venue_mouseover,
      mouseout: venue_mouseout,
    });

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
  }
}

function getColor(d, genre) {
  if (d != 0) {
    return GENRES[genre].color
  } else {
    return "#555a66"
  }
}

function getMarkers(data, genre) {

  var venues = L.geoJson(data, {

    pointToLayer: function(feature, latlng) {
      if (genre != "top") {

        function getMax(data) {
          var max = -10000000;
          var min = 10000000;
          for (var i = 0; i < data.length; i++) {
            max = Math.max(data[i].properties.value, max);
            if (data[i].properties.value != 0) {
              min = Math.min(data[i].properties.value, min);
            }
          }
          return [min, max];
        }
        var val_range = getMax(data.features);

        var geojsonMarkerOptions = {
          radius: 10,
          color: getColor(feature.properties.value, genre),
          fillColor: getColor(feature.properties.value, genre),

          weight: 2,
          fillOpacity: marker_opacity(feature.properties.value, val_range[0], val_range[1]),
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

  const params = jQuery.param({
    genre: genre,
    admin_level: 3
  });
  var request_url = "search?" + params;

  d3.json(request_url, function(error, d) {
    if (error) console.log(error);
    data = d['data']
    for (i in data){
      if (data[i].dom_genre) {
      data[i].dom_genre_label = (GENRES[data[i].dom_genre]["label"])}
    }

    var venue_geo = makegeoJSON(data)
    var venues = getMarkers(venue_geo, genre)
    venues.addTo(countyMap)

  });
};

this.usVenues = usVenues;
