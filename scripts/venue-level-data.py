import mysql.connector as mysql
import configparser

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

top_level_genres = ['pop', 'rock', 'hip_hop', 'rnb',
                    'classical_and_jazz', 'electronic', 'country_and_folk']

query = """SELECT DISTINCT venue, state, county
           FROM all_events;"""
cursor.execute(query)

venues = cursor.fetchall()

for venue in venues:
    venue_name = venue[0]
    state = venue[1]
    county = venue[2]

    venue_location_query = """SELECT venue_lat, venue_long FROM all_events
                              WHERE venue = %s
                              AND state = %s
                              AND county = %s"""

    values = (venue_name, state, county)
    cursor.execute(venue_location_query, values)

    venue_location = cursor.fetchall()
    if venue_location:
        venue_location = venue_location[0]
        venue_lat = venue_location[0]
        venue_long = venue_location[1]

        events_query = """SELECT dom_genre FROM all_events
                          WHERE venue = %s
                          AND state = %s
                          AND county = %s
                          AND venue_lat = %s
                          AND venue_long = %s"""

        values = (venue_name, state, county, venue_lat, venue_long)
        cursor.execute(events_query, values)

        events_in_venue = cursor.fetchall()
        num_events_in_venue = len(events_in_venue)

        num_events_per_genre = {}
        total_weights_per_genre = {}

        for event in events_in_venue:
            event_genres = event[0].split("/")
            weight = 1 / len(event_genres)
            for event_genre in event_genres:
                num_events_per_genre[event_genre] = \
                    num_events_per_genre[event_genre] + 1 \
                    if event_genre in num_events_per_genre else 1

                total_weights_per_genre[event_genre] = \
                    total_weights_per_genre[event_genre] + weight \
                    if event_genre in total_weights_per_genre else weight

        dom_genre_value = 0
        dom_genre = None

        for genre_weight in total_weights_per_genre.keys():
            if total_weights_per_genre[genre_weight] > dom_genre_value:
                dom_genre_value = total_weights_per_genre[genre_weight]
                dom_genre = genre_weight

        for top_level_genre in top_level_genres:
            if top_level_genre not in num_events_per_genre:
                num_events_per_genre[top_level_genre] = 0

            if top_level_genre not in total_weights_per_genre:
                total_weights_per_genre[top_level_genre] = 0

        query = """INSERT INTO venue_level_data
                (state_abbr, county_name, venue, venue_lat,
                venue_long,
                pop, rock, hip_hop, rnb, classical_and_jazz,
                electronic, country_and_folk, dom_genre,
                pop_num, rock_num,
                hip_hop_num, rnb_num, classical_and_jazz_num,
                electronic_num, country_and_folk_num, total_num)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);"""

        values = (state, county, venue_name,
                  venue_lat, venue_long,
                  total_weights_per_genre['pop'],
                  total_weights_per_genre['rock'],
                  total_weights_per_genre['hip_hop'],
                  total_weights_per_genre['rnb'],
                  total_weights_per_genre['classical_and_jazz'],
                  total_weights_per_genre['electronic'],
                  total_weights_per_genre['country_and_folk'],
                  dom_genre,
                  num_events_per_genre['pop'],
                  num_events_per_genre['rock'],
                  num_events_per_genre['hip_hop'],
                  num_events_per_genre['rnb'],
                  num_events_per_genre['classical_and_jazz'],
                  num_events_per_genre['electronic'],
                  num_events_per_genre['country_and_folk'],
                  num_events_in_venue
                  )

        cursor.execute(query, values)
        db.commit()
