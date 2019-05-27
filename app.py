from flask import Flask
from flask_mysqldb import MySQL
from flask import render_template, request, jsonify
import configparser
import simplejson as json
import os
app = Flask(__name__)

config = configparser.ConfigParser()
PROJECT_ROOT = os.path.realpath(os.path.dirname(__file__))
config.read(os.path.join(PROJECT_ROOT, 'config.ini'))

# move to config file
app.config['MYSQL_HOST'] = config['mysql']['host']
app.config['MYSQL_USER'] = config['mysql']['user']
app.config['MYSQL_PASSWORD'] = config['mysql']['pass']
app.config['MYSQL_DB'] = 'state_of_music'
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'

mysql = MySQL(app)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/states')
def get_states_genres():
    genre = request.args.get('genre') or 'top'

    cur = mysql.connection.cursor()

    genre_column = genre + '_norm' if genre != 'top' else 'dom_genre'

    select_query = "SELECT state_code, state_name, state_abbr, " + \
        genre_column + " FROM state_level_data ORDER BY " + \
        genre_column + ' DESC;'

    cur.execute(select_query)
    data = cur.fetchall()

    index_no_events = 0
    for index, state in enumerate(data):
        if state.get('dom_genre'):
            state['dom_genre'] = state['dom_genre'].split("/")[0]
        else:
            state['value'] = state[genre_column]
            del state[genre_column]
            if (state['value'] == 0):
                if index_no_events == 0:
                    index_no_events = index
                state['ranking'] = index_no_events
            else:
                state['ranking'] = index + 1

    return jsonify(data=data)


@app.route('/counties')
def get_counties_genres():
    genre = request.args.get('genre') or 'top'

    cur = mysql.connection.cursor()

    genre_column = genre + '_norm' if genre != 'top' else 'dom_genre'

    select_query = "SELECT state_code, state_abbr, " + \
        "county_code, county_name, " + genre_column + \
        " FROM county_level_data ORDER BY " + genre_column + ' DESC;'

    cur.execute(select_query)
    data = cur.fetchall()

    index_no_events = 0
    for index, county in enumerate(data):
        if county.get('dom_genre'):
            county['dom_genre'] = county['dom_genre'].split("/")[0]
        else:
            county['value'] = county[genre_column]
            del county[genre_column]
            if (county['value'] == 0):
                if index_no_events == 0:
                    index_no_events = index
                county['ranking'] = index_no_events
            else:
                county['ranking'] = index + 1

    return jsonify(data=data)


@app.route('/venues')
def get_venues_genres():
    genre = request.args.get('genre') or 'top'

    cur = mysql.connection.cursor()

    genre_column = genre if genre != 'top' else 'dom_genre'

    select_query = "SELECT venue, venue_lat, venue_long, " + \
        genre_column + \
        " FROM venue_level_data ORDER BY " + genre_column + ' DESC;'

    cur.execute(select_query)
    data = cur.fetchall()

    index_no_events = 0
    for index, venue in enumerate(data):
        if venue.get('dom_genre'):
            venue['dom_genre'] = venue['dom_genre'].split("/")[0]
        else:
            venue['value'] = venue[genre_column]
            del venue[genre_column]
            if (venue['value'] == 0):
                if index_no_events == 0:
                    index_no_events = index
                venue['ranking'] = index_no_events
            else:
                venue['ranking'] = index + 1

    return jsonify(data=data)

@app.route('/top')
def get_top_stats():
    level = request.args.get('level') or 'state'

    cur = mysql.connection.cursor()

    genre_column = 'dom_genre'
    level_name_column = level + "_name"
    table = level + "_level_data"

    if level != "venue":

        select_query = "SELECT pop_norm, rock_norm, hip_hop_norm, rnb_norm, classical_and_jazz_norm, electronic_norm, country_and_folk_norm, " + \
            level_name_column + ", " + genre_column + \
            " FROM " + table + ";"

    else:
        select_query = "SELECT pop, rock, hip_hop, rnb, classical_and_jazz, electronic, country_and_folk, venue" + \
            " FROM " + table + ";"

    cur.execute(select_query)
    data = cur.fetchall()

    for index, genre in enumerate(data):
        if genre.get('dom_genre'):
            genre['dom_genre'] = genre['dom_genre'].split("/")[0]

        if level != "venue":
            for i in ['pop_norm', 'rock_norm', 'hip_hop_norm', 'rnb_norm', 'classical_and_jazz_norm', 'electronic_norm', 'country_and_folk_norm']:
                head,sep,tail = i.partition('_norm')
                genre[head] = genre[i]
                del genre[i]

    return jsonify(data=data)


if __name__ == '__main__':
    app.run(debug=True)
