import test from 'ava';
import store from '../src/store';
import { addExpression, addOutcome } from '../src/actionCreators';

test('ADD_EXPRESSION action adds new expression to the state', t => {
    const initialState = store.getState();
    const text = `Foobar ${new Date().getTime()}`;
    const addExpressionAction = addExpression({ text });
    const expectedNextState = {
        ...initialState,
        expressions: [text, ...initialState.expressions]
    };
    store.dispatch(addExpressionAction);
    t.deepEqual(expectedNextState, store.getState());
});

test('ADD_OUTCOME action adds new outcome to the state, or update if same text exists', t => {
    const initialState = store.getState();
    const text = `Foobar ${new Date().getTime()}`;
    const outcome = {
        text,
        entities: { foo: [{ type: 'value', value: 'bar' }] }
    };
    const addOutcomeAction = addOutcome(outcome);
    const expectedNextState = {
        ...initialState,
        outcomes: [outcome, ...initialState.outcomes]
    };
    const outcome2 = {
        text,
        entities: { bar: [{ type: 'value', value: 'foo' }] }
    };
    const addOutcomeAction2 = addOutcome(outcome2);
    const expectedNextState2 = {
        ...initialState,
        outcomes: [outcome2, ...initialState.outcomes]
    };
    store.dispatch(addOutcomeAction);
    t.deepEqual(expectedNextState, store.getState());
    store.dispatch(addOutcomeAction2);
    t.deepEqual(expectedNextState2, store.getState());
});
