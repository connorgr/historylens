from dateutil.parser import *
import json
import re
import sys

# Takes the ad-hoc data we curled from Zotero, and converts to our intermediate JSON format
# It can then be imported by import.py.
# See import.py for a full description of our intermediate JSON format.

doc_url_re = re.compile(r"/.*")
year_re = re.compile(r"\d\d\d\d")

def extract_doc_url(json):
    assert json.has_key("id")
    return "https://api.zotero.org/groups/50280/items/" + doc_url_re.findall(json["id"])[0][1:]

def extract_title(json):
    return json.get("title", "")

def extract_topics(json):
    return []

def extract_authors(json):
    authors = []
    for entry in json.get("author", {}):
        current = []
        for nametype in entry.keys():
            current.append(entry[nametype])
        if len(current) > 0:
            authors.append(current)
    return authors

def extract_year(json):
    if not json.has_key("issued"):
        return ""
    if not json["issued"].has_key("raw"):
        return ""
    regexed = year_re.findall(json["issued"]["raw"])
    if len(regexed) > 0:
        return regexed[0]
    try:
        return parse(json["issued"]["raw"]).year
    except:
        return ""

def random_location():
    return None

def main(verbose, truncation, random_geo_seed):
    rows = []

    metadata_rows = {}
    seen_rows = set()
    for line in sys.stdin:
	if line in seen_rows:
	    continue
	else:
	    seen_rows.add(line)
	metadata = json.loads(line)
	if not metadata.has_key("items"):
 	    continue
        metadata = metadata["items"][0]
        if metadata == None or metadata == {} or metadata == []:
            continue
        doc_url = extract_doc_url(metadata)
        title = extract_title(metadata)
        topics = extract_topics(metadata)
        authors = extract_authors(metadata)
	year = extract_year(metadata)
        metadata_rows[doc_url] = {"document_url": doc_url,
                                  "title": title,
                                  "topics":topics,
                                  "authors":authors,
                                  "year":year}
        if random_geo_seed:
            metadata_rows[doc_url]["origin"] = random_location()
            metadata_rows[doc_url]["fake"] = True
        else:
            metadata_rows[doc_url]["origin"] = None

    count = 0
    for doc_url in metadata_rows:
        count += 1
        if count > truncation:
            break
        rows.append(metadata_rows[doc_url])

    if verbose:
        for row in rows:
            for col in row:
                json.dump(row[col], sys.stderr)
                sys.stderr.write("\t")
            sys.stderr.write("\n")

    json.dump(rows, sys.stdout, sort_keys=True, indent=4)

if __name__ == '__main__':
    arg1 = bool(sys.argv[1]) if (len(sys.argv) >= 2) else False
    arg2 = int(sys.argv[2]) if (len(sys.argv) >= 3) else ()
    arg3 = bool(sys.argv[3]) if (len(sys.argv) >= 4) else False
    main(arg1, arg2, arg3)
