import requests
import time
import mysql.connector as mysql
import configparser
import datetime
import csv
from collections import defaultdict
import json

###################################
###########  STAGING  ##############
####################################
### read-in data need for sql connection
config = configparser.ConfigParser()
config.read('../config.ini')

db = mysql.connect(
    host=config['mysql']['host'],
    user=config['mysql']['user'],
    passwd=config['mysql']['pass'],
    database="state_of_music"
)

cursor = db.cursor()

### save API URLs as vars
URL = "https://accounts.spotify.com/api/token"
URL2 = "https://api.spotify.com/v1/search"

### stage params and inputs for Spotify token API
client_id = config['spotify']['client_id']
client_secret = config['spotify']['client_secret']
grant_type = 'client_credentials'
token_params = {'grant_type': grant_type}

### stage genreDict.json for later user
with open('genreDict.json','r',encoding="utf-8") as file:
    genre_dict = json.loads(file.read())

#####################################
##########  FUNCTIONS  ##############
#####################################

def addEntry(dict,key,vars):
    dict = dict
    dict[key] = vars
    return dict;

def calcShare(genre):
    share = (event_genre_dict[genre] / total)
    return share;

# ###########################################
# ##########  TRANSFORMATIONS  ##############
# ###########################################

query = """SELECT event_genre, event_subgenre, artist_name, artist_genre, ticketmaster_id
            FROM ticketmaster_events"""

cursor.execute(query)

count = 0

for row in cursor:
    # if count < 5:
        main_genre_name = row[0]
        sub_genre_name = row[1]
        main_artist_name = row[2]
        main_artist_genre = row[3]
        ticketmaster_id = row[4]

        if main_artist_name is not '':
            token = requests.post(  URL,
                                    data=token_params,
                                    auth=(client_id,client_secret)
                                    ).json()['access_token']
            spotify_params = {  'q': main_artist_name,
                                'type': 'artist',
                                'access_token': token}
            data = requests.get(url=URL2,params=spotify_params).json()
            spotify_genres = data['artists']['items'][0]['genres'] if (
                 len(data['artists']['items']) > 0 and 'genres' in
                 data['artists']['items'][0]) else []

            genres = {}

            if main_genre_name != '':
                genres = addEntry(genres,'tm_main',[main_genre_name.lower()])
            if sub_genre_name != '':
                genres = addEntry(genres,'tm_sub',[sub_genre_name.lower()])
            if main_artist_name != '':
                genres = addEntry(genres,'tm_artist',[main_artist_genre.lower()])
            if (main_artist_name != '' and spotify_genres != []):
                genres = addEntry(genres,'spotify',spotify_genres)


            event_genre_dict = {'country':0,
                                'electronic music':0,
                                'folk':0,
                                'hip hop':0,
                                'jazz':0,
                                'pop':0,
                                'r&b and soul':0,
                                'rock':0,
                                'classical music':0,
                                }

            print(main_artist_name)

            if 'spotify' in genres or 'tm_artist' in genres:
                for dict in genres:
                    if dict in ['spotify','tm_artist']:
                        for genre in genres[dict]:
                            for key in event_genre_dict:
                                if genre.lower() in genre_dict[key]:
                                    print(genre,("---->"),key)
                                    event_genre_dict[key] = event_genre_dict[key] + 1.0
                                elif genre.lower() == key.lower():
                                    print(genre,("---->"),key)
                                    event_genre_dict[key] = event_genre_dict[key] + 1.0
                                elif 'r&b' in genre.lower():
                                    new_genre = genre.lower().replace('r&b','r&b and soul')
                                    if new_genre == key.lower():
                                        print(new_genre,("---->"),key)
                                        event_genre_dict[key] = event_genre_dict[key] + 1.0
                    else:
                        for genre in genres[dict]:
                            for key in event_genre_dict:
                                if genre.lower() in genre_dict[key]:
                                    print(genre,("---->"),key)
                                    event_genre_dict[key] = event_genre_dict[key] + 0.5
                                elif genre.lower() == key.lower():
                                    print(genre,("---->"),key)
                                    event_genre_dict[key] = event_genre_dict[key] + 0.5
                                elif 'r&b' in genre.lower():
                                    new_genre = genre.lower().replace('r&b','r&b and soul')
                                    if new_genre == key.lower():
                                        print(new_genre,("---->"),key)
                                        event_genre_dict[key] = event_genre_dict[key] + 0.5
            else:
                for dict in genres:
                    for genre in genres[dict]:
                        for key in event_genre_dict:
                            if genre.lower() in genre_dict[key]:
                                print(genre,("---->"),key)
                                event_genre_dict[key] = event_genre_dict[key] + 1.0
                            elif genre.lower() in genre_dict[key]:
                                print(genre,("---->"),key)
                                event_genre_dict[key] = event_genre_dict[key] + 1.0
                            elif 'r&b' in genre.lower():
                                new_genre = genre.lower().replace('r&b','r&b and soul')
                                if new_genre == key.lower():
                                    print(new_genre,("---->"),key)
                                    event_genre_dict[key] = event_genre_dict[key] + 1.0

            total = 0
            for key in event_genre_dict:
                total = total + event_genre_dict[key]

            if total > 0:
                pop = calcShare('pop')
                rock = calcShare('rock')
                hip_hop = calcShare('hip hop')
                rnb = calcShare('r&b and soul')
                classical_and_jazz = calcShare('classical music') + calcShare('jazz')
                electronic = calcShare('electronic music')
                country_and_folk = calcShare('country') + calcShare('folk')
            else:
                (pop,rock,hip_hop,rnb,classical_and_jazz,
                electronic,country_and_folk) = (0,0,0,0,0,0,
                0,0,0)

            print(pop)
            print(rock)
            print(hip_hop)
            print(rnb)
            print(classical_and_jazz)
            print(electronic)
            print(country_and_folk)

            count = count + 1

            print(count)

            query = """INSERT INTO ticketmaster_events
                        (ticketmaster_id, local_date, event_genre,
                        event_subgenre, venue, venue_lat, venue_long,
                        artist_id, artist_name, artist_genre, pop,
                        rock, hip_hop, r_n_b,
                        classical_and_jazz, electronic,
                        country_and_folk) VALUES
                         (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                         %s, %s, %s, %s, %s, %s) WHERE (ticketmaster_id == %s)"""
            values = (event_id, local_date, main_genre_name, sub_genre_name,
                      main_venue_name, main_venue_lat, main_venue_lon,
                      main_artist_id, main_artist_name, main_artist_genre,
                      pop, rock, hip_hop, rnb,
                      classical_and_jazz, electronic,
                      country_and_folk, ticketmaster_id)

            cursor.execute(query, values)
            db.commit()
