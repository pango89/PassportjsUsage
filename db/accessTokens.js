'use strict';
const tokens = {};

module.exports.find = function(key, done){
    if (tokens[key]){
        return done(null, tokens[key]);
    }
    return done(new Error('Token Not Found'));
};

module.exports.findByUserIdAndClientId = function(userId, clientId, done){
    for (let token of tokens){
        if (tokens[token].userId === userId && tokens[token].clientId === clientId){
             return done(null, token);
      }
    }
    return done(new Error('Token Not Found'));
};

module.exports.save = function(token, userId, clientId, done){
    tokens[token] = { userId, clientId };
    done();
};