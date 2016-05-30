#!/usr/bin/env node

import moment from 'moment';
import request from 'request-promise';
import { writeFileSync, appendFile } from 'fs';
import { join as pathJoin } from 'path';
import { polloSanitize } from './stringHelpers';
import tgBot from './tgBot';
import FBBot from './fbBot';
import wit from './wit';
import router from './router';
import { replies } from '../replies';
import { createStore } from './store';
import { tripDialogReply } from './tripDialog';
import {
    updateExpression,
    updateOutcome,
    updateChatSession
} from './actionCreators';
import GoogleURL from 'google-url';
const googleUrl = new GoogleURL({ key: process.env.GOOGLE_API_KEY });

const DEBUG_TO_LOGFILE = process.env.DEBUG_TO_LOGFILE;
const CLICKBUS_WEB_URL = process.env.CLICKBUS_WEB_URL;
const CLICKBUS_WEB_URL_DATE_PARAM = process.env.CLICKBUS_WEB_URL_DATE_PARAM;
const CLICKBUS_UTM_PARAMS = process.env.CLICKBUS_UTM_PARAMS || '';

const fbBot = new FBBot();
const store = createStore();
const onUpdate = ({ bot, botType }) => update => {
    const { message } = update;
    const { chat, from, date } = message;
    const messageText = message.text;
    if (!messageText) {
        console.log(`Update: ${JSON.stringify(update, ' ', 2)}`);
        return null;
    }

    const text = polloSanitize(messageText);
    const tgOptions = {
        disable_web_page_preview: 'true',
        chat_id: chat.id
    };
    const fbObtions = {
        recipientId: from.id
    };
    const sendMessageOptions = botType === 'facebook'
        ? fbObtions
        : tgOptions;
    console.log(`
        Message: ${messageText}
                 ${text}`);
    store.dispatch(updateExpression({ text }));
    store.dispatch(updateChatSession({ chat, date }));

    // const authorId = from.id;
    return wit.query(text, true).then(result => {
        /* eslint-disable no-underscore-dangle */
        const outcome = result.outcomes[0]
            ? { text: result._text, entities: result.outcomes[0].entities }
            : {};
        /* eslint-enable no-underscore-dangle */
        console.log('outcome', JSON.stringify(outcome));
        console.log('chat, from, date', chat, from, date);
        const reply = router(outcome, { store, chat, from, date });
        store.dispatch(updateOutcome(outcome));
        const currentChat = store.getState().chats.find(item => item.id === chat.id);
        const context = currentChat.session;
        if (typeof reply === 'string') {
            console.log('reply', reply);
            console.log('context', context);
            bot.sendMessage({
                ...sendMessageOptions,
                text: reply
            });
            // @TODO remove unknown place from context if the bot replied
            // with the noSlug answer
            if (!context.destinationMeta || !context.originMeta) {
                const nextContext = {
                    ...context,
                    destination: !context.destinationMeta ? undefined : context.destination,
                    origin: !context.originMeta ? undefined : context.origin
                };
                console.log('remove place?', nextContext);
                store.dispatch(updateChatSession({
                    chat: { ...chat, session: nextContext }
                }));
            }
            return reply;
        }
        if (reply && reply.url) {
            const replyText = !context.timeFilter
                ? replies.trip.requesting(context.origin, context.destination)
                : context.timeFilter.from.grain === 'day'
                    ? replies.trip.requestingWithDay(
                        context.origin, context.destination,
                        moment(context.timeFilter.from.value)
                    ) : replies.trip.requestingWithDayAndTime(
                        context.origin, context.destination,
                        moment(context.timeFilter.from.value),
                        context.timeFilter.to ? moment(context.timeFilter.to.value) : null
                    );
            bot.sendMessage({
                ...sendMessageOptions,
                text: replyText
            });
            console.log(`requesting ${reply.url}`);
            return request(reply.url).then(body => {
                console.log('reply arrived');
                const apiResult = JSON.parse(body);
                const rawTrips = apiResult.items;
                console.log(`${rawTrips.length} trips`);
                // console.log(JSON.stringify(rawTrips, ' ', 2));
                const trips = rawTrips.map(trip => {
                    const firstPart = trip.parts[0];
                    const {
                        departure,
                        arrival,
                        busCompany,
                        availableSeats
                    } = firstPart;
                    const beginTime = departure.waypoint.schedule;
                    const endTime = arrival.waypoint.schedule;
                    const departurePlace = departure.waypoint.place.city;
                    const departureTime = moment(`${beginTime.date} ${beginTime.time}.000-03`);
                    const arrivalPlace = arrival.waypoint.place.city;
                    const arrivalTime = moment(`${endTime.date} ${endTime.time}.000-03`);
                    const duration = arrivalTime.diff(departureTime, 'minutes');
                    const busCompanyName = busCompany.name;
                    console.log(
`${beginTime.date} ${beginTime.time} - ${endTime.date} ${endTime.time} - ${duration}`
                    );
                    return {
                        departurePlace,
                        arrivalPlace,
                        departureTime,
                        arrivalTime,
                        duration,
                        busCompanyName,
                        availableSeats
                    };
                });
                console.log(`trips[0]: ${JSON.stringify(trips[0])}`);

                const srcSlug = context.originMeta.slugs[0];
                const destSlug = context.destinationMeta.slugs[0];
                const webUrl = `${CLICKBUS_WEB_URL}/${srcSlug}/${destSlug}/?${CLICKBUS_UTM_PARAMS}`;
                const url = `${webUrl}&${CLICKBUS_WEB_URL_DATE_PARAM}=${reply.departureDay}`;

                console.log(`shortening the web url ${url}…`);
                googleUrl.shorten(url, (err, shortUrl) => {
                    console.log('URL shortened', shortUrl);
                    const nextContext = Object.assign({}, context, { trips, shortUrl });
                    const secondReply = tripDialogReply(nextContext);
                    return bot.sendMessage({
                        ...sendMessageOptions,
                        text: secondReply
                    });
                });
            }).catch(err => {
                const { statusCode } = err;
                const nextContext = Object.assign({}, context, { apiError: statusCode });
                const errorReply = tripDialogReply(nextContext);
                return bot.sendMessage({
                    ...sendMessageOptions,
                    text: errorReply
                });
            });
        }
        console.log('what is this?', reply);
        const debugContext = JSON.stringify(context);
        const debugOutcome = JSON.stringify(outcome);
        if (DEBUG_TO_LOGFILE) {
            const logLine = `${new Date().toString()}, ${text}, ${debugOutcome}, ${debugContext}\n`;
            appendFile(DEBUG_TO_LOGFILE, logLine, err => console.error(err));
        }
        return bot.sendMessage({
            ...sendMessageOptions,
            text: replies.unknown(
                `context: ${debugContext}
                outcome: ${debugOutcome}`
            )
        });
    }).catch(err => console.error(err));
};

tgBot.on('update', onUpdate({ bot: tgBot, botType: 'telegram' }));
fbBot.start(onUpdate({ bot: fbBot, botType: 'facebook' }));

// store.subscribe(() => {
//     console.log(JSON.stringify(store.getState(), ' ', 2));
// });
process.on('SIGINT', () => {
    console.log('Got SIGINT. Saving state to disk.');
    if (process.env.STATE_FILE) {
        writeFileSync(
            pathJoin(__dirname, process.env.STATE_FILE),
            JSON.stringify(store.getState(), ' ', 2),
            'utf8'
        );
        process.exit();
    }
});
