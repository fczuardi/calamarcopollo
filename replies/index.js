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
    thanks: () => 'Não há de que :)',
    // ## FAQ
    faq: faqReply,
    // ## Trip
    trip: {
        noPlaces: () => 'Certo… preciso saber da origem e do destino',
        noDestination: () => 'E qual o destino?',
        noOrigin: () => 'Saindo de onde?',
        requestingWithFilters: (origin, destination,
            { day, timeFilterFrom, timeFilterTo, busTypeFilters, priceFilter }) => {
            const begin = 'Só um minuto, vou buscar aqui… (';
            const end = ')';
            const places = `${origin} 🚌 ${destination}`;
            const dayText = day
                ? `🗓 ${day.format('DD/MM/YYYY')})`
                : null;
            const timeInterval = timeFilterFrom
                ? `🕙 ${timeFilterFrom.format('HH:mm')}${timeFilterTo ? ` - ${timeFilterTo.format('HH:mm')}` : ''})`
                : null;
            const busType = busTypeFilters
                ? `😴 ${busTypeFilters.join(' ou ')}`
                : null;
            const priceSort = priceFilter
                ? `ordenadas por ${priceFilter.value.slice(0, -5)} preço`
                : null;
            const content = [places, dayText, timeInterval, busType, priceSort]
                .filter(i => i !== null)
                .join(', ');
            return begin + content + end;
        },
        noSlug: place =>
            `Infelizmente ${place} é uma localidade que eu não conheço.`,
        apiError: statusCode => `⛔️ Estou tendo problemas para acessar a base de viagens. Por favor tente mais tarde, ou entre em contato com o suporte. [${statusCode}]`,
        noTrips: (origin, destination) =>
            `Não consegui encontrar viagens de ${origin} para ${destination}`,
        noTripsWithUrl: (origin, destination) =>
            `Não encontrei nenhuma viagem de ${origin} para ${destination}`,
        listTitle: (company, departure, seats, duration, price, busType) =>
            `${company} ${departure.format('HH:mm')}, ${price}, ${busType}, ${seats} lugar${seats !== '1' ? 'es' : ''}, ${durationFormat(duration)}`,
        listItemTg: (company, departure, arrival, seats, duration) =>
            `${company}: ${departure.name} ${departure.time} 🚌  ${arrival.name} ${arrival.time}, ${duration} minutos ${seats} lugar${seats !== '1' ? 'es' : ''} disponíve${seats !== '1' ? 'is' : 'l'}.`,
        listItemFb: (company, departure, arrival, seats, duration) =>
            `${departure.name} ${departure.time} → ${arrival.name} ${arrival.time}, ${duration} minutos.`,
        filteredDepartureList: (origin, destination, results, url,
            { day, timeFilterFrom, timeFilterTo, busTypeFilters, priceFilter, excludedFilters }) => {

            // Possible values for excludedFilters
            // []
            // ['busTypeFilters']
            // ['busTypeFilters', 'timeFilterTo']
            // ['busTypeFilters', 'timeFilterTo', 'timeFilterFrom']

            const optionsSize = results ? results.length : 0;
            const firstOptionSize = excludedFilters.length ? 0 : optionsSize;
            const dayText = dayString(day, dayStrings);
            const headerBegin = `De ${origin} para ${destination} ${dayText}, `;
            const headerEnd = `tenho ${firstOptionSize} opç${firstOptionSize === 1 ? 'ão' : 'ões'}`;
            const intervalFilterAfter = timeFilterFrom
                ? `depois das ${timeFilterFrom.format('HH:mm')}, `
                : '';
            const intervalFilter = timeFilterTo
                    ? `entre ${timeFilterFrom.format('HH:mm')} e ${timeFilterTo.format('HH:mm')}, `
                    : intervalFilterAfter;
            const busType = busTypeFilters
                ? `😴 ${busTypeFilters.join(' ou ')}, `
                : '';
            const priceSort = priceFilter
                ? `ordenadas por ${priceFilter.value.slice(0, -5)} preço, `
                : null;
            let header = headerBegin;
            switch (excludedFilters.length) {
            case 1:
            case 2:
                header = `${headerBegin}não achei nada. Mas ${intervalFilter}${priceSort} tenho ${optionsSize}`;
                break;
            case 3:
                header = `${headerBegin}não achei nada. Mas neste dia ${priceSort} tenho ${optionsSize}`;
                break;
            default:
                header = `${headerBegin}${intervalFilter}${busType}${priceSort}${headerEnd}`;
                break;
            }
            const body = `${results ? `:\n\n${results}` : '.'}`;
            const footer = `Para ver todas as opções desse dia acesse ${url}`;
            return { header, body, footer };
        },
        moreResultsTitle: () => 'Mais opções',
        moreResultsButton: () => 'Ver todas',
        detail: () => 'Escolher'
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
