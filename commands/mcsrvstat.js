var requireDir = require('require-dir');
var helper = requireDir(`./helpers`);

const { colors } = require('../config/main.json');
const green = colors.green;
const red = colors.red;

async function mcsrvstat(mcserver){
    mcserver = mcserver.replaceAll(" ", "");
    
    let status = await helper.download(`https://api.mcsrvstat.us/2/${mcserver}`)
    
    if (status === "error"){
        return({"color": red, "title": "An error has occured", "text": "MCSrvStat was unreachable"});
    }

    if (status.ip === ""){
        return({"color": green, "title": "Failed to get info", "text": `${mcserver} is unreachable by the MCSrvStat API`});
    }else if(!Object.keys(status).includes("players")){
        return({"color": green, "title": "Failed to get info", "text": `${mcserver} is not a Minecraft server`});
    }

    let IPPort = `${status.ip}:${status.port}`
    let hostname = `${status.hostname}`
    let version = `${status.version}`
    let playerCount = `[${status.players.online}/${status.players.max}]`
    let motd = `${status.motd.clean}`
    
    let message = "**";
    message += `IP and Port: ${IPPort}\n`;
    message += `Hostname: ${hostname}\n`;
    message += `Versions: ${version}\n`;
    message += `Players: ${playerCount}\n`;
    message += `MOTD: ${motd}\n`;
    message += `**`;

    return({"color": green, "title": `MCSrvStat for ${mcserver}`, "text": `${message}`});
}

module.exports = mcsrvstat;