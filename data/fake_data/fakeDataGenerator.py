import random
import json
import sys
import re
import requests
import string
import MySQLdb

# Our JSON format:
# [ { "document_url" : string,
#     "origin" : number?,
#     "authors" : [(string?, string?)]    // (firstName, lastName)
#     "topics" : [string]
#     "year" : number?
#     "places_referenced" : { number : number }   // (place, count)
#     "title" : string?
#   } ]

FIRST_NAMES = ["James", "John", "Robert", "Michael", "William", "David",
               "Mary", "Patricia", "Linda", "Barbara", "Elizabeth", "Jennifer"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Jones", "Brown", "Davis",
              "Miller", "Wilson", "Moore", "Taylor", "Anderson", "Thomas"]

TOPIC_COUNT = [1, 1, 2, 2, 2, 3, 4]

YEAR_RANGE = (1850, 2012)
TOPICS = ["War", "Revolution", "Realpolitik", "Modern", "Disease",
          "Exploration", "People", "Women", "Diplomacy", "Events"]

TITLE_WORD_COUNT = [2, 3, 3, 4]
TITLE_WORDS = TOPICS

CITY_LAMBDA = 20
YEAR_LAMBDA = 20
YEAR_STD_DEV = 15

cityGenerator = None

pageTitleQuery = """
SELECT page_title
FROM page
WHERE page_id = %(pageId)s
"""

def coinFlip(bias):
    if random.random() < bias:
        return 1
    else:
        return 0

def poisson(avg):
    N = 40
    return sum([coinFlip(float(avg)/N) for i in range(N)])

def randomCity():
    return cityGenerator.randomCity()

def randomUnrelatedWikipediaTitle(city, cursor):
    pageId = random.randint(1, 8877327)
    cursor.execute(pageTitleQuery, {"pageId": str(pageId)})
    result = cursor.fetchone()
    if result:
        return result[0].replace("_", " ")
    else:
        return randomUnrelatedWikipediaTitle(city, cursor)

def randomRelatedWikipediaTitle(city):
    return cityGenerator.randomTitle(city)

def oldRandomTitle(cityName):
    size = random.choice(TITLE_WORD_COUNT)
    parts = [random.choice(TITLE_WORDS) for i in range(size)]
    return " ".join(parts)

def randomTopic():
    return random.choice(TOPICS)

def generateRandomDocs(out, limit, cursor):
    # Pick random city, topic, year combinations
    for i in range(limit):
        for j in range(poisson(CITY_LAMBDA)):
            (geoid, cityName) = randomCity()
            topics = [randomTopic()
                      for k in range(random.choice(TOPIC_COUNT))]
            for year in randomYears(poisson(YEAR_LAMBDA), YEAR_STD_DEV):
                doc = {}
                random_id = "".join([random.choice(string.lowercase) for i in range(20)])
                doc["document_url"] = "justinpombrio.net#" + random_id
                doc["origin"] = geoid
                doc["topics"] = topics
                doc["year"] = year
                doc["authors"] = randomAuthor()
                doc["title"] = randomUnrelatedWikipediaTitle(cityName, cursor)
                doc["places_referenced"] = []
                out.write(json.dumps(doc))
                out.write("\n")

def randomYear(center, spread):
    year = int(random.normalvariate(center, spread))
    if year >= YEAR_RANGE[0] and year <= YEAR_RANGE[1]:
        return year
    else:
        return randomYear(center, spread)

def randomYears(count, spread):
    center = random.uniform(YEAR_RANGE[0], YEAR_RANGE[1])
    return [randomYear(center, spread) for i in range(count)]

def randomAuthor():
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    return [first, last]

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

    def randomTitle(self, city):
        url = ("http://toolserver.org/~erwin85/randomarticle.php?lang=en&family=wikipedia&categories=" +
                   urllib.quote(city[1].encode('utf-8')) + "&subcats=1&d=2")
        title = self.getTitleFromUrl(url)
        while title == None:
            title = self.getGeneralTitle()
        return title

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

# if __name__ == "__main__":
#     data = RandomCityGenerator()
#     randCities = []
#     outputFile = sys.stdout
#     f = (sys.stdout if sys.argv[1] == '.' else open(sys.argv[1], 'a')) if len(sys.argv) > 1 else sys.stdout
#     end = int(sys.argv[2]) if len(sys.argv) > 2 else ()
#     i = 0
#     while i < end:
#         (geoid, city, title) = data.randomCityTitlePair()
#         f.write(city + "\t" + title + "\n")
#         i += 1

if __name__ == '__main__':
    db = MySQLdb.connect(user="root", db="wikipedia")
    cursor = db.cursor()
    cityGenerator = RandomCityGenerator()
    outputFile = open(sys.argv[1], 'a') if len(sys.argv) > 1 and sys.argv[1] != "." else sys.stdout
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    generateRandomDocs(outputFile, limit, cursor)
