import requests
import datetime
import mysql.connector as mysql
import configparser
import csv

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

us_states_and_viewports = list()
with open('state_bounding_boxes.csv', 'r') as csvfile:
    states_and_viewports = csv.reader(csvfile, delimiter=',')
    for row in states_and_viewports:
        us_states_and_viewports.append(row)

date_range = [datetime.datetime.today() + datetime.timedelta(days=x) for x in
    range(0, 30)]
start_date = date_range[0].strftime("%Y-%m-%d"+"T00:00:00Z")
end_date = date_range[-1].strftime("%Y-%m-%d"+"T23:59:59Z")

token = config['eventbrite']['token']
categories = '103'  # music
formats = '6'  # concerts and performances

for us_state_and_viewport in us_states_and_viewports[1:]:
            params = {'token': token,
                      'categories': categories,
                      'formats': formats,
                      'location.viewport.northeast.latitude': us_state_and_viewport[4],
                      'location.viewport.northeast.longitude': us_state_and_viewport[3],
                      'location.viewport.southwest.latitude': us_state_and_viewport[2],
                      'location.viewport.southwest.longitude': us_state_and_viewport[1],
                      'start_date.range_start': start_date,
                      'start_date.range_end': end_date
                      }

            r = requests.get(url=base_url + 'events/search/', params=params)

            data = r.json()

            total_events = data['pagination']['object_count']
            pages_list = [1] if data['pagination']['page_count'] == 1 else list(
                range(1,data['pagination']['page_count']+1))

            if total_events > 0:
                for page in pages_list:
                    params = {'token': token,
                              'categories': categories,
                              'formats': formats,
                              'location.viewport.northeast.latitude': us_state_and_viewport[4],
                              'location.viewport.northeast.longitude': us_state_and_viewport[3],
                              'location.viewport.southwest.latitude': us_state_and_viewport[2],
                              'location.viewport.southwest.longitude': us_state_and_viewport[1],
                              'start_date.range_start': start_date,
                              'start_date.range_end': end_date,
                              'page': page
                              }

                    r = requests.get(url=base_url + 'events/search/', params=params)

                    data = r.json()

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
