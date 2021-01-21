const { colors } = require('../config/main.json');
const green = colors.green;

function about(creator, bot){
    message =  "**";
    message += "Info: \n";
    message += `This is a Discord bot I made for shits and giggles \n`
    message += `Creator: ${creator.username}#${creator.discriminator} \n`;
    message += `Creator ID: ${creator.id} \n`;
    message += `Bot: ${bot.username}#${bot.discriminator} \n`;
    message += `Bot ID: ${bot.id} \n`;
    message +=" **";
    return({"color": green, "title": `About ${bot.username}`, "text": message});
}

module.exports = about;