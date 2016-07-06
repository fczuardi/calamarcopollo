const defaultMenuCTA = [
    {
        type: 'postback',
        title: 'Ajuda',
        payload: '/help'
    },
    {
        type: 'postback',
        title: 'Recomeçar',
        payload: '/restart'
    },
    {
        type: 'postback',
        title: 'Sobre',
        payload: '/version'
    },
    {
        type: 'web_url',
        title: 'Reportar um Problema',
        url: 'https://github.com/calamar-io/calamarcopollo/issues/new'
    }
];


const customMenuPath = process.env.CUSTOM_MENU_PATH || './custom';
const customMenu = require(customMenuPath);
const menu = customMenu || defaultMenuCTA;

export { menu };
