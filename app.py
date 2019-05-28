from flask import Flask
from flask_mysqldb import MySQL
from flask import render_template, request, jsonify, abort
import configparser
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


@app.route('/search')
def search():
    genre = request.args.get('genre') or 'top'
    state = request.args.get('state') or None
    county = request.args.get('county') or None
    level = request.args.get('admin_level') or None

    if level == '1' and county is not None:
        return abort(400)

    if level == '1':
        return get_states_data(genre, state)
    elif level == '2':
        return get_counties_data(genre, state, county)
    elif level == '3':
        return get_venues_data(genre, state, county)
    else:
        message = """Parameter `admin_level` is required
            and can only be 1, 2, or 3"""
        return abort(400, message)
    return


def get_states_data(genre, state):
    cur = mysql.connection.cursor()

    genre_column = genre + '_norm' if genre != 'top' else 'dom_genre'
    genre_num = genre + '_num' \
        if genre != 'top' \
        else 'pop_num, rock_num, hip_hop_num, rnb_num, classical_and_jazz_num, electronic_num, country_and_folk_num'

    where_clause = ''
    if state:
        where_clause = "WHERE state_abbr = '" + state + "'"
    select_query = "SELECT state_code, state_name, state_abbr, " + \
        genre_column + ", " + genre_num + " FROM state_level_data " + \
        where_clause + " ORDER BY " + \
        genre_column + ' DESC;'

    cur.execute(select_query)
    data = cur.fetchall()

    for index, state in enumerate(data):
        if state.get('dom_genre'):
            state['dom_genre'] = state['dom_genre'].split("/")[0]
        else:
            state['value'] = state[genre_column]
            del state[genre_column]
            if (state['value'] != 0):
                state['ranking'] = index + 1

    return jsonify(data=data)


def get_counties_data(genre, state, county):
    cur = mysql.connection.cursor()

    genre_column = genre + '_norm' if genre != 'top' else 'dom_genre'
    genre_num = genre + '_num' \
        if genre != 'top' \
        else 'pop_num, rock_num, hip_hop_num, rnb_num, classical_and_jazz_num, electronic_num, country_and_folk_num'

    where_clause = ''
    if state:
        where_clause = "WHERE state_abbr = '" + state + "'"
        if county:
            where_clause += ' AND county_name = "' + county + '"'
    elif county:
        where_clause = 'WHERE county_name = "' + county + '"'

    select_query = "SELECT state_code, state_abbr, " + \
        "county_code, county_name, " + genre_column + ", " + genre_num + \
        " FROM county_level_data " + where_clause + \
        " ORDER BY " + genre_column + ' DESC;'

    cur.execute(select_query)
    data = cur.fetchall()

    for index, county in enumerate(data):
        if county.get('dom_genre'):
            county['dom_genre'] = county['dom_genre'].split("/")[0]
        else:
            county['value'] = county[genre_column]
            del county[genre_column]
            if (county['value'] != 0):
                county['ranking'] = index + 1

    return jsonify(data=data)


def get_venues_data(genre, state, county):
    cur = mysql.connection.cursor()

    genre_column = genre if genre != 'top' else 'dom_genre'
    genre_num = genre + '_num' \
        if genre != 'top' \
        else 'pop_num, rock_num, hip_hop_num, rnb_num, classical_and_jazz_num, electronic_num, country_and_folk_num'

    where_clause = ''
    if state:
        where_clause = "WHERE state_abbr = '" + state + "'"
        if county:
            where_clause += ' AND county_name = "' + county + '"'
    elif county:
        where_clause = 'WHERE county_name = "' + county + '"'

    select_query = "SELECT venue, venue_lat, venue_long, " + \
        genre_column + ", " + genre_num + \
        " FROM venue_level_data " + where_clause + \
        " ORDER BY " + genre_column + ' DESC;'

    cur.execute(select_query)
    data = cur.fetchall()

    for index, venue in enumerate(data):
        if venue.get('dom_genre'):
            venue['dom_genre'] = venue['dom_genre'].split("/")[0]
        else:
            venue['value'] = venue[genre_column]
            del venue[genre_column]
            if (venue['value'] != 0):
                venue['ranking'] = index + 1

    return jsonify(data=data)


