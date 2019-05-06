(function() {
  //sets dimentions
  var margin = {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    },
    height = 450 - margin.top - margin.bottom,
    width = 960 - margin.left - margin.right;
  //defining map projection
  var projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale(1000)

  //tells map how to draw the paths from the projection
  var path = d3.geoPath()
    .projection(projection);

  var genres = ['pop', 'indie', 'country', 'classical', 'hiphop', 'metal']
  var colors = {
    pop: "#002f81",
    indie: "#0381b4",
    country: "#4a2777",
    classical: "#b41162",
    hiphop: "#bf9076",
    metal: "#545a66",
  }

  var uStates = {};
  uStates.draw = function(genre_) {
    //Loading in genre data
    var request_url = "states/genre/" + genre_
    d3.json(request_url, function(data_) {

      /////////////////////////////////SETTING COLOUR RANGES/////////////////////////////////

      //setting colour range for main page
      var color_cat = d3.scaleOrdinal().domain(genres)
        .range(['#002f81', '#0381b4', '#4a2777', '#b41162', '#bf9076', '#545a66'])

      //setting colour range for genres
      var min = d3.min(data_.values());
      var max = d3.max(data_.values());
      var color_genre = d3.scaleLinear().domain([min, max]).range(genre_)

      console.log(genre_)
      console.log(data_.values())

      ///////////////////////////////JOINING GENRE DATA TO JSON//////////////////////////////

      //loading in us json data
      d3.json("https://gist.githubusercontent.com/wboykinm/dbbe50d1023f90d4e241712395c27fb3/raw/9753ba3a47f884384ab585a42fc1be84a4a474ca/us-states.json",
        function read_json(json_) {
          // Looping through each state data value in the .csv file
          for (var i = 0; i < data_.length; i++) {
            // Grabing State Name
            var dataState = data_[i].state_name;
            // Grabbing genre scores
            var value = data_[i].value;
            // Finding the corresponding state inside the JSON
            var states = json_.features
            for (var j = 0; j < states.length; j++) {
              var jsonState = states[j].properties.name;
              if (dataState == jsonState) {
                // Copying all genre scores into the JSON
                states[j].properties.value = value;
                // Stop looking through the JSON
                break;
              };
            };
          };

          ///////////////////CREATING SVG ELEMENT AND APPEND MAP TO SVG////////////////////

          var map = d3.select("#statesvg").append("svg")
            //Binding the data to the SVG and create one path per json feature
            .selectAll("path")
            .data(states)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("opacity", 0.7);


          // applying colour scheme based on html input for 'genre_'
          if (genre_ == "top") {
            map.style("fill", function(d) {
              return color_cat(d.properties.value)
            })
          } else {
            map.style("fill", function(d) {
              return color_genre(d.properties.value)
            })
          }

        });
    });

  };

  this.uStates = uStates;

})();
