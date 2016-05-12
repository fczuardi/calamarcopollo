import {
    UPDATE_EXPRESSION,
    UPDATE_OUTCOME
} from './actionTypes';

const basicCreator = type => payload => ({
    type,
    payload: {
        ...payload
    }
});

const updateExpression = basicCreator(UPDATE_EXPRESSION);
const updateOutcome = basicCreator(UPDATE_OUTCOME);

export {
    updateExpression,
    updateOutcome
};
