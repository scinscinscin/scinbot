var xml2js = require('xml2js');
var requireDir = require('require-dir');
var helper = requireDir(`./helpers`);

var dates = {
    convert:function(d) {
        // Converts the date in d to a date-object. The input can be:
        //   a date object: returned without modification
        //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
        //   a number     : Interpreted as number of milliseconds
        //                  since 1 Jan 1970 (a timestamp) 
        //   a string     : Any format supported by the javascript engine, like
        //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
        //  an object     : Interpreted as an object with year, month and date
        //                  attributes.  **NOTE** month is 0-11.
        return (
            d.constructor === Date ? d :
            d.constructor === Array ? new Date(d[0],d[1],d[2]) :
            d.constructor === Number ? new Date(d) :
            d.constructor === String ? new Date(d) :
            typeof d === "object" ? new Date(d.year,d.month,d.date) :
            NaN
        );
    },
    compare:function(a,b) {
        // Compare two dates (could be of any type supported by the convert
        // function above) and returns:
        //  -1 : if a < b
        //   0 : if a = b
        //   1 : if a > b
        // NaN : if a or b is an illegal date
        // NOTE: The code inside isFinite does an assignment (=).
        return (
            isFinite(a=this.convert(a).valueOf()) &&
            isFinite(b=this.convert(b).valueOf()) ?
            (a>b)-(a<b) :
            NaN
        );
    }
}

const { colors , prefix} = require('../config/main.json');
const green = colors.green;
const red = colors.red;

async function mcjar(args){
    args = args.split(" ")
    let jarType = args.shift();
    let version = args[0];
    
    let response;

    switch(jarType){
        case 'vanilla_client':
            response = vanilla(version, "client");
        break;

        case 'vanilla_server':
            response = vanilla(version, "server");
        break;
        
        case 'fabric':
            response = fabric(version);
        break;
        
        case 'spigot':
            response = bukkitSpigot(version, "spigot");
        break;
        
        case 'bukkit':
            response = bukkitSpigot(version, "bukkit");
        break;
        
        case 'paper':
            response = paper(version);
        break;
        
        case 'tuinity':
            response = {"color": green, "title": `Tuinity`, "text": `https://ci.codemc.io/job/Spottedleaf/job/Tuinity/lastSuccessfulBuild/artifact/tuinity-paperclip.jar`};
        break;
        
        case 'forge':
            response = forge(version);
        break;
        
        case 'spongevanilla':
            response = {"color": green, "title": `SpongeVanilla`, "text": `**This might be outdated**\n\nhttps://repo.spongepowered.org/maven/org/spongepowered/spongevanilla/1.12.2-7.3.1-RC391/spongevanilla-1.12.2-7.3.1-RC391.jar`};
        break;
        
        case 'mohist':
            response = mohist(version);
        break;
        
        case 'magma':
            response = {"color": green, "title": `Magma`, "text": `https://ci.hexeption.dev/job/Magma%20Foundation/job/Magma/job/master/lastSuccessfulBuild/artifact/*zip*/archive.zip`};
        break;

        default:
            response = help();
    }
    
    return(response);
}


async function vanilla(version, type){
    let versionsList = await helper.download("https://launchermeta.mojang.com/mc/game/version_manifest.json");
    let downloadLink;

    for (i=0; i < versionsList.versions.length; i++){
        let workingObject = versionsList.versions[i];
        if(workingObject.id === version){
            downloadLink = workingObject.url;
        }
    }
    
    if (downloadLink === undefined){
        return({"color": red, "title": "Not a minecraft version", "text": `${version} cannot be found as a vanilla version`});
    }

    let versionJSON = await helper.download(downloadLink);
    return({"color": green, "title": `${version}`, "text": `${versionJSON["downloads"][type]["url"]}`});
}

