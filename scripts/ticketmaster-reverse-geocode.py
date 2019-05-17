import requests
import mysql.connector as mysql
import configparser
import googlemaps
import time

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

gmaps = googlemaps.Client(key='AIzaSyBcYrsWYbXhwxJ-NQXUSZs6aCoCaiQ-97o')


query = """SELECT ticketmaster_id, venue_lat, venue_long
            FROM ticketmaster_events"""

cursor.execute(query)

for row in cursor:
        ticketmaster_id = row[0]
        venue_lat = row[1]
        venue_long = row[2]

        if venue_lat and venue_long:

            geocoded_result = gmaps.reverse_geocode((venue_lat, venue_long))

            if (geocoded_result[0]):
                state = ""
                county = ""
                for address_component in geocoded_result[0]['address_components']:
                    if (
                        address_component['types'] and
                        address_component['types'][0] == "administrative_area_level_1"
                    ):
                        state = address_component['short_name']
                    if (
                        address_component['types'] and
                        address_component['types'][0] == "administrative_area_level_2"
                    ):
                        county = address_component['short_name']
                        county = county.replace("St", "St.")
                        county = county.replace("County", "")
                        county = county.replace("Parish", "")

                query = """UPDATE ticketmaster_events SET
                        state = %s, county = %s
                        WHERE ticketmaster_id = %s;"""
                values = (state,county,ticketmaster_id)

                cursor2.execute(query, values)
                db.commit()
            time.sleep(.5)
