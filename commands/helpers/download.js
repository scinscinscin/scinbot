var axios = require('axios');

function download(link){
    var promise = new Promise(function(resolve, reject) {
        axios({
            method: 'get',
            url: link
        }).then((res) => {
            resolve(res.data);
        }, (error) => {
            //console.log(error)
            resolve("error")
        });
    });
    return promise;
}

module.exports = download;