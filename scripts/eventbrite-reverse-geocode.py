import mysql.connector as mysql
import configparser
import googlemaps
import time
import threading

# read-in data need for sql connection
config = configparser.ConfigParser()
config.read('../config.ini')

db = mysql.connect(
    host=config['mysql']['host'],
    user=config['mysql']['user'],
    passwd=config['mysql']['pass'],
    database="state_of_music"
)
cursor = db.cursor()

apikey = config['gmaps']['api_key']
gmaps = googlemaps.Client(key=apikey)

query = """SELECT eventbrite_id, venue_lat, venue_long, state, county
            FROM eventbrite_events"""

cursor.execute(query)

events = cursor.fetchall()
db.close()


def geolocate_events(events):
    db = mysql.connect(
        host=config['mysql']['host'],
        user=config['mysql']['user'],
        passwd=config['mysql']['pass'],
        database="state_of_music"
    )
    cursor = db.cursor()

    for row in events:
        eventbrite_id = row[0]
        venue_lat = row[1]
        venue_long = row[2]
        state = row[3]
        county = row[4]

        if (
            venue_lat and
            venue_long and
            (state is None or county is None)
        ):
            geocoded_result = gmaps.reverse_geocode((venue_lat, venue_long))

            if (geocoded_result[0]):
                state = ""
                county = ""
                for address_component in geocoded_result[0]['address_components']:
                    if (
                        address_component['types'] and
                        address_component['types'][
                            0] == "administrative_area_level_1"
                    ):
                        state = address_component['short_name']
                    if (
                        address_component['types'] and
                        address_component['types'][
                            0] == "administrative_area_level_2"
                    ):
                        county = address_component['short_name']
                        county = county.replace("St ", "St. ")
                        county = county.replace("County", "")
                        county = county.replace("Parish", "")

                query = """UPDATE eventbrite_events SET
                            state = %s, county = %s
                            WHERE eventbrite_id = %s;"""
                values = (state, county, eventbrite_id)

                cursor.execute(query, values)
                db.commit()
            time.sleep(.5)


chunk = int(len(events) / 5)
t1 = threading.Thread(target=geolocate_events,
                      args=(events[0:chunk], ))
t2 = threading.Thread(target=geolocate_events,
                      args=(events[chunk:chunk * 2], ))
t3 = threading.Thread(target=geolocate_events,
                      args=(events[chunk * 2:chunk * 3], ))
t4 = threading.Thread(target=geolocate_events,
                      args=(events[chunk * 3:chunk * 4], ))
t5 = threading.Thread(target=geolocate_events,
                      args=(events[chunk * 4:len(events)], ))

t1.start()
time.sleep(2)
t2.start()
time.sleep(2)
t3.start()
time.sleep(2)
t4.start()
time.sleep(2)
t5.start()
