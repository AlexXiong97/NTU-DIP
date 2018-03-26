const Alexa = require('alexa-sdk');
const constants = require('constants');
const https = require('https');
const puzzle = require('puzzle');

const stateHandlers = {
  startModeIntentHandlers : Alexa.CreateStateHandler(constants.states.START_MODE, {
    'NewSession': function() {
      this.emit ('NewSession'); // uses the handler in newSessionHandlers
    },
    'AMAZON.HelpIntent': function() {
      var message = "What you are looking at is not your typical sliding puzzle. Every move is done through voice control."+
      "There are four commands you could use:move up, move down, move left and, move right. Got it? Now, enjoy the game!";
      this.response.speak(message)
        .listen(message);
      this.emit(':responseReady');
    },
    'AMAZON.YesIntent': function() {
      // initialze the puzzle state.
      this.attributes['puzzleState'] = constants.originalPuzzle;
      this.handler.state = constants.states.PLAY_MODE;
      this.response.speak("Great! Make your move!")
        .listen('Say help to learn about the rules or make your move!');
      this.emit(':responseReady');
    },
    'AMAZON.NoIntent': function() {
      console.log("NOINTENT");
      this.response.speak('Ok, see you next time!');
      this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function() {
      console.log("STOPINTENT");
      this.response.speak("Goodbye!");
      this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function() {
      console.log("CANCELINTENT");
      this.response.speak("Goodbye!");
      this.emit(':responseReady');
    },
    'SessionEndedRequest': function() {
      console.log("SESSIONENDEDREQUEST");
      this.response.speak("Goodbye!");
      this.emit(':responseReady');
    },
    'Unhandled': function(){
      console.log('UNHANDLED');
      var message = "say yes to continue, or no, to end the game!";
      this.response.speak(message)
        .listen(message);
      this.emit(':responseReady');
    }
  }),
  playModeIntentHandlers : Alexa.CreateStateHandler(constants.states.PLAY_MODE, {
    'NewSession': function () {
        this.handler.state = '';
        this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
    },
    'MoveIntent': function() {
      // set the invalid move to false
      this.attributes['invalidMove'] = false;
      const slotValues = getSlotValues(this.event.request.intent.slots);
      const movingDirection = slotValues['direction']['resolved'];
      const beforeState = this.attributes['puzzleState'];
      if (puzzle.checkSucess(beforeState)) {
        // if solved already
        this.response.speak("You have successfully solved the puzzle with "+ this.attributes['moveCount']+ "moves!");
        this.emit(':responseReady');
      } else {
        // if haven't solved yet
        const afterState = [];
        switch(movingDirection){
          case "left":
            afterState = puzzle.moveLeft(beforeState).state;
            this.attributes['invalidMove'] = puzzle.moveLeft(beforeState).validity;
            break;
          case "right":
            afterState = puzzle.moveRight(beforeState).state;
            this.attributes['invalidMove'] = puzzle.moveLeft(beforeState).validity;
            break;
          case "up":
            afterState = puzzle.moveUp(beforeState).state;
            this.attributes['invalidMove'] = puzzle.moveLeft(beforeState).validity;
            break;
          case "down":
            afterState = puzzle.moveDown(beforeState).state;
            this.attributes['invalidMove'] = puzzle.moveLeft(beforeState).validity;
            break;
          default:
            break;
        }
        if (this.attributes['invalidMove']) {
          // invalid move, don't change anything. return error msg as feedback.
          this.response.speak("Invalid Move");
          this.emit(':responseReady');
        } else {
          // update the puzzleState and moveCount
          this.attributes['puzzleState'] = afterState;
          this.attributes['moveCount'] += 1;
          if (puzzle.checkSucess(afterState)) {
            // if solved
            this.attributes['solved'] = true;
            this.response.speak("Okay, moving "+ movingDirection)
              .listen("Congradulations! You have solved the puzzle!");
            this.emit(':responseReady');
          } else {
            this.response.speak("Okay, moving "+ movingDirection)
              .listen("Continue your next move!");
            this.emit(':responseReady');
          }
        }
      }
    },
    'AMAZON.HelpIntent': function() {
      this.response.speak('There are four commands you could use:move up, move down, move left and, move right.')
          .listen('Try make a move.');
      this.emit(':responseReady');
    },
    "AMAZON.StopIntent": function() {
      console.log("STOPINTENT");
      this.response.speak("Goodbye!");
      this.emit(':responseReady');
    },
    "AMAZON.CancelIntent": function() {
      console.log("CANCELINTENT");
    },
    'SessionEndedRequest': function () {
      console.log("SESSIONENDEDREQUEST");
      this.response.speak("Goodbye!");
      this.emit(':responseReady');
    },
    'Unhandled': function() {
      console.log("UNHANDLED");
      this.response.speak('Sorry, I didn\'t get that. Try saying Move Right or any other directions.')
      .listen('Try saying Move Right or any other directions.');
      this.emit(':responseReady');
    }
  })
};

module.exports = stateHandlers;

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
