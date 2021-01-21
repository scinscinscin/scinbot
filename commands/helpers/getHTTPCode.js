var http = require("http");

function getHTTPCode(domain){
    var promise = new Promise(function(resolve) {
        var req = http.get(domain, function(res){
            resolve(res.statusCode)
        });
        req.on('error', function(err){
            resolve("error");
        });
        req.end();
    });
    return promise;
}

module.exports = getHTTPCode;