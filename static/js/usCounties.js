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
      color: "#ddd", // border color
      weight: 1,
      fillOpacity: 0.7,
    }
  }

  function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
      fillOpacity: 1
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
      layer.bringToFront();
    }

    var popup = L.popup()
      .setLatLng(e.latlng)
      .setContent('Popup') //needs real data
      .openOn(countyMap);
  }

  function resetHighlight(e) {
    choropleth.resetStyle(e.target);
  }

  function zoomToFeature(e) {
    window.choropleth.remove()
    countyMap.fitBounds(e.target.getBounds());
    //add base map to div
    basemap.addTo(countyMap);

  }

  function onEachFeature(feature, layer) {
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
    onEachFeature: onEachFeature
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
