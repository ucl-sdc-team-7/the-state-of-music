var tooltip = d3.select("#stats-tooltip")
  .attr("class", "toolTip")

stats.top = function(genre) {

  var params = jQuery.param({
    genre: "top",
    filter_state: current_state,
    filter_county: current_county,
  });

  var request_url = "stats/" + geo_level + "?" + params;

  d3.json(request_url, function(error, d) {
    if (error) console.log(error);

    d = d['data']

    var max_genres = [];
    var mygenres = Object.keys(GENRES);

    if (d.length >= 1) {

      for (var i in mygenres) {
        var max = d.reduce((max, p) => p[mygenres[i]] > max ? p[mygenres[i]] : max, d[0][mygenres[i]]);
        var max_obj = d.filter(obj => {
          return obj[mygenres[i]] === max
        })
        if (geo_level == "state") {
          var name = max_obj[0]["state_name"]
          max_genres.push({
            genre: mygenres[i],
            name: name,
            max: parseInt(max * 100)
          })
        }
        if (geo_level == "county") {
          var name = max_obj[0]["county_name"]
          max_genres.push({
            genre: mygenres[i],
            name: name,
            max: max
          })
        }
        if (geo_level == "venue") {
          var name = max_obj[0]["venue"]
          max_genres.push({
            genre: mygenres[i],
            name: name,
            max: max
          })
        }

      }
    }

    //sort bars based on value
    max_genres = max_genres.sort(function(a, b) {
      return a.max - b.max
    })

    var data = [];
    for (var i = 0; i < max_genres.length; i++) {
      if (max_genres[i].max > 0) {
        data.push(max_genres[i])
      }
    }

    if (data.length == 1) {
      $("#stats-text").empty();
      d3.selectAll("svg#stats > *").remove();
      $("#stats-text").html("<small>Only " + data[0].name + " is playing " + GENRES[data[0].genre].label + " this month.</small>");
    } else if (data.length == 0) {
      $("#stats-text").empty();
      d3.selectAll("svg#stats > *").remove();
      if (geo_level == "county") {
        $("#stats-text").html("<small>No upcoming shows in " + current_state + " this month.</small>");
      }
      if (geo_level == "venue") {
        $("#stats-text").html("<small>No upcoming shows in " + current_county + " county this month.</small>");
      }
    } else if (data.length > 1) {

      $("#stats-text").empty();
      //creating svg object
      const chart = d3.select("#displayStats").select("svg")

      //assigning margins
      const bar = chart.append("g")
        .attr("transform", "translate(" + bar_margin.left + "," + bar_margin.top + ")")

      // setting domains for bars
      x.domain([0, d3.max(data, function(d) {
        return d.max
      })]);
      y.domain(data.map(function(d) {
        return d.genre
      })).padding(0.3);

      function mouseOver_stats(d) {

          d3.select("#stats-tooltip")
            .attr("class", "toolTip")
            .transition().duration(300)
            .style("opacity", 0.8)
            .style("left", d3.event.pageX + 10 + "px")
            .style("top", d3.event.pageY - 200 + "px")

          d3.select("#stats-tooltip")
            .html(GENRES[d.genre].label);
          }

      function mouseOut_stats() {
        d3.select("#stats-tooltip").transition().duration(500).style("opacity", 0);
      }

      //drawing bars in chart
      bar.selectAll('.bar').data(data)
        .enter().append('rect')
        .attr("class", "bar")
        .attr("width", function(d) {
          return x(d.max);
        }) //assigning width of bars
        .attr('y', function(d) {
          return y([d.genre]);
        })
        .attr("height", y.bandwidth()) //assigning hieght of bars
        .attr("fill", function(d) {
          return GENRES[d.genre]["color"]
        })
        .on("mouseover", mouseOver_stats)
    		.on("mouseout", mouseOut_stats);

      //adding labels to axis
      bar.selectAll(".text")
        .data(data).enter()
        .append("text")
        .attr("class", "axis-text")
        .attr("dy", ".35em")
        .attr("x", function(d) {
          return -100
        })
        .attr("y", function(d) {
          return y(d.genre) + y.bandwidth() / 2
        })
        .attr("text-anchor", "right")
        .text(function(d) {
          return d.name
        })
        .style("fill", "#555a66;")
        .call(wrap, bar_margin.left);

      //assigning y-axis
      bar.append('g').attr("class", "y axis").call(d3.axisLeft(y).tickFormat(function(d) {
        return d.name;
      }));
    }
  });
};

this.stats = stats;
