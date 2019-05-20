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

query = """SELECT state_code, state_name, state_abbr, county_code, county_name,
        pop_2018, sum_level FROM populations;"""
cursor.execute(query)

for row in cursor:
    state_code = row[0]
    state_name = row[1]
    state_abbr = row[2]
    county_code = row[3]
    county_name = row[4]
    pop_2018 = row[5]
    sum_level = row[6]

    if sum_level == "50":  # if the row is a county, instead of a state [40]
        query = """INSERT INTO county_level_data
                (state_code, state_name, state_abbr, county_code, county_name,
                pop_2018) VALUES (%s, %s, %s, %s, %s, %s);"""
        values = (state_code, state_name, state_abbr, county_code, county_name,
                  pop_2018)
        cursor2.execute(query, values)
        db.commit()
