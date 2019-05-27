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
cursor = db.cursor(buffered=True)
cursor2 = db.cursor(buffered=True)
cursor3 = db.cursor(buffered=True)
cursor4 = db.cursor(buffered=True)


def load(extract_cursor, data_source, source_id, load_cursor):
    for row in extract_cursor:
        source = data_source
        source_id = row[0]
        venue_name = row[1].lower() if row[1] else None
        venue_lat = row[2]
        venue_long = row[3]
        pop = row[4]
        rock = row[5]
        hip_hop = row[6]
        rnb = row[7]
        classical_and_jazz = row[8]
        electronic = row[9]
        country_and_folk = row[10]
        state = row[11]
        county = row[12]
        genres = ['pop',
                  'rock',
                  'hip_hop',
                  'rnb',
                  'classical_and_jazz',
                  'electronic',
                  'country_and_folk']

        genre_dict = dict()
        for genre in genres:
            genre_dict[genre] = eval(genre)

        max_genre = 0
        dom_genre = 'other'

        for genre in genre_dict:
            if genre_dict[genre] > max_genre and genre_dict[genre] != 0:
                dom_genre = genre
                max_genre = genre_dict[genre]
            elif genre_dict[genre] == max_genre and max_genre > 0:
                dom_genre = dom_genre + "/" + genre

        if (state and county) or (state == 'DC'):
            select_query = "SELECT source_id FROM all_events " + \
                "WHERE source_id = '" + source_id + "'"

            load_cursor.execute(select_query)
            existing_event = load_cursor.fetchall()

            if (not existing_event):
                query = """INSERT INTO all_events
                        (source, source_id, venue, venue_lat, venue_long,
                        state, county, pop, rock, hip_hop, rnb,
                        classical_and_jazz, electronic, country_and_folk,
                        dom_genre) VALUES
                        (%s, %s, %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s, %s, %s);"""
                values = (source, source_id, venue_name,
                          venue_lat, venue_long, state, county,
                          pop, rock, hip_hop, rnb, classical_and_jazz,
                          electronic, country_and_folk, dom_genre)

                load_cursor.execute(query, values)
                db.commit()


query = """SELECT ticketmaster_id, venue, venue_lat, venue_long, pop, rock,
        hip_hop, rnb, classical_and_jazz, electronic, country_and_folk, state,
        county
        FROM ticketmaster_events
        WHERE (pop + rock + hip_hop + rnb + classical_and_jazz + electronic +
        country_and_folk != 0) AND (state != 'AB' AND state != 'BC' AND
        state != 'MB' AND state != 'NB' AND state != 'NL' AND state != 'NS' AND
        state != 'NT' AND state != 'NU' AND state != 'ON' AND state != 'PE' AND
        state != 'QC' AND state != 'SK' AND state != 'YT') AND
        (venue_lat > 18.910361 AND venue_long < -66.94989);"""

cursor.execute(query)

load(cursor, 'ticketmaster', 'ticketmaster_id', cursor2)

query = """SELECT eventbrite_id, venue_name, venue_lat, venue_long, pop, rock,
        hip_hop, rnb, classical_and_jazz, electronic, country_and_folk, state,
        county
        FROM eventbrite_events
        WHERE (pop + rock + hip_hop + rnb + classical_and_jazz + electronic +
        country_and_folk != 0) AND (state != 'AB' AND state != 'BC' AND
        state != 'MB' AND state != 'NB' AND state != 'NL' AND state != 'NS' AND
        state != 'NT' AND state != 'NU' AND state != 'ON' AND state != 'PE' AND
        state != 'QC' AND state != 'SK' AND state != 'YT') AND
        (venue_lat > 18.910361 AND venue_long < -66.94989);"""

cursor3.execute(query)

load(cursor3, 'eventbrite', 'eventbrite_id', cursor4)
