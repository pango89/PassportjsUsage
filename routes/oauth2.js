'use strict';

const oauth2orize = require('oauth2orize');
const login = require('connect-ensure-login');
const passport = require('passport');
const db = require('../db');
const utils = require('../utils');

// Create OAuth 2.0 server
const server = oauth2orize.createServer();

server.serializeClient(function(client, done) {
    return done(null, client.id);
});

server.deserializeClient(function(id, done) {
        db.clients.findById(id, function(err, client) {
        if(err){ return done(err); }
        return done(null, client);
    });
});

server.grant(oauth2orize.grant.token(function(client, user, ares, done){
    const token = utils.getUid(256);
    db.accessTokens.save(token, user.id, client.clientId, function(error){
        if(error){
            return done(error);
        }
        return done(null, token);
    });
}));

server.exchange(oauth2orize.exchange.password(function(client, username, password, scope, done){
    // Validate the client
    db.clients.findById(client.clientId, function(error, localClient){
        if(error){
            return done(error);
        }
        if(!localClient){
            return done(null, false);
        }
        if(localClient.clientSecret !== client.clientSecret){ 
            return done(null, false);
        }

        // Validate the user
        db.users.findByUsername(username, function(error, user){
            if(error){
                return done(error);
            }
            if(!user){
                return done(null, false);
            }
            if(password !== user.password){
                return done(null, false);
            }

            // Everything validated, return the token
            const token = utils.getUid(256);
            db.accessTokens.save(token, user.id, client.clientId, function(error){
                if (error){
                    return done(error);
                }
                return done(null, token);
            });
        });
    });
}));

module.exports.authorization = [
    login.ensureLoggedIn(),
    server.authorize(function(clientId, redirectUri, done){
        db.clients.findByClientId(clientId, function(error, client){
            if(error){
                return done(error);
            }
            if(!client){
                return done(null, false);
            }
            if (client.redirectUri != redirectUri){
                return done(null, false);
            }
            return done(null, client, client.redirectUri);
        });
    }),
    function(request, response){
        response.render('dialog', { transactionId: req.oauth2.transactionId, user: request.user, client: request.oauth2.client });
    }
];

exports.token = [
    passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
    server.token(),
    server.errorHandler()
];