#!/bin/sh
set -eu

curl "$CLICKBUS_URL/places" > ./data/places_latest.json
ls -la data/places*
read -r -p "Overwrite places.json with places_latest.json ? [y/N] " response
case $response in
    [yY][eE][sS]|[yY])
        cp -f ./data/places_latest.json ./data/places.json
        ;;
    *)
esac
