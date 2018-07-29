import document from "document";
import { HeartRateSensor } from "heart-rate";
import { user } from "user-profile";
import { vibration } from "haptics";
import { peerSocket } from "messaging";
import { geolocation } from "geolocation";

let hrmData = document.getElementById("hrm-data");
let circle = document.getElementById("circle");
let hrm = new HeartRateSensor();
let passThreshold = false;
let passThresholdPrev = false;
let ok = false;
let help = false;
let positions;
var timer;
hrm.start();

//refresh every second
function refreshData() {
  //reading heart rate and location data
  geolocation.getCurrentPosition(locationSuccess, locationError);
  let data = {
    heartRate: hrm.heartRate ? hrm.heartRate : 0,
    location: {
      latitude: positions ? positions.coords.latitude : 0,
      longitude: positions ? positions.coords.longitude : 0
    },
    help: help
  };

  //setting threshold and alerts
  if (data.heartRate > 220 - user.age){
    circle.style.fill = "red";
    hrmData.style.fill = "white";
    passThreshold = true;
    if (passThresholdPrev == false){
      startTimer();
      vibration.start("ring");
    }
  } else if (data.heartRate > 220 - user.age - 10){
    circle.style.fill = "yellow";
    hrmData.style.fill = "black";
    passThreshold = false;
  } else {
    circle.style.fill = "green";
    hrmData.style.fill = "white";
    passThreshold = false;
  }
  
  passThresholdPrev = passThreshold;
  
  //display on screen
  hrmData.text = data.heartRate + "";
  return data;
}

//if heartrate doesn't go down in 5s and the user didn't press "ok", notification will be sent
function startTimer(){
  ok = false; //reset "ok" button
  timer = setTimeout(function(){ help = true; }, 5000);
}

//refresh data every second to see if we need to send message
function sendMessage(){
  refreshData();
  if (passThreshold == false || ok == true){
    clearTimeout(timer); //cancel sending message if notification was already sent or if the user pressed "ok"
    vibration.stop();
  }
  message();
  help = false;
}
setInterval(sendMessage, 1000);

//send message to companion app
function message(){
    if (peerSocket.readyState === peerSocket.OPEN) {
      peerSocket.send(refreshData());
    }
}

//buttons
let okButton = document.getElementById("ok-button");
okButton.onactivate = function(evt) {
  ok = true;
  console.log("stopped");
  let takeCarePage = document.getElementById("take-care");
  takeCarePage.style.display = "inline"; //pop-up the take care page and auto disappears after 3s
  setTimeout(function(){ takeCarePage.style.display = "none"; }, 3000);
}
//send help immediately if pressed HELP button
let helpButton = document.getElementById("help-button");
let helpComingPage = document.getElementById("help-coming");
let gotItButton = helpComingPage.getElementById("got-it-button");
helpButton.onactivate = function(evt) {
  help = true;
  clearTimeout(timer); //message is already sent, no need to send again after 5s
  helpComingPage.style.display = "inline"; //pop-up the "help on the way" page
  vibration.stop();
}
gotItButton.onclick = function(evt) {
  helpComingPage.style.display = "none"; //hide the "help on the way" page
}

//getting location
function locationSuccess(position) {
  positions = position;
}

function locationError(error) {}