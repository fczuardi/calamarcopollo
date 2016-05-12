import fs from 'fs';
import path from 'path';
import { createStore as createReduxStore } from 'redux';
import reducer from './reducer';

let parsedFileContents = null;
try {
    const filename = path.join(__dirname, process.env.STATE_FILE);
    const fileContents = fs.readFileSync(filename, 'utf8');
    parsedFileContents = JSON.parse(fileContents);
} catch (e) {
    console.log('No local state present, starting with an empty one…');
}

const emptyState = {
    chats: [],
    users: [],
    expressions: [],
    outcomes: []
};
const initialState = parsedFileContents || emptyState;
const createStore = (r = reducer, s = initialState) => createReduxStore(r, s);

export { createStore };
