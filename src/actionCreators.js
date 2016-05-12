import {
    UPDATE_EXPRESSION,
    UPDATE_OUTCOME,
    UPDATE_CHAT_SESSION
} from './actionTypes';

const basicCreator = type => payload => ({
    type,
    payload: {
        ...payload
    }
});

const updateExpression = basicCreator(UPDATE_EXPRESSION);
const updateOutcome = basicCreator(UPDATE_OUTCOME);
const updateChatSession = basicCreator(UPDATE_CHAT_SESSION);

export {
    updateExpression,
    updateOutcome,
    updateChatSession
};
