const Alexa = require('alexa-sdk');
const constants = require('./constants');
const https = require('https');
const slidingPuzzleIndexHandler = require('./sliding-puzzle');
const pianoPuzzleIndexHandler = require('./piano-puzzle');
const laserPuzzleIndexHandler = require('./laser-puzzle');
const stateHandlers = require('./stateHandlers');
const puzzle = require('./puzzle');

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = constants.appId;
    alexa.dynamoDBTableName = constants.dynamoDBTableName;
    alexa.registerHandlers(
      newSessionHandlers,
      slidingPuzzleIndexHandler.newSessionHandlers,
      pianoPuzzleIndexHandler.newSessionHandlers,
      laserPuzzleIndexHandler.newSessionHandlers,
      stateHandlers.startModeIntentHandlers,
      stateHandlers.playModeIntentHandlers
    );
    alexa.execute();
};

const newSessionHandlers = {
  'NewSession': function(){
    // check if it is the first time being invoked
    if (Object.keys(this.attributes).length == 0) {
      console.log("new session for new user");
    }
    this.handler.state = constants.states.PIANO_GAME;
    this.response.speak('Welcome to the piano challenge, your mission should you choose to accept it. Would you like to accept the challenge?')
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
