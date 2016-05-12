import test from 'ava';
import { createStore } from '../src/store';
import { updateExpression, updateOutcome } from '../src/actionCreators';

const store = createStore();

test('UPDATE_EXPRESSION action adds new expression to the state', t => {
    const initialState = store.getState();
    const text = `Foobar ${new Date().getTime()}`;
    const expectedNextState = {
        ...initialState,
        expressions: [text, ...initialState.expressions]
    };
    store.dispatch(updateExpression({ text }));
    console.log(updateExpression({ text }));
    t.deepEqual(expectedNextState.expressions, store.getState().expressions);
});

test('UPDATE_OUTCOME action adds new outcome to the state, or update if same text exists', t => {
    const initialState = store.getState();
    const text = `Foobar ${new Date().getTime()}`;
    const outcome = {
        text,
        entities: { foo: [{ type: 'value', value: 'bar' }] }
    };
    const expectedNextState = {
        ...initialState,
        outcomes: [outcome, ...initialState.outcomes]
    };
    const outcome2 = {
        text,
        entities: { bar: [{ type: 'value', value: 'foo' }] }
    };
    const expectedNextState2 = {
        ...initialState,
        outcomes: [outcome2, ...initialState.outcomes]
    };
    store.dispatch(updateOutcome(outcome));
    t.deepEqual(expectedNextState, store.getState());
    store.dispatch(updateOutcome(outcome2));
    t.deepEqual(expectedNextState2, store.getState());
});
