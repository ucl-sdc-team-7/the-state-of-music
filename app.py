from flask import Flask
from flask_mysqldb import MySQL
from flask import render_template
import configparser
app = Flask(__name__)

config = configparser.ConfigParser()
config.read('config.ini')

# move to config file
app.config['MYSQL_HOST'] = config['mysql']['host']
app.config['MYSQL_USER'] = config['mysql']['user']
app.config['MYSQL_PASSWORD'] = config['mysql']['pass']
app.config['MYSQL_DB'] = 'state_of_music'

mysql = MySQL(app)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/genre/<genre>')
def show_genre(genre):
    return 'Genre %s' % genre


if __name__ == '__main__':
    app.run(debug=True)
