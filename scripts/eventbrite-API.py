import requests
# import time
import mysql.connector as mysql
import configparser

config = configparser.ConfigParser()
config.read('../config.ini')

db = mysql.connect(
    host=config['mysql']['host'],
    user=config['mysql']['user'],
    passwd=config['mysql']['pass'],
    database="state_of_music"
)

cursor = db.cursor()

base_url = "https://www.eventbriteapi.com/v3/"

####
# TODO: instead of passing a giant viewport for the whole US,
# iterate through the states.
# An approach that could work is to get the centroid for every
# state and have a really wide "within" param.
# There's going to be overlap between states with that approach,
# but we can eliminate duplicates in the DB afterwards.
####
# us_states = ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE",
#              "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS",
#              "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS",
#              "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY",
#              "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
#              "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"]

token = config['eventbrite']['token']
categories = '103'  # music
formats = '6'  # concerts and performances
location_lat_ne = '46.406436'  # random northeast point
location_long_ne = '-65.7526587'
location_lat_sw = '28.06344'  # random southwest point
location_long_sw = '-123.3917947'
date_range_start = '2019-05-01T00:00:00'
date_range_end = '2019-05-31T23:59:59'

params = {'token': token,
          'categories': categories,
          'formats': formats,
          'location.viewport.northeast.latitude': location_lat_ne,
          'location.viewport.northeast.longitude': location_long_ne,
          'location.viewport.southwest.latitude': location_lat_sw,
          'location.viewport.southwest.longitude': location_long_sw,
          'start_date.range_start': date_range_start,
          'start_date.range_end': date_range_end,
          }

r = requests.get(url=base_url + 'events/search/', params=params)

data = r.json()

total_events = data['pagination']['object_count']

if total_events > 0:
    events = data['events']
    for event in events:
        event_id = event['id']
        event_name = event['name']['text']
        event_date = event['start']['local']
        venue_id = event['venue_id']
        subcategory_id = event['subcategory_id']

        venue_url = base_url + 'venues/' + venue_id
        venue_req = requests.get(url=venue_url, params={'token': token})
        venue_data = venue_req.json()

        venue_name = venue_data['name']
        venue_lat = venue_data['latitude']
        venue_long = venue_data['longitude']

        if subcategory_id:
            subcategory_url = base_url + 'subcategories/' + subcategory_id
            subcategory_req = requests.get(
                url=subcategory_url,
                params={'token': token}
            )
            subcategory_data = subcategory_req.json()
            subcategory_name = subcategory_data['name']
        else:
            subcategory_name = ''

        query = """INSERT INTO eventbrite_events
                    (eventbrite_id, local_date, event_name,
                    venue_name, venue_lat, venue_long, genre) VALUES
                    (%s, %s, %s, %s, %s, %s, %s)"""
        values = (event_id, event_date, event_name, venue_name,
                  venue_lat, venue_long, subcategory_name)

        cursor.execute(query, values)
        db.commit()
