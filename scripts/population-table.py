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
    next(raw_data,None)
    for row in raw_data:
        sum_level = row[0]
        state_code = row[3]
        county_code = row[4]
        state_name = row[5]
        county_name = row[6]
        state_abbr = row[7]
        pop_2018 = row[18]

        words_in_county_name = county_name.split(" ")
        if words_in_county_name[-3:] == ['City','and','Borough']:
            county_name = " ".join(words_in_county_name[:-3])
            words_in_county_name = county_name.split(" ")
        if words_in_county_name[-2:] == ['Census','Area']:
            county_name = " ".join(words_in_county_name[:-2])
            words_in_county_name = county_name.split(" ")
        if (words_in_county_name[-1] == 'County' or words_in_county_name[-1] == 'Parish'
              or words_in_county_name[-1] =='Municipality' or words_in_county_name[-1] == 'Borough'):
            county_name = " ".join(words_in_county_name[:-1])
            words_in_county_name = county_name.split(" ")

        query = """INSERT INTO populations
                (sum_level, state_code, state_name, state_abbr, county_code,
                county_name, pop_2018) VALUES
                (%s, %s, %s, %s, %s, %s, %s)"""
        values = (sum_level, state_code, state_name, state_abbr, county_code,
                  county_name, pop_2018)

        cursor.execute(query, values)
        db.commit()
