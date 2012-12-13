import MySQLdb
import json
import sys

# Our JSON format:
# [ { "document_url" : string,
#     "origin" : number?,
#     "authors" : [(string?, string?)]    // (firstName, lastName)
#     "topics" : [string]
#     "year" : number?
#     "places_referenced" : { number : number }   // (place, count)
#     "title" : string?
#   } ]

# Our SQL tables:
# doc_tbl -> docid, title, pubYear, origin (a placeId), url
# place_tbl -> placeId, name, latitude, longitude, country_code, region1, region2, region3, region4
# tag_tbl -> tagId, tagName, tagTypeId
# author_tbl -> authorId, firstName, lastName
# docsToTags_tbl -> docId, tagId
# docsToAuthors_tbl -> docId, authorId
# placeRefs_tbl -> docId, placeId, frequency

def default(value, default):
    return default if value is None else value

def execute(cursor, query, mapping):
    for key in mapping:
        if isinstance(mapping[key], unicode):
            mapping[key] = mapping[key].encode('latin-1', 'ignore')
    cursor.execute(query, mapping)

def try_insert(cursor, cmd, query, mapping):
    execute(cursor, cmd, mapping)
    cursor.fetchall()
    execute(cursor, query, mapping)
    return cursor.fetchone()[0]

def insert_author(cursor, docId, firstName, lastName):
    cmd = u"""
INSERT INTO author_tbl (firstName, lastName)
SELECT * FROM (SELECT %(firstName)s, %(lastName)s) AS QQ
WHERE NOT EXISTS (
  SELECT 1 FROM author_tbl
  WHERE IFNULL(firstName,'') = IFNULL(%(firstName)s,'')
  AND IFNULL(lastName,'') = IFNULL(%(lastName)s,'')
);
"""
    query = u"""
SELECT authorId FROM author_tbl
WHERE IFNULL(firstName,'') = IFNULL(%(firstName)s,'')
AND IFNULL(lastName,'') = IFNULL(%(lastName)s,'');
"""
    if firstName is None and lastName is None:
        return None
    else:
        mapping = {"firstName" : firstName,
                   "lastName" : lastName}
        authorId = try_insert(cursor, cmd, query, mapping)
        if not authorId: return 0
        cmd2 = u"""
INSERT INTO docsToAuthors_tbl (docId, authorId)
SELECT * FROM (SELECT %(docId)s, %(authorId)s) AS QQ
WHERE NOT EXISTS (
  SELECT 1 FROM docsToAuthors_tbl
  WHERE docId = %(docId)s AND authorId = %(authorId)s
);
"""
        return execute(cursor, cmd2, {"docId" : docId, "authorId" : authorId})

def insert_tag(cursor, docId, tag):
    cmd1 = u"""
INSERT INTO tag_tbl (tagName)
SELECT * FROM (SELECT %(tag)s) AS QQ
WHERE NOT EXISTS (
  SELECT 1 FROM tag_tbl WHERE IFNULL(tagName,'') = IFNULL(%(tag)s,'')
);
"""
    query1 = u"""
SELECT tagId FROM tag_tbl WHERE IFNULL(tagName,'') = IFNULL(%(tag)s,'');
"""
    tagId = try_insert(cursor, cmd1, query1, {"tag" : tag})
    if not tagId: return 0
    cmd2 = u"""
INSERT INTO docsToTags_tbl (docId, tagId)
SELECT * FROM (SELECT %(docId)s, %(tagId)s) AS QQ
WHERE NOT EXISTS (
  SELECT 1 FROM docsToTags_tbl
  WHERE docId = %(docId)s AND tagId = %(tagId)s
);
"""
    return execute(cursor, cmd2, {"docId" : docId, "tagId" : tagId})

