const Alexa = require('alexa-sdk');
const constants = require('./constants');
const puzzle = require('./puzzle');
const silence = '<audio src="' + constants.PATHS.SILENCE_80_SEC + '" />';

const pianoPuzzleIndexHandler = {
  newSessionHandlers: Alexa.CreateStateHandler(constants.states.PIANO_GAME, {
    'NewSession': function(){
      console.log("new session in piano puzzle")
    },
    'AMAZON.YesIntent': function() {
      // Help message for piano
      this.response.shouldEndSession(false);
      // Get silence to wait for a user input.
      var reply = 'Glad you accept the challenge, your mission for the first puzzle is to decode the message on the unstoppable fan which gives you hints on what to input for the red buttons.' +
      ' ...You could say help if you want more hints. Or, if you solve the puzzle, you will be given instructions on the LCD screen about how to unlock the next puzzle.' + silence;
      this.emit(':ask', reply, reply);
    },
    'AMAZON.NoIntent': function() {
      console.log("NO INTENT");
      this.response.shouldEndSession(false);
      this.response.speak('Say yes when you are ready to start the piano puzzle.');
      this.emit(':responseReady');
    },
    'AMAZON.HelpIntent' : function() {
      this.response.shouldEndSession(false);
      this.response.speak('Here is a little tip: do you remember the stroboscope from those science experiments on televisions? When you shine lights with matching freqency on the spinning fan, you will be amazed!'+silence);
      this.emit(':responseReady');
    },
    'SubmitAnswerIntent' : function() {
      // check submitted answer
      const slotValues = getSlotValues(this.event.request.intent.slots);
      const guess = slotValues['answer']['resolved'];

      if (guess == '1') {
        this.handler.state = constants.states.LASER_GAME;
        this.response.shouldEndSession(false);
        this.response.speak('Congraduations! The answer is one, because the box is not empty anymore after you put one in. So, are you ready for the next puzzle?');
        this.emit(':responseReady');
      } else {
        this.response.shouldEndSession(false);
        this.response.speak('Nahhh! you are smarter than this, come on, give it another try.'+silence);
        this.emit(':responseReady');
      }
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

module.exports = pianoPuzzleIndexHandler;

//COOKBOOK HELPER FUNCTIONS
const getSlotValues = function(filledSlots) {
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
