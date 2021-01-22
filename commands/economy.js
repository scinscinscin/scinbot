const fs = require('fs');

const { prefix, colors } = require('../config/main.json');
const green = colors.green;
const red = colors.red;

async function main(args, authorID){
    economy = JSON.parse(fs.readFileSync('./config/economy.json'));
    let options = args.split(" ")
    let command = options.shift()

    switch (command){
        case 'join' :
            response = join(authorID);
        break;

        case 'bal' :
            response = bal(options, authorID);
        break;

        case 'gamble' :
            response = gamble("gamble", authorID);
        break;

        case 'roll' :
            response = gamble("roll", authorID);
        break;

        case 'startCompany' :
            response = startCompany(options, authorID);
        break;

        case 'listCompanies' :
            response = listCompanies();
        break;

        case 'invest' :
            response = invest(options, authorID);
        break;

        case 'sell' :
            response = sell(options, authorID);
        break;

        case 'help' :
            response = help();
        break;

        default:
            response = ({"color": red, "title": `Unknown command`, "text": `Type "${prefix}eco help" to get a list of all commands`});
    }

    if (response === undefined){
        response = ({"color": red, "title": `You are already in the economy`, "text": `You cannot join the economy twice.`});
    }
    return(response);
}

function join(authorID){
    authorID = authorID.toString();
    let joinedMembers = Object.keys(economy.members);
    let template = {
        "balance": 2500,
        "stocks": []
    }

    if (joinedMembers.includes(authorID)){
        return({"color": red, "title": `You are already in the economy`, "text": `**You cannot join the economy twice.**`});
    }
    
    economy["members"][authorID] = template;
    fs.writeFileSync('./config/economy.json', JSON.stringify(economy, null, 2));
    return({"color": green, "title": `Success`, "text": `**You have successfully joined the economy.**`});
}

function bal(options, authorID){
    authorID = authorID.toString();
    let member = authorID

    if (options[0]!==undefined){
        member = options[0].substring(3).slice(0, -1);
    }

    let joinedMembers = Object.keys(economy.members);
    if (!joinedMembers.includes(member)){
        return({"color": red, "title": `Not part of the economy`, "text": `**Cannot find that person's balance since they are not part of the economy.**`});
    }

    let balance = totalBalance = economy["members"][member]["balance"];
    let stocks = economy["members"][member]["stocks"]

    message = '';
    message += `**<@!${member}> has ${balance} scinbucks on hand**`

    if (stocks.length > 0){
        message += `\n\n**Stocks:** \n`
        for (i=0; i<stocks.length; i++){
            let workingCompany = stocks[i];
            let companyStock = economy["companies"][workingCompany]["stockPrice"];
            totalBalance += companyStock;
            message += `**${workingCompany} - ${companyStock}**\n`;
        }
        message += `\n**Total Balance: ${totalBalance} scinbucks**`;
    }
    fs.writeFileSync('./config/economy.json', JSON.stringify(economy, null, 2));
    return({"color": green, "title": `Balance`, "text": `${message}`});
}

function gamble(type, authorID){
    authorID = authorID.toString();
    let joinedMembers = Object.keys(economy.members);
    if (!joinedMembers.includes(authorID)){
        return({"color": red, "title": `Not part of the economy`, "text": `**You cannot execute this command until you're part of the economy.**`});
    }

    let balance = economy["members"][authorID]["balance"];
    let gains;

    let gacha = Math.random() > 0.3 ? 1 : -1;
    if (type === "roll"){
        let absoluteGains = Math.round(Math.random() * 50)
        gains = Math.round(absoluteGains * gacha);
    }else{
        gains = Math.round(balance * 0.1 * gacha);
    }

    let newBalance = Math.round(Math.round(balance) + Math.round(gains));
    if(newBalance < 0){
        newBalance = 0;
    }
    
    economy["members"][authorID]["balance"] = newBalance;
    fs.writeFileSync('./config/economy.json', JSON.stringify(economy, null, 2));

    if(gacha === 1){
        return({"color": green, "title": `You made money`, "text": `**You received ${gains} scinbucks\nYour new balance is ${newBalance}**`});
    }else{
        return({"color": red, "title": `You lost money`, "text": `**You lost ${gains * -1} scinbucks\n Your new balance is ${newBalance}**`}); 
    }
}

function startCompany(options, authorID){
    let owner = authorID.toString();
    let joinedMembers = Object.keys(economy.members);
    if (!joinedMembers.includes(owner)){
        return({"color": red, "title": `Not part of the economy`, "text": `**You cannot execute this command until you're part of the economy.**`});
    }
    //check if user put in a company name
    let companyName = options.join('-');
    if (companyName === ""){
        return({"color": red, "title": `Missing company name`, "text": `**Usage:** "${prefix}eco startCompany your cool company name"`});
    }

    //check if the company name has already been taken
    let companyList = Object.keys(economy.companies);
    if (companyList.includes(companyName)){
        return({"color": red, "title": `Taken company name`, "text": `**The company name "${companyName}" is already taken**`});
    }

    //By this point the user should not own a company, and their company name isn't already used.
    let template = {
        "owner": owner,
        "stockPrice": 500
    }
    economy["companies"][companyName] = template;
    fs.writeFileSync('./config/economy.json', JSON.stringify(economy, null, 2));
    return({"color": green, "title": `Successful Company Creation`, "text": `**You have successfully created the ${companyName}\n It's current stock is 500 scinbucks**`});
}

