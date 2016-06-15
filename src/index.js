#!/usr/bin/env node

import { FacebookMessengerBot, calamarMessageFormat } from 'calamars';
import tgBot from './tgBot';
import { polloSanitize } from './stringHelpers';
import { createStore } from './store';
import {
    updateExpression,
    updateOutcome,
    updateChatSession
} from './actionCreators';
import wit from './wit';
import router from './router';
import { replies } from '../replies';
import moment from 'moment';
import request from 'request-promise';
import GoogleURL from 'google-url';
import { tripDialogReply } from './tripDialog';
import { appendFile } from 'fs';

const googleUrl = new GoogleURL({ key: process.env.GOOGLE_API_KEY });

const CLICKBUS_URL = process.env.CLICKBUS_URL;
const CLICKBUS_API_KEY = process.env.CLICKBUS_API_KEY;
const CLICKBUS_WEB_URL = process.env.CLICKBUS_WEB_URL;
const CLICKBUS_UTM_PARAMS = process.env.CLICKBUS_UTM_PARAMS || '';
const CLICKBUS_WEB_URL_DATE_PARAM = process.env.CLICKBUS_WEB_URL_DATE_PARAM;
const DEBUG_TO_LOGFILE = process.env.DEBUG_TO_LOGFILE;

const store = createStore();
const onUpdate = async ({ bot, update }) => {
    const message = calamarMessageFormat(update);
    const { chatId, senderId } = message;
    const messageText = message.text;
    const date = message.timestamp;
    if (!messageText) {
        console.log(`Update: ${JSON.stringify(update, ' ', 2)}`);
        return null;
    }
    const text = polloSanitize(messageText);
    console.log(`
        Message: ${messageText}
        ${text}`)
    ;
    store.dispatch(updateExpression({ text }));
    const chat = {
        id: chatId
    };
    store.dispatch(updateChatSession({ chat, date }));
    const botType = message.platform;

    let sendMessageOptions;
    let from;
    if (botType === 'facebookMessenger') {
        sendMessageOptions = { userId: senderId };
        from = await bot.getUserInfo(senderId);
    } else {
        sendMessageOptions = { disable_web_page_preview: 'true', chat_id: chatId };
        from = update.message.from;
    }

    const witResult = await wit.query(text, true);
    /* eslint-disable no-underscore-dangle */
    const { _text, outcomes } = witResult;
    const outcome = outcomes[0]
    ? { text: _text, entities: outcomes[0].entities }
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
        const apiTripRequestOptions = {
            uri: reply.url,
            headers: {
                'X-API-KEY': CLICKBUS_API_KEY
            }
        };
        const apiSessionRequestOptions = {
            ...apiTripRequestOptions,
            uri: `${CLICKBUS_URL}/session`
        };
        let responseBody;
        let sessionBody;
        try {
            responseBody = await request(apiTripRequestOptions);
            sessionBody = await request(apiSessionRequestOptions);
        } catch (err) {
            console.log('___err___', err);
            const { statusCode } = err;
            const nextContext = Object.assign({}, context, { apiError: statusCode });
            const errorReply = tripDialogReply(nextContext);
            return bot.sendMessage({
                ...sendMessageOptions,
                text: errorReply
            });
        }
        console.log('reply arrived');
        const sessionCookie = JSON.parse(sessionBody).content;
        const apiResult = JSON.parse(responseBody);
        const rawTrips = apiResult.items;
        console.log(`${rawTrips.length} trips`);
        // console.log(JSON.stringify(rawTrips, ' ', 2));
        const trips = rawTrips.filter(
            trip => trip.parts && trip.parts[0] && trip.parts[0].availableSeats > 0
        ).map(trip => {
            const firstPart = trip.parts[0];
            const {
                departure,
                arrival,
                busCompany,
                availableSeats
            } = firstPart;
            const price = departure.waypoint.prices[0].price;
            const beginTime = departure.waypoint.schedule;
            const scheduleId = beginTime.id;
            const endTime = arrival.waypoint.schedule;
            const departurePlace = departure.waypoint.place.city;
            const departureTime = moment(`${beginTime.date} ${beginTime.time}.000-03`);
            const arrivalPlace = arrival.waypoint.place.city;
            const arrivalTime = moment(`${endTime.date} ${endTime.time}.000-03`);
            const duration = arrivalTime.diff(departureTime, 'minutes');
            const busCompanyName = busCompany.name;
            const busCompanyLogo = busCompany.logo;
            console.log(
`${beginTime.date} ${beginTime.time} - ${endTime.date} ${endTime.time} - ${duration} - ${availableSeats}`
            );
            return {
                price,
                departurePlace,
                arrivalPlace,
                departureTime,
                arrivalTime,
                duration,
                busCompanyName,
                busCompanyLogo,
                availableSeats,
                scheduleId
            };
        });
        // console.log('trips', trips);
        // console.log(`trips[0]: ${JSON.stringify(trips[0])}`);

        const srcSlug = context.originMeta.slugs[0];
        const destSlug = context.destinationMeta.slugs[0];
        const webUrl = `${CLICKBUS_WEB_URL}/${srcSlug}/${destSlug}/?${CLICKBUS_UTM_PARAMS}`;
        const url = `${webUrl}&${CLICKBUS_WEB_URL_DATE_PARAM}=${reply.departureDay}`;

        console.log(`shortening the web url ${url}…`);
        const secondReply = await new Promise(resolve => {
            googleUrl.shorten(url, (err, shortUrl) => {
                console.log('URL shortened', shortUrl);
                const nextContext = Object.assign({}, context, {
                    trips,
                    shortUrl,
                    sessionCookie
                });
                return resolve(tripDialogReply(nextContext));
            });
        });

        if (
            botType === 'facebookMessenger' &&
            secondReply.structuredRely &&
            secondReply.structuredRely.length > 0
        ) {
            return bot.sendMessage({
                ...sendMessageOptions,
                text: secondReply.textReply.header
            }).then(() => {
                bot.sendMessage({
                    ...sendMessageOptions,
                    attachment: {
                        type: 'template',
                        payload: {
                            template_type: 'generic',
                            elements: secondReply.structuredRely.slice(0, 10)
                        }
                    }
                }).then(() => {
                    bot.sendMessage({
                        ...sendMessageOptions,
                        text: secondReply.textReply.footer
                    });
                });
            });
        }

        if (secondReply.textReply) {
            return bot.sendMessage({
                ...sendMessageOptions,
                text: [
                    secondReply.textReply.header,
                    secondReply.textReply.body,
                    '\n\n',
                    secondReply.textReply.footer
                ].join('')
            });
        }

        return bot.sendMessage({
            ...sendMessageOptions,
            text: secondReply
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
};

const port = process.env.PORT;
const callbackPath = process.env.FB_CALLBACK_PATH;
const listeners = { onUpdate };
const staticFiles = [
    { path: process.env.POST_TO_CLICKBUS_HACK_PATH, file: './src/autopost.html' }
];
const fbBot = new FacebookMessengerBot({ port, callbackPath, listeners, staticFiles });

//
fbBot.launchPromise.then(serverStatus => {
    console.log('serverStatus', serverStatus, port);
    fbBot.setWelcomeMessage({
        text: replies.start
    }).then(welcomeMsgSetResult =>
        console.log('welcomeMsgSetResult', welcomeMsgSetResult)
    );
});

tgBot.on('update', update => onUpdate({ bot: tgBot, update }));
