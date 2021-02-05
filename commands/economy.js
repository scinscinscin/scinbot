const fs = require('fs');

const { prefix, colors, startBalance, companyStartBalance, gachaThreshold } = require('../config/main.json');
const green = colors.green;
const red = colors.red;

async function main(args, authorID){
    economy = JSON.parse(await fs.readFileSync('./config/economy.json'));
    members = Object.keys(economy.members);
    let options = args.split(" ")
    let command = options.shift()

    switch (command){
        case 'join' :
            response = join(authorID);
        break;

        case 'bal' :
            response = bal(authorID, options);
        break;

        case 'gamble' :
            response = gamble(authorID, "gamble");
        break;

        case 'roll' :
            response = gamble(authorID, "roll");
        break;

        case 'startCompany' :
            response = startCompany(authorID, options);
        break;

        case 'listCompanies' :
            response = listCompanies();
        break;

        case 'invest' :
            response = invest(authorID, options);
        break;

        case 'sell' :
            response = sell(authorID, options);
        break;

        case 'foldCompany':
            response = foldCompany(authorID, options);
        break;

        case 'help':
            response = help();
        break;

        default:
            response = {"color": red, "title": `Unknown command`, "text": `Type "${prefix}eco help" to get a list of all commands`};
    }

    return(response);
}

function join(authorID){
    let template = {
        "onHandCash": startBalance,
        "investments": {}
    };

    if(members.includes(authorID)){
        return({"color": red, "title": `You are already part of the economy!`, "text": `You cannot join the economy twice!`});
    }

    economy["members"][authorID] = template;
    fs.writeFileSync('./config/economy.json', JSON.stringify(economy, null, 2));
    return({"color": green, "title": `Success`, "text": `**You have successfully joined the economy.**`});
}

function bal(authorID, options){
    // Assume that the member is the author then check if the options is not empty
    let member = authorID;
    if(options.length > 0){
        member = options[0].substring(3).slice(0, -1);
    }

    // Check if the member is part of the economy
    if(!members.includes(member)){
        return({"color": red, "title": `Not part of the economy!`, "text": `**Cannot find that person's balance since they are not part of the economy.**`});
    }

    let onHandCash = economy["members"][member]["onHandCash"];                              // Amount of money that the member has on hand
    let totalCash = onHandCash;                                                             // onHandCash + stocks
    let investments = Object.keys(economy["members"][member]["investments"]);               // The member's investments
    
    let message = ``;
    message += `**<@!${member}> has ${onHandCash} scinbucks on hand**\n`;

    if(investments.length != 0){
        message += '\n**Stocks:** \n';
        for (i=0; i<investments.length; i++){
            let workingCompany = investments[i];
            let amount = economy["members"][member]["investments"][workingCompany];         // amount of stock that the user has of workingCompany
            let unitPrice = economy["companies"][workingCompany]["stockPrice"];             // the price of 1 workingCompany stock
            let stockPrice = amount * unitPrice;                                            // amount of stock * the price of 1 stock
            
            totalCash += stockPrice;
            message += `**${workingCompany} - ${stockPrice}**\n`;
        }

        message += `\n**Total: ${totalCash} scinbucks**`;
    }

    return({"color": green, "title": `Balance`, "text": `${message}`});
}

function gamble(authorID, type){
    // Check if the user is part of the economy
    if(!members.includes(authorID)){
        return({"color": red, "title": `You are not part of the economy!`, "text": `**Join the economy first before running this command!**`});
    }

    let balance = economy["members"][authorID]["onHandCash"];   // The balance of the user who is gambling
    let gacha = Math.random() > gachaThreshold ? 1 : -1         // Determine if user loses or gains money
    let absoluteGainLoss;                                       // Abosolute value of the  amount that the user will gain/lose

    if(type === "gamble"){absoluteGainLoss = Math.round(balance/10)}                
    else if(type === "roll"){absoluteGainLoss = Math.round(Math.random() * 50)}

    let gainLoss = Math.round(gacha * absoluteGainLoss);        // The amount of money that will be added to the user's balance
    let newBalance = balance + gainLoss;                        // The user's new balance
    
    economy["members"][authorID]["onHandCash"] = newBalance;
    fs.writeFileSync('./config/economy.json', JSON.stringify(economy, null, 2));

    if(gacha === 1){
        return({"color": green, "title": `You gained money!`, "text": `**Your ${type} netted you ${absoluteGainLoss}\n Your new balance is ${newBalance}**`});
    }else{
        return({"color": red, "title": `You lost money!`, "text": `**Your ${type} lost you ${absoluteGainLoss}\n Your new balance is ${newBalance}**`});
    }
}

