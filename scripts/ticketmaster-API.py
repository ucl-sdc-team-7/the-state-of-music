import requests
import time
import mysql.connector as mysql
import configparser
import datetime
import timeit
import threading

start_time = timeit.default_timer()

config = configparser.ConfigParser()
config.read('../config.ini')

db = mysql.connect(
    host=config['mysql']['host'],
    user=config['mysql']['user'],
    passwd=config['mysql']['pass'],
    database="state_of_music"
)

cursor = db.cursor()

ticketmaster_url = "https://app.ticketmaster.com/discovery/v2/events.json"

us_states = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DC",
    "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA",
    "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN",
    "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM",
    "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
    "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA",
    "WI", "WV", "WY"
]

classificationName = "music"
size = 200
apikey = config['ticketmaster']['apikey']
apikey2 = config['ticketmaster']['apikey2']
apikey3 = config['ticketmaster']['apikey3']
apikey4 = config['ticketmaster']['apikey4']
apikey5 = config['ticketmaster']['apikey5']

today = datetime.datetime.today()

query_largest_date = """SELECT local_date FROM ticketmaster_events
                        ORDER BY local_date DESC LIMIT 1"""

cursor.execute(query_largest_date)
largest_date = cursor.fetchall()

if len(largest_date):
    largest_date = largest_date[0][0]
    largest_date = datetime.datetime(
        largest_date.year, largest_date.month, largest_date.day)
else:
    largest_date = today

num_days = (today + datetime.timedelta(days=30) - largest_date).days

date_range = [largest_date +
              datetime.timedelta(days=x) for x in range(1, num_days + 1)]
date_list = list(map(lambda x: [x.strftime("%Y-%m-%d" + "T00:00:00Z"),
                                x.strftime("%Y-%m-%d" + "T23:59:59Z")],
                     date_range))


def retrieve_events_for_states(states, apikey):
    db = mysql.connect(
        host=config['mysql']['host'],
        user=config['mysql']['user'],
        passwd=config['mysql']['pass'],
        database="state_of_music"
    )
    cursor = db.cursor()

    for us_state in states:
        time.sleep(3)
        print(us_state)
        for date in date_list:
            time.sleep(3)

            params = {'stateCode': us_state,
                      'classificationName': classificationName,
                      'apikey': apikey,
                      'startDateTime': date[0],
                      'endDateTime': date[1],
                      'size': size
                      }
            r = requests.get(url=ticketmaster_url, params=params)
            data = r.json()

            if ('page' not in data):
                print(data)
            total_events = data['page']['totalElements']

            if total_events > 0:
                events = data['_embedded']['events']

                for index, event in enumerate(events):
                    local_date = event['dates']['start']['localDate']
                    event_id = event['id']

                    main_genre = event['classifications'][0].get('genre')
                    main_genre_name = main_genre['name'] if main_genre else ''
                    sub_genre = event['classifications'][0].get('subGenre')
                    sub_genre_name = sub_genre['name'] if sub_genre else ''

                    main_venue = event['_embedded']['venues'][0]
                    main_venue_name = main_venue['name']

                    main_venue_location = main_venue.get('location')
                    main_venue_lat = main_venue['location'][
                        'latitude'] if main_venue_location else None
                    main_venue_lon = main_venue['location'][
                        'longitude'] if main_venue_location else None

                    artists = event['_embedded'].get('attractions')
                    main_artist_id = artists[0]['id'] if artists else ''
                    main_artist_name = artists[0]['name'] if (
                        artists and 'name' in artists[0]) else ''
                    main_artist_genre = artists[0]['classifications'][0]['genre'][
                        'name'] if (artists and 'classifications' in artists[
                            0] and 'genre' in artists[0]['classifications'][0]) else ''

                    event_exists_query = """SELECT ticketmaster_id
                                            FROM ticketmaster_events
                                            WHERE ticketmaster_id =
                                            '""" + event_id + "'"

                    cursor.execute(event_exists_query)
                    existing_event = cursor.fetchall()

                    if (not len(existing_event)):
                        query = """INSERT INTO ticketmaster_events
                                    (ticketmaster_id, local_date, event_genre,
                                    event_subgenre, venue, venue_lat,
                                    venue_long, artist_id, artist_name,
                                    artist_genre) VALUES
                                    (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
                        values = (event_id, local_date, main_genre_name,
                                  sub_genre_name, main_venue_name,
                                  main_venue_lat, main_venue_lon,
                                  main_artist_id, main_artist_name,
                                  main_artist_genre)

                        cursor.execute(query, values)
                        db.commit()
    db.close()


t1 = threading.Thread(target=retrieve_events_for_states,
                      args=(us_states[0:11], apikey, ))
t2 = threading.Thread(target=retrieve_events_for_states,
                      args=(us_states[11:21], apikey2,))
t3 = threading.Thread(target=retrieve_events_for_states,
                      args=(us_states[21:31], apikey3,))
t4 = threading.Thread(target=retrieve_events_for_states,
                      args=(us_states[31:41], apikey4,))
t5 = threading.Thread(target=retrieve_events_for_states,
                      args=(us_states[41:51], apikey5,))


t1.start()
time.sleep(2)
t2.start()
time.sleep(2)
t3.start()
time.sleep(2)
t4.start()
time.sleep(2)
t5.start()
