var usCounties = {};

usCounties.draw = function(bbox, genre) {

  // initialize the map
  var countyMap = L.map('mapCanvas').fitBounds(bbox);

  const url = "http://{s}tile.stamen.com/toner-lite/{z}/{x}/{y}.png";

  const basemap = L.tileLayer(url, {
    subdomains: ['', 'a.', 'b.', 'c.', 'd.'],
    minZoom: 0,
    format: 'png',
    opacity: 1,
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  });

  counties_geo.features.forEach(function(element) {
    countyData.find(function(newElement) {
      if (element.properties.NAME == newElement.county_name) {
        element.properties.value = newElement.value;
      };
    })

  });

  function style() {
    return {
      color: "#fff", // border color
      weight: 1,
      fillOpacity: 0.7,
    }
  }

  function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
      fillOpacity: 1
    });
    layer.openPopup()
  }

  function resetHighlight(e) {
    var layer = e.target;
    choropleth.resetStyle(layer);
    layer.closePopup()
  }

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

  choropleth = L.choropleth(counties_geo, {
    valueProperty: "value",
    scale: ["white", "#4a2777"], //color to change with genre-icon click
    steps: 10,
    mode: "q", // q for quantile
    style: style,
    onEachFeature: onEachFeature_county
  }).addTo(countyMap);


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
