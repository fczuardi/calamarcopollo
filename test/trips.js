import test from 'ava';
import {
    tripIntent,
    tripIntentDestination,
    tripIntentOrigin,
    tripOriginDestination,
    tripOriginDestinationDepartureTime,
    tripOriginDestinationDepartureTimeFail
} from './helpers/releases/v0.3.0';

import {
    tripIntentDestination as tripIntentDestination060,
    tripIntentOrigin as tripIntentOrigin060,
    tripOriginDestination as tripOriginDestination060
} from './helpers/releases/v0.6.0';

test('[0.6.0] Expressions with TRIP INFO intent and DESTINATION only', tripIntentDestination060);
test('[0.6.0] Expressions with TRIP INFO intent and ORIGIN only', tripIntentOrigin060);
test(
    '[0.6.0] Expressions with TRIP INFO intent, ORIGIN and DESTINATION',
    tripOriginDestination060
);

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
test.failing(
    '[0.3.0] (known failure) tripOriginDestinationDepartureTimeFail',
    tripOriginDestinationDepartureTimeFail
);
test.todo('Cities not on Clickbus API: "bora p/ cravinhos, saindo de joanópolis?"');
