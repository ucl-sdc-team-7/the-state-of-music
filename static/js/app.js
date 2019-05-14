uStates.draw("topgenre")
stats.draw("topgenre")
//Update data section (Called from the onclick)
function updateData() {
  d3.selectAll(".genre-icon")
    .on('click', function() {
      var genre_id = d3.select(this).attr('id')
      d3.selectAll("svg > *").remove();
      uStates.draw(genre_id);
      stats.draw(genre_id);
    });
}
function updatelogo() {
  d3.selectAll('#logo')
    .on('click', function() {
      d3.selectAll("svg > *").remove();
      uStates.draw("topgenre");
      stats.draw("topgenre")
    });
}

//drawing counties onclick
d3.selectAll('.map-path')
  .on('click', function(d) {
    var state_abbr = d.properties.abbr;
    var state_bbox = get_state_bbox(state_abbr);
    //usCounties.draw(state_bbox,genre) //function that draws leaflet to come
  });

  
//set map zoom to state (includes margin)
//stateBoxes variable is loaded from state_boundaries_w_margin.js
function zoomToState(state_abbr) {
countyMap.fitBounds([
    [stateBoxes[state_abbr].xmin,stateBoxes[state_abbr].xmin],
    [stateBoxes[state_abbr].xmax,stateBoxes[state_abbr].ymax]
]);
}