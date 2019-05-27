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

query = """SELECT state_code, state_name, state_abbr, county_code,
        county_name, pop_2018
        FROM populations WHERE sum_level = 50;"""

cursor.execute(query)
counties = cursor.fetchall()

top_level_genres = ['pop', 'rock', 'hip_hop', 'rnb',
                    'classical_and_jazz', 'electronic', 'country_and_folk']

for county in counties:
    state_code = county[0]
    state_name = county[1]
    state_abbr = county[2]
    county_code = county[3]
    county_name = county[4].rstrip()
    pop_2018 = county[5]

    if county_name == 'District of Columbia':
        query_events = 'SELECT dom_genre FROM all_events WHERE state = "DC"'
    else:
        query_events = 'SELECT dom_genre FROM all_events WHERE county = "' + \
            county_name + '"'

    cursor.execute(query_events)
    events_in_county = cursor.fetchall()

    num_events_in_county = len(events_in_county)

    num_events_per_genre = {}
    total_weights_per_genre = {}
    normalised_weights_per_genre = {}

    for event in events_in_county:
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

    for genre_weight in total_weights_per_genre.keys():
        normalised_weights_per_genre[genre_weight] = \
            total_weights_per_genre[genre_weight] * pop_2018 / 1000

    query = """INSERT INTO county_level_data
            (state_code, state_name, state_abbr, county_code,
            county_name, pop_2018,
            pop, rock, hip_hop, rnb, classical_and_jazz,
            electronic, country_and_folk, dom_genre,
            pop_norm, rock_norm, hip_hop_norm, rnb_norm,
            classical_and_jazz_norm, electronic_norm,
            country_and_folk_norm, pop_num, rock_num,
            hip_hop_num, rnb_num, classical_and_jazz_num,
            electronic_num, country_and_folk_num, total_num)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s);"""

    values = (state_code, state_name, state_abbr,
              county_code, county_name, pop_2018,
              total_weights_per_genre['pop'],
              total_weights_per_genre['rock'],
              total_weights_per_genre['hip_hop'],
              total_weights_per_genre['rnb'],
              total_weights_per_genre['classical_and_jazz'],
              total_weights_per_genre['electronic'],
              total_weights_per_genre['country_and_folk'],
              dom_genre,
              normalised_weights_per_genre['pop'],
              normalised_weights_per_genre['rock'],
              normalised_weights_per_genre['hip_hop'],
              normalised_weights_per_genre['rnb'],
              normalised_weights_per_genre['classical_and_jazz'],
              normalised_weights_per_genre['electronic'],
              normalised_weights_per_genre['country_and_folk'],
              num_events_per_genre['pop'],
              num_events_per_genre['rock'],
              num_events_per_genre['hip_hop'],
              num_events_per_genre['rnb'],
              num_events_per_genre['classical_and_jazz'],
              num_events_per_genre['electronic'],
              num_events_per_genre['country_and_folk'],
              num_events_in_county
              )

    cursor.execute(query, values)
    db.commit()
