import test from 'ava';
import {
    tripIntent,
    tripIntentDestination,
    tripIntentOrigin,
    tripOriginDestination
} from './helpers/releases/0.3.0';

test('[0.3.0] Expressions with a TRIP INFO intent but no other data', tripIntent);
test('[0.3.0] Expressions with TRIP INFO intent and DESTINATION only', tripIntentDestination);
test('[0.3.0] Expressions with TRIP INFO intent and ORIGIN only', tripIntentOrigin);
test('[0.3.0] The expression suggested on the help command should work', tripOriginDestination);
