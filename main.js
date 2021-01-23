//Scinbot by Scinorandex
var os = require("os");
const hostname = os.hostname();

const Discord = require('discord.js');
const client = new Discord.Client();

const { token } = require('./config/token.json');
const { hushlogin, prefix, infoChannel, colors } = require('./config/main.json');

var requireDir = require('require-dir');
var command = requireDir('./commands');
var helper = requireDir(`./commands/helpers`);

//Colors
const green = colors.green;
const red = colors.red;

function sendMsg(channel, rqer, color, title, text){
    channel.send(new Discord.MessageEmbed()
        .setColor(color)
        .addField(title, text)
        .setTimestamp()
        .setFooter(`Requested by: ${rqer} | Host: ${hostname}`)
    );
}

client.on('message', async message => {
    let msg = cmd = message.content;
    let args = "";
    if (msg.split(" ").length > 1){
        cmd = msg.substr(0, msg.indexOf(" "))
        args = msg.substr(msg.indexOf(" ") + 1);
    }

    if(cmd.substring(0, prefix.length) === prefix){
        //remove prefix at the start if present
        cmd = cmd.substring(prefix.length);
    }else{
        //else break out of the function
        return;
    }
    
    let channelID = message.channel.id;
    let channel = await client.channels.cache.get(channelID);
    let authorID = await message.author.id;
    let author = await message.author.username;
    let response;

    switch(cmd) {
        case `htop`:
            response = await command.htop();
        break;

        case `checklog`:
            response = await command.checklog(args);
        break;

        case 'mcsrvstat' :
            response = await command.mcsrvstat(args);
        break;

        case `hjt`:
            response = await command.checklog(args);
        break;

        case `bind`:
            response = await command.bind(args);
        break;

        case `mcstatus`:
            response = await command.mcstatus();
        break;

        case 'eco' :
            response = await command.economy(args, authorID);
        break;

        case `test`:
            response = await command.test(channelID, authorID, author, args);
        break;
        
        case `about`:
            response = await command.about(creator, bot);
        break;
        
        case `shutdown` :
            if(authorID == creator.id){
                console.log("Shutting Down");
                client.destroy();
            }
            return;
        break;

        default:
            return;
    }

    if(response === undefined){
        response = { "color": red, "title": "Unknown Error", "text": "Unknown internal error has occured."}
    }

    let { color, title, text } = response; 
    sendMsg(channel, author, color, title, text);

});

client.on('ready', async () => {
    if(!hushlogin){
        var channel = await client.channels.cache.get(infoChannel);
        channel.send(new Discord.MessageEmbed()
            .setColor(green)
            .addField("Start Success", "Successfully started on " + helper.getADate())
        ); 
    }

    client.user.setActivity(`you. My prefix is ${prefix}`, {
        type: "WATCHING",
        url: "https://scinorandex.xyz/"
    });
    
    creator = (await client.fetchApplication()).owner
    bot = await client.user

    console.log("Logged in to Discord");
    command.updateStock();
    setInterval(command.updateStock, 10 * 1000);
})

client.login(token);