import test from 'ava';
import {
    tripIntent,
    tripIntentDestination,
    tripIntentOrigin,
    tripOriginDestination,
    tripOriginDestinationDepartureTime
} from './helpers/releases/v0.3.0';

test('[0.3.0] Expressions with a TRIP INFO intent but no other data', tripIntent);
test('[0.3.0] Expressions with TRIP INFO intent and DESTINATION only', tripIntentDestination);
test('[0.3.0] Expressions with TRIP INFO intent and ORIGIN only', tripIntentOrigin);
test(
    '[0.3.0] Expressions with TRIP INFO intent, ORIGIN and DESTINATION',
    tripOriginDestination
);
test(
    '[0.3.0] Expressions with TRIP INFO intent, ORIGIN, DESTINATION, DEPARTURE_DATETIME',
    tripOriginDestinationDepartureTime
);
test.todo('Cities not on Clickbus API: "bora p/ cravinhos, saindo de joanópolis?"');
