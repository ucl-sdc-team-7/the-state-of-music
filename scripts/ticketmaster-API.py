import requests
import time
import mysql.connector as mysql
import configparser
import datetime
import csv
from collections import defaultdict

####################################
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
URL = "https://app.ticketmaster.com/discovery/v2/events.json"
URL2 = "https://accounts.spotify.com/api/token"
URL3 = "https://api.spotify.com/v1/search"

### stage params and inputs for Spotify token API
client_id = config['spotify']['client_id']
client_secret = config['spotify']['client_secret']
grant_type = 'client_credentials'
token_params = {'grant_type': grant_type}


##### stage params for TM event search API
us_states = [
              "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DC",
              "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
              "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN",
              "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM",
              "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
              "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA",
              "WI", "WV", "WY"
             ]
classificationName = "music"
size = 200
apikey = config['ticketmaster']['apikey']
start_date = datetime.datetime.today()
date_range = [start_date + datetime.timedelta(days=x) for x in range(0, 30)]
date_list = list(map(lambda x: [x.strftime("%Y-%m-%d"+"T00:00:00Z"),x.strftime(
    "%Y-%m-%d"+"T23:59:59Z")],date_range))

##### stage genre dictionary for genre assignment
genre_dict=defaultdict(list)
csvfile=open('genre-list.csv')
reader= csv.DictReader(csvfile)
for l in reader:
    for k,v in l.items():
        if v != '':
            genre_dict[k].append(v)

#####################################
##########  API CALLS  ##############
#####################################
for us_state in us_states:

    for date in date_list:
        time.sleep(.21)

        params = {'stateCode': us_state,
                  'classificationName': classificationName,
                  'apikey': apikey,
                  'startDateTime': date[0],
                  'endDateTime': date[1],
                  'size': size
                  }
        r = requests.get(url=URL, params=params)
        data = r.json()

        total_events = data['page']['totalElements']

        if total_events > 0 :
            events = data['_embedded']['events']

            for index, event in enumerate(events):
                local_date = event['dates']['start']['localDate']
                event_id = event['id']

                main_genre = event['classifications'][0].get('genre')
                main_genre_name = main_genre['name'] if main_genre else ''
                sub_genre = event['classifications'][0].get('subGenre')
                sub_genre_name = sub_genre['name'] if sub_genre else ''

                main_venue = event['_embedded']['venues'][0]
                main_venue_name = main_venue['name']

                main_venue_location = main_venue.get('location')
                main_venue_lat = main_venue['location'][
                    'latitude'] if main_venue_location else None
                main_venue_lon = main_venue['location'][
                    'longitude'] if main_venue_location else None

                artists = event['_embedded'].get('attractions')
                main_artist_id = artists[0]['id'] if artists else ''
                main_artist_name = artists[0]['name'] if (artists and 'name' in
                    artists[0]) else ''
                main_artist_genre = artists[0]['classifications'][0]['genre'][
                  'name'] if (artists and 'classifications' in artists[
                  0] and 'genre' in artists[0]['classifications'][0]) else ''

                query = """INSERT INTO ticketmaster_events
                            (ticketmaster_id, local_date, event_genre,
                            event_subgenre, venue, venue_lat, venue_long,
                            artist_id, artist_name, artist_genre) VALUES
                             (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
                values = (event_id, local_date, main_genre_name, sub_genre_name,
                          main_venue_name, main_venue_lat, main_venue_lon,
                          main_artist_id, main_artist_name, main_artist_genre)

                cursor.execute(query, values)
                db.commit()
