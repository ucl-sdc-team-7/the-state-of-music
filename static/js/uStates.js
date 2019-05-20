//sets dimentions
const map_margin = {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  map_height = 450 - map_margin.top - map_margin.bottom,
  map_width = 960 - map_margin.left - map_margin.right;
//defining map projection
const projection = d3.geoAlbersUsa()
  .translate([map_width / 2, map_height / 2])
  .scale(1000)

//tells map how to draw the paths from the projection
const map_path = d3.geoPath()
  .projection(projection);

const map = d3.select("#statesvg")
  //Binding the data to the SVG and create one path per json feature
  .selectAll("path")
  .attr("class", "map-path")

const uStates = {};
uStates.draw = function(genre) {

  //Loading in genre data
  var request_url = "states/genre/" + genre
  d3.json("https://raw.githubusercontent.com/richa-sud/the-state-of-music-json/master/state_pop.json", function(error, data) {
    if (error) console.log(error);

    /////////////////////////////////SETTING COLOUR RANGES/////////////////////////////////

    //setting colour range for main page
    // var color_cat = d3.scaleOrdinal().domain(colorsandgenres.genres)
    //   .range(colorsandgenres.colors)

    //setting colour range for genres
    var data = data.features
    var val_arr = [];
    for (var j = 0; j < data.length; j++) {
      var value = +data[j].value;
      val_arr.push(value)
    }

    var min = d3.min(val_arr);
    var max = d3.max(val_arr);

    if (genre != "topgenre") {
      var color_genre = d3.scaleLinear().domain([min, max]).range(["white", GENRES[genre].color]);
    }

    ///////////////////////////////JOINING GENRE DATA TO JSON//////////////////////////////

    //loading in us json data
    d3.json("https://raw.githubusercontent.com/richa-sud/the-state-of-music-json/master/uStates.json",
      function(json) {
        // Looping through each state data value in the .csv file
        for (var i = 0; i < data.length; i++) {
          // Grabing State Name
          var dataState = data[i].abbr;

          //Grabbing data value
          var value = data[i].value;

          // Finding the corresponding state inside the JSON
          var states = json.features
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
              "<table><tr><td> Top Genre:</td><td>" + GENRES[d.properties.value] + "</td></tr>" +
              "</table>" +
              "<small>(click to zoom)</small>")
            .style("left", (d3.event.pageX - 345) + "px")
            .style("top", (d3.event.pageY - 100) + "px");
        }

        //tooltip for all genres
        function mouseOver_genre(d) {
          d3.select("#tooltip")
            .attr("class", "toolTip")
            .transition().duration(300)
            .style("opacity", 0.8);
          d3.select("#tooltip").html(
              "<h4>" + d.properties.name + ", " + d.properties.abbr + "</h4>" +
              "<table><tr><td>" + GENRES[genre].label + "</td><td>" + d.properties.value * 100 + "%</td></tr>" +
              "</table>" +
              "<small>(click to zoom)</small>")
            .style("left", (d3.event.pageX - 345) + "px")
            .style("top", (d3.event.pageY - 100) + "px");
        }

        function mouseOut() {
          d3.select("#tooltip").transition().duration(500).style("opacity", 0);
        }

        var map = d3.select("#statesvg")
          //Binding the data to the SVG and create one path per json feature
          .selectAll("path")
          .data(states)
          .enter()
          .append("path")
          .attr("class", "map-path")
          .attr("d", map_path)
          .style("stroke", "#fff")
          .style("stroke-width", "1")
          .style("opacity", 0.7);


        // applying colour scheme based on html input for 'genre_'
        if (genre == "topgenre") {
          map.on("mouseover", mouseOver_topgenre).on("mouseout", mouseOut)
            .style("fill", function(d) {
              return "222222";
            });
        } else {
          map.on("mouseover", mouseOver_genre).on("mouseout", mouseOut)
            .style("fill", function(d) {
              return color_genre(d.properties.value)
            });
        }

        //drawing counties onclick
        d3.selectAll('.map-path')
          .on('click', function(d) {
            $("#countymap").toggle()
            d3.selectAll("svg > *").remove();
            mouseOut();
            var state_abbr = d.properties.abbr;
            var state_bbox = get_state_bbox(state_abbr);
            usCounties.draw(state_bbox, current_genre); //function that draws leaflet
            geo_level = "county";
            current_state = state_abbr;
          });
      });
  });
};

this.uStates = uStates;
