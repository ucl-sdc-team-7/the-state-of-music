uStates.draw("topgenre")
stats.draw("topgenre")

function updateInfoBox(label,color){
		$("#titleGenre").html(label);
		document.documentElement.style.setProperty('--genre-color', color);
		$("#titleCategory").html("Where live "+label+" music is most popular")
	}

//Update data section (Called from the onclick)
function updateData() {
	d3.selectAll(".genre-icon")
		.on('click', function() {
			var genre_id = d3.select(this).attr('id')
			d3.selectAll("svg > *").remove();
			uStates.draw(genre_id);
			stats.draw(genre_id);
			updateInfoBox(GENRES[genre_id].label,GENRES[genre_id].color);
    });
}
function updatelogo() {
	d3.selectAll('#logo')
		.on('click', function() {
			d3.selectAll("svg > *").remove();
			uStates.draw("topgenre");
			stats.draw("topgenre")
			$("#titleGenre").html("music");
			document.documentElement.style.setProperty('--genre-color', "#888b94");
			$("#titleCategory").html("The most popular types of live music")
    });
}
  
//set map zoom to state (includes margin)
//stateBoxes variable is loaded from state_boundaries_w_margin.js
function zoomToState(state_abbr) {
countyMap.fitBounds([
    [stateBoxes[state_abbr].xmin,stateBoxes[state_abbr].xmin],
    [stateBoxes[state_abbr].xmax,stateBoxes[state_abbr].ymax]
]);
}
