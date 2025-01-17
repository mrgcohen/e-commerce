const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('../db/config');
require('dotenv').config();

module.exports = (app) => {
    
    // enable cross-origin resource sharing
    app.use(cors());

    // parse incoming json req
    app.use(bodyParser.json());

    // parse incoming url-encoded req
    app.use(bodyParser.urlencoded({ extended: true }));

    // helmet for added security on http headers
    app.use(helmet());

    // trust first proxy for session cookie secure
    app.set('trust proxy', 1);

    // enable session for persistent cart
    app.use(session ({
        store: new pgSession({
            pool: pool,
            tableName: 'session'
        }),
        secret: process.env.SESSION_SECRET, 
        resave: false, 
        saveUninitialized: true, 
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true
        }
    }));

}