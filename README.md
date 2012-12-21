**History Lens**
History Lens is a web application that provides an environment to store, explore, and analyze historical information through visualization.
More information here: https://sites.google.com/site/visualsummariesinscidb/report.

*Notable Files and Folders*
- map.html: html code for the map front end
- timeline.html: html code for the timeline
- tool.html: html code for the entire tool
- js: a collection of the js code
- css/style.css: contains style sheet for the project
- data/import.py: python script used to import new data. Details about how to use this are below.
- data/fake_data: files and scripts used to generate the fake data
- data/original_files: files and scripts provided by Jo Guldi and Christopher Johnson-Roberson
- php/query.php: backend php file that generates queries to be run on the visualSummaries database

*Importing New Data*

New documents can be imported into our database using the script import.py. It takes through stdin JSON of the following format,
```
[ {
    "document_url" : string,
    "origin" : number?, // geoname place id
    "authors" : [(string?, string?)] // (firstName, lastName)
    "topics" : [string]
    "year" : number?
    "places_referenced" : { number? : number? } // (geoname place id, count)
    "title" : string?
} ...]
```

*Installing the tool locally*
- Clone our github repo
- Set up the our database (includes the allCountries table from the Geonames database)
 - Install MySQL
 - Download visualSummaries.sql
 - Run the following commands: 
  - mysql -u root -p[root_password] -e 'create database visualSummaries;'
  - mysql -u root -p[root_password] visualSummaries < visualSummaries.sql
- Gather document metadata into the above JSON format
- Run the import.py script. To check that the database has been populated, run `php php/query.php` and see that results are returned
- View vs/tool.html in a web browser!

*Future work*
- Find or create a suitable geoparser so that new document information can easily be downloaded and tagged with proper location data.
- Develop a method of dynamically tagging new documents.
- Develop a more thorough method of sampling the data to make the queries more scalable.
