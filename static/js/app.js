uStates.draw("topgenre")
stats.draw("topgenre")
//Update data section (Called from the onclick)
function updateData() {
  d3.selectAll(".genre-icon")
    .on('click', function() {
      var genre_id = d3.select(this).attr('id');
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
