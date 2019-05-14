(function() {

  var usCounties = {};

  usCounties.draw = function(bbox, genre) {

    //leaflet goes here
    // initialize the map - zoom and bounding box to change on click

    const map = L.map('countymap').setView([40.7831, -73.9712], 12);



    const url = "http://{s}tile.stamen.com/toner-lite/{z}/{x}/{y}.png";

    const basemap = L.tileLayer(url, {
      subdomains: ['', 'a.', 'b.', 'c.', 'd.'],
      minZoom: 0,
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });

    //add base map to div
    basemap.addTo(map);

    map.invalidateSize(true);


  }

  this.usCounties = usCounties

})();
