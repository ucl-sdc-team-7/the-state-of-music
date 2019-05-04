(function(){
		//sets dimentions
 	var margin = {top: 0, left: 0, right: 0, bottom: 0},
 	height = 450 - margin.top - margin.bottom,
 	width = 960 - margin.left - margin.right;
    //defining map projection
   var projection = d3.geoAlbersUsa()
   .translate([width / 2 , height / 2])
   .scale(1000)

   //tells map how to draw the paths from the projection
   var path = d3.geoPath()
   .projection(projection);

   var genres = ['top_genre','indie','country','classical','hiphop','metal']
	 var colors = {
		 pop:"#002f81",
		 indie:"#0381b4",
		 country: "#4a2777",
		 classical: "#b41162",
		 hiphop:"#bf9076",
		 metal:"#545a66",
	 }


	 var uStates = {};
	 uStates.draw = function(genre_){
		 //Loading in genre data
	 	d3.csv( "./static/state_genres.csv", function(data_) {

/////////////////////////////////SETTING COLOURS RANGES/////////////////////////////////

//This part is pretty inefficient. - any help would be much appreciated!!!

		 //setting colour range for main page
		 var color_cat = d3.scaleOrdinal().domain(genres)
		 .range(['#002f81','#0381b4','#4a2777','#b41162','#bf9076','#545a66'])

		 //setting colour range for pop music
		 var popArray = [];
		 for (var d = 0; d < data_.length; d++) {
			 popArray.push(parseFloat(data_[d].pop))
		 }
		 var minpop = d3.min(popArray)
		 var maxpop = d3.max(popArray)
		 var color_pop = d3.scaleLinear().domain([minpop,maxpop]).range(["white",colors.pop])

		 //setting colour range for indie music
		 var indieArray = [];
		 for (var d = 0; d < data_.length; d++) {
			 indieArray.push(parseFloat(data_[d].indie))
		 }
		 var minindie = d3.min(indieArray)
		 var maxindie = d3.max(indieArray)
		 var color_indie = d3.scaleLinear().domain([minindie,maxindie]).range(["white",colors.indie])

		 //setting colour range for country music
		 var countryArray = [];
		 for (var d = 0; d < data_.length; d++) {
			 countryArray.push(parseFloat(data_[d].country))
		 }
		 var mincountry = d3.min(countryArray)
		 var maxcountry = d3.max(countryArray)
		 var color_country = d3.scaleLinear().domain([mincountry,maxcountry]).range(["white",colors.country])

		 //setting colour range for classical music
		 var classicalArray = [];
		 for (var d = 0; d < data_.length; d++) {
			 	classicalArray.push(parseFloat(data_[d].classical))
		 	}
		 var minclassical = d3.min(classicalArray)
		 var maxclassical = d3.max(classicalArray)
		 var color_classical = d3.scaleLinear().domain([minclassical,maxclassical]).range(["white",colors.classical])

		 //setting colour range for hiphop music
		 var hiphopArray = [];
		 for (var d = 0; d < data_.length; d++) {
			 	hiphopArray.push(parseFloat(data_[d].hiphop))
		 	}
		 var minhiphop = d3.min(hiphopArray)
		 var maxhiphop = d3.max(hiphopArray)
		 var color_hiphop = d3.scaleLinear().domain([minhiphop,maxhiphop]).range(["white",colors.hiphop])

		 	//setting colour range for metal music
		 var metalArray = [];
		 for (var d = 0; d < data_.length; d++) {
			 	metalArray.push(parseFloat(data_[d].metal))
		 	}
		 var minmetal = d3.min(metalArray)
		 var maxmetal = d3.max(metalArray)
		 var color_metal = d3.scaleLinear().domain([minmetal,maxmetal]).range(["white",colors.metal])

/////////////////////////////////JOINING GENRE DATA TO JSON/////////////////////////////////

      //loading in us json data
    d3.json("https://gist.githubusercontent.com/wboykinm/dbbe50d1023f90d4e241712395c27fb3/raw/9753ba3a47f884384ab585a42fc1be84a4a474ca/us-states.json",
    function(json_) {
				// Looping through each state data value in the .csv file
				for (var i = 0; i < data_.length; i++) {
					// Grabing State Name
      		var dataState = data_[i].state_name;

      		// Grabing all data values
      		var top_genre = data_[i].top_genre;
      		var pop = data_[i].pop;
      		var indie = data_[i].indie;
      		var country = data_[i].country;
      		var classical = data_[i].classical;
      		var hiphop = data_[i].hiphop;
      		var metal = data_[i].metal;

      		// Finding the corresponding state inside the JSON
					var states = json_.features
      		for (var j = 0; j < states.length; j++) {
						var jsonState = states[j].properties.name;
						if (dataState == jsonState) {

          		// Copying all data values into the JSON
          		states[j].properties.top_genre = top_genre;
          		states[j].properties.pop = pop;
          		states[j].properties.indie = indie;
          		states[j].properties.country = country;
          		states[j].properties.classical = classical;
          		states[j].properties.hiphop = hiphop;
          		states[j].properties.metal = metal;

          		// Stop looking through the JSON
          		break;
						};
					};
				};

/////////////////////////////////CREATING SVG ELEMENT AND APPEND MAP TO SVG/////////////////////////////////

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
				if (genre_ == "most_pop"){
	        map.style("fill", function(d) { return color_cat(d.properties.top_genre) })
	      }

	      else if (genre_ == "pop"){
	        map.style("fill", function(d){return color_pop(d.properties.pop)})
	      }

	      else if (genre_ == "indie"){
	        map.style("fill", function(d){return color_indie(d.properties.indie)})
	      }

	      else if (genre_ == "country"){
	        map.style("fill", function(d){return color_country(d.properties.country)})
	      }

	      else if (genre_ == "classical"){
	        map.style("fill", function(d){return color_classical(d.properties.classical)})
	      }

	      else if (genre_ == "hiphop"){
	        map.style("fill", function(d){return color_hiphop(d.properties.hiphop)})
	      }

	      else if (genre_ == "metal"){
	        map.style("fill", function(d){return color_metal(d.properties.metal)})
	      };

    	});
  	});

	};

	this.uStates=uStates;

})();
