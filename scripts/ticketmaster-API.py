import requests
import time
import mysql.connector as mysql
import configparser
import datetime
import csv
from collections import defaultdict
import urllib
from bs4 import BeautifulSoup as BS
import ssl
import re
import random



#####################################
############  STAGING  ##############
#####################################
### set-up genre list
x = ssl.create_default_context()
x.check_hostname = False
x.verify_mode = ssl.CERT_NONE
url = "https://en.wikipedia.org/wiki/List_of_music_styles"

html = urllib.request.urlopen(url, context=x).read()
soup = BS(html, 'html.parser')
print(soup)

# for link in soup.find_all('li'):
#     print(link)

# for link in soup.find_all('a'):
#     print(link.get_text('title'))

#
# ### read-in data need for sql connection
# config = configparser.ConfigParser()
# config.read('../config.ini')
#
# db = mysql.connect(
#     host=config['mysql']['host'],
#     user=config['mysql']['user'],
#     passwd=config['mysql']['pass'],
#     database="state_of_music"
# )
#
# cursor = db.cursor()
#
# ### save API URLs as vars
# URL = "https://app.ticketmaster.com/discovery/v2/events.json"
# URL2 = "https://accounts.spotify.com/api/token"
# URL3 = "https://api.spotify.com/v1/search"
#
# ### stage params and inputs for Spotify token API
# client_id = config['spotify']['client_id']
# client_secret = config['spotify']['client_secret']
# grant_type = 'client_credentials'
# token_params = {'grant_type': grant_type}
#
#
# ##### stage params for TM event search API
# us_states = [
#               "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DC",
#               "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
#               "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN",
#               "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM",
#               "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
#               "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA",
#               "WI", "WV", "WY"
#              ]
# classificationName = "music"
# size = 200
# apikey = config['ticketmaster']['apikey']
# start_date = datetime.datetime.today()
# date_range = [start_date + datetime.timedelta(days=x) for x in range(0, 30)]
# date_list = list(map(lambda x: [x.strftime("%Y-%m-%d"+"T00:00:00Z"),x.strftime(
#     "%Y-%m-%d"+"T23:59:59Z")],date_range))
#
# ##### stage genre dictionary for genre assignment
# genre_dict=defaultdict(list)
# csvfile=open('genre-list.csv')
# reader= csv.DictReader(csvfile)
# for l in reader:
#     for k,v in l.items():
#         if v != '':
#             genre_dict[k].append(v)
#
#
# #####################################
#
# #####################################
# ##########  API CALLS  ##############
# #####################################
# for us_state in us_states:
#     print(us_state)
#
#     for date in date_list:
#         entry = 0
#         # print(date[0])
#         time.sleep(.21)
#
#         params = {'stateCode': us_state,
#                   'classificationName': classificationName,
#                   'apikey': apikey,
#                   'startDateTime': date[0],
#                   'endDateTime': date[1],
#                   'size': size
#                   }
#         r = requests.get(url=URL, params=params)
#         data = r.json()
#
#         total_events = data['page']['totalElements']
#
#         if total_events > 0 :
#             events = data['_embedded']['events']
#
#             for index, event in enumerate(events):
#                 local_date = event['dates']['start']['localDate']
#                 event_id = event['id']
#
#                 main_genre = event['classifications'][0].get('genre')
#                 main_genre_name = main_genre['name'] if main_genre else ''
#                 sub_genre = event['classifications'][0].get('subGenre')
#                 sub_genre_name = sub_genre['name'] if sub_genre else ''
#
#                 main_venue = event['_embedded']['venues'][0]
#                 main_venue_name = main_venue['name']
#
#                 main_venue_location = main_venue.get('location')
#                 main_venue_lat = main_venue['location'][
#                     'latitude'] if main_venue_location else None
#                 main_venue_lon = main_venue['location'][
#                     'longitude'] if main_venue_location else None
#
#                 artists = event['_embedded'].get('attractions')
#                 main_artist_id = artists[0]['id'] if artists else ''
#                 main_artist_name = artists[0]['name'] if (artists and 'name' in
#                     artists[0]) else ''
#                 main_artist_genre = artists[0]['classifications'][0]['genre'][
#                   'name'] if (artists and 'classifications' in artists[
#                   0] and 'genre' in artists[0]['classifications'][0]) else ''
#
#                 if main_artist_name is not '':
#                     token = requests.post(  URL2,
#                                             data=token_params,
#                                             auth=(client_id,client_secret)
#                                             ).json()['access_token']
#                     spotify_params = {  'q': main_artist_name,
#                                         'type': 'artist',
#                                         'access_token': token}
#                     data = requests.get(url=URL3,params=spotify_params).json()
#                     spotify_genres = data['artists']['items'][0]['genres'] if (
#                          len(data['artists']['items']) > 0 and 'genres' in
#                          data['artists']['items'][0]) else []
#
#
#
#                 genre_list = list()
#                 if main_genre_name != '':
#                     genre_list.append(main_genre_name.lower())
#                 if sub_genre_name != '':
#                     genre_list.append(sub_genre_name.lower())
#                 if (main_artist_name != '' and spotify_genres != []):
#                     for genre in spotify_genres:
#                         genre_list.append(genre.lower())
#
#                 entry = entry + 1
#
#
#                 # print('\n',entry, "'"+main_artist_name+"'")
#                 # print("main_genre_name:",main_genre_name)
#                 # print("sub_genre_name:",sub_genre_name)
#                 # if main_artist_name is not '':
#                 #     print("spotify_genres:",spotify_genres)
#                 #
#                 # print("genre_list:",genre_list)
#
#                 event_genre_dict = {'Other':0,
#                                     'Pop':0,
#                                     'Rock':0,
#                                     'Electronic':0,
#                                     'Hip Hop':0,
#                                     'R&B':0,
#                                     'Indie':0,
#                                     'Country and Folk':0,
#                                     'Metal':0,
#                                     'Classical':0,
#                                     'Jazz':0
#                                     }
#
#                 for genre in genre_list:
#                     for key in genre_dict:
#                         for genre_match in genre_dict[key]:
#                             if genre == genre_match.lower():
#                                 event_genre_dict[key] = event_genre_dict[key] + 1
#
#                 total = (event_genre_dict['Pop'] +
#                         event_genre_dict['Rock'] +
#                         event_genre_dict['Metal'] +
#                         event_genre_dict['Indie'] +
#                         event_genre_dict['Hip Hop'] +
#                         event_genre_dict['R&B'] +
#                         event_genre_dict['Classical'] +
#                         event_genre_dict['Jazz'] +
#                         event_genre_dict['Electronic'] +
#                         event_genre_dict['Country and Folk'] +
#                         event_genre_dict['Other'])
#
#                 if total > 0:
#                     pop = event_genre_dict['Pop'] / total
#                     rock_and_metal = ((event_genre_dict['Rock'] +
#                                         event_genre_dict['Metal']) / total)
#                     indie = event_genre_dict['Indie'] / total
#                     hip_hop = event_genre_dict['Hip Hop'] / total
#                     rnb = event_genre_dict['R&B'] / total
#                     classical_and_jazz = ((event_genre_dict['Classical'] +
#                                             event_genre_dict['Jazz']) / total)
#                     electronic_and_dance = event_genre_dict['Electronic'] / total
#                     country_and_folk = event_genre_dict['Country and Folk'] / total
#                     other = event_genre_dict['Other'] / total
#                 else:
#                     pop = 0
#                     rock_and_metal = 0
#                     indie = 0
#                     hip_hop = 0
#                     rnb = 0
#                     classical_and_jazz = 0
#                     electronic_and_dance = 0
#                     country_and_folk = 0
#                     other = 0

                # query = """INSERT INTO ticketmaster_events
                #             (ticketmaster_id, local_date, event_genre,
                #             event_subgenre, venue, venue_lat, venue_long,
                #             artist_id, artist_name, artist_genre, pop,
                #             rock_and_metal, indie, hip_hop, r_n_b,
                #             classical_and_jazz, country_and_folk, other) VALUES
                #              (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                #              %s, %s, %s, %s, %s)"""
                # values = (event_id, local_date, main_genre_name, sub_genre_name,
                #           main_venue_name, main_venue_lat, main_venue_lon,
                #           main_artist_id, main_artist_name, main_artist_genre,
                #           pop, rock_and_metal, indie, hip_hop, rnb,
                #           classical_and_jazz, country_and_folk, other)
                #
                # cursor.execute(query, values)
                # db.commit()
