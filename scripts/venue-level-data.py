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

genres = ['pop', 'rock', 'hip_hop', 'rnb',
          'classical_and_jazz', 'electronic', 'country_and_folk']

query = """SELECT state, county, venue, dom_genre FROM all_events"""
cursor.execute(query)

for event in cursor:
    state = event[0]
    if len(event[1]) == 0:
        county = ''
    else:
        county = event[1][:-1] if event[1][-1] == " " else event[1] # omit trailing space
    venue = event[2]
    dom_genre = event[3]

    query = """SELECT state_abbr, county_name, pop, rock, hip_hop, rnb,
                classical_and_jazz, electronic, country_and_folk, all_genres,
                dom_genre, pop_num, rock_num, hip_hop_num, rnb_num,
                classical_and_jazz_num, electronic_num, country_and_folk_num,
                total_num
                FROM venue_level_data
                WHERE state_abbr = %s AND
                county_name = %s AND venue = %s"""
    values = (state, county, venue)
    cursor2.execute(query, values)

    for venue_row in cursor2:
        state_abbr = venue_row[0]
        county_name = venue_row[1]
        pop = float(venue_row[2])
        rock = float(venue_row[3])
        hip_hop = float(venue_row[4])
        rnb = float(venue_row[5])
        classical_and_jazz = float(venue_row[6])
        electronic = float(venue_row[7])
        country_and_folk = float(venue_row[8])
        all_genres = float(venue_row[9])
        dom_genre_venue = venue_row[10]
        genre_dict = {'pop': pop,
                      'rock': rock,
                      'hip_hop': hip_hop,
                      'rnb': rnb,
                      'classical_and_jazz': classical_and_jazz,
                      'electronic': electronic,
                      'country_and_folk': country_and_folk}

        pop_num = int(venue_row[11])
        rock_num = int(venue_row[12])
        hip_hop_num = int(venue_row[13])
        rnb_num = int(venue_row[14])
        classical_and_jazz_num = int(venue_row[15])
        electronic_num = int(venue_row[16])
        country_and_folk_num = int(venue_row[17])
        total_num = venue_row[18]
        num_dict = {'pop': pop_num,
                    'rock': rock_num,
                    'hip_hop': hip_hop_num,
                    'rnb': rnb_num,
                    'classical_and_jazz': classical_and_jazz_num,
                    'electronic': electronic_num,
                    'country_and_folk': country_and_folk_num}

        if len(dom_genre.split("/")) == 1 and dom_genre in genres:  # if a single genre is dominant
            genre_dict[dom_genre] = genre_dict[dom_genre] + 1
            num_dict[dom_genre] = num_dict[dom_genre] + 1
            total_num = total_num + 1
        elif len(dom_genre.split("/")) > 1:  # if multiple genres share dominance
            # assign weight for partial genres
            weight = (1 / len(dom_genre.split("/")))
            for partial_dom_genre in dom_genre.split("/"):
                if partial_dom_genre in genres:
                    genre_dict[partial_dom_genre] = genre_dict[
                        partial_dom_genre] + weight
                    num_dict[partial_dom_genre] = num_dict[partial_dom_genre] + 1
                    total_num = total_num + 1

        max = 0
        all_genres = 0
        for genre in genre_dict:
            if genre_dict[genre] > 0:
                all_genres = all_genres + genre_dict[genre]
            if genre_dict[genre] > max and genre_dict[genre] > 0:
                max = genre_dict[genre]
                dom_genre_venue = genre
            elif genre_dict[genre] == max and genre_dict[genre] > 0:
                dom_genre_venue = dom_genre_venue + "/" + genre

        query = """UPDATE venue_level_data SET
                    pop = %s, rock = %s, hip_hop = %s,
                    rnb = %s, classical_and_jazz = %s,
                    electronic = %s, country_and_folk = %s,
                    all_genres = %s, dom_genre = %s, pop_num = %s,
                    rock_num = %s, hip_hop_num = %s, rnb_num = %s,
                    classical_and_jazz_num = %s, electronic_num = %s,
                    country_and_folk_num = %s, total_num = %s
                    WHERE state_abbr = %s AND county_name = %s AND venue = %s;"""
        values = (genre_dict['pop'], genre_dict['rock'], genre_dict['hip_hop'],
                  genre_dict['rnb'], genre_dict['classical_and_jazz'],
                  genre_dict['electronic'], genre_dict['country_and_folk'],
                  all_genres, dom_genre_venue,num_dict['pop'],
                  num_dict['rock'], num_dict['hip_hop'], num_dict['rnb'],
                  num_dict['classical_and_jazz'], num_dict['electronic'],
                  num_dict['country_and_folk'], total_num, state_abbr,
                  county_name, venue)
        cursor3.execute(query, values)
        db.commit()
