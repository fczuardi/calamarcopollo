import {
    ADD_EXPRESSION,
    ADD_OUTCOME
} from './actionTypes';

const basicCreator = type => payload => ({
    type,
    payload: {
        ...payload
    }
});

const addExpression = basicCreator(ADD_EXPRESSION);
const addOutcome = basicCreator(ADD_OUTCOME);

export {
    addExpression,
    addOutcome
};
