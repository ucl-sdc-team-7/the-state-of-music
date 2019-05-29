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
      if (tspan.node().getComputedTextLength() > width - 20) {
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
  } else {
    gen_text = GENRES[current_genre].label;
    gen_text_2 = gen_text;
    gen_text = capitalizeFirstLetter(gen_text);
  }
  //geographical component
  if (geo_level == 'state') {
    geo_text = 'at state level';
    geo_text_2 = 'states';
  } else if (geo_level == 'county') {
    for (i = 0; i < 51; i++) {
      if (states_geo.features[i].properties.abbr == geog) {
        geo_text = states_geo.features[i].properties.name_2;
      }
    }
    geo_text = 'in ' + geo_text;
    geo_text_2 = 'counties';
  } else if (geo_level == 'venue') {
    geo_text = 'in ' + geog;
    geo_text_2 = 'venues';
  }
  $("#titleGenre").html(gen_text + " " + geo_text);
  $("#displayStatsTitle").html("Which " + geo_text_2 + " feel the strongest about " + gen_text_2 + "?")
}


function updateSums(genre) {

  var params = jQuery.param({
    genre: genre,
    filter_state: current_state,
    filter_county: current_county,
  });

  var request_url = "stats/" + geo_level + "?" + params;

  d3.json(request_url, function(error, d) {
    if (error) console.log(error);

    d = d['data']

    var mygenres = Object.keys(GENRES);

    function getSum(total, num) {
      return total + num;
    }

    if (geo_level == "state") {
      var level = "the United States"
    } else if (geo_level == "county") {
      var level = "this state"
    } else if (geo_level == "venue") {
      var level = "this county"
    }


    if (genre != "top" && d.length > 0) {

      var nums = [];
      var key = genre + '_num'
      for (var index in d) {
        nums.push(d[index][key]);
      }

      var nums_arr = {
        genre: genre,
        num: nums.reduce(getSum)
      }


      $("#infoText").empty()
      $("#infoText").html("<small>There are " + nums_arr.num + " " + GENRES[nums_arr.genre].label + " shows playing in " + level + " in the next 30 days. </br>" +
      " Some examples of this genre include " + GENRES[nums_arr.genre].sub_genres + ".</small>");

    } else if (genre == "top" && d.length > 0){
      var mygenres = Object.keys(GENRES);

      var nums_arr = [];

      for (var i in mygenres) {
        var key = mygenres[i] + '_num'
        var nums = [];
        for (var index in d) {
          nums.push(d[index][key]);
        }

        nums_arr.push({
          [mygenres[i]]: nums.reduce(getSum)
        })

      }

      var sums = []
      for (var obj in nums_arr) {
        var obj = nums_arr[obj]
        for (var i in obj) {
          sums.push(obj[i])
        }
      }

      var total_shows = sums.reduce(getSum)

      var pop_perc = nums_arr[0]['pop'] / total_shows * 100
      pop_perc = pop_perc.toFixed(0)

      var rock_perc = nums_arr[1]['rock'] / total_shows * 100
      rock_perc = rock_perc.toFixed(0)

      var hiphop_perc = nums_arr[2]['hip_hop'] / total_shows * 100
      hiphop_perc = hiphop_perc.toFixed(0)

      var rnb_perc = nums_arr[3]['rnb'] / total_shows * 100
      rnb_perc = rnb_perc.toFixed(0)

      var classicaljazz_perc = nums_arr[4]['classical_and_jazz'] / total_shows * 100
      classicaljazz_perc = classicaljazz_perc.toFixed(0)

      var electronic_perc = nums_arr[5]['electronic'] / total_shows * 100
      electronic_perc = electronic_perc.toFixed(0)

      var countryfolk_perc = nums_arr[6]['country_and_folk'] / total_shows * 100
      countryfolk_perc = countryfolk_perc.toFixed(0)


      $("#infoText").empty()
      $("#infoText").html("<small>There are a total of " + total_shows + " shows playing in " + level + " this month." +
        " Out of which, " +
        pop_perc + "% are pop shows, " +
        rock_perc + "% are rock, " +
        hiphop_perc + "% are hip hop, " +
        rnb_perc + "% are R&B, " +
        classicaljazz_perc + "% are classical & jazz, " +
        electronic_perc + "% are electronic and " +
        countryfolk_perc + "% are country & folk.</small>"
      );
    } else {
      $("#infoText").empty()
      $("#infoText").html("<small>No upcoming shows this month.</small>")
    }
  });
}
