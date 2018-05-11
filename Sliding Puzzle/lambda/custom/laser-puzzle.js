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
      this.response.speak('Welcome to the second puzzle,  Part 1 of this puzzle is to solve a simple logic gate puzzle. Insert the correct logic gate into the correct slot to unlock a laser. Once you assemble all the right logic gate, you will activate three lasers.'+
      '...What are those lasers used for? Good question, try figure out yourself when you reached there. Or... say Help to get hints.' );
      this.emit(':responseReady');
    },
    'AMAZON.NoIntent': function() {
      console.log("NO INTENT");
      this.response.shouldEndSession(false);
      this.response.speak('Say yes when you are ready to start the laser puzzle.');
      this.emit(':responseReady');
    },
    'AMAZON.HelpIntent' : function() {
      this.response.shouldEndSession(false);
      this.response.speak('Here is a little tips: match all 3 lasers to the correct receivers simultaneously using mirrors.');
      this.emit(':responseReady');
    },
    'SubmitAnswerIntent' : function() {
      // check submitted answer
      const slotValues = getSlotValues(this.event.request.intent.slots);
      const guess = slotValues['answer']['resolved'];

      if (guess == 'envelope') {
        this.handler.state = constants.states.SLIDING_GAME;
        this.response.shouldEndSession(false);
        this.response.speak('Congraduations! Oh, wow, you deserve a 5.0 GPA. But do not get cocky, the next puzzle will get physical!');
        this.emit(':responseReady');
      } else {
        this.response.shouldEndSession(false);
        this.response.speak('Nahhh! you are smarter than this, come on, give it another try.');
        this.emit(':responseReady');
      }

    },
    'Unhandled': function(){
    }
  })
}

module.exports = laserPuzzleIndexHandler;

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
