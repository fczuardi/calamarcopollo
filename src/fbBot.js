import Koa from 'koa';
import router from 'koa-simple-router';
import bodyParser from 'koa-bodyparser';
import request from 'request-promise';

const PORT = process.env.PORT || 8081;
const FB_VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
const webhookPath = '/fbwebhook';

const webRouter = updateCallback => router(_ => {
    /* eslint-disable no-param-reassign */
    _.get(webhookPath, (ctx, next) => {
        if (ctx.query['hub.verify_token'] === FB_VERIFY_TOKEN) {
            ctx.body = ctx.query['hub.challenge'];
        }
        ctx.body = 'Error, wrong validation token';
        return next;
    });
    _.post(webhookPath, (ctx, next) => {
        // console.log('ctx.request.body', ctx.request.body);
        ctx.request.body.entry.forEach(({ messaging }) => {
            messaging.forEach(item => {
                const { sender, timestamp, message } = item;
                if (!message || !message.text) {
                    console.log('no text messagingItem', item);
                    return null;
                }
                const text = message.text;
                // telegram style update object
                const update = {
                    message: {
                        text,
                        chat: {
                            id: sender.id
                        },
                        from: {
                            id: sender.id
                        },
                        date: timestamp
                    }
                };
                updateCallback(update);
            });
        });
        ctx.body = 'Foo';
        return next;
    });
    /* eslint-enable no-param-reassign */
});

class FbBot {
    constructor() {
        this.app = new Koa();
    }

    start(updateCallback) {
        this.app.use(bodyParser());
        this.app.use(webRouter(updateCallback));
        console.log(`Facebook Messenger Webhook listening port ${PORT}`);
        this.app.listen(PORT);
    }

    sendMessage({ recipientId, text } = null) {
        console.log('FB sendMessage', recipientId, text);
        const requestOptions = {
            method: 'POST',
            uri: `https://graph.facebook.com/v2.6/me/messages?access_token=${FB_PAGE_ACCESS_TOKEN}`,
            json: true,
            body: {
                recipient: {
                    id: recipientId
                },
                message: {
                    text
                }
            }
        };
        console.log('requestOptions', requestOptions);
        return request(requestOptions);
    }
}

export default FbBot;
// const bot = new FbBot(update => {
//     console.log('update callback', update);
// });
//
// console.log(bot);