function listCompanies(){
    let companyList = Object.keys(economy.companies);
    let message = '**';
    
    for (i=0; i<companyList.length; i++){
        let workingCompany = companyList[i];
        let props = economy["companies"][workingCompany];
        message += `${workingCompany} - ${props.stockPrice} scinbucks\n`;
        message += `Owned by <@${props.owner}>\n\n`;
    }
    message += '**';
    fs.writeFileSync('./config/economy.json', JSON.stringify(economy, null, 2));
    return({"color": green, "title": `List of Companies`, "text": message});
}

function invest(options, authorID){
    let owner = authorID.toString();
    let joinedMembers = Object.keys(economy.members);
    if (!joinedMembers.includes(owner)){
        return({"color": red, "title": `Not part of the economy`, "text": `**You cannot execute this command until you're part of the economy.**`});
    }

    //check if user put in a company name
    let companyName = options.join('-');
    if (companyName === ""){
        return({"color": red, "title": `Missing company name`, "text": `**Usage:** "${prefix}eco invest company-name"`});
    }

    //check if there is a company that exists under that name
    let companyList = Object.keys(economy.companies);
    if (!companyList.includes(companyName)){
        return({"color": red, "title": `Unknown company name`, "text": `**Cannot find "${companyName}"**`});
    }

    //get properties of the user and check if user already owns stock on that company
    let userProps = economy["members"][owner];
    if (userProps.stocks.includes(companyName)){
        return({"color": red, "title": `You already own stock in ${companyName}`, "text": `**You can only own one stock per company!**`});
    }

    //get the price of the comapany's stock and subtract it from balance
    //list the company to user's stock
    //write the new stock list and balance
    let companyStock = economy["companies"][companyName]["stockPrice"];
    userProps.balance = Math.round(Math.round(userProps.balance) - Math.round(companyStock));
    userProps.stocks.push(companyName);

    economy["members"][owner] = userProps;
    fs.writeFileSync('./config/economy.json', JSON.stringify(economy, null, 2));
    return({"color": green, "title": `Success`, "text": `**You have successfully bought stock in ${companyName}\n Your new balance is ${userProps.balance} scinbucks**`});
}

function sell(options, authorID){
    let owner = authorID.toString();
    let joinedMembers = Object.keys(economy.members);
    if (!joinedMembers.includes(owner)){
        return({"color": red, "title": `Not part of the economy`, "text": `**You cannot execute this command until you're part of the economy.**`});
    }

    //check if user put in a company name
    let companyName = options.join('-');
    if (companyName === ""){
        return({"color": red, "title": `Missing company name`, "text": `**Usage:** "${prefix}eco sell company-name"`});
    }

    //check if there is a company that exists under that name
    let companyList = Object.keys(economy.companies);
    if (!companyList.includes(companyName)){
        return({"color": red, "title": `Unknown company name`, "text": `**Cannot find "${companyName}"**`});
    }

    //get properties of the user and check if user doesn't stock on that company
    let userProps = economy["members"][owner];
    if (!userProps.stocks.includes(companyName)){
        return({"color": red, "title": `You don't own stock in ${companyName}`, "text": `**You can only sell stock if you own stock!**`});
    }

    //get the price of the comapany's stock and subtract it from balance
    let companyStock = economy["companies"][companyName]["stockPrice"];
    userProps.balance = Math.round(Math.round(userProps.balance) + Math.round(companyStock));

    //remove the company from the user's stock
    let index = userProps.stocks.indexOf(companyName);
    userProps.stocks.splice(index, 1)

    //write the new stock list and balance
    economy["members"][owner] = userProps;
    fs.writeFileSync('./config/economy.json', JSON.stringify(economy, null, 2));
    return({"color": green, "title": `Success`, "text": `**You have successfully sold stock in ${companyName}\n Your new balance is ${userProps.balance} scinbucks**`});
}

function help(){
    message = "**";
    message += "Commands: \n";
    message += `${prefix}eco join - Join the economy\n`;
    message += `${prefix}eco bal - Get your balance or another player's balance\n`;
    message += `${prefix}eco gamble - Randomly lose or win 10% of your current balance\n`;
    message += `${prefix}eco roll - Randomly lose or win money from 0-50 scinbucks\n`;
    message += `${prefix}eco startCompany - Start a company. Usage: "${prefix}eco startCompany your-super-cool-company-name"\n`;
    message += `${prefix}eco listCompanies- List all the companies\n`;
    message += `${prefix}eco invest - Invest in a company. Usage: "${prefix}eco invest company-name"\n`;
    message += `${prefix}eco sell - Sell your stock in a company. Usage: ${prefix}eco sell company-name\n`;
    message += `${prefix}eco help - Display this help screen\n`;
    message += "**"
    return({"color": green, "title": `Help Screen`, "text": `${message}`});
}
module.exports = main;