#!/bin/sh

#curl "https://api.zotero.org/groups/50280/items?format=keys&key=Gq3JKFsWe1rQPdaHiOFOPxLj" > itemKeys

zotero_key="Gq3JKFsWe1rQPdaHiOFOPxLj"
zotero_format="csljson"
echo -n "" > items
echo -n "" > itemTags

while read key; do
  curl --compressed "https://api.zotero.org/groups/50280/items/${key}?format=${zotero_format}&key=${zotero_key}" >> items
  echo "" >> items
  curl --compressed "https://api.zotero.org/groups/50280/items/${key}/tags?key=${zotero_key}" >> itemTags
  echo "" >> itemTags
done < itemKeys