@app.route('/stats/state')
def get_state_stats():

    genre = request.args.get('genre') or 'top'

    cur = mysql.connection.cursor()

    genre_column = genre + '_norm'

    if genre != "top":
        select_query = "SELECT state_code, state_name, state_abbr, " + \
            genre_column + " FROM state_level_data ORDER BY " + \
            genre_column + ' DESC;'

    else:
        select_query = "SELECT pop_norm, rock_norm, hip_hop_norm, rnb_norm, classical_and_jazz_norm, electronic_norm, country_and_folk_norm, " + \
            "state_name FROM state_level_data;"

    cur.execute(select_query)
    data = cur.fetchall()

    for index, state in enumerate(data):
        if genre != "top":
            state['value'] = state[genre_column]
            del state[genre_column]
            if (state['value'] != 0):
                state['ranking'] = index + 1

        else:
            for i in ['pop_norm', 'rock_norm', 'hip_hop_norm', 'rnb_norm', 'classical_and_jazz_norm', 'electronic_norm', 'country_and_folk_norm']:
                head, sep, tail = i.partition('_norm')
                state[head] = state[i]
                del state[i]

    return jsonify(data=data)


@app.route('/stats/county')
def get_county_stats():
    genre = request.args.get('genre') or 'top'
    filter_state = request.args.get('filter_state')

    genre_column = genre + '_norm' if genre != 'top' else 'dom_genre'

    cur = mysql.connection.cursor()

    if genre == "top":
        select_query = "SELECT pop_norm, rock_norm, hip_hop_norm, rnb_norm, classical_and_jazz_norm, electronic_norm, country_and_folk_norm, " + \
            "county_name FROM county_level_data WHERE state_abbr = " + "'" + filter_state + "';"

    else:
        select_query = "SELECT state_code, state_abbr, " + \
            "county_code, county_name, " + genre_column + \
            " FROM county_level_data WHERE state_abbr = " + "'" + filter_state + "'" + \
            " ORDER BY " + genre_column + ' DESC;'

    cur.execute(select_query)
    data = cur.fetchall()

    for index, county in enumerate(data):
        if genre != "top":
            county['value'] = county[genre_column]
            del county[genre_column]
            if (county['value'] != 0):
                county['ranking'] = index + 1
        else:
            for i in ['pop_norm', 'rock_norm', 'hip_hop_norm', 'rnb_norm', 'classical_and_jazz_norm', 'electronic_norm', 'country_and_folk_norm']:
                head, sep, tail = i.partition('_norm')
                county[head] = county[i]
                del county[i]

    return jsonify(data=data)


@app.route('/stats/venue')
def get_venue_stats():
    genre = request.args.get('genre') or 'top'
    filter_state = request.args.get('filter_state')
    filter_county = request.args.get('filter_county')

    cur = mysql.connection.cursor()

    genre_column = genre if genre != 'top' else 'dom_genre'

    if genre == "top":
        select_query = "SELECT pop, rock, hip_hop, rnb, classical_and_jazz, electronic, country_and_folk, venue, " + \
            "county_name FROM venue_level_data WHERE state_abbr = " + "'" + filter_state + "'" + \
            " AND county_name = " + "'" + filter_county + "';"

    else:
        select_query = "SELECT venue, venue_lat, venue_long, " + \
            genre_column + \
            " FROM venue_level_data WHERE state_abbr = " + "'" + filter_state + "'" + \
            " AND county_name = " + "'" + filter_county + "'"\
            " ORDER BY " + genre_column + ' DESC;'

    cur.execute(select_query)
    data = cur.fetchall()

    for index, venue in enumerate(data):
        if genre != "top":
            venue['value'] = venue[genre_column]
            del venue[genre_column]
            if (venue['value'] != 0):
                venue['ranking'] = index + 1

    return jsonify(data=data)

if __name__ == '__main__':
    app.run(debug=True)
