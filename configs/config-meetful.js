module.exports = {
    title: "Meeatful",
    firebaseURL: 'meeatful',
    serviceAccount: 'meeatful-firebase-adminsdk-sgkyv-9c21097936.json',
    databaseURL: 'https://meeatful.firebaseio.com/',
    signalName: 'live-sync',
    CSS: [
        "https://fonts.googleapis.com/css?family=Nothing+You+Could+Do",
        "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css",
        "https://cdn.rawgit.com/indrimuska/angular-moment-picker/master/dist/angular-moment-picker.min.css"
    ],
    CDN_HEAD: [
        "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.1/angular.js",
    ],
    CDN: [
        "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js",
        'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/angular.js/1.6.1/angular-route.min.js',
    ],
    CDN_APP: [
        'https://cdnjs.cloudflare.com/ajax/libs/angular-ui-bootstrap/2.5.0/ui-bootstrap-tpls.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.10.6/moment-with-locales.js',
        'https://cdn.rawgit.com/indrimuska/angular-moment-picker/master/dist/angular-moment-picker.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.4/lodash.min.js',
        'https://maps.googleapis.com/maps/api/js?libraries=places'
        //&amp;key=AIzaSyB8riHvf4BwR7qOmAARsB3XRcRfueneUOs
    ],
    staticFolder: {
        "sobre-nosotros": {
            languages: ['es']
        },
        "how-it-works": {
            languages: ['en']
        },
        "about-us": {
            languages: ['en']
        }
    },
    i18n_config: {
        languages: ['en', 'es'],
        default: 'es',
    },
    i18n: {
        NAV_ABOUT_US: {
            en: 'About Us',
            es: 'Sobre Nosotros'
        },
        NAV_HOW_IT_WORKS: {
            en: "How it works",
            es: "Como funciona"
        },
        NAV_CREATE_EVENT: {
            en: "Create an event",
            es: "Crea un evento"
        },
        NAV_EXPLORE: {
            en: "Explore events",
            es: "Explorar eventos"
        },
        NAV_GET_IN_TOUCH: {
            en: "Get in touch",
            es: "Contactanos"
        },
        NAV_SIGN_IN: {
            en: "Sign In",
            es: "Ingresar"
        },
        NAV_PROFILE: {
            en: "Profile",
            es: "Perfil"
        },
        NAV_DASHBOARD: {
            en: "My events",
            es: "Mis eventos"
        },
        NAV_HOME: {
            en: "Home",
            es: "Inicio"
        },
        ROUTE_HOME: {
            en: "home",
            es: "inicio"
        },
        ROUTE_EXPLORE: {
            en: "explore-events",
            es: "explorar-eventos"
        },
        ROUTE_ABOUT_US: {
            en: 'about-us',
            es: 'sobre-nosotros'
        },
        ROUTE_HOW_IT_WORKS: {
            en: 'how-it-works',
            es: 'como-funciona'
        },
        ROUTE_GET_IN_TOUCH: {
            en: 'get-in-touch',
            es: "contactanos"
        },
        ROUTE_SIGN_UP: {
            en: 'sign-up',
            es: 'registrase'
        },
        ROUTE_DASHBOARD: {
            en: 'my-events',
            es: 'mis-eventos'
        },
        ROUTE_PROFILE: {
            en: 'profile',
            es: 'perfil'
        },
        ROUTE_SIGN_IN: {
            en: 'sign-in',
            es: 'ingresar'
        },
        ROUTE_CREATE_EVENT: {
            en: 'event',
            es: 'evento'
        },
        ROUTE_EDIT_EVENT: {
            en: 'event',
            es: 'evento'
        },
        ROUTE_SUBSCRIBE: {
            en: "subscribe",
            es: "suscribete"
        },
        HTML_SUBSCRIBE_TEXT: {
            en: 'Nos gustaria mantenerte informado sobre el lanzamiento de la plataforma. No dudes en anotarte, prometemos no dejarte spam.',
            es: 'Nos gustaria mantenerte informado sobre el lanzamiento de la plataforma. No dudes en anotarte, prometemos no dejarte spam.'
        },
        TEXT_DATE: {
            en: "Date",
            es: "Fecha"
        },
        TEXT_ADDRESS: {
            en: "Address",
            es: "Direccion"
        },
        TEXT_STATUS: {
            en: "Status",
            es: "Estado"
        },
        TEXT_LISTVIEW_LABEL_EVENT_NAME: {
            en: "Event name",
            es: "Nombre del evento"
        },
        TEXT_LISTVIEW_LABEL_EVENT_SHORT_DESCRIPTION: {
            en: "Brief description",
            es: "Pequeña descripcion"
        },
        TEXT_DESCRIPTION: {
            en: "Description",
            es: "Descripcion"
        },
        TEXT_LISTVIEW_LABEL_CREATOR: {
            en: "Creator",
            es: "Creador"
        },
        TEXT_LISTVIEW_LABEL_EVENT_CREATED_AT: {
            en: "Creation date",
            es: "Fecha de creacion"
        },
        TEXT_COMPLETE_PROFILE: {
            en: "Please, take time to complete your profile :)",
            es: "Completa tu perfil cuando puedas :)"
        },
        TEXT_VALIDATE_CREDENTIALS: {
            en: "You forgot your credentials ? :)",
            es: "Olvidaste tu password ? :)"
        },
        TEXT_ACCEPT: {
            en: "Accept",
            es: "Aceptar"
        },
        TEXT_SEND: {
            en: "Send",
            es: "Enviar"
        },
        TEXT_CLOSED: {
            en: "Closed",
            es: "Cerrado"
        },
        TEXT_ACTION_CLOSE: {
            en: "Close",
            es: "Cerrar"
        },
        TEXT_LABEL_EVENT_OWNER: {
            en: "Created by",
            es: "Creado por"
        },
        TEXT_ACTION_JOIN_EVENT: {
            en: "Join!",
            es: "Unirse!"
        },
        TEXT_ACTION_OPEN: {
            en: "Open",
            es: "Abrir"
        },
        TEXT_OPEN: {
            en: "Open",
            es: "Abierto"
        },
        TEXT_CREATE: {
            en: "Create",
            es: "Nuevo"
        },
        TEXT_SAVE: {
            en: "Save",
            es: "Guardar"
        },
        TEXT_SUBSCRIBE: {
            en: "Subscribe",
            es: "Suscríbete"
        },
        TEXT_SUBSCRIBE_SUCCESS: {
            en: "Thanks for subscribe, you will receive info when we finish to cook the site",
            es: "Gracias por suscribirte, recibiras mas informacion apenas terminemos de cocinar el sitio"
        },
        TEXT_SIGN_IN: {
            en: 'Sign In',
            es: "Ingresar"
        },
        TEXT_CREATE_ACCOUNT: {
            en: "Create a new account",
            es: "Crea una cuenta nueva"
        },
        TEXT_SIGN_UP: {
            en: 'Sign Up',
            es: "Registrarse"
        },
        TEXT_PROFILE: {
            en: "Profile",
            es: "Perfil"
        },
        TEXT_SIGN_UP_FORM_BOTTOM_1: {
            en: 'Already registered?,',
            es: 'Ya tenes una cuenta?, '
        },
        TEXT_REFRESH: {
            en: "Refresh",
            es: "Refrescar"
        },
        TEXT_FOLLOW_US_IN: {
            en: "Follow us in",
            es: "Siguenos en"
        },
        VALIDATE_EMAIL_IN_USE: {
            en: 'Email already registered',
            es: "Email ya registrado"
        },
        VALIDATE_PERSONAL_ID: {
            en: "Personal ID already registered",
            es: "ID Personal ya registrado"
        }
    }
};
