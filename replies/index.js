import { dayString } from '../src/stringHelpers';

const dayStrings = {
    today: 'hoje',
    tomorrow: 'amanhã',
    dayAfterTomorrow: 'depois de amanhã'
};

/* eslint-disable max-len */
const replies = {
    // ## Commands
    version: v => `v${v}`,
    help: 'Tente consultar um horário de ônibus, por exemplo: horários de São Paulo para Rio de Janeiro',
    start: 'AVISO: Você está conversando com uma versão de desenvolvimento do bot "calamarcopollo" e qualquer frase que você digitar pode ficar publicamente logada na web. Portanto não digite nada privado para este bot. DICA: sempre que quiser recomeçar a interação do zero, digite /restart',
    restart: 'OK, vamos recomeçar do zero.',
    insult: 'Eu sou um robô e meu trabalho é servir, faço o possível mas nem sempre acerto… pode extravazar seu descontentamento em mim, eu mereço.',
    // ## Interactions
    greeting: {
        noUsername: 'Oi, em que posso ajudar?',
        username: username => `Olá ${username}, em que posso ajudar?`
    },
    close: '👍',
    // ## Trip
    trip: {
        noPlaces: 'Certo… preciso saber da origem e do destino',
        noDestination: 'E qual o destino?',
        noOrigin: 'Saindo de onde?',
        apiError: 'Estou tendo problemas para acessar a base de viagens. Por favor tente mais tarde, ou entre em contato com o suporte.',
        noTrips: (origin, destination) =>
            `Não consegui encontrar viagens de ${origin} para ${destination}`,
        departureList: (origin, destination, day, optionsSize) =>
            `De ${origin} para ${destination} ${dayString(day, dayStrings)} tenho ${optionsSize} opções:`
    }
};
/* eslint-enable max-len */

export {
    replies,
    dayStrings
};