function startCompany(authorID, options){
    // Check if the user is part of the economy
    if(!members.includes(authorID)){
        return({"color": red, "title": `You are not part of the economy!`, "text": `**Join the economy first before running this command!**`});
    }

    // Check if the user put in a name
    if(options.length === 0){
        return({"color": red, "title": `No name!`, "text": `**You can't start a company without a name!**`});  
    }

    let companyName = options.join("");                             // The company name that the user put in
    let companyList = Object.keys(economy.companies);               // The list of already existing companies
    // Check if the companyName already exists
    if(companyList.includes(companyName)){
        return({"color": red, "title": `That name is taken!`, "text": `**The name "${companyName}" is already taken!**`}); 
    }

    let template = {
        "owner": authorID,
        "stockPrice": companyStartBalance
    }

    economy["companies"][companyName] = template;
    fs.writeFileSync('./config/economy.json', JSON.stringify(economy, null, 2));
    return({"color": green, "title": `Success`, "text": `**You have successfully created the company "${companyName}".**`});
}

function listCompanies(){
    let companyList = Object.keys(economy["companies"]);            // List of companies
    let message = `**`;

    for(i=0; i<companyList.length; i++){
        let workingCompany = companyList[i];
        let owner = economy["companies"][workingCompany]["owner"];
        let stockPrice = economy["companies"][workingCompany]["stockPrice"];
        message += `${workingCompany} - ${stockPrice} scinbucks\n`;
        message += `Owned by: <@!${owner}>\n\n`
    }
    
    message += `**`;
    return({"color": green, "title": `Company List`, "text": `${message}`});
}

function invest(authorID, options){
    if(!members.includes(authorID)){
        return({"color": red, "title": `You are not part of the economy!`, "text": `**Join the economy first before running this command!**`});
    }
    
    if(options.length !== 2){
        return({"color": red, "title": `Invalid number of arguments!`, "text": `**This command takes in 2 arguments**`});
    }
    
    let company = options[0];i                                      // the company that the user is trying to invest to
    let amount = parseInt(options[1]);                              // amount of stock that the user wants to buy for that company
    let companyList = Object.keys(economy["companies"]);            // list of all companies that exist

    if(!companyList.includes(company)){
        return({"color": red, "title": `${company} does not exist`, "text": `**${company} is not a registered company**`});
    }
    
    if(isNaN(amount)){
        return({"color": red, "title": `Invalid parameter`, "text": `**Second parameter needs to be an integer**`});
    }

    // need to determine if the user can invest in the company
    let stockPrice = economy["companies"][company]["stockPrice"];                               // the price of one stock that the user is investing in
    let payment = Math.round(stockPrice * amount);                                              // amount that the user will pay to buy the stock
    let balance = economy["members"][authorID]["onHandCash"];                                   // the balance of the user

    if (payment > balance){
        return({"color": red, "title": `Not enough cash`, "text": `**You don't have enough cash to buy ${amount} stock(s) in ${company}**`});
    }
    
    // So by this point it should be a valid company that the user can afford to buy stock in
    let authorInvestments = Object.keys(economy["members"][authorID]["investments"]);           // list of companies that the user has invested in
    if(!authorInvestments.includes(company)){
        economy["members"][authorID]["investments"][company] = 0;                                              // Add the company to the user's list of stock if it isn't there
    }

    let currentInvestmentAmount = economy["members"][authorID]["investments"][company];         // the amount of stock that the user already has in the company
    let newInvestmentAmount = currentInvestmentAmount + amount;                                 // The new amount of stock that the user has for the company
    let newBalance = balance - payment;                                                         // The user's new balance

    // Write the new stats
    economy["members"][authorID]["investments"][company] = newInvestmentAmount;
    economy["members"][authorID]["onHandCash"] = newBalance;
    fs.writeFileSync('./config/economy.json', JSON.stringify(economy, null, 2));
    return({"color": green, "title": `Success`, "text": `**You have successfully bought ${amount} stock(s) in ${company}**`});
}

