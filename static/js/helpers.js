function get_state_bbox(state_abbr) {
  return [
    [stateBoxes[state_abbr].ymin, stateBoxes[state_abbr].xmin],
    [stateBoxes[state_abbr].ymax, stateBoxes[state_abbr].xmax]
  ];
}

function domgenre_colors(d) {
  return d ? GENRES[d]["color"] : "#aaadb2";
}

function marker_opacity(d, left, right) {

  function split(left, right) {
    var array = [];
    delta = (right - left) / 9;

    while (left < right) {
      array.push(left);
      left += delta;
    }
    array.push(right);
    return array;
  }

  var result = split(left, right);

  return d > result[9] ? 0.9 :
    d > result[8] ? 0.8 :
    d > result[7] ? 0.7 :
    d > result[6] ? 0.6 :
    d > result[5] ? 0.5 :
    d > result[4] ? 0.4 :
    d > result[3] ? 0.3 :
    0.2;
}
