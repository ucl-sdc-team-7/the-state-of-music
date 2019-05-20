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
cursor3 = db.cursor(buffered=True)

genres = ['pop','rock','hip_hop','rnb','classical_and_jazz','electronic','country_and_folk']

query = """SELECT state, county, venue, dom_genre FROM all_events"""
cursor.execute(query)

for event in cursor:
        state = event[0]
        county = event[1][:-1] if event[1][-1] == " " else event[1] # omit trailing space
        venue = event[2]
        dom_genre = event[3]

        query = """SELECT state_abbr, county_name, pop, rock, hip_hop, rnb,
                classical_and_jazz, electronic, country_and_folk, all_genres,
                dom_genre FROM venue_level_data WHERE state_abbr = %s AND
                county_name = %s AND venue = %s"""
        values = (state,county,venue)
        cursor2.execute(query,values)

        for row in cursor2:
            state_abbr = row[0]
            county_name = row[1]
            pop = float(row[2])
            rock = float(row[3])
            hip_hop = float(row[4])
            rnb = float(row[5])
            classical_and_jazz = float(row[6])
            electronic = float(row[7])
            country_and_folk = float(row[8])
            all_genres = float(row[9])
            dom_genre_venue = row[10]
            genre_dict = {'pop': pop,
                          'rock': rock,
                          'hip_hop': hip_hop,
                          'rnb': rnb,
                          'classical_and_jazz': classical_and_jazz,
                          'electronic': electronic,
                          'country_and_folk': country_and_folk}

            if len(dom_genre.split("/")) == 1 and dom_genre in genres: #if a single genre is dominant
                genre_dict[dom_genre] = genre_dict[dom_genre] + 1
            elif len(dom_genre.split("/")) > 1: #if multiple genres share dominance
                weight = (1 / len(dom_genre.split("/"))) #assign weight for partial genres
                for partial_dom_genre in dom_genre.split("/"):
                    if partial_dom_genre in genres:
                        genre_dict[partial_dom_genre] = genre_dict[partial_dom_genre] + weight

            max = 0
            all_genres = 0
            for genre in genre_dict:
                if genre_dict[genre] > 0:
                    all_genres = all_genres + genre_dict[genre]
                if genre_dict[genre] > max and genre_dict[genre] > 0:
                    max = genre_dict[genre]
                    dom_genre_venue = genre
                elif genre_dict[genre] == max and genre_dict[genre] > 0:
                    dom_genre_venue = dom_genre_venue + "/" + genre

            query = """UPDATE venue_level_data SET
                    pop = %s, rock = %s, hip_hop = %s,
                    rnb = %s, classical_and_jazz = %s,
                    electronic = %s, country_and_folk = %s,
                    all_genres = %s, dom_genre = %s
                    WHERE state_abbr = %s AND county_name = %s AND venue = %s;"""
            values = (genre_dict['pop'], genre_dict['rock'], genre_dict['hip_hop'],
                      genre_dict['rnb'], genre_dict['classical_and_jazz'],
                      genre_dict['electronic'], genre_dict['country_and_folk'],
                      all_genres, dom_genre_venue, state_abbr,county_name,venue)
            cursor3.execute(query, values)
            db.commit()
