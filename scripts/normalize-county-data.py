import mysql.connector as mysql
import configparser

# read-in data needed for sql connection
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


def normalize(genre):
    genre_norm = ((genre / pop_2018) * 1000)
    return genre_norm


query = """SELECT state_name, county_name, pop_2018, pop, rock, hip_hop,
        rnb, classical_and_jazz, electronic, country_and_folk, all_genres FROM
        county_level_data"""

cursor.execute(query)

for row in cursor:
    state_name = row[0]
    county_name = row[1]
    pop_2018 = row[2]
    pop = row[3]
    rock = row[4]
    hip_hop = row[5]
    rnb = row[6]
    classical_and_jazz = row[7]
    electronic = row[8]
    country_and_folk = row[9]

    pop_norm = normalize(pop)
    rock_norm = normalize(rock)
    hip_hop_norm = normalize(hip_hop)
    rnb_norm = normalize(rnb)
    classical_and_jazz_norm = normalize(classical_and_jazz)
    electronic_norm = normalize(electronic)
    country_and_folk_norm = normalize(country_and_folk)

    query = """UPDATE county_level_data SET pop_norm = %s, rock_norm = %s,
            hip_hop_norm = %s, rnb_norm = %s, classical_and_jazz_norm = %s,
            electronic_norm = %s, country_and_folk_norm = %s
            WHERE state_name = %s AND county_name = %s;"""
    values = (pop_norm, rock_norm, hip_hop_norm, rnb_norm, classical_and_jazz_norm,
              electronic_norm, country_and_folk_norm, state_name, county_name)
    cursor2.execute(query, values)
    db.commit()