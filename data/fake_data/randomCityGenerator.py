import pickle
import random
import re
import requests
import sys
import urllib

# Generate cities and topics
class RandomCityGenerator:

    def __init__(self):
        f = open('places.tab', 'r')
        cities = []
        f.readline()
        for line in f:
            line = line.decode('latin1')
            values = line.split('\t')
            cities.append((values[0], values[1], int(values[14])))
        cities = sorted(cities, key=lambda x: x[2])
        self.cities = []
        self.total_pop = 0
        self.titles = []
        for city in cities:
            self.total_pop += city[2]
            self.cities.append((city[0], city[1], self.total_pop))
        self.title_regex = re.compile(r'span dir="auto">([^<]*)<')

    def randomCity(self):
        # city = (geo_id, geo_name)
        r = random.uniform(0, self.total_pop)
        i = 0
        j = 0
        while j < r:
            j += self.cities[i][2]
            i += 1
        return (self.cities[i][0], self.cities[i][1])

    def randomCityTitlePair(self):
        city = self.randomCity()
        url = ("http://toolserver.org/~erwin85/randomarticle.php?lang=en&family=wikipedia&categories=" +
                   urllib.quote(city[1].encode('utf-8')) + "&subcats=1&d=2")
        title = self.getTitleFromUrl(url)
        while title == None:
            title = self.getGeneralTitle()
        return (city[0], city[1], title)

    def getGeneralTitle(self):
        numTitles = len(self.titles)
        r = int(random.uniform(0, numTitles * 1.75))
        if r >= numTitles:
            url = "http://toolserver.org/~erwin85/randomarticle.php?lang=en&family=wikipedia&categories=history&subcats=1&d=2"
            title = self.getTitleFromUrl(url)
            if title != None:
                self.titles.append(title)
            return title
        else:
            return self.titles[r]

    def getTitleFromUrl(self, url):
        titles = self.title_regex.findall(requests.get(url).content)
        if len(titles) > 0:
            return titles[0]
        else:
            return None

if __name__ == "__main__":
    data = RandomCityGenerator()
    randCities = []
    outputFile = sys.stdout
    f = (sys.stdout if sys.argv[1] == '.' else open(sys.argv[1], 'a')) if len(sys.argv) > 1 else sys.stdout
    end = int(sys.argv[2]) if len(sys.argv) > 2 else ()
    i = 0
    while i < end:
        (geoid, city, title) = data.randomCityTitlePair()
        f.write(city + "\t" + title + "\n")
        i += 1
