from bs4 import BeautifulSoup
import requests
import json

#####################################
###########  SCRAPING  ##############
#####################################
genreDict = {}
url = "https://en.m.wikipedia.org/wiki/List_of_music_styles"
r = requests.get(url)
soup = BeautifulSoup(r.content)

#this finds all the spans with the mw-headline class, which is all of the main genre titles
mainGenres = soup.find_all("span", {"class": "mw-headline"})

#the [0:20] sub-setting is to avoid the categories Other, References, External links, Bibliography, and See also
#for future uses of this code the number of valid categories needs to be confirmed, or other means of exclusion added
for mainGenre in mainGenres[0:20]:
    #the key and genreList will populate our dictionary
    key=(mainGenre.text.lower())
    genreList=[]
    #the id of each mainGenres span is used to target the list of bullet points that follow them
    section = soup.find(id=mainGenre.get('id'))
    try:
        genres = section.find_next('ul')
        #all the bullet points within these lists are taken
        for li in genres.find_all('li'):
            #this takes all the text from the li element: get_text() works even when the string is split by html
            #minor issue here that where a string was initially split, double spacing is created
            allText = li.get_text()
            #where there are sub-genres, each is added as it's own li element
            #this prevents them being added twice from the parent genre li element
            if '\n' in allText:
                firstItem = allText.split('\n', 1)[0]
            #the relevent genre is added to the list for this main genre
            #the join and split here is getting rid of any double spaces
                genreList.append(' '.join(firstItem.lower().split()))
            else: genreList.append(' '.join(allText.lower().split()))
    except:
        pass
    #the dictionary is populated
    genreDict[key]=genreList

#file is utf8 encoded due to required characters
with open('genreDict.json', 'w', encoding='utf-8') as file:
    json.dump(genreDict, file, ensure_ascii=False)
