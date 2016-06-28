#!/bin/sh
set -eu

jq '[.items[] | {slug, name: (.name|sub(" \\-.*"; "")), alias: (.name|sub(" \\-.*"; "")|sub("\\,..."; "")|ascii_downcase)}]' \
data/places.json \
> data/slugdb.json
