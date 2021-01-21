const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function execBash(cmd) {
    const { stdout, stderr } = await exec(cmd);
    return(stdout);
}

module.exports = execBash;