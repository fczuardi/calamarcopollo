const {
    ADD_EXPRESSION,
    ADD_OUTCOME
} = require('./actionTypes');

const basicCreator = type => payload => ({
    type,
    payload: {
        ...payload
    }
});

const addExpression = basicCreator(ADD_EXPRESSION);
const addOutcome = basicCreator(ADD_OUTCOME);

module.exports = {
    addExpression,
    addOutcome
};
