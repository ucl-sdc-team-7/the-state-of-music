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
  return d > 0.9 ? 0.9 :
    d > 0.8 ? 0.8 :
    d > 0.7 ? 0.7 :
    d > 0.6 ? 0.6 :
    d > 0.5 ? 0.5 :
    d > 0.4 ? 0.4 :
    d > 0.4 ? 0.3 :
    0.2;
}

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        x = text.attr("x")-5,
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));

      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}
