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
    delta = (right - left) / 8;

    while (left < right) {
      array.push(left);
      left += delta;
    }
    array.push(right);
    return array;
  }

  var result = split(left, right);

  return d > result[7] ? 0.9 :
    d > result[6] ? 0.8 :
    d > result[5] ? 0.7 :
    d > result[4] ? 0.6 :
    d > result[3] ? 0.5 :
    d > result[2] ? 0.4 :
    d > result[1] ? 0.3 :
    0.2;
}

function wrap(text, width) {
  text.each(function() {

    var breakChars = ['/', '&', '-'],
      text = d3.select(this),
      textContent = text.text(),
      spanContent;

    breakChars.forEach(char => {
      // Add a space after each break char for the function to use to determine line breaks
      textContent = textContent.replace(char, char + ' ');
    });

    var words = textContent.split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      x = text.attr('x'),
      y = text.attr('y'),
      dy = parseFloat(text.attr('dy') || 0),
      tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width-20) {
        line.pop();
        spanContent = line.join(' ');
        breakChars.forEach(char => {
          // Remove spaces trailing breakChars that were added above
          spanContent = spanContent.replace(char + ' ', char);
        });
        tspan.text(spanContent);
        line = [word];
        tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
      }
    }
  });
}
