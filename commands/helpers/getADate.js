function getADate(){
    let datetime = new Date();
    let da=datetime.getDate();
    let mo=datetime.getMonth() + 1;
    let ye=datetime.getFullYear();
    let hr=datetime.getHours().toString();
    let mn=datetime.getMinutes().toString();
    let sc=datetime.getSeconds().toString();
  
    if(hr.length==1){hr="0"+hr}
    if(mn.length==1){mn="0"+mn}
    if(sc.length==1){sc="0"+sc}
  
    return(`${mo}-${da}-${ye} ${hr}:${mn}:${sc}`);
}

module.exports = getADate;