from flask import Flask
from flask_mysqldb import MySQL
from flask import render_template, request, jsonify
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


@app.route('/genre')
def show_genre():
    level = request.args.get('level') or 'state'
    genre = request.args.get('genre') or 'top'

    cur = mysql.connection.cursor()

    table = level + '_level_data'
    level_code_column = level + '_code'
    level_abbr_column = level + '_abbr'
    genre_column = genre if genre != 'top' else 'dom_genre'

    select_query = "SELECT " + level_code_column + ", " + \
        level_abbr_column + ", " + genre_column + " FROM " + table + \
        " ORDER BY " + genre_column

    cur.execute(select_query)
    data = cur.fetchall()

    for index, state in enumerate(data):
        if state.get('dom_genre'):
            state['dom_genre'] = state['dom_genre'].split("/")[0]
        else:
            del state[genre_column]
        state['ranking'] = index + 1

    return jsonify(data=data)


if __name__ == '__main__':
    app.run(debug=True)
