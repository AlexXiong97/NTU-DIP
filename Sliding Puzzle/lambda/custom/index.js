const Alexa = require('alexa-sdk');
const https = require('https');
const puzzle = require('./puzzle');

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = "amzn1.ask.skill.366897d9-f60f-4e9d-83cb-a731c5855e6f"; // APP_ID is your skill id which can be found in the Amazon developer console where you create the skill.
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
	'NewSession': function() {
    console.log("in NewSession");
    // when you have a new session,
    // this is where you'll
    // optionally initialize

    // after initializing, continue on
    routeToIntent.call(this);
  },
	'LaunchRequest': function(){
		this.emit('InitializeIntent');
	},
	'InitializeIntent': function() {
		// emit response
		this.response.speak('Welcome to the final rounds, your mission should you choose to accept it. What you are looking at is not your typical sliding puzzle.'+'every move is done through voice control'+
			' There are four commands you could shout out:'+' move up'+' move down'+' move left'+' and move right.'+' Now, enjoy the game!');
    puzzle.initialzePuzzle();
    console.log(puzzle.readStatus());
    this.emit(':responseReady');

	},
	'MoveIntent': function() {
		console.log("Move");
		// Handle https request here on every move intent
		// ...
		var slotValues = getSlotValues(this.event.request.intent.slots);
    if (puzzle.checkSucess()){
      // puzzle solved
      this.emit(":tell","Dude, you have finished the puzzle, bye bye!");
    } else {
      // haven't solved the puzzle yet
      switch(slotValues['direction']['resolved']){
        case "left":
          puzzle.moveLeft();
          break;
        case "right":
          puzzle.moveRight();
          break;
        case "up":
          puzzle.moveUp();
          break;
        case "down":
          puzzle.moveDown();
          break;
        default:
          break;
      }
      if (puzzle.checkSucess()){
        this.emit(':tell',"Congradulations! You have solved the puzzle! Maggie is saved!");
      }
      // giving feedback
  		this.emit(':tell',"Okay, moving, "+slotValues['direction']['resolved']);
    }
	},
	'SessionEndedRequest' : function() {
    console.log('Session ended with reason: ' + this.event.request.reason);
  },
  'AMAZON.StopIntent' : function() {
    this.response.speak('See you, will miss you!');
    this.emit(':responseReady');
  },
  'AMAZON.HelpIntent' : function() {
    this.response.speak("This is not like your typical sliding game " +
         "It is controlled by your voice only."+" Remember, always start your command with, alexa, ask sliding puzzle"+
         " then followed by one of the following instructions:"+" move up"+" move down"+" move left"+" or move right");
    this.emit(':responseReady');
  },
  'AMAZON.CancelIntent' : function() {
    this.response.speak('Bye');
    this.emit(':responseReady');
  }
};

// ***********************************
// ** Route to Intent
// ***********************************

// after doing the logic in new session,
// route to the proper intent

function routeToIntent() {
  switch (this.event.request.type) {
    case 'IntentRequest':
      this.emit(this.event.request.intent.name);
      break;
    case 'LaunchRequest':
      this.emit('LaunchRequest');
      break;
    default:
      this.emit('LaunchRequest');
  }
}

//COOKBOOK HELPER FUNCTIONS

function getSlotValues(filledSlots) {
  //given event.request.intent.slots, a slots values object so you have
  //what synonym the person said - .synonym
  //what that resolved to - .resolved
  //and if it's a word that is in your slot values - .isValidated
  let slotValues = {};

  console.log('The filled slots: ' + JSON.stringify(filledSlots));
  Object.keys(filledSlots).forEach(function(item) {
    //console.log("item in filledSlots: "+JSON.stringify(filledSlots[item]));
    var name = filledSlots[item].name;
    //console.log("name: "+name);
    if (filledSlots[item] &&
      filledSlots[item].resolutions &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {

      switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
        case "ER_SUCCESS_MATCH":
          slotValues[name] = {
            "synonym": filledSlots[item].value,
            "resolved": filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
            "isValidated": true
          };
          break;
        case "ER_SUCCESS_NO_MATCH":
          slotValues[name] = {
            "synonym": filledSlots[item].value,
            "resolved": filledSlots[item].value,
            "isValidated": false
          };
          break;
      }
    } else {
      slotValues[name] = {
        "synonym": filledSlots[item].value,
        "resolved": filledSlots[item].value,
        "isValidated": false
      };
    }
  }, this);
  //console.log("slot values: " + JSON.stringify(slotValues));
  return slotValues;
}
