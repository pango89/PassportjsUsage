'use strict';

const clients = [
    { id: '1', name: 'Samplr', clientId: 'abc123', clientSecret: 'ssh-secret', isTrusted: true },
    { id: '2', name: 'Samplr2', clientId: 'xyz123', clientSecret: 'ssh-password', isTrusted: true },
];

module.exports.findByClientId = function(clientId, done){
    for (var index = 0; index < clients.length; index++) {
        if(clients[index].clientId === clientId){
            return done(null, clients[index]);
        }        
    }
    return done(new Error('Client Not Found'));
};

module.exports.findById = function(id, done){
    for (var index = 0; index < clients.length; index++) {
        if(clients[index].id === id){
            return done(null, clients[index]);
        }        
    }
    return done(new Error('Client Not Found'));
};