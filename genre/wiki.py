import requests
from bs4 import BeautifulSoup

url = "https://en.wikipedia.org/wiki/List_of_music_styles"
page = requests.get(url)

soup = BeautifulSoup(page.content, 'html.parser')

for link in soup.find_all('a'):
    print(link.get_text('title'))
