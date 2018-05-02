const Alexa = require('alexa-sdk');
const constants = require('./constants');
const puzzle = require('./puzzle');

const laserPuzzleIndexHandler = {
  newSessionHandlers: Alexa.CreateStateHandler(constants.states.LASER_GAME, {
    'NewSession': function(){
      console.log("new session in laser game");
    },
    'AMAZON.YesIntent': function() {
      // Intro for laser puzzle here
      this.response.shouldEndSession(false);
      this.response.speak('say something');
      this.emit(':responseReady');
    },
    'AMAZON.NoIntent': function() {
      console.log("NO INTENT");
      this.response.shouldEndSession(false);
      this.response.speak('Say yes when you are ready to start the laser puzzle.');
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
    'AMAZON.HelpIntent' : function() {
      this.response.shouldEndSession(false);
      this.response.speak('help message of laser puzzle');
      this.emit(':responseReady');
    },
    'SubmitAnswerIntent' : function() {
      // check
      this.handler.state = constants.states.SLIDING_GAME;
      this.response.shouldEndSession(false);
      this.response.speak('Congraduations! You have unlocked the next puzzle, which is sliding puzzle! Are you ready?');
      this.emit(':responseReady');
    },
  	'SessionEndedRequest' : function() {
      console.log('Session ended with reason: ' + this.event.request.reason);
      this.response.shouldEndSession(false);
      this.response.speak('Goodbye!');
      this.emit(':responseReady');
    },
    'Unhandled': function(){
      console.log('UNHANDLED');
      var message = "say yes to continue, or no, to end the game!";
      this.response.shouldEndSession(false);
      this.response.speak(message)
        .listen(message);
      this.emit(':responseReady');
    }
  })
}

module.exports = laserPuzzleIndexHandler;
