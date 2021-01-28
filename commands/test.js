const fs = require('fs');
const commit = fs.readFileSync(`gitCommit`, {encoding:'utf8', flag:'r'});
const { colors } = require('../config/main.json');
const green = colors.green;

function test(channelID, authorID, author, args){
    message =  "**";
    message += "Info: \n";
    message += `Commit Hash: ${commit}`;
    message += `Author: ${author} \n`;
    message += `Author ID: ${authorID} \n`;
    message += `Channel ID: ${channelID} \n`;
    message += `Arguments: ${args} \n`;
    message +=" **";
    return({"color": green, "title": "Test Successful", "text": message});
}

module.exports = test;