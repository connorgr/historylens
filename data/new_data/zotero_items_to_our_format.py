import xml.etree.ElementTree as ET
import urllib
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

# items format:
# {"items":[{"id":NUM/STR,
#            "title":title,
#            "author"[{"family":first, "given":last}],
#            "issued":STR}]}
# 



# [DONE] get zotero items
# get zotero 

zoteroItemUrl = "http://zotero.org/groups/50280/items/"

# Extract metadata from items

def getMetadata(fileName):
    items = map(json.loads, open(fileName).read().split("\n")[:-1])
    mapping = {}
    for item in items:
        item = item["items"][0]
        docId = getDocUrl(item["id"])
        doc = {}
        if "title" in item:
            doc["title"] = item["title"]
        if "author" in item:
            author = item["author"]
            if "family" in author and "given" in author:
                doc["author"] = (author["family"], author["given"])
        if "issued" in item:
            if "raw" in item["issued"]:
                doc["year"] = item["issued"]["raw"][-4:]
        if "abstract" in item:
            doc["abstract"] = item["abstract"]
        mapping[docId] = doc
    return mapping

def getDocUrl(idStr):
    """559764/I67T2W8J -> http://zotero.org/groups/50280/items/I67T2W8J"""
    return zoteroItemUrl + idStr.split("/")[1]

# Extract tags from itemTags xml

def getAllTags(fileName):
    magicString = '{http://www.w3.org/2005/Atom}'
    mapping = {}
    for line in open(fileName).read().split('<?xml version="1.0"?>')[1:20]:
        tree = ET.fromstring(line)
        docId = None
        tags = []
        for child in tree:
            if child.tag == magicString + 'id':
                parts = child.text.split("/tags")
                if len(parts) == 2:
                    docId = parts[0]
            if child.tag == magicString + 'entry':
                for grandchild in child:
                    if grandchild.tag == magicString + 'id':
                        parts = grandchild.text.split('/tags/')
                        if len(parts) == 2:
                            tag = urllib.unquote(parts[1]).replace("+", " ")
                            tags.append(tag)
        mapping[docId] = tags
    return mapping

# Put them together

def extractData(itemFile, tagFile):
    metadata = getMetadata(itemFile)
    tags = getAllTags(tagFile)
    docs = []
    for docId in metadata:
        doc = metadata[docId]
        doc["document_url"] = docId
        if docId in tags:
            doc["topics"] = tags[docId]
        docs.append(doc)
    return docs
    

if __name__ == '__main__':
    docs = extractData("items", "itemTags")
    json.dump(docs, sys.stdout, sort_keys=True, indent=4)
