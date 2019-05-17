import datetime
import mysql.connector as mysql
import configparser
import csv
from eventbrite import Eventbrite

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
start_date = date_range[0].strftime("%Y-%m-%d" + "T00:00:00Z")
end_date = date_range[-1].strftime("%Y-%m-%d" + "T23:59:59Z")

# EVENTBRITE auth config
token_1 = config['eventbrite']['token1']
token_2 = config['eventbrite']['token2']
token_3 = config['eventbrite']['token3']
token_4 = config['eventbrite']['token4']

oauth_token_list = [token_1,token_2,token_3,token_4]
oauth_token = oauth_token_list[0]

categories = '103'  # music
formats = '6'  # concerts and performances

# EVENTBRITE token_swap func
def token_swap(old_oauth_token):
    old_index = oauth_token_list.index(old_oauth_token)
    new_index = (old_index + 1) if (old_index + 1 < len(oauth_token_list)) else 0
    return oauth_token_list[new_index]


for us_state_and_viewport in us_states_and_viewports[1:]:
    params = {'categories': categories,
              'formats': formats,
              'location.viewport.northeast.latitude': us_state_and_viewport[4],
              'location.viewport.northeast.longitude': us_state_and_viewport[3],
              'location.viewport.southwest.latitude': us_state_and_viewport[2],
              'location.viewport.southwest.longitude': us_state_and_viewport[1],
              'start_date.range_start': start_date,
              'start_date.range_end': end_date
              }

    events_response = Eventbrite(oauth_token).event_search(**params)

    try:
        total_events = events_response['pagination']['object_count']
    except:
        oauth_token = token_swap(oauth_token)
        events_response = Eventbrite(oauth_token).event_search(**params)
        total_events = events_response['pagination']['object_count']



    pages_list = [1] if events_response['pagination']['page_count'] == 1 else list(
        range(1, events_response['pagination']['page_count'] + 1))

    if total_events > 0:
        for page in pages_list:
            params = {'categories': categories,
                      'formats': formats,
                      'location.viewport.northeast.latitude': us_state_and_viewport[4],
                      'location.viewport.northeast.longitude': us_state_and_viewport[3],
                      'location.viewport.southwest.latitude': us_state_and_viewport[2],
                      'location.viewport.southwest.longitude': us_state_and_viewport[1],
                      'start_date.range_start': start_date,
                      'start_date.range_end': end_date,
                      'page': page
                      }

            events_response = Eventbrite(oauth_token).event_search(**params)

            try:
                events = events_response['events']
            except:
                oauth_token = token_swap(oauth_token)
                events_response = Eventbrite(oauth_token).event_search(**params)
                events = events_response['events']

            for event in events:
                event_id = event['id']
                event_name = event['name']['text']
                if (len(event_name) > 100):
                    event_name = event_name[0:99]
                event_date = event['start']['local']
                venue_id = event['venue_id']
                subcategory_id = event['subcategory_id']

                venue_url = '/venues/' + venue_id
                venue_response = Eventbrite(oauth_token).get(venue_url)
                try:
                    venue_name = venue_response['name']
                except:
                    oauth_token = token_swap(oauth_token)
                    venue_response = Eventbrite(oauth_token).get(venue_url)
                    venue_name = venue_response['name']

                if (venue_name and len(venue_name) > 50):
                    venue_name = venue_name[0:49]
                venue_lat = venue_response['latitude']
                venue_long = venue_response['longitude']

                if subcategory_id:
                    subcategory_url = '/subcategories/' + subcategory_id
                    subcategory_response = Eventbrite(oauth_token).get(subcategory_url)
                    try:
                        subcategory_name = subcategory_response['name']
                    except:
                        oauth_token = token_swap(oauth_token)
                        subcategory_response = Eventbrite(oauth_token).get(subcategory_url)
                        subcategory_name = subcategory_response['name']
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
