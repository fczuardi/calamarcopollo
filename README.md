# CalamarcoPollo

_Save The Chicken Foundation_

[![npm version](https://badge.fury.io/js/calamarcopollo.svg)](https://badge.fury.io/js/calamarcopollo)

<a href="https://openclipart.org/detail/26927/chick"><img src="https://openclipart.org/download/26927/papapishu-chick.svg" /></a>

## About

CalamarcoPollo project is a chatbot for consulting intercity bus schedules in Brazil using Brazilian Portuguese natural language queries and conversations.

This project is also a real-world app used to improve and test the, still very alpha [CalaMars framework][calamars].

## Demo

If you have [Telegram][telegram] installed, add the [@calamarcopollo_demo_bot][demobot] to your contacts and try to talk to it.

For inspiration of what the pollo is capable of, try one of the [sample statements][statements].

## Install

```sh
git clone https://github.com/calamar-io/calamarcopollo.git
cd calamarcopollo
npm install --production
npm run build:npm
cp .env-sample .env
nano .env
# fill-in the blanks
npm start
```

## License AGPL v3.0

Copyright (c) 2016 Fabricio C Zuardi

This software is distributed under the [GNU AFFERO GENERAL PUBLIC LICENSE version 3][license].

[calamars]: https://github.com/calamar-io/calamars
[telegram]: https://telegram.org/
[demobot]: https://telegram.me/calamarcopollo_demo_bot
[statements]: http://fczuardi.github.io/calamarcopollo/statements.html
[license]: https://raw.githubusercontent.com/fczuardi/calamarcopollo/master/LICENSE
