function get_state_bbox(state_abbr) {
    return [
      [stateBoxes[state_abbr].ymin, stateBoxes[state_abbr].xmin],
      [stateBoxes[state_abbr].ymax, stateBoxes[state_abbr].xmax]
    ];
}

function domgenre_colors(d) {
  return typeof d === 'undefined' ? "#e2e2e2":
          GENRES[d]["color"];
}
