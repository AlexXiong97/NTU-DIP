const Alexa = require('alexa-sdk');
const constants = require('constants');
const https = require('https');
const stateHandlers = require('stateHandlers');
const puzzle = require('./puzzle');

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = constants.appId;
    alexa.dynamoDBTableName = constants.dynamoDBTableName;
    alexa.registerHandlers(
      newSessionHandlers,
      stateHandlers.startModeIntentHandlers,
      stateHandlers.playModeIntentHandlers
    );
    alexa.execute();
};

const newSessionHandlers = {
  'NewSession': function(){
    // check if it is the first time being invoked
    if (Object.keys(this.attributes).length == 0) {
      this.attributes['moveCount'] = 0;
      this.attributes['solved'] = false;
    }
    this.handler.state = constants.states.START_MODE;
    this.response.speak('Welcome to the final rounds, your mission should you choose to accept it. Would you like to accept the challenge?')
      .listen('Say yes to get briefing about the rules.');
    this.emit(':responseReady');
  },
  'AMAZON.StopIntent' : function() {
    this.response.speak('See you later! You could invoke me again when you want to resume the game.');
    this.emit(':responseReady');
  },
  'AMAZON.CancelIntent' : function() {
    this.response.speak('Goodbye!');
    this.emit(':responseReady');
  },
	'SessionEndedRequest' : function() {
    console.log('Session ended with reason: ' + this.event.request.reason);
    this.response.speak('Goodbye!');
    this.emit(':responseReady');
  }
}

// const handlers = {
// 	'NewSession': function() {
//     console.log("in NewSession");
//     // when you have a new session,
//     // this is where you'll
//     // optionally initialize
//
//     // after initializing, continue on
//     routeToIntent.call(this);
//   },
// 	'LaunchRequest': function(){
// 		this.emit('InitializeIntent');
// 	},
// 	'InitializeIntent': function() {
// 		// emit response
// 		this.response.speak('Welcome to the final rounds, your mission should you choose to accept it. What you are looking at is not your typical sliding puzzle.'+'every move is done through voice control'+
// 			' There are four commands you could shout out:'+' move up'+' move down'+' move left'+' and move right.'+' Now, enjoy the game!');
//     // puzzle.initializePuzzle();
//     // console.log(puzzle.readStatus());
//     this.emit(':responseReady');
//
// 	},
// 	'MoveIntent': function() {
// 		// console.log("Before move: "+puzzle.readStatus());
// 		// Handle https request here on every move intent
// 		// ...
// 		var slotValues = getSlotValues(this.event.request.intent.slots);
//     this.emit(':tell',"Okay, moving, "+slotValues['direction']['resolved']);
//     // if (puzzle.checkSucess()){
//     //   // puzzle solved
//     //   this.emit(":tell","Dude, you have finished the puzzle, bye bye!");
//     // } else {
//     //   // haven't solved the puzzle yet
//     //   switch(slotValues['direction']['resolved']){
//     //     case "left":
//     //       puzzle.moveLeft();
//     //       break;
//     //     case "right":
//     //       puzzle.moveRight();
//     //       break;
//     //     case "up":
//     //       puzzle.moveUp();
//     //       break;
//     //     case "down":
//     //       puzzle.moveDown();
//     //       break;
//     //     default:
//     //       break;
//     //   }
//     //   if (puzzle.checkSucess()){
//     //     this.emit(':tell',"Congradulations! You have solved the puzzle! Maggie is saved!");
//     //   }
//     //   // giving feedback
//   	// 	this.emit(':tell',"Okay, moving, "+slotValues['direction']['resolved']);
//     // }
// 	}
// };
//
// // ***********************************
// // ** Route to Intent
// // ***********************************
//
// // after doing the logic in new session,
// // route to the proper intent
//
// function routeToIntent() {
//   switch (this.event.request.type) {
//     case 'IntentRequest':
//       this.emit(this.event.request.intent.name);
//       break;
//     case 'LaunchRequest':
//       this.emit('LaunchRequest');
//       break;
//     default:
//       this.emit('LaunchRequest');
//   }
// }
