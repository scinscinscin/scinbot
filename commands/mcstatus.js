var requireDir = require('require-dir');
var helper = requireDir('./helpers');

const { colors } = require('../config/main.json');
const green = colors.green;
const red = colors.red;

async function mcstatus(){
    let rawJson = await helper.download("https://status.mojang.com/check");
    const otherServices = ["piston-meta.mojang.com", "auth.xboxlive.com"];
    if (rawJson === "error"){
        return({"color": red, "title": `An error has occured.`, "text": `https://status.mojang.com/check is not reachable.`});
    }

    let message = '**';

    for (i=0; i<rawJson.length; i++){
        let workingObject = rawJson[i];
        let service = Object.keys(workingObject);
        
        let serviceStatus;
        if (service[0] === 'session.minecraft.net'){
            let HTTPCode = await helper.getHTTPCode(`http://${service[0]}`);
            if (HTTPCode !== "error"){
                serviceStatus = true;
            }
        }else{
            serviceStatus = await helper.pingDomain(service[0]);
        }

        if(serviceStatus){
            message += `:green_square: ${service[0]} \n`
        }else{
            message += `:red_square: ${service[0]} \n`
        }
    }
    
    for (j=0; j<otherServices.length; j++){
        let workingSite = otherServices[j];
        let serviceStatus = await helper.pingDomain(workingSite);
        if(serviceStatus){
            message += `:green_square: ${workingSite} \n`
        }else{
            message += `:red_square: ${workingSite} \n`
        }
    }
    
    message += "**";
    return({"color": green, "title": "MCServices Check", "text": message});
}

module.exports = mcstatus;