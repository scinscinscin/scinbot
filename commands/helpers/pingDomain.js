var ping = require('ping');

function pingMachine(domain){
    var promise = new Promise(function(resolve) {
        ping.sys.probe(domain, function(isAlive){
            resolve(isAlive)
        });
    });
    return promise;
}

module.exports = pingMachine;