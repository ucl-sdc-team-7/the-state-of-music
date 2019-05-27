import requests
import mysql.connector as mysql
import configparser
import json


config = configparser.ConfigParser()
config.read('../config.ini')

db = mysql.connect(
    host=config['mysql']['host'],
    user=config['mysql']['user'],
    passwd=config['mysql']['pass'],
    database="state_of_music"
)
cursor = db.cursor(buffered=True)

top_level_genres = ['country', 'electronic music', 'folk', 'hip hop',
                    'jazz', 'pop', 'r&b and soul', 'rock', 'classical music']

# save API URLs as vars
token_url = "https://accounts.spotify.com/api/token"
genres_url = "https://api.spotify.com/v1/search"

# stage params and inputs for Spotify token API
client_id = config['spotify']['client_id']
client_secret = config['spotify']['client_secret']
grant_type = 'client_credentials'
token_params = {'grant_type': grant_type}

# stage genreDict.json for later user
with open('genreDict.json', 'r', encoding="utf-8") as file:
    genre_dict = json.loads(file.read())


def transform_genre_name(genre):
    genre = genre.lower().replace('r&b', 'r&b and soul')
    return genre


def calculate_genre_and_add_to_event(event_genres, genre, weight=1):
    for top_genre in genre_dict.keys():
        if (
            (genre == top_genre) or
            (genre in genre_dict[top_genre])
        ):
            event_genres[top_genre] = event_genres[top_genre] + weight \
                if top_genre in event_genres else weight


select_query = """SELECT event_genre, event_subgenre, artist_name,
                artist_genre, ticketmaster_id, pop
                FROM ticketmaster_events"""

cursor.execute(select_query)
events = cursor.fetchall()

for row in events:
    main_genre_name = row[0]
    sub_genre_name = row[1]
    main_artist_name = row[2]
    main_artist_genre = row[3]
    ticketmaster_id = row[4]
    pop = row[5]

    if pop is None:  # genres need to be calculated for this event

        spotify_genres = []
        genres = {}

        if main_artist_name:
            token = requests.post(token_url,
                                  data=token_params,
                                  auth=(client_id, client_secret)
                                  ).json()['access_token']
            spotify_params = {'q': main_artist_name,
                              'type': 'artist',
                              'access_token': token}
            data = requests.get(url=genres_url, params=spotify_params).json()
            spotify_genres = data['artists']['items'][0]['genres'] if (
                len(data['artists']['items']) > 0 and 'genres' in
                data['artists']['items'][0]) else []

            for spotify_genre in spotify_genres:
                spotify_genre = transform_genre_name(spotify_genre)
                calculate_genre_and_add_to_event(
                    genres, spotify_genre, weight=1)

        if main_artist_genre:
            main_artist_genre = transform_genre_name(main_artist_genre)
            calculate_genre_and_add_to_event(
                genres, main_artist_genre, weight=1)

        if main_genre_name:
            weight = 1
            if (main_artist_genre or spotify_genres):
                weight = 0.5

            main_genre_name = transform_genre_name(main_genre_name)
            calculate_genre_and_add_to_event(genres, main_genre_name, weight)

        if sub_genre_name:
            weight = 1
            if (main_artist_genre or spotify_genres):
                weight = 0.5

            sub_genre_name = transform_genre_name(sub_genre_name)
            calculate_genre_and_add_to_event(genres, sub_genre_name, weight)

        event_genre_totals = sum(genres.values())
        genre_shares = {}
        # Calculate shares
        for top_level_genre in top_level_genres:
            num_genre = genres[top_level_genre] \
                if top_level_genre in genres else 0
            genre_shares[top_level_genre] = (num_genre / event_genre_totals) \
                if event_genre_totals != 0 else 0

        update_query = """UPDATE ticketmaster_events SET
                        pop = %s, rock = %s, hip_hop = %s, rnb = %s,
                        classical_and_jazz = %s, electronic = %s,
                        country_and_folk = %s
                        WHERE ticketmaster_id = %s"""
        values = (genre_shares['pop'],
                  genre_shares['rock'],
                  genre_shares['hip hop'],
                  genre_shares['r&b and soul'],
                  genre_shares['classical music'] + genre_shares['jazz'],
                  genre_shares['electronic music'],
                  genre_shares['country'] + genre_shares['folk'],
                  ticketmaster_id)

        cursor.execute(update_query, values)
        db.commit()
