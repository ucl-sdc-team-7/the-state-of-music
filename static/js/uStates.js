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

  var genres = ['pop', 'rock_metal', 'indie', 'hiphop', 'rnb', 'classical_jazz', 'electronic_dance', 'country_folk'];

  var colors = {
    pop: "#002f81",
    rock_metal: "#2a7187",
    indie: "#0381b4",
    hiphop: "#4a2777",
    rnb: "#b41162",
    classical_jazz: "#bf9076",
    electronic_dance: "#56371b",
    country_folk: "#545a66",
  }

  var tool_txt = {
    pop: "Pop",
    rock_metal: "Rock & Metal",
    indie: "Indie",
    hiphop: "Hip Hop",
    rnb: "R&B",
    classical_jazz: "Classical & Jazz",
    electronic_dance: "Electronic & Dance",
    country_folk: "Country & Folk"
  }


  var uStates = {};
  uStates.draw = function(genre_) {
    //Loading in genre data
    var request_url = "states/genre/" + genre_
    d3.json("https://raw.githubusercontent.com/richa-sud/the-state-of-music-json/master/state_pop.json", function(error, data_) {
      if (error) console.log(error);

      /////////////////////////////////SETTING COLOUR RANGES/////////////////////////////////

      //setting colour range for main page
      var color_cat = d3.scaleOrdinal().domain(genres)
        .range(['#002f81', '#2a7187', '#0381b4', '#4a2777', '#b41162', '#bf9076', '#56371b', '#545a66'])

      //setting colour range for genres
      var data = data_.features
      var val_arr = [];
      for (var j = 0; j < data.length; j++) {
        var value = +data[j].value;
        val_arr.push(value)
      }

      var min = d3.min(val_arr);
      var max = d3.max(val_arr);
      var color_genre = d3.scaleLinear().domain([min, max]).range(["white", colors[genre_]])

      ///////////////////////////////JOINING GENRE DATA TO JSON//////////////////////////////

      //loading in us json data
      d3.json("https://raw.githubusercontent.com/richa-sud/the-state-of-music-json/master/uStates.json",
        function(json_) {
          // Looping through each state data value in the .csv file
          for (var i = 0; i < data.length; i++) {
            // Grabing State Name
            var dataState = data[i].abbr;

            //Grabbing data value
            var value = data[i].value;

            // Finding the corresponding state inside the JSON
            var states = json_.features
            for (var j = 0; j < states.length; j++) {
              var jsonState = states[j].properties.abbr;
              if (dataState == jsonState) {
                // Copying all genre scores into the JSON
                states[j].properties.value = value;
                // Stop looking through the JSON
                break;
              };
            };
          };

          ///////////////////CREATING SVG ELEMENT AND APPEND MAP TO SVG////////////////////



          //tooptip for top genre page
          function mouseOver_topgenre(d) {
            d3.select("#tooltip")
              .attr("class", "toolTip")
              .transition().duration(300)
              .style("opacity", 0.8);
            d3.select("#tooltip").html(
                "<h4>" + d.properties.name + ", " + d.properties.abbr + "</h4>" +
                "<table><tr><td> Top Genre:</td><td>" + tool_txt[d.properties.value] + "</td></tr>" +
                "</table>" +
                "<small>(click to zoom)</small>")
              .style("left", (d3.event.pageX - 345) + "px")
              .style("top", (d3.event.pageY - 120) + "px");

          }

          //tooltip for all genres
          function mouseOver_genre(d) {
            d3.select("#tooltip")
              .attr("class", "toolTip")
              .transition().duration(300)
              .style("opacity", 0.8);
            d3.select("#tooltip").html(
                "<h4>" + d.properties.name + ", " + d.properties.abbr + "</h4>" +
                "<table><tr><td>" + tool_txt[genre_] + "</td><td>" + d.properties.value * 100 + "%</td></tr>" +
                "</table>" +
                "<small>(click to zoom)</small>")
              .style("left", (d3.event.pageX - 345) + "px")
              .style("top", (d3.event.pageY - 120) + "px");
          }

          function mouseOut() {
            d3.select("#tooltip").transition().duration(500).style("opacity", 0);
          }

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
          if (genre_ == "topgenre") {
            map.on("mouseover", mouseOver_topgenre).on("mouseout", mouseOut)
              .style("fill", function(d) {
                return color_cat(d.properties.value)
              });
          } else {
            map.on("mouseover", mouseOver_genre).on("mouseout", mouseOut)
              .style("fill", function(d) {
                return color_genre(d.properties.value)
              });
          }

        });
    });

  };

  this.uStates = uStates;

})();
