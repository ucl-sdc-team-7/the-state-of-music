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

query = """SELECT state_code, state_name, state_abbr, pop_2018
        FROM populations WHERE sum_level = 40;"""

cursor.execute(query)
states = cursor.fetchall()

top_level_genres = ['pop', 'rock', 'hip_hop', 'rnb',
                    'classical_and_jazz', 'electronic', 'country_and_folk']

for state in states:
    state_code = state[0]
    state_name = state[1]
    state_abbr = state[2]
    pop_2018 = state[3]

    query_events = "SELECT dom_genre FROM all_events WHERE state = '" + \
        state_abbr + "'"

    cursor.execute(query_events)
    events_in_state = cursor.fetchall()

    num_events_in_state = len(events_in_state)

    num_events_per_genre = {}
    total_weights_per_genre = {}
    normalised_weights_per_genre = {}

    for event in events_in_state:
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
            total_weights_per_genre[genre_weight] / pop_2018 * 100000

    query = """INSERT INTO state_level_data
            (state_code, state_name, state_abbr, pop_2018,
            pop, rock, hip_hop, rnb, classical_and_jazz,
            electronic, country_and_folk, dom_genre,
            pop_norm, rock_norm, hip_hop_norm, rnb_norm,
            classical_and_jazz_norm, electronic_norm,
            country_and_folk_norm, pop_num, rock_num,
            hip_hop_num, rnb_num, classical_and_jazz_num,
            electronic_num, country_and_folk_num, total_num)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s, %s);"""

    values = (state_code, state_name, state_abbr, pop_2018,
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
              num_events_in_state
              )

    cursor.execute(query, values)
    db.commit()
