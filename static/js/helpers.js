function get_state_bbox(state_abbr) {
    return [
      [stateBoxes[state_abbr].ymin, stateBoxes[state_abbr].xmin],
      [stateBoxes[state_abbr].ymax, stateBoxes[state_abbr].xmax]
    ];
}

function domgenre_colors(d) {
  return d == "pop" ? "#002f81":
         d == "rock" ? "#2a7187":
         d == "hip_hop" ? "#0381b4":
         d == "rnb" ? "#4a2777":
         d == "classical_and_jazz" ? "#b41162":
         d == "electronic" ? "#bf9076":
         d == "county_and_folk" ? "#56371b" :
         "#e2e2e2";
}
