//setting dimentions
const bar_margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 60
  },
  bar_width = 300 - bar_margin.left - bar_margin.right,
  bar_height = 300 - bar_margin.top - bar_margin.bottom;

const x = d3.scaleLinear().range([0, bar_width]);
const y = d3.scaleBand().range([bar_height, 0]);

const stats = {};

stats.draw = function(genre) {

  console.log(geo_level)

  const params = jQuery.param({
    genre: genre,
    level: geo_level
  });
  var request_url = "genre?" + params;
  d3.json(request_url, function(error, data) {
    if (error) console.log(error);
    data = data['data']

    //sort bars based on value
    data = data.sort(function(a, b) {
      return b.ranking - a.ranking
    })

    max_rank = data[0]

    //finding top five states
    data = data.slice(-5, max_rank.ranking)

    // setting domains for bars
    x.domain([0, d3.max(data, function(d) {
      return d.ranking
    })]);
    y.domain(data.map(function(d) {
      return d.state_name
    })).padding(0.3);

    //creating y-axis
    const yAxis = d3.axisLeft(y);

    //creating svg object
    const chart = d3.select("#displayStats").select("svg")

    //assigning margins
    const bar = chart.append("g")
      .attr("transform", "translate(" + bar_margin.left + "," + bar_margin.top + ")")

    if (genre != "top") {

      //assigning y-axis
      bar.append('g').attr("class", "y axis").call(d3.axisLeft(y))

      //drawing bars in chart
      bar.selectAll('.bar').data(data)
        .enter().append('rect')
        .attr("class", "bar")
        .attr('y', function(d) {
          return y(d.state_name);
        }) //assigning hieght of bars
        .attr("width", function(d) {
          return x(d.ranking);
        }) //assigning width of bars
        .attr("height", y.bandwidth())
        .attr("fill", function(d) {
          return GENRES[genre].color
        })

      //adding values to bars
      bar.selectAll(".text")
        .data(data).enter()
        .append("text")
        .attr("class", "bar-text")
        .attr("dy", ".35em")
        .attr("x", function(d) {
          return x(d.ranking) - 20
        })
        .attr("y", function(d) {
          return y(d.state_name) + y.bandwidth() / 2
        })
        .attr("text-anchor", "middle")
        .text(function(d) {
          return d.ranking
        })
        .style("fill", "white")
    }

  });
};

this.stats = stats;
