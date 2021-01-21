let os = require('os');
let osutils = require('node-os-utils');
let cdd = require('check-disk-space');
var requireDir = require('require-dir');
var helper = requireDir('./helpers');

const { drives, colors } = require('../config/main.json');
const green = colors.green;
const red = colors.red

async function htop(){
    let title = "System Status for " + helper.getADate();
    let message = "";

    function mbtogb(mb){
        let gb = mb/1000;
        return (gb.toFixed(2));
    }

    let loadAvg = os.loadavg();
    let { totalMemMb, usedMemMb, freeMemMb, freeMemPercentage } = await osutils.mem.info();
    let cpuUsage = await osutils.cpu.usage();
    let kernel = await helper.execBash('uname -r');
    let uptime = await osutils.os.uptime();
    uptime = helper.secondsToDhms(uptime);

    message += "**";
    message += "System Information \n";
    message += "Kernel: " + kernel ;
    message += "Uptime: " + uptime + "\n \n";
    
    message += "CPU and Memory \n";
    message += "CPU Usage: " + cpuUsage + "% usage\n";
    message += "Load Avg: " + loadAvg[0] + ", " + loadAvg[1] + ", " + loadAvg[2] + "\n";
    message += "Used Mem: " + mbtogb(usedMemMb) + "GB /" + mbtogb(totalMemMb) + "GB used" + "\n";
    message += "Free Mem: " + mbtogb(freeMemMb) + "GB or " + freeMemPercentage + "% free" + "\n\n";

    message += "Disk Space \n";
    for(i=0; i<drives.length; i++){
        currentDrive=drives[i];
        info = await cdd(currentDrive);
        
        let { diskPath, free, size } = info;
        free = (free/(1073741824)).toFixed(2);
        size = (size/(1073741824)).toFixed(2);

        message += diskPath + ": " + free + "/" + size + " GiB free \n"
    }
    message += "**"

    return({"color": green, "title": title, "text": message});
}

module.exports = htop;