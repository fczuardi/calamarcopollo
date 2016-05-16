import {
    UPDATE_EXPRESSION,
    UPDATE_OUTCOME,
    UPDATE_CHAT_SESSION
} from './actionTypes';

const updateArrayItem = (arr, i, newItem) => {
    const shouldReplaceItem = (i > -1 && newItem !== null);
    return shouldReplaceItem
        ? [...arr.slice(0, i), newItem, ...arr.slice(i + 1)]
        : [newItem, ...arr];
};

export default function (state, action) {
    const { type, payload } = action;
    const { text, chat } = payload || {};
    const chatId = chat && chat.id ? chat.id : null;
    const expressionIndex = state.expressions.findIndex(t => t === text);
    const outcomeIndex = state.outcomes.findIndex(item => item.text === text);
    const chatIndex = state.chats.findIndex(item => item.id === chatId);
    const oldChat = chatIndex >= 0 ? state.chats[chatIndex] : null;;
    switch (type) {
    case UPDATE_EXPRESSION:
        return {
            ...state,
            expressions: updateArrayItem(
                state.expressions, expressionIndex, text
            )
        };
    case UPDATE_OUTCOME:
        return {
            ...state,
            outcomes: updateArrayItem(
                state.outcomes, outcomeIndex, payload
            )
        };
    case UPDATE_CHAT_SESSION:
        if (!chat.session) {
            chat.session = oldChat && oldChat.session ? oldChat.session : {};
        }
        return {
            ...state,
            chats: updateArrayItem(
                state.chats, chatIndex, chat
            )
        };
    default:
        return state;
    }
}
