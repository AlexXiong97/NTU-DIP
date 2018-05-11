const Alexa = require('alexa-sdk');
const constants = require('./constants');
const puzzle = require('./puzzle');

const slidingPuzzleIndexHandler = {
  newSessionHandlers: Alexa.CreateStateHandler(constants.states.SLIDING_GAME, {
    'NewSession': function(){
      console.log("new session in sliding puzzle");
    },
    'SlidingPuzzleIntent': function() {
      this.handler.state = constants.states.START_MODE;
      this.response.shouldEndSession(false);
      this.response.speak('Welcome to the sliding puzzle, Are you ready for the mind blowing challenge?')
        .listen('Say yes to get briefing about the rules.');
      this.emit(':responseReady');
    },
    'AMAZON.StopIntent' : function() {
      this.response.shouldEndSession(false);
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
    },
    'Unhandled': function(){
    }
  })
}

module.exports = slidingPuzzleIndexHandler;
