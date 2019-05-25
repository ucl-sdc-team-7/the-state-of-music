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

venue_dict = dict()

query = """SELECT venue, venue_lat, venue_long, state, county FROM all_events;"""
cursor.execute(query)

for row in cursor:
    venue = row[0]
    venue_lat = row[1]
    venue_long = row[2]
    state = row[3]
    if len(row[4]) == 0:
        county = ''
    else: # omit trailing space
        county = row[4][:-1] if row[4][-1] == " " else row[4]
    if venue and state != 'ON':  # if venue field is populated and state isn't Ontario
        venue_match = state + county + venue + str(venue_lat) + str(venue_long)
        if venue_match not in venue_dict:  # omit duplicates
            venue_dict[venue_match] = {'state': state,
                                       'county': county,
                                       'venue': venue,
                                       'venue_lat': venue_lat,
                                       'venue_long': venue_long}

for venue_match in venue_dict:
    query = """INSERT INTO venue_level_data
            (state_abbr, county_name, venue, venue_lat, venue_long)
            VALUES (%s, %s, %s, %s, %s);"""
    values = (venue_dict[venue_match]['state'], venue_dict[venue_match]['county'],
              venue_dict[venue_match]['venue'], venue_dict[
                  venue_match]['venue_lat'],
              venue_dict[venue_match]['venue_long'])
    cursor2.execute(query, values)
    db.commit()
