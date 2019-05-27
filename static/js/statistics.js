//setting dimentions
const bar_margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 120
  },
  bar_width = 300 - bar_margin.left - bar_margin.right,
  bar_height = 300 - bar_margin.top - bar_margin.bottom;

const x = d3.scaleLinear().range([0, bar_width]);
const y = d3.scaleBand().range([bar_height, 0]);

const stats = {};

stats.draw = function(genre) {

  var params = jQuery.param({
    genre: genre,
    filter_state: current_state,
    filter_county: current_county,
  });

  var request_url = "stats/" + geo_level + "?" + params;

  d3.json(request_url, function(error, d) {
    if (error) console.log(error);

    d = d['data']

    //sort bars based on value
    d = d.sort(function(a, b) {
      return a.ranking - b.ranking
    })
    console.log(data)

    //finding top five states
    d = d.slice(0, 5).reverse();

    var data = [];
    for (var i = 0; i < d.length; i++) {
      if (d[i].value != 0) {
        data.push(d[i])
      }
    }

    if (data.length == 1) {

      if (geo_level == "county") {
        d3.selectAll("svg#stats > *").remove();
        $("#stats-text").html("<small>Only " + data[0].county_name + " is playing this genre this month.</small>");
      } else if (geo_level == "venue") {
        d3.selectAll("svg#stats > *").remove();
        $("#stats-text").html("<small>Only " + data[0].venue + " is playing this genre this month.</small>");
      }
    }

    else if (data.length == 0) {
      d3.selectAll("svg#stats > *").remove();
      $("#stats-text").html("<small>Noone is playing this genre this month.</small>");
    }

    else if (data.length > 1) {

      $("#stats-text").remove();

      //creating svg object
      const chart = d3.select("#displayStats").select("svg")

      //assigning margins
      const bar = chart.append("g")
        .attr("transform", "translate(" + bar_margin.left + "," + bar_margin.top + ")")

      if (genre != "top") {

        // setting domains for bars
        x.domain([0, d3.max(data, function(d) {
          return d.value
        })]);

        //drawing bars in chart
        bar.selectAll('.bar').data(data)
          .enter().append('rect')
          .attr("class", "bar")
          .attr("width", function(d) {
            return x(d.value);
          }) //assigning width of bars
          .attr("fill", function(d) {
            return GENRES[genre].color
          })

        //adding labels to axis
        bar.selectAll(".text")
          .data(data).enter()
          .append("text")
          .attr("class", "axis-text")
          .attr("dy", ".35em")
          .attr("x", function(d) {
            return -100
          })
          .attr("text-anchor", "right")
          .style("fill", "#555a66;");


        if (geo_level == "state") {
          y.domain(data.map(function(d) {
            return d.state_name
          })).padding(0.3);

          bar.selectAll('.bar')
            .attr('y', function(d) {
              return y(d.state_name);
            })
            .attr("height", y.bandwidth()); //assigning hieght of bars

          bar.selectAll(".axis-text")
            .attr("y", function(d) {
              return y(d.state_name) + y.bandwidth() / 2
            })
            .text(function(d) {
              return d.state_name
            })
            .call(wrap, bar_margin.left);

        } else if (geo_level == "county") {

          y.domain(data.map(function(d) {
            return d.county_name
          })).padding(0.3);

          bar.selectAll('.bar')
            .attr('y', function(d) {
              return y(d.county_name)
            })
            .attr("height", y.bandwidth()); //assigning hieght of bars

          bar.selectAll(".axis-text")
            .attr("y", function(d) {
              return y(d.county_name) + y.bandwidth() / 2
            })
            .text(function(d) {
              return d.county_name
            })
            .call(wrap, bar_margin.left);

        } else if (geo_level == "venue") {
          y.domain(data.map(function(d) {
            return d.venue
          })).padding(0.3);

          bar.selectAll('.bar')
            .attr('y', function(d) {
              return y(d.venue)
            })
            .attr("height", y.bandwidth()); //assigning hieght of bars

          bar.selectAll(".axis-text")
            .attr("y", function(d) {
              return y(d.venue) + y.bandwidth() / 2
            })
            .text(function(d) {
              return d.venue
            })
            .call(wrap, bar_margin.left);
        }

        //assigning y-axis
        bar.append('g').attr("class", "y axis").call(d3.axisLeft(y).tickFormat(function(d) {
          return d.county_name;
        }));

      }
    }

  });
};

this.stats = stats;