function sell(authorID, options){
    // check if user is part of the economy
    if(!members.includes(authorID)){
        return({"color": red, "title": `You are not part of the economy!`, "text": `**Join the economy first before running this command!**`});
    }
    
    // check if there are a valid number of arguments
    if(options.length !== 2){
        return({"color": red, "title": `Invalid number of arguments!`, "text": `**This command takes in 2 arguments**`});
    }
    
    let company = options[0];i                                      // the company that the user is trying to sell off
    let amount = parseInt(options[1]);                              // amount of stock that the user wants to sell for that company
    let companyList = Object.keys(economy["companies"]);            // list of all companies that exist

    // check if the company exists
    if(!companyList.includes(company)){
        return({"color": red, "title": `${company} does not exist`, "text": `**${company} is not a registered company**`});
    }
    
    // check if the second variable is an integer
    if(isNaN(amount)){
        return({"color": red, "title": `Invalid parameter`, "text": `**Second parameter needs to be an integer**`});
    }
    
    // check if the user owns any stock in the company
    let authorInvestments = Object.keys(economy["members"][authorID]["investments"]);
    if(!authorInvestments.includes(company)){
        return({"color": red, "title": `Can't sell!`, "text": `**You can't sell ${amount} stock(s) because you don't own any stock in ${company}**`});
    }

    // check if the amount that the user wants to sell is valid
    let currentInvestmentAmount = economy["members"][authorID]["investments"][company];         // the amount of stock that the user already has in the company
    if (amount > currentInvestmentAmount){
        return({"color": red, "title": `Can't sell!`, "text": `**You can't sell ${amount} stock(s) because you only own ${currentInvestmentAmount} stock(s)**`});
    }

    // So by this point the company should exist, the user has stock in it, and they can sell the amount(that is an integer) they want to
    let stockPrice = economy["companies"][company]["stockPrice"];                               // the price of one stock that the user is selling off
    let payment = Math.round(stockPrice * amount);                                              // amount that the user will get after they sell the stock
    let balance = economy["members"][authorID]["onHandCash"];                                   // the balance of the user

    let newInvestmentAmount = currentInvestmentAmount - amount;                                 // The new amount of stock that the user has for the company
    let newBalance = Math.round(balance + payment);                                             // The user's new balance

    // Write the new stats
    economy["members"][authorID]["onHandCash"] = newBalance;
    if(newInvestmentAmount === 0){
        // delete the investment if it is zero
       delete economy["members"][authorID]["investments"][company];
    }else{
        // else just write newInvestmentAmount to it
        economy["members"][authorID]["investments"][company] = newInvestmentAmount;
    }
    fs.writeFileSync('./config/economy.json', JSON.stringify(economy, null, 2));
    return({"color": green, "title": `Success`, "text": `**You have successfully sold ${amount} stock(s) in ${company}**`});
}

function foldCompany(authorID, options){
    // Check if the user is part of the economy
    if(!members.includes(authorID)){
        return({"color": red, "title": `You are not part of the economy!`, "text": `**Join the economy first before running this command!**`});
    }
    
    // check if there are a valid number of arguments
    if(options.length !== 1){
        return({"color": red, "title": `Invalid number of arguments!`, "text": `**This command takes in 1 argument**`});
    }

    //check it the company exists
    let companyName = options.join("");
    let companyList = Object.keys(economy.companies);
    if(!companyList.includes(companyName)){
        return({"color": red, "title": `That company doesn't exist!`, "text": `**The name "${companyName}" doesn't exist**`}); 
    }
    
    let stockPrice = economy["companies"][companyName]["stockPrice"];                           // stockPrice of the company
    let owner = economy["companies"][companyName]["owner"];                                     // owner of the company

    // Check if the author is the owner of the company
    if (owner !== authorID){
        return({"color": red, "title": `You don't own that company!`, "text": `**You can't shutdown a company you don't own**`}); 
    }

    // Actually fold the company
    // Return the stock to the stock members
    for(i=0; i<members.length; i++){
        let member = members[i];                                                                // Working member
        let investments = Object.keys(economy["members"][member]["investments"]);               // List of investments of the working member

        if(investments.includes(companyName)){
            let balance = economy["members"][member]["onHandCash"];                             // The balance of the member
            let investmentAmount = economy["members"][member]["investments"][companyName];      // Amount of stocks that the user has on the dead company
            let newBalance = Math.round(balance + (investmentAmount * stockPrice));             // The new balance of the member

            //Write the user's new balance and delete the company from their investments
            economy["members"][member]["onHandCash"] = newBalance;
            delete economy["members"][member]["investments"][companyName];
        }
    }

    // Remove the company from the companyList
    delete economy["companies"][companyName];
    fs.writeFileSync('./config/economy.json', JSON.stringify(economy, null, 2));
    return({"color": red, "title": `Success!`, "text": `**You have successfully deleted ${companyName}**`});
}

function help(){
    let message = ``;
    message += '**Usage: \n**';
    message += "```" + prefix + "eco [subcommand] <parameters>```\n";
    message += `**`;
    message += `Subcommands: \n`;
    message += `join: Join the economy\n`;
    message += `bal: List your or another user's balance\n`;
    message += `gamble: Gain or lose 10% of your current balance\n`;
    message += `roll: Gain or lose 0-50 scinbucks\n`;
    message += `listCompanies: lits all the companies\n\n`;
    message += `startCompany: Start a company\n`;
    message += "Parameters: ``<companyName>``\n\n";
    message += `foldCompany: Fold a company you own\n`;
    message += "Parameters: ``<companyName>``\n\n";
    message += `invest: Invest stock(s) in a company\n`;
    message += "Parameters: ``<companyName> <amountOfStocks>``\n\n";
    message += `sell: Sell stock(s) in a company\n`;
    message += "Parameters: ``<companyName> <amountOfStocks>``\n\n";
    message += `**`;

    return({"color": green, "title": `Help`, "text": `${message}`});
}
module.exports = main;