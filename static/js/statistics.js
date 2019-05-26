(function() {

  //setting dimentions
  const bar_margin = {
      top: 20,
      right: 20,
      bottom: 20,
      left: 40
    },
    bar_width = 300 - bar_margin.left - bar_margin.right,
    bar_height = 300 - bar_margin.top - bar_margin.bottom;

  const x = d3.scaleLinear().range([0, bar_width]);
  const y = d3.scaleBand().range([bar_height, 0]);

  const stats = {};

  stats.draw = function(genre) {
    //using fake data for now
    d3.json("https://raw.githubusercontent.com/richa-sud/the-state-of-music-json/master/state_pop.json", function(error, data_) {
      if (error) console.log(error);

      var data = data_.features

      //sort bars based on value
      data = data.sort(function(a, b) {
        return a.value - b.value
      })

      //finding top five states
      data = data.slice(-5, data.length)

      // setting domains for bars
      x.domain([0, d3.max(data, function(d){ return d.value })]);
      y.domain(data.map(function(d){ return d.abbr })).padding(0.3);

      //creating y-axis
      const yAxis = d3.axisLeft(y);

      //creating svg object
      const chart = d3.select("#displayStats").select("svg")

      //assigning margins
      const bar = chart.append("g")
      .attr("transform", "translate(" + bar_margin.left + "," + bar_margin.top + ")")



      if (genre == "top") {
        console.log("temp - gotta finish this bit")

      } else {
        //assigning y-axis
        bar.append('g').attr("class", "y axis").call(d3.axisLeft(y))

        //drawing bars in chart
        bar.selectAll('.bar').data(data)
        .enter().append('rect')
        .attr("class", "bar")
        .attr('y', function(d) { return y(d.abbr); }) //assigning hieght of bars
        .attr("width", function(d) { return x(d.value); }) //assigning width of bars
        .attr("height", y.bandwidth())
        .attr("fill", function(d) {return GENRES[genre].color})

        //adding values to bars
        bar.selectAll(".text")
        .data(data).enter()
        .append("text")
        .attr("class", "bar-text")
        .attr("dy", ".35em")
        .attr("x", function(d){ return x(d.value) - 20 })
        .attr("y", function(d){ return y(d.abbr) + y.bandwidth()/2 })
        .attr("text-anchor","middle")
        .text(function(d) { return d.value })
        .style("fill", "white")
      }

    });
  };

  this.stats = stats;

})();
