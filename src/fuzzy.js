import Fuse from 'fuse.js';
import { WitDriver } from 'calamars';
const { getEntity, getEntities, getEntityMeta } = WitDriver;
const SLUG_LIST_PATH = process.env.SLUG_LIST_PATH;

const slugList = SLUG_LIST_PATH ? require(SLUG_LIST_PATH) : [];
const fuse = new Fuse(slugList, {
    keys: ['name', 'alias'],
    threshold: 0.2
});

const addLocalMetadata = place => {
    if (!place || !place.value || place.metadata) {
        return place;
    }
    const needle = place.value;
    const searchResult = fuse.search(needle);
    if (searchResult.length) {
        console.log('\nLocal metadata found.');
        const newPlace = {
            ...place,
            metadata: `{"slugs": ["${searchResult[0].slug}"]}`,
            value: searchResult[0].name
        };
        return newPlace;
    }
    return place;
};

const addLocalMetadatas = arr => {
    try {
        return arr.map(addLocalMetadata);
    } catch (e) {
        return arr;
    }
};

const extractEntities = outcomes => {
    const unknownPlace = addLocalMetadata(getEntity(outcomes, 'places'));
    const unknownPlaces = addLocalMetadatas(getEntities(outcomes, 'places'));
    const origin = addLocalMetadata(getEntity(outcomes, 'origin'));
    const origins = addLocalMetadatas(getEntities(outcomes, 'origin'));
    const destination = addLocalMetadata(getEntity(outcomes, 'destination'));
    const originMeta = getEntityMeta(origin);
    const destinationMeta = getEntityMeta(destination);
    const dateTime = getEntity(outcomes, 'datetime');
    const timeFilter = dateTime ? {
        from: !dateTime.from ? dateTime : dateTime.from,
        to: dateTime.to ? dateTime.to : null
    } : null;

    return {
        unknownPlace,
        unknownPlaces,
        origin,
        origins,
        originMeta,
        destination,
        destinationMeta,
        timeFilter
    };
};

export {
    extractEntities
};
