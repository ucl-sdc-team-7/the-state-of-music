

  var usCounties = {};



  usCounties.draw = function(bbox, genre) {

    // initialize the map - zoom and bounding box to change on click
    //var bounds = [[-124.92351, 32.0603879],[-113.617292, 42.4832861]];

    var countyMap = L.map('countymap').fitBounds(bbox);

    const url = "http://{s}tile.stamen.com/toner-lite/{z}/{x}/{y}.png";

    const basemap = L.tileLayer(url, {
      subdomains: ['', 'a.', 'b.', 'c.', 'd.'],
      minZoom: 0,
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });

    //add base map to div
    basemap.addTo(countyMap);

    L.geoJson(counties_geo).addTo(countyMap);

    //var counties = fetchJSON("../static/data/usCounties_geo.js")
    //.then(function(counties) { return counties});

    //counties.addTo(map);
/*
    choropleth = L.choropleth(usCounties, {

      valueProperty: "value", // which property in the features to use
      scale: ["white", GENRES[genre].color], // chroma.js scale - include as many as you like
      steps: 10, // number of breaks or steps in range
      mode: "q", // q for quantile, e for equidistant, k for k-means
      style: {
      color: "#fff", // border color
      weight: 1,
      fillOpacity: 0.9
    },

  }).addTo(map);

  */

  }

  this.usCounties = usCounties
