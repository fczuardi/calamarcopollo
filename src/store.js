import fs from 'fs';
import path from 'path';
import { createStore } from 'redux';
import {
    ADD_EXPRESSION,
    ADD_OUTCOME
} from './actionTypes';

const emptyState = {
    chats: [],
    users: [],
    expressions: [],
    outcomes: []
};

let parsedFileContents = null;
try {
    const filename = path.join(__dirname, process.env.STATE_FILE);
    const fileContents = fs.readFileSync(filename, 'utf8');
    parsedFileContents = JSON.parse(fileContents);
} catch (e) {
    console.log('No local state present, starting with an empty one…');
}

const initialState = parsedFileContents || emptyState;

const updateArrayItem = (arr, i, newItem) => {
    const shouldReplaceItem = (i > -1 && newItem !== null);
    return shouldReplaceItem
        ? [...arr.slice(0, i), newItem, ...arr.slice(i + 1)]
        : [newItem, ...arr];
};
const reducer = (state = initialState, action) => {
    const { type, payload } = action;
    const payloadText = payload && payload.text ? payload.text : null;
    const expressionIndex = state.expressions.findIndex(t => t === payloadText);
    const outcomeIndex = state.outcomes.findIndex(item => item.text === payloadText);
    switch (type) {
    case ADD_EXPRESSION:
        return {
            ...state,
            expressions: updateArrayItem(
                state.expressions,
                expressionIndex,
                payloadText
            )
        };
    case ADD_OUTCOME:
        return {
            ...state,
            outcomes: updateArrayItem(
                state.outcomes,
                outcomeIndex,
                payload
            )
        };
    default:
        return state;
    }
};

const store = createStore(reducer);

export default store;
