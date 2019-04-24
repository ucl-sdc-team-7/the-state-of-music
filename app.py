from flask import Flask
from flask_mysqldb import MySQL
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

mysql = MySQL(app)


@app.route('/')
def index():
    return 'Hi International SuperFriends. We have a website running!'


@app.route('/genre/<genre>')
def show_genre(genre):
    return 'Genre %s' % genre


if __name__ == '__main__':
    app.run(debug=True)
