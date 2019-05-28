$("#top").addClass("selected")
uStates.draw("top")
stats.top("top")

//function updateInfoBox(label) {
//  $("#titleGenre").html(label);
  //this slightly  ugly solution shifts the colouring of the info boxes
  //it's repeated in the updatelogo function below
//  document.documentElement.style.setProperty('--displayInfo-color', "#efefef");
//  $("#titleCategory").html("Where live " + label + " music is most popular")
//  document.documentElement.style.setProperty('--displayInfo-text-color', "#555b66");
//  $("#displayStatsTitle").html("Where should " + label + " fans go this month?");
//}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function updateInfoBox(geog) {
//this function updates the grey box
//the geog argument passes it venues or counties as required
//global variables for genre and the map level are counties_geo_index
//the title is built from two strings, one for genre and one for geography
var gen_text
var geo_text
//genre component
if (current_genre == "top") {
  gen_text = 'All genres';
  gen_text_2 = 'each genre';
}
else {
  gen_text = GENRES[current_genre].label;
  gen_text_2 = gen_text;
  gen_text = capitalizeFirstLetter(gen_text);
}
//geographical component
if (geo_level == 'state') {
  geo_text = 'at state level';
  geo_text_2 = 'states';
}
else if (geo_level == 'county') {
  for (i = 0; i < 51; i++) {
  if (states_geo.features[i].properties.abbr == geog) {
    geo_text = states_geo.features[i].properties.name_2;
  }}
  geo_text = 'in '+geo_text;
  geo_text_2 = 'counties';
}
else if (geo_level == 'venue') {
  geo_text = 'in '+geog;
  geo_text_2 = 'venues';
}
$("#titleGenre").html(gen_text + " " + geo_text);
$("#displayStatsTitle").html("Which "+geo_text_2+" feel the strongest about "+gen_text_2+"?")
}

//Update data section (Called from the onclick)
function updateData() {
  d3.selectAll(".genre-icon")
    .on('click', function() {
      var genre_id = d3.select(this).attr('id')
      current_genre = genre_id;

      // Make all icons (except this) transparent
      if($('.genre-icon').not(this).hasClass("selected")) {
        $(".genre-icon").removeClass("selected")
      }
      // Make this opaque
      if (!$(this).hasClass("selected")){
        $(this).addClass("selected")
      }

      // removing state map and statistics
      d3.selectAll("svg#statesvg > *").remove();
      d3.selectAll("svg#stats > *").remove();

      if(genre_id == "top") {
        stats.top("top")
      } else {
        stats.draw(genre_id)
      }
      // adding new maps depending on geo_level
      if (geo_level == "state") {
        uStates.draw(genre_id);
        updateInfoBox();
      } else if (geo_level == "county") {
        usCounties.recalculateGenres(genre_id);
        updateInfoBox(current_state);
      } else if (geo_level == "venue") {
        usVenues.draw(genre_id)
        updateInfoBox(current_county);
      }
      // if (genre_id != "top") {
      //   updateInfoBox(GENRES[genre_id].label);
      // } else {
      //   updateInfoBox("music");
      //}
    });
}



function updatelogo() {
  d3.selectAll('#logo')
    .on('click', function() {
      $(".genre-icon").removeClass("selected")
      $("#top").addClass("selected")
      // removing state map and statistics
      d3.selectAll("svg#statesvg > *").remove();
      d3.selectAll("svg#stats > *").remove();

      current_genre = "top"

      // adding new maps depending on geo_level
      if (geo_level == "state") {
        uStates.draw("top");
      } else {
        $("#countymap").toggle();
        geo_level = "state"
        uStates.draw("top");
      }

      // adding top genre stats
      stats.top("top");
      //updating infoBox and ensuring venue popup has been removed
      updateInfoBox();
      countyMap.removeControl(venueInfo)

      // $("#titleGenre").html("music");
      //document.documentElement.style.setProperty('--displayInfo-color', "#888b94");
      // $("#titleCategory").html("The most popular types of live music")
      //document.documentElement.style.setProperty('--displayInfo-text-color', "#FFFFFF");
      //$("#displayStatsTitle").html("Which states feel the strongest about each genre?");
    });
}
