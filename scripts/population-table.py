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
with open('population_data.csv', 'r') as csvfile:
    raw_data = csv.reader(csvfile, delimiter=',')
    for row in raw_data:
        if row[0] == '50':
            state_code = row[3]
            county_code = row[4]
            state_name = row[5]
            county_name = row[6]
            pop_2018 = row[17]

            if county_name[len(county_name)-6:] == 'County':
                county_name = county_name[:-7]
            elif county_name[len(county_name)-6:] =='Parish':
                county_name = county_name[:-7]

            query = """INSERT INTO populations
                    (state_code, state_name, county_code,
                    county_name, pop_2018) VALUES
                    (%s, %s, %s, %s, %s)"""
            values = (state_code, state_name, county_code, county_name,
                      pop_2018)

            cursor.execute(query, values)
            db.commit()
