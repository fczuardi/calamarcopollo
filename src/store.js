const fs = require('fs');
const path = require('path');
const createStore = require('redux').createStore;
const {
    ADD_EXPRESSION,
    ADD_OUTCOME
} = require('./actionTypes');

const initialState = {
    chats: [],
    users: [],
    expressions: [],
    outcomes: []
};

let localInitialState = {};
try {
    localInitialState = JSON.parse(fs.readFileSync(
        path.join(__dirname, process.env.STATE_FILE),
        'utf8'
    ));
} catch (e) {
    localInitialState = initialState;
}

const updateArrayItem = (arr, i, newItem) => {
    const shouldReplaceItem = (i > -1 && newItem !== null);
    return shouldReplaceItem
        ? [...arr.slice(0, i), newItem, ...arr.slice(i + 1)]
        : [newItem, ...arr];
};
const reducer = (state = localInitialState, action) => {
    const { type, payload } = action;
    const payloadText = payload.text || null;
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

module.exports = store;
