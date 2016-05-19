import test from 'ava';
import {
    tripIntent,
    tripIntentDestination,
    tripOriginDestination
} from './helpers/releases/0.3.0';

test('[0.3.0] Expressions with a trip info intent but no other data', tripIntent);
test('[0.3.0] Expressions with trip intent and destination only', tripIntentDestination);
test('[0.3.0] The expression suggested on the help command should work', tripOriginDestination);
