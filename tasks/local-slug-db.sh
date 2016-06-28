#!/bin/sh
set -eu

jq '[.items[] | {slug, name: (.name|sub(" \\- TODOS"; ""; "i")), alias: (.name|sub(" \\- TODOS"; ""; "i")|sub("\\,..."; "")|sub(".* \\- "; "")|ascii_downcase)}]' \
data/places.json \
> data/slugdb.json
