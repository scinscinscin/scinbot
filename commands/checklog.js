var requireDir = require('require-dir');
var helper = requireDir('./helpers');
var fs = require('fs');

const { colors } = require('../config/main.json');
const green = colors.green;
const red = colors.red;

async function main(link){
    const detections = JSON.parse(fs.readFileSync('./config/detections.json', 'utf8'));

    //process link
    if (link.includes("https://pastebin.com")){
        if (link.charAt(link.length - 1) === '/'){
            link = link.substr(0, link.length - 1);
        }
        link="https://pastebin.com/raw/"+link.split('/').pop();
    }else if (link == "" || link == undefined){
        return({"color": red, "title": `An error has occured.`, "text": `Missing URL.`});
    }

    //curl the URL
    let contents = await helper.download(link)
    if (contents === "error"){
        return({"color": red, "title": `An error has occured.`, "text": `${link} is not reachable.`});
    }

    //process the contents if it's from ubuntu pastebin
    if(link.includes("https://paste.ubuntu.com")){
        contents=contents.substring(contents.indexOf('<div class="paste"><pre><span></span>') + 37);
        contents=contents.split('</pre></div>')[0]
    }

    let type;
    let message = "";
    //determine what type of log file it is and set allFlags accordingly
    if(contents.includes("Logfile of HiJackThis Fork by Alex Dragokas")){
        var allFlags = detections.hjt;
        type = { "logType": "Dragokas' HiJackThis log" }
    }else if(contents.includes("Logfile of Trend Micro HijackThis")){
        var allFlags = detections.hjt;
        type = { "logType": "Trend Micro HiJackThis Log" }
        message += "Ran with Trend Micro HijackThis, This bot is incompatible with this, Please do not rely on this bot for information with these types of logs!\n"
        message += "Use https://github.com/dragokas/hijackthis/raw/devel/binary/HiJackThis.exe for complete compatiblity. If you cannot do this then use Absol or Butterfly.\n\n"
    }else if(contents.includes("Hijackthis alternative for Unix using bash")){
        type = { "logType": "Unix HiJackThis Log" }
        return({"color": red, "title": `Not Implemented`, "text": `Unix HijackThis has not been implemented yet`});
    }else if(contents.includes("---- Minecraft Crash Report ----")){
        type = { "logType": "Minecraft Crash Report" }
        return({"color": red, "title": `Not Implemented`, "text": `Minecraft Crash Reports have not been implemented yet`});
    }else if(contents.includes("Time of this report")){
        type = { "logType": "DXDiag Report" }
        return({"color": red, "title": `Not Implemented`, "text": `DXDiag reports have not been implemented yet`});
    }else{
        type = { "logType": "Unknown log file type" }
        return({"color": red, "title": `Unknown log file type`, "text": `Unknown log file type`});
    }

    //start scanning the log
    for (i=0; i<allFlags.length; i++){
        let flags = allFlags[i].flags;
        let res = allFlags[i].res;
        let hasDetected = false;
        let flagsDetected = [];

        for (j=0; j<flags.length; j++){
            let flag = flags[j];
            if (contents.includes(flag)){
                hasDetected = true;
                flagsDetected.push(flag);
            }    
        }
        
        if(hasDetected){
            message += `${flagsDetected.join(", ")}:\n`
            message += `**${res}** \n\n`
        }
    }
    
    if (message === ""){
        message += "**:green_square: No detections found.**"
    }
    
    return({"color": green, "title": `Done scanning ${link} - ${type.logType}`, "text": `${message}`});
}

module.exports = main;