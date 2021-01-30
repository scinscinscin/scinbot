// The hypixel api is so unbearable to work with
// that it's damn near impossible to get information
// out of, especially about the minigames
// hence why i'm currently only reporting general
// info about the user. I need to dwell on how
// i'm going to parse the data cleanly.

var requireDir = require('require-dir');
var helper = requireDir(`./helpers`);

const { hypixelToken } = require('../config/token.json');
const { colors } = require('../config/main.json');
const green = colors.green;
const red = colors.red;

async function main(args){
    let arguments = args.split(" ");
    let response = await helper.download(`https://api.hypixel.net/player?key=${hypixelToken}&name=${arguments[0]}`);

    if (response === "error"){
        return({"color": red, "title": "Failed to get info", "text": `The Hypixel API is unreachable`});
    }else if (response.player === null){
        return({"color": red, "title": "Not a player", "text": `${arguments[0]} cannot be found in the API. Check the spelling`});
    }

    let player = response.player;
    let message = "**";

    if (arguments.length === 1){
        //general info about the user
        message += `Display Name: ${player.displayname}\n`;
        message += `Hypixel ID: ${player["_id"]}\n`;
        message += `UUID: ${player.uuid}\n`;
        message += `Aliases: ${player.knownAliases.join(", ")}\n`
        message += `First Login: ${(new Date(player.firstLogin)).toLocaleString()}\n`;
        message += `Latest Login: ${(new Date(player.lastLogin)).toLocaleString()}\n`;
        message += `Latest Logout: ${(new Date(player.lastLogout)).toLocaleString()}\n`;
        message += `Experience: ${player.networkExp}\n`;
        message += `Most Recent Game Type: ${player.mostRecentGameType}`;
        message += "**";

        return({"color": green, "title": `General Info for ${arguments[0]}`, "text": `${message}`});
    }

    if (arguments.length > 1){
        return({"color": green, "title": `Too much information`, "text": `**This command only takes the username for it's parameter.**`});
    }
}

module.exports = main;