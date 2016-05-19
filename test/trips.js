import test from 'ava';
import {
    tripOriginDestination,
    tripIntent
} from './helpers/releases/0.3.0';

test('Expressions with a trip info intent but no other data', tripIntent);
test('The expression suggested on the help command should work', tripOriginDestination);
