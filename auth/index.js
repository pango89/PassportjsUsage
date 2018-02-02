'use strict';

const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const BearerStrategy = require('passport-http-bearer').Strategy;
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
const db = require('../db');

function verifyClient(clientId, clientSecret, done){
    db.clients.findByClientId(clientId, function(error, client){
        if(error){
            return done(error);
        }
        if(!client){
            return done(null, false);
        }
        if(client.clientSecret !== clientSecret){
            return done(null, false);
        }
        return done(null, client);
    });
}

passport.use(new BasicStrategy(verifyClient));
passport.use(new ClientPasswordStrategy(verifyClient));

passport.use(new BearerStrategy(function(accessToken, done){
    db.accessTokens.find(accessToken, function(error, token){
        if(error){
            return done(error);
        }
        if(!accessToken){
            return done(null, false);
        }
        if(accessToken.userId){
            db.users.findByUserId(token.userid, function(error, user){
                if(error){
                    return done(error);
                }
                if(!user){
                    return done(null, false, { message: 'Unknown user' });
                }
                var info = { scope: '*' }
                done(null, user, info);
            })
        }
    });
}));