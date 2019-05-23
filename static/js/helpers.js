function get_state_bbox(state_abbr) {
    return [
      [stateBoxes[state_abbr].ymin, stateBoxes[state_abbr].xmin],
      [stateBoxes[state_abbr].ymax, stateBoxes[state_abbr].xmax]
    ];
}

function getrequestURL(genre) {
  //Loading in genre data
  const params = jQuery.param({
    genre: genre,
    level: geo_level
  });

  return "genre?" + params;
}

function domgenre_colors(d) {
  return d == "pop" ? "#002f81":
         d == "rock" ? "#2a7187":
         d == "hip_hop" ? "#0381b4":
         d == "rnb" ? "#4a2777":
         d == "classical_and_jazz" ? "#b41162":
         d == "electronic" ? "#bf9076":
         d == "county_and_folk" ? "#56371b" :
         "#8a8d94";
}

function marker_opacity(d) {
  return d > 0.9 ? 0.9 :
    d > 0.8 ? 0.8 :
    d > 0.7 ? 0.7 :
    d > 0.6 ? 0.6 :
    d > 0.5 ? 0.5 :
    d > 0.4 ? 0.4 :
    d > 0.4 ? 0.3 :
    0.2;
}