def insert_doc(cursor, url, title, publicationYear, origin, original):
    cmd = u"""
INSERT INTO doc_tbl (title, pubYear, origin, url, originalData)
SELECT * FROM (SELECT %(title)s, %(pubYear)s, %(origin)s, %(url)s, %(original)s) AS QQ
WHERE NOT EXISTS (
  SELECT 1 FROM doc_tbl
  WHERE IFNULL(title,'') = IFNULL(%(title)s,'')
  AND IFNULL(pubYear,0) = IFNULL(%(pubYear)s,0)
  AND IFNULL(origin,0) = IFNULL(%(origin)s,0)
  AND IFNULL(url,'') = IFNULL(%(url)s,'')
);
"""
    query = u"""
SELECT docId FROM doc_tbl
WHERE IFNULL(title,'') = IFNULL(%(title)s,'')
AND IFNULL(pubYear,0) = IFNULL(%(pubYear)s,0)
AND IFNULL(origin,0) = IFNULL(%(origin)s,0)
AND IFNULL(url,'') = IFNULL(%(url)s,'');
"""
    mapping = {"url":url, "title":title, "pubYear":publicationYear, "origin":origin, "original":original}
    result = try_insert(cursor, cmd, query, mapping)
    insert_place(cursor, origin)
    return result

def insert_place_ref(cursor, docId, placeId, frequency):
    cmd = u"""
INSERT INTO placeRef_tbl (docId, placeId, frequency)
SELECT * FROM (SELECT %(docId)s, %(placeId)s, %(frequency)s) AS QQ
WHERE NOT EXISTS (
  SELECT 1 FROM placeRef_tbl
  WHERE docId = %(docId)s AND placeId = %(placeId)s
);
"""
    result = cursor.execute(cmd, {"docId":docId, "placeId":placeId, "frequency":frequency})
    insert_place(cursor, placeId)
    return result

def insert_place(cursor, placeId):
    cmd = u"""
INSERT INTO place_tbl
SELECT geo_id, geo_name, geo_latitude, geo_longitude, geo_country_code, geo_admin1_code, geo_admin2_code, geo_admin3_code, geo_admin4_code, geo_feature_class, geo_feature_code, geo_population
FROM allCountries
WHERE geo_id = %(placeId)s
AND NOT EXISTS (
  SELECT 1 FROM place_tbl
  WHERE placeId = geo_id
);
"""
    return execute(cursor, cmd, {"placeId":placeId})

def populate_place_table(cursor):
    # TODO: make this work. It should be faster.
    cmd = u"""
INSERT INTO tmp_tbl
SELECT DISTINCT placeId
(SELECT origin FROM doc_tbl AS d
UNION ALL
SELECT placeId FROM placeRef_tbl AS pr) AS QQ;

INSERT INTO place_tbl
SELECT geo_id, geo_name, geo_latitude, geo_longitude, geo_country_code, geo_admin1_code, geo_admin2_code, geo_admin3_code, geo_admin4_code, geo_feature_class, geo_feature_code, geo_population
FROM tmp_tbl as t
inner join allCountries AS c
  ON t.placeId = c.geo_id
WHERE NOT EXISTS (
  SELECT 1 FROM place_tbl AS p
  WHERE p.placeId = c.geo_id
);

TRUNCATE TABLE tmp_tbl;
"""
    return cursor.execute(cmd)

def main(verbose = False, originalData = False):
    db = MySQLdb.connect(user="root", db="visualSummaries")
    cursor = db.cursor()

    doc_count = 0
    for line in sys.stdin:
        if not line:
            break
        print line
        doc = json.loads(line)
        docId = insert_doc(cursor, doc["document_url"], doc["title"],
                           doc["year"], doc["origin"],
                           1 if originalData else 0)
        if docId is not None:
            doc_count += 1
            for author in doc["authors"]:
                insert_author(cursor, docId, author[0], author[1])
            for topic in doc["topics"]:
                insert_tag(cursor, docId, topic)
            place_refs = doc["places_referenced"]
            for placeId in place_refs:
                insert_place_ref(cursor, docId, int(placeId), place_refs[placeId])

    print "Document info added."
    #print "Fetching geodata..."
    #populate_place_table(cursor)
    #print "Geo data fetched."
    print "Committing changes..."
    db.commit()
    print ("All done. Processed %s documents." % doc_count)
    
        
if __name__ == '__main__':
    main(False)
