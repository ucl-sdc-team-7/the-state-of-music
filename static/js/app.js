uStates.draw("topgenre")
stats.draw("topgenre")

function updateInfoBox(label,color){
		$("#titleGenre").html(label);
		//this slightly  ugly solution shifts the colouring of the info boxes
		//it's repeated in the updatelogo function below
		document.documentElement.style.setProperty('--displayInfo-color', "#efefef");
		$("#titleCategory").html("Where live "+label+" music is most popular")
		document.documentElement.style.setProperty('--displayInfo-text-color', "#555b66");
		$("#displayStatsTitle").html("Where should "+label+" fans go this month?");

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
			document.documentElement.style.setProperty('--displayInfo-color', "#888b94");
			$("#titleCategory").html("The most popular types of live music")
			document.documentElement.style.setProperty('--displayInfo-text-color', "#FFFFFF");
			$("#displayStatsTitle").html("Which states feel the strongest about each genre?");
    });
}
