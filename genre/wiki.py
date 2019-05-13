import requests
from bs4 import BeautifulSoup

url = "https://en.wikipedia.org/wiki/List_of_music_styles"
page = requests.get(url)

soup = BeautifulSoup(page.content, 'html.parser')

#for id in soup.find_all('Genres'):
#if "Genres[edit]" in soup.find_all('h2'):
    #for sub_heading in soup.find_all('h3'):
for link in soup.find_all('a'):
        #print(sub_heading.text)
    print(link.get_text('title'))




# to fetch all <li> tas

#for link in soup.find_all(attrs={"class" : "mw-headline"}):

        #print(link.get_text('title'))
