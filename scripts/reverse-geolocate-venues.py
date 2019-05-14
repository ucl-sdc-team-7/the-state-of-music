import googlemaps
import csv
import time
import mysql.connector as mysql
import configparser

gmaps = googlemaps.Client(key='AIzaSyBcYrsWYbXhwxJ-NQXUSZs6aCoCaiQ-97o')

config = configparser.ConfigParser()
config.read('../config.ini')

db = mysql.connect(
    host=config['mysql']['host'],
    user=config['mysql']['user'],
    passwd=config['mysql']['pass'],
    database="state_of_music"
)

cursor = db.cursor()

query = """SELECT eventbrite_id, venue_lat,
        venue_long FROM eventbrite_events"""

cursor.execute(query)

for row in cursor:
    eventbrite_id = row[0]
    venue_lat = row[1]
    venue_long = row[2]

    print(venue_lat)
    print(venue_long)

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

    print(state)
    print(county)
    print("-------------")

    time.sleep(1)
