import { dayString, durationFormat } from '../src/stringHelpers';
const faqAnswers = require(process.env.FAQ_PATH || '../answers.json');

const DEBUG_TO_LOGFILE = process.env.DEBUG_TO_LOGFILE;
const PRIVACY_POLICY_ON_START = process.env.PRIVACY_POLICY_ON_START === 'yes';

const faqReply = value => {
    const selectedAnswer = faqAnswers.find(answer => answer.value === value);
    return selectedAnswer ? selectedAnswer.response : null;
};

const dayStrings = {
    today: 'hoje',
    tomorrow: 'amanhã',
    dayAfterTomorrow: 'depois de amanhã'
};

/* eslint-disable max-len */
const defaultReplies = {
    // ## Commands
    version: v => `v${v}`,
    help: () => 'Tente consultar um horário de ônibus, por exemplo: horários de São Paulo para Rio de Janeiro',
    start: () => (PRIVACY_POLICY_ON_START
        ? 'AVISO: Você está conversando com uma versão de desenvolvimento do bot "calamarcopollo" e qualquer frase que você digitar pode ficar publicamente logada na web. Portanto não digite nada privado para este bot. DICA: sempre que quiser recomeçar a interação do zero, digite /restart'
        : 'Bem vindo, em que posso ajudar?'
    ),
    restart: () => 'OK, vamos recomeçar do zero.',
    // ## Insult
    insult: username => `Desculpe ${username}, sou um robô e meu trabalho é servir, faço o possível mas nem sempre acerto… pode extravazar seu descontentamento em mim, eu mereço.`,
    // ## Interactions
    greeting: {
        noUsername: () => 'Oi, em que posso ajudar?',
        username: username => `Olá ${username}, em que posso ajudar?`
    },
    close: () => ':)',
    laugh: () => 'hehehe',
    compliment: () => 'Muito obrigado!',
    nameOrigin: () => 'Por que a galinha atravessou a rua? :P',
    howAreYou: () => 'Vou bem, obrigado!',
    // ## FAQ
    faq: faqReply,
    // ## Trip
    trip: {
        noPlaces: () => 'Certo… preciso saber da origem e do destino',
        noDestination: () => 'E qual o destino?',
        noOrigin: () => 'Saindo de onde?',
        requesting: (origin, destination) =>
            `Só um minuto, vou buscar aqui… (${origin} 🚌 ${destination})`,
        requestingWithDay: (origin, destination, day) =>
            `Só um minuto, vou buscar aqui… (${origin} 🚌 ${destination}, 🗓 ${day.format('DD/MM/YYYY')})`,
        requestingWithDayAndTime: (origin, destination, day, to) =>
            `Só um minuto, vou buscar aqui… (${origin} 🚌 ${destination}, 🗓 ${day.format('DD/MM/YYYY')} 🕙 ${day.format('HH:mm')}${to ? ` - ${to.format('HH:mm')}` : ''})`,
        noSlug: place =>
            `Infelizmente ${place} é uma localidade que eu não conheço.`,
        apiError: statusCode => `⛔️ Estou tendo problemas para acessar a base de viagens. Por favor tente mais tarde, ou entre em contato com o suporte. [${statusCode}]`,
        noTrips: (origin, destination) =>
            `Não consegui encontrar viagens de ${origin} para ${destination}`,
        noTripsWithUrl: (origin, destination) =>
            `Não encontrei nenhuma viagem de ${origin} para ${destination}`,
        listTitle: (company, departure, seats, duration, price) =>
            `${company} ${departure.format('HH:mm')}, ${price}, ${seats} lugar${seats !== '1' ? 'es' : ''}, ${durationFormat(duration)}`,
        listItemTg: (company, departure, arrival, seats, duration) =>
            `${company}: ${departure.name} ${departure.time} 🚌  ${arrival.name} ${arrival.time}, ${duration} minutos ${seats} lugar${seats !== '1' ? 'es' : ''} disponíve${seats !== '1' ? 'is' : 'l'}.`,
        listItemFb: (company, departure, arrival, seats, duration) =>
            `${departure.name} ${departure.time} → ${arrival.name} ${arrival.time}, ${duration} minutos.`,
        filteredDepartureListAfter: (origin, destination, day, optionsSize, url, options) => ({
            header: `De ${origin} para ${destination} ${dayString(day, dayStrings)} depois das ${day.format('HH:mm')} tenho ${optionsSize} ${optionsSize !== 1 ? 'opções' : 'opção'}:`,
            body: `${options ? `:\n\n${options}` : '.'}`,
            footer: `Para ver todas as opções desse dia acesse ${url}`
        }),
        filteredDepartureListBetween: (origin, destination, from, to, optionsSize, url, options) => ({
            header: `De ${origin} para ${destination} ${dayString(from, dayStrings)} entre ${from.format('HH:mm')} e ${to.format('HH:mm')} tenho ${optionsSize} ${optionsSize !== 1 ? 'opções' : 'opção'}:`,
            body: `${options ? `:\n\n${options}` : '.'}`,
            footer: `Para ver todas as opções desse dia acesse ${url}`
        }),
        departureList: (origin, destination, day, optionsSize, url, options) => ({
            header: `De ${origin} para ${destination} ${dayString(day, dayStrings)} tenho ${optionsSize} opç${optionsSize !== 1 ? 'ões' : 'ão'}:`,
            body: `${options ? `:\n\n${options}` : '.'}`,
            footer: `Para reservar acesse ${url}`
        }),
        detail: () => 'Checar'
    },
    // ## Unexpected answer
    unknown: () => (DEBUG_TO_LOGFILE
        ? () => 'não entendi 😥'
        : debug => `Vixe, me confundi. ${debug}`
    )
};
/* eslint-enable max-len */

const customRepliesPath = process.env.CUSTOM_REPLIES_PATH || './custom';
const customReplies = require(customRepliesPath);
const replies = {
    ...defaultReplies,
    ...customReplies,
    greeting: {
        ...defaultReplies.greeting,
        ...customReplies.greeting
    },
    trip: {
        ...defaultReplies.trip,
        ...customReplies.trip
    }
};

export {
    replies,
    dayStrings
};
