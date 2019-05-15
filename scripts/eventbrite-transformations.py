import requests
import mysql.connector as mysql
import configparser
import json

### read-in data need for sql connection
config = configparser.ConfigParser()
config.read('../config.ini')

db = mysql.connect(
    host=config['mysql']['host'],
    user=config['mysql']['user'],
    passwd=config['mysql']['pass'],
    database="state_of_music"
)
cursor = db.cursor(buffered=True)
cursor2 = db.cursor(buffered=True)

### stage genreDict.json for later user
with open('genreDict.json','r',encoding="utf-8") as file:
    genre_dict = json.loads(file.read())

### run transformations
query = """SELECT genre, eventbrite_id
        FROM eventbrite_events"""

cursor.execute(query)

for row in cursor:
    eb_genre = row[0].lower()
    eb_id = row[1]

    genres = ['country', 'electronic music', 'folk', 'hip hop', 'jazz', 'pop', 'r&b and soul', 'rock', 'classical music']
    event_genre_dict = {}
    for genre in genres:
        event_genre_dict[genre] = 0

    eb_genre = eb_genre.replace("edm / electronic", "electronic music")
    eb_genre = eb_genre.replace("hip hop / rap", "hip hop")
    eb_genre = eb_genre.replace("r&b", "r&b and soul")
    eb_genre = eb_genre.replace("blues & jazz", "jazz")

    for key in event_genre_dict:
        if eb_genre == key:
            event_genre_dict[key] = 1
        elif eb_genre in genre_dict[key]:
            event_genre_dict[key] = 1

    pop = event_genre_dict['pop']
    rock = event_genre_dict['rock']
    hip_hop = event_genre_dict['hip hop']
    rnb = event_genre_dict['r&b and soul']
    classical_and_jazz = event_genre_dict['classical music'] + event_genre_dict['jazz']
    electronic = event_genre_dict['electronic music']
    country_and_folk = event_genre_dict['country'] + event_genre_dict['folk']

    print(eb_id)
    print("genre:", eb_genre)
    for genre in event_genre_dict:
        print(genre, event_genre_dict[genre])

    query = """UPDATE eventbrite_events SET
            pop = %s, rock = %s, hip_hop = %s, rnb = %s,
            classical_and_jazz = %s, electronic = %s,
            country_and_folk = %s
            WHERE eventbrite_id = %s;"""
    values = (pop, rock, hip_hop, rnb,
              classical_and_jazz, electronic,
              country_and_folk, eb_id)
    cursor2.execute(query, values)
    db.commit()
