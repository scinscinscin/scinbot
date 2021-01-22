const fs = require('fs');

function updateStock(){
    economy = JSON.parse(fs.readFileSync('./config/economy.json'));
    let companyList = Object.keys(economy.companies);

    for (i=0; i<companyList.length; i++){
        let stock = economy["companies"][companyList[i]]["stockPrice"];
        let gacha = Math.random() > 0.3 ? 1 : -1;
        let absoluteGains = Math.round(Math.random() * 50);
        let gains = Math.round(absoluteGains * gacha);
        let newStock = Math.round(Math.round(stock) + Math.round(gains));

        economy["companies"][companyList[i]]["stockPrice"] = newStock;
    }

    fs.writeFileSync('./config/economy.json', JSON.stringify(economy, null, 2));
}

module.exports = updateStock;