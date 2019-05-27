stats.top = function(genre) {

  var params = jQuery.param({
    genre: "top",
    filter_state: current_state,
    filter_county: current_county,
  });

  var request_url = "stats/" + geo_level + "?" + params;

  d3.json(request_url, function(error, data) {
    if (error) console.log(error);

    data = data['data']

    var max_genres = [];
    var mygenres = Object.keys(GENRES);

    for (var i in mygenres) {
      var max = data.reduce((max, p) => p[mygenres[i]] > max ? p[mygenres[i]] : max, data[0][mygenres[i]]);
      var max_obj = data.filter(obj => {
        return obj[mygenres[i]] === max
      })
      if (geo_level == "state") {
        var name = max_obj[0]["state_name"]
        max_genres.push({
          genre: mygenres[i],
          name: name,
          max: parseInt(max*100)
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

    //sort bars based on value
    max_genres = max_genres.sort(function(a, b) {
      return a.max - b.max
    })

    //creating svg object
    const chart = d3.select("#displayStats").select("svg")

    //assigning margins
    const bar = chart.append("g")
      .attr("transform", "translate(" + bar_margin.left + "," + bar_margin.top + ")")

    // setting domains for bars
    x.domain([0, d3.max(max_genres, function(d) {
      return d.max
    })]);
    y.domain(max_genres.map(function(d) {
      return d.genre
    })).padding(0.3);

    //drawing bars in chart
    bar.selectAll('.bar').data(max_genres)
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

    //adding labels to axis
    bar.selectAll(".text")
      .data(max_genres).enter()
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

    //adding values to bars
    bar.selectAll(".text")
      .data(max_genres).enter()
      .append("text")
      .attr("class", "bar-text")
      .attr("dy", ".35em")
      .attr("x", function(d) {
        return x(d.max) - 20
      })
      .attr("y", function(d) {
        return y(d.genre) + y.bandwidth() / 2
      })
      .attr("text-anchor", "middle")
      .text(function(d) {
        return Math.round(d.max*1000)/1000
      })
      .style("fill", "#ffffff");

    //assigning y-axis
    bar.append('g').attr("class", "y axis").call(d3.axisLeft(y).tickFormat(function(d) {
      return d.name;
    }));

  });
};

this.stats = stats;