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
cursor4 = db.cursor(buffered=True)

genres = ['pop','rock','hip_hop','rnb','classical_and_jazz','electronic','country_and_folk']

st_co_dict = dict()

query = """SELECT state_code, state_name, state_abbr, county_code, county_name,
        pop_2018 FROM populations;"""
cursor.execute(query)

for row in cursor:
    state_code = row[0]
    state_name = row[1]
    state_abbr = row[2]
    county_code = row[3]
    county_name = row[4]
    pop_2018 = row[5]

    st_co = str(state_abbr) + "|" + str(county_name)

    state_dict = {'state': state_abbr,
                  'county': county_name,
                  'genre_dict': {'pop': 0,
                                'rock': 0,
                                'hip_hop': 0,
                                'rnb': 0,
                                'classical_and_jazz': 0,
                                'electronic': 0,
                                'country_and_folk': 0}
                }

    st_co_dict[st_co] = state_dict


    query = """INSERT INTO final_data
            (state_code, state_name, state_abbr, county_code, county_name,
            pop_2018) VALUES (%s, %s, %s, %s, %s, %s);"""
    values = (state_code, state_name, state_abbr, county_code, county_name,
              pop_2018)
    cursor2.execute(query, values)
    db.commit()


query = """SELECT state, county, dom_genre FROM all_events"""
cursor3.execute(query)

for row in cursor3:
    state = row[0]
    county = row[1]
    dom_genre = row[2]

    if state and county:
        if str(county)[-1] == ' ':
            county = str(county)[:-1]

        st_co = str(state) + "|" + str(county)

        if len(dom_genre.split("/")) == 1 and dom_genre in genres: #if a single genre is dominant
            st_co_dict[st_co]['genre_dict'][str(dom_genre)] = (st_co_dict[st_co]['genre_dict'][str(dom_genre)] + 1)

        elif len(dom_genre.split("/")) > 1: #if multiple genres share dominance
            weight = (1 / len(dom_genre.split("/"))) #assign weight for partial genres
            for partial_dom_genre in dom_genre.split("/"):
                if partial_dom_genre in genres:
                    st_co_dict[st_co]['genre_dict'][str(partial_dom_genre)] = st_co_dict[st_co]['genre_dict'][str(partial_dom_genre)] + weight

for st_co in st_co_dict:
    query = """UPDATE final_data SET
            pop = %s, rock = %s, hip_hop = %s,
            rnb = %s, classical_and_jazz = %s,
            electronic = %s, country_and_folk = %s
            WHERE state_abbr = %s AND county_name = %s;"""
    values = (st_co_dict[st_co]['genre_dict']['pop'],
              st_co_dict[st_co]['genre_dict']['rock'],
              st_co_dict[st_co]['genre_dict']['hip_hop'],
              st_co_dict[st_co]['genre_dict']['rnb'],
              st_co_dict[st_co]['genre_dict']['classical_and_jazz'],
              st_co_dict[st_co]['genre_dict']['electronic'],
              st_co_dict[st_co]['genre_dict']['country_and_folk'],
              st_co_dict[st_co]['state'],
              st_co_dict[st_co]['county'])
    cursor4.execute(query, values)
    db.commit()
