var fs = require('fs');

const { colors } = require('../config/main.json');
const green = colors.green;
const red = colors.red;

function bind(args){
    const binds = JSON.parse(fs.readFileSync('./config/binds.json', 'utf8'));
    let keys = Object.keys(binds);
    let message = "";

    if(args === "list"){
        for (i=0; i<keys.length; i++){
            message += `**${keys[i]}**\n`
        }
        return({"color": green, "title": `List of Binds`, "text": `${message}`})
    }else if(!keys.includes(args)){
        return({"color": red, "title": `Bind not found`, "text": `The bind "${args}" was not found`})
    }

    let paste = binds[args];
    message += paste;
    
    return({"color": green, "title": `${args}`, "text": `${message}`});
}

module.exports = bind;