async function fabric(version){
    let versionsList = await helper.download("https://launchermeta.mojang.com/mc/game/version_manifest.json");
    let releaseTime;

    for (i=0; i < versionsList.versions.length; i++){
        let workingObject = versionsList.versions[i];
        if(workingObject.id === version){
            releaseTime = workingObject.time;
        }
    }
    
    if (releaseTime === undefined){
        return({"color": red, "title": "Not a minecraft version", "text": `${version} cannot be found as a vanilla version`});
    }

    let fabricCompatible = dates.compare(releaseTime, "2019-08-22T12:46:36+00:00");
    if (fabricCompatible === 1 || version === "18w43b"){

        //Download and convert XML to JSON
        let latestBuildXML = await helper.download("https://maven.fabricmc.net/net/fabricmc/fabric-installer/maven-metadata.xml");
        let latestBuildJSON;
        xml2js.parseString(latestBuildXML, (err, result) => {
            if(err) {
                console.log("Failed to convert XML to JSON");
            }

            latestBuildJSON = result;
        });

        let latestBuild = latestBuildJSON.metadata.versioning[0].latest[0];
        let latestBuildLink = `https://maven.fabricmc.net/net/fabricmc/fabric-installer/${latestBuild}/fabric-installer-${latestBuild}.jar`;

        let message = "**";
        message += "Download the latest version of the fabric installer from: \n";
        message += `${latestBuildLink} \n\n`;
        message += "Install it using the following command for a client: \n";
        message += "**";
        message += "```java -jar ./fabric-installer-" + latestBuild + ".jar client -mcversion \"" + version + "\"\n```";
        message += "**";
        message += "Install it using the following command for a server: \n";
        message += "**"
        message += "```java -jar ./fabric-installer-" + latestBuild + ".jar server -mcversion \"" + version + "\" -downloadMinecraft```";

        return({"color": green, "title": `${version}`, "text": `${message}` });
    }else{
        return({"color": red, "title": "Not compatible with fabric", "text": `${version} is not compatible with fabric`});
    }
}

async function forge(version){
    let promotions = await helper.download("https://files.minecraftforge.net/maven/net/minecraftforge/forge/promotions_slim.json");
    let promotionKey = `${version}-latest`;
    let build = promotions["promos"][promotionKey];

    if (build === undefined){
        return({"color": red, "title": "Not a forge version", "text": `Cannot find a forge build for ${version}`});
    }
    
    let downloadLink = `https://files.minecraftforge.net/maven/net/minecraftforge/forge/${version}-${build}/forge-${version}-${build}-installer.jar`
    return({"color": green, "title": `${version}`, "text": `${downloadLink}` });
}

async function bukkitSpigot(version, type){
    let download = await helper.download(`https://hub.spigotmc.org/versions/${version}.json`)
    if (download === "error"){
        return({"color": red, "title": "Not a spigot version", "text": `Either it isn't a version number, or it is unsupported by BuildTools`});
    }else{
        let message = "**";
        message += "Download the latest version of BuildTools from: \n";
        message += "https://hub.spigotmc.org/jenkins/job/BuildTools/lastSuccessfulBuild/artifact/target/BuildTools.jar\n";
        message += "**";

        if (type === "bukkit"){
            message += "```java -jar BuildTools.jar --compile craftbukkit --rev \"" + version + "\"```\n";
        }else if (type === "spigot"){
            message += "```java -jar BuildTools.jar --rev \"" + version + "\"```\n";
        }

        return({"color": green, "title": `${version}`, "text": `${message}`});
    }
}

async function paper(version){
    let paperJSON = await helper.download('https://papermc.io/api/v2/projects/paper/');
    let supportedVersions = paperJSON.versions;

    if (!supportedVersions.includes(version)){
        return({"color": red, "title": "Not a paper version", "text": `Either it isn't a version number, or it is unsupported by Paper`});
    }
    
    let buildsJSON = await helper.download(`https://papermc.io/api/v2/projects/paper/versions/${version}`);
    let latestBuild = buildsJSON.builds[buildsJSON.builds.length - 1];
    let buildNameJSON = await helper.download(`https://papermc.io/api/v2/projects/paper/versions/${version}/builds/${latestBuild}/`);
    let buildName = buildNameJSON.downloads.application.name;
    let downloadLink = `https://papermc.io/api/v2/projects/paper/versions/${version}/builds/${latestBuild}/downloads/${buildName}`;

    return({"color": green, "title": `${version}-${latestBuild}`, "text": `${downloadLink}`});
}

async function mohist(version){
    let status = await helper.download(`https://ci.codemc.io/job/Mohist-Community/job/Mohist-${version}/`);
    if (status === "error"){
        return({"color": red, "title": "Not a Mohist version", "text": `Either it isn't a version number, or it is unsupported by Mohist`});
    }
    
    let downloadLink = `https://ci.codemc.io/job/Mohist-Community/job/Mohist-${version}/lastSuccessfulBuild/artifact/*zip*/archive.zip`
    return({"color": green, "title": `${version}`, "text": `${downloadLink}`});
}

function help(){
    let message = "**";
    message += "Usage:\n**";
    message += "```" + prefix + "mcjar [server-software]```\n";
    message += "**Supported server software: **\n";
    message += "``vanilla_client, vanilla_server, fabric, spigot, bukkit, paper, tuinity, forge, spongevanilla, mohist, magma``";

    return({"color": green, "title": `Help Message`, "text": `${message}`});
}

module.exports = mcjar;