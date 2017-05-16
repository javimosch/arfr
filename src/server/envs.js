module.exports = {
    
    FILE_LOGGING_LEVEL:process.env.FILE_LOGGING_LEVEL || "DEBUG",
    
    DB_URI: process.env.dbURI,

    SOCKETS_PORT: 8081,

    SSH_HOST: process.env.SSH_HOST || '62.210.97.81',
    SSH_USER: process.env.SSH_USER || 'root',
    SSH_PWD: process.env.SSH_PWD,

    GITLAB_API_KEY: process.env.GITLAB_API_KEY,

    PROD: process.env.PROD && process.env.PROD.toString() == '1' || false,
    PORT: process.env.PORT || 3000,

    serverURL: process.env.serverURL || 'https://www.diagnostical.fr',
    isMailingDisabled: process.env.disableMailing === '1',

    MAILGUN_DOMAIN: process.env.MAILGUN_DOMAIN || 'diagnostical.fr',
    MAILGUN_API_KEY: process.env.MAILGUN_API_KEY || 'key-537daa84b8e3ea8797c895c8b5725ee0',

    ERROR: {
        DATABASE_ISSUE: "Database Issue (Code:200)"
    },

    DEBUG_PDF_GENERATION: process.env.DEBUG_PDF_GENERATION && process.env.DEBUG_PDF_GENERATION.toString() == '1' || false,
};
