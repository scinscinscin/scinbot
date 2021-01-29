const { colors } = require('../config/main.json');
const green = colors.green;

async function ping(message){
    let messageSent = message.createdTimestamp;
    let currentTime = Math.floor(Date.now());
    let ping = (messageSent - currentTime) * -1;
    
    return({"color": green, "title": `Ping`, "text": `${ping}ms`});
}

module.exports = ping;