# CalamarcoPollo

_Save The Chicken Foundation_

[![npm version](https://badge.fury.io/js/calamarcopollo.svg)](https://badge.fury.io/js/calamarcopollo)

<a href="https://openclipart.org/detail/26927/chick"><img src="https://openclipart.org/download/26927/papapishu-chick.svg" /></a>

## About

CalamarcoPollo project is a chatbot for consulting intercity bus schedules in Brazil using Brazilian Portuguese natural language queries and conversations.

This project is also a real-world app used to improve and test the, still very alpha [CalaMars framework][calamars].

## Demo

If you have [Telegram][telegram] installed, add the [@calamarcopollo_demo_bot][demobot] to your contacts and try to talk to it.

If you have Facebook, send a message in the [CalamarcoPollo facebook page][pollopage]
asking to be added in the testers list, and then use this
[fb messenger link][fblink], or if you use the mobile Facebook Messenger app,
scan the image below:



For inspiration of what the pollo is capable of, try one of the [sample statements][statements].

## Install

```sh
mkdir mybot
cd mybot
npm install calamarcopollo@latest
cp node_modules/calamarcopollo/.env-sample .env
# fill-in the blanks
source .env
`npm bin`/pollo
```

## Custom replies

In the ```.env``` file, you can setup a path with a javascript module to override
any of the [default reply strings][defaultreplies], this custom path is stored
in the ```CUSTOM_REPLIES_PATH``` environment var.

You can copy the ```replies/custom.js``` file to use it as basis for your replacements:

```sh
cp node_modules/calamarcopollo/replies/custom.js ./custom-replies.js
# edit .env file to add the absolute path to custom-replies.js file as value
# for the CUSTOM_REPLIES_PATH variable
source .env
```

## License AGPL v3.0

Copyright (c) 2016 Fabricio C Zuardi

This software is distributed under the [GNU AFFERO GENERAL PUBLIC LICENSE version 3][license].

[calamars]: https://github.com/calamar-io/calamars
[telegram]: https://telegram.org/
[demobot]: https://telegram.me/calamarcopollo_demo_bot
[pollopage]: https://www.facebook.com/Calamarcopollo-1782353951999287/
[fblink]: http://m.me/1782353951999287
[statements]: http://fczuardi.github.io/calamarcopollo/statements.html
[defaultreplies]: https://github.com/fczuardi/calamarcopollo/blob/master/replies/index.js#L19-L63
[license]: https://raw.githubusercontent.com/fczuardi/calamarcopollo/master/LICENSE
