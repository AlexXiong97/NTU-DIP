const Alexa = require('alexa-sdk');
const constants = require('./constants');
const puzzle = require('./puzzle');
const silence = '<audio src="' + constants.PATHS.SILENCE_80_SEC + '" />';

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
      this.response.speak(silence);
      this.emit(':responseReady');
    },
    'AMAZON.CancelIntent' : function() {
      this.response.speak('Goodbye!');
      this.emit(':responseReady');
    },
    'SessionEndedRequest': function() {
      console.log("SESSIONENDEDREQUEST");
      // never ends the session.
      this.response.shouldEndSession(false);
      this.response.speak(silence);
      this.emit(':responseReady');
    },
    'Unhandled': function(){
      console.log("unhandled!");
      this.response.shouldEndSession(false);
      this.response.speak(silence);
      this.emit(':responseReady');
    }
  })
}

module.exports = slidingPuzzleIndexHandler;
