import { me } from "companion";
import * as messaging from "messaging";
import { settingsStorage } from "settings";

var notificationCount = 0;

if (!me.permissions.granted("access_internet")) {
   console.log("We're not allowed to access the internet :-(");
}

messaging.peerSocket.addEventListener("message", (evt) => {
    //getting today's date
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();

    if(dd<10) {
      dd = '0'+dd
    } 

    if(mm<10) {
      mm = '0'+mm
    }
  
    today = yyyy+'-'+mm+'-'+dd;
  
    if (evt.data) {
      let message = {
      appId: me.applicationId,
      notificationId: notificationCount,
      date: today,
      notification: evt.data
      }
    
    notificationCount++;
      
    let url = `https://naajw2ldia.execute-api.us-east-2.amazonaws.com/prod`
      fetch(url, {
        method: "POST",
        body: JSON.stringify(message)
      }).then(res => {return res.json()})
      .then(body => console.log(body))
      .catch(error => console.error('Error:', error))
      .then(response => console.log('Success:', response));
    console.log(JSON.stringify(message));
    //console.log("notified");
  }
});