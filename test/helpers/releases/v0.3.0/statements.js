// Calamarcopollo example Statements
// =================================
//
// version-here
// --------
//
// Below is a list of sample messages that can be used with this version
// of the bot, this is a non-exaustive list since the bot uses a natural language
// interpreter and can learn to answer to similar phrasings.
//
// ### Commands
//
// There are some explicit commands that you can pass to the bot by using the
// format ```/command```, you can also call those commands with natural language:
const cmd = {
    // Telegram's default start command
    start: [
        '/start'
    ],
    // Ask the bot to tell you what version of this codebase it is using
    version: [
        '/version'
    ],
    // Messages to get a usage hint
    help: [
        '/help',
        'ajuda',
        'como usa isso?',
        'o que vc sabe fazer?',
        'como funciona?'
    ],
    // Messages to manually reset the chat session and restart with a blank context
    restart: [
        '/restart',
        'de novo',
        '/reset',
        'esquece tudo'
    ]
};

// ### Interactions
//
// Statements that are not commands and do not provide any data useful for
// context, just chat.
const interaction = {
    // Conversation starters
    greeting: [
        'Olá',
        'Oi',
        'Bom dia bot'
    ],
    // End of an interaction
    close: [
        'Obrigado.',
        'Tchau.',
        'Valeu bot!'
    ]
};

// ### Trip Info intent and dialogs
//
// Statements that provides information about what trip the user is looking
// for: such as origin city, destination, departure day and time
const trips = {
    // Statements containing only the trip info intent but no data
    info: [
        'Horários de ônibus',
        'Passagem',
        'Preciso viajar',
        'Quero viajar.',
        'Viagem',
        'Você sabe horarios de ônibus?'
    ],
    // Some ways of informing the destination
    infoDest: [
        'bora pro rio',
        'Horários de ônibus para ubatuba',
        'para jahu',
        'Partiu sampa?',
        'Passagem pra Atiabia tem?',
        'Preciso viajar com destino a marília, sp',
        'Quero viajar para santos.',
        'vamos para guarulhos'
    ],
    // Some example of accepted ways of phrasing the origin city
    infoOrigin: [
        'de osasco',
        'Estou em Itatiba, quero uma passagem',
        'Horários de ônibus a partir de são carlos',
        'Origem sampa',
        'partindo de ribeirao preto, o que tem?',
        'passagens do rio',
        'Preciso viajar saindo de rio de janeiro, rj',
        'Quero viajar saindo de santos.'
    ],
    // Expressions with both origin and destination
    infoOriginDest: [
        'bora para santos saindo de são paulo?',
        'from campinas to rio de janeiro',
        'from campinas to rio de janeiro, rj',
        'horários de São Paulo para Rio de Janeiro',
        'passagem de Santos, SP para Rio de Janeiro, RJ',
        'quais opções tenho eu para ir de brasilha à guarulos?',
        'quero ribeirao, sanca',
        'sampa > santos'
    ],
    // Expressions with origin, destination and time filter
    infoOriginDestTime: [
        'quero ir de ribeirao preto para o rio de janeiro em janeiro',
        'quero ir de são paulo à santos, sp depois de amanhã as 10 da noite',
        'quero ir de são paulo à santos, sp depois de amanhã as 10',
        'quero ir de são paulo à santos, sp depois de amanhã',
        'sampa santos amanhã',
        'sanca > santos dia 25 de maio',
        'veja pra mim por favor os horarios de sao carlos para campinas na noite de natal'
    ],
    failingInfoOriginDestTime: [
        'rio de janeiro até são paulo dia 25 de maio depois das 18'
    ]
};

export {
    cmd,
    interaction,
    trips
};
