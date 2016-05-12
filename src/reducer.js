import {
    UPDATE_EXPRESSION,
    UPDATE_OUTCOME
} from './actionTypes';

const updateArrayItem = (arr, i, newItem) => {
    const shouldReplaceItem = (i > -1 && newItem !== null);
    return shouldReplaceItem
        ? [...arr.slice(0, i), newItem, ...arr.slice(i + 1)]
        : [newItem, ...arr];
};

export default function (state, action) {
    const { type, payload } = action;
    const payloadText = payload && payload.text ? payload.text : null;
    const expressionIndex = state.expressions.findIndex(t => t === payloadText);
    const outcomeIndex = state.outcomes.findIndex(item => item.text === payloadText);
    switch (type) {
    case UPDATE_EXPRESSION:
        return {
            ...state,
            expressions: updateArrayItem(
                state.expressions, expressionIndex, payloadText
            )
        };
    case UPDATE_OUTCOME:
        return {
            ...state,
            outcomes: updateArrayItem(
                state.outcomes, outcomeIndex, payload
            )
        };
    default:
        return state;
    }
}
