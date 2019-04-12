from flask import Flask
app = Flask(__name__)


@app.route('/')
def index():
    return 'Hi International SuperFriends. We have a website running!'


@app.route('/genre/<genre>')
def show_genre(genre):
    return 'Genre %s' % genre
