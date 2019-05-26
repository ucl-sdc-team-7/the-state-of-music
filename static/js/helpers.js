function get_state_bbox(state_abbr) {
    return [
      [stateBoxes[state_abbr].ymin, stateBoxes[state_abbr].xmin],
      [stateBoxes[state_abbr].ymax, stateBoxes[state_abbr].xmax]
    ];
}

function domgenre_colors(d) {
  return d ? GENRES[d]["color"] : "#aaadb2";
}

function marker_opacity(d) {
  return d > 1 ? 0.9 :
    d > 0.9 ? 0.8 :
    d > 0.8 ? 0.7 :
    d > 0.7 ? 0.6 :
    d > 0.6 ? 0.5 :
    d > 0.5 ? 0.4 :
    0.3;
}
