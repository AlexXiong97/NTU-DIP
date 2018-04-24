const Alexa = require('alexa-sdk');
const aws = require('aws-sdk');
const constants = require('./constants');
const https = require('https');
const http = require('http');
const request = require("request");
const puzzle = require('./puzzle');

var lambda = new aws.Lambda({
  region: 'us-east-1'
});
var params = {
  FunctionName: 'arduinoRequestHandlers',
  InvocationType: 'RequestResponse',
  Payload: ''
}

const stateHandlers = {
  startModeIntentHandlers : Alexa.CreateStateHandler(constants.states.START_MODE, {
    'NewSession': function() {
      this.emit ('NewSession'); // uses the handler in newSessionHandlers
    },
    'AMAZON.HelpIntent': function() {
      var message = "What you are looking at is not your typical sliding puzzle. Every move is done through voice control."+
      "There are four commands you could use:move up, move down, move left and, move right. Got it? Now, enjoy the game!";
      this.response.shouldEndSession(false);
      this.response.speak(message)
        .listen(message);
      this.emit(':responseReady');
    },
    'AMAZON.YesIntent': function() {
      // initialze the puzzle state.
      this.attributes['puzzleState'] = constants.originalPuzzle;
      this.attributes['moveCount'] = 0;
      this.handler.state = constants.states.PLAY_MODE;
      // update proxy "pulling service"
      params.Payload = JSON.stringify({
        "action": "update",
        "toMove": false,
        "moving": false
      });
      lambda.invoke(params, function(error, data){
        if (error) {
          console.log("error!"+ error);
        }
        if(data.Payload){
          console.log("succeed with callback payload: "+JSON.stringify(data.Payload));
          // generate response
          this.response.shouldEndSession(false);
          this.response.speak("Great! Make your move!")
            .listen('Say help to learn about the rules or make your move!');
          this.emit(':responseReady');
        }
      });
    },
    'AMAZON.NoIntent': function() {
      console.log("NOINTENT");
      this.response.shouldEndSession(false);
      this.response.speak('Ok, see you next time!');
      this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function() {
      console.log("STOPINTENT");
      this.response.shouldEndSession(false);
      this.response.speak("Goodbye!");
      this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function() {
      console.log("CANCELINTENT");
      this.response.shouldEndSession(false);
      this.response.speak("Goodbye!");
      this.emit(':responseReady');
    },
    'SessionEndedRequest': function() {
      console.log("SESSIONENDEDREQUEST");
      // never ends the session.
      this.response.shouldEndSession(false);
      this.response.speak("Goodbye!");
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
  }),
  playModeIntentHandlers : Alexa.CreateStateHandler(constants.states.PLAY_MODE, {
    'NewSession': function () {
        this.handler.state = '';
        this.emitWithState('NewSession'); // Equivalent to the Start Mode NewSession handler
    },
    'MoveIntent': function() {
      // First check whether the robotic arm is moving by asking arduinoProxy
      params.Payload = JSON.stringify({
        "action": "availabilityCheck"
      });
      lambda.invoke(params, function(error, data){
        if (error) {
          console.log("error!"+ error);
        }
        if(data.Payload){
          console.log("succeed with callback payload: "+JSON.stringify(data.Payload));
          if (data.Payload.isMoving) {
            this.response.shouldEndSession(false);
            this.response.speak("The robotic arm is still moving, please chill out!");
            this.emit(':responseReady');
          }

          // accept nextMove command only if isMoving == false.
          // set the invalid move to false
          this.attributes['invalidMove'] = false;
          const slotValues = getSlotValues(this.event.request.intent.slots);
          const movingDirection = slotValues['direction']['resolved'];
          const beforeState = this.attributes['puzzleState'];
          console.log("before moving: "+ JSON.stringify(beforeState));
          var afterState = [];

          if (puzzle.checkSucess(beforeState)) {
            // if solved already
            this.response.speak("You have successfully solved the puzzle with "+ this.attributes['moveCount']+ "moves!");
            this.emit(':responseReady');
          } else {
            // if haven't solved yet
            switch(movingDirection){
              case "left":
                var result = puzzle.moveLeft(beforeState);
                afterState = result.state;
                this.attributes['invalidMove'] = !result.validity;
                break;
              case "right":
                var result = puzzle.moveRight(beforeState);
                afterState = result.state;
                this.attributes['invalidMove'] = !result.validity;
                break;
              case "up":
                var result = puzzle.moveUp(beforeState);
                afterState = result.state;
                this.attributes['invalidMove'] = !result.validity;
                break;
              case "down":
                var result = puzzle.moveDown(beforeState);
                afterState = result.state;
                this.attributes['invalidMove'] = !result.validity;
                break;
              default:
                break;
            }
            console.log("After moving, the state:"+ JSON.stringify(afterState));
            if (this.attributes['invalidMove']) {
              // invalid move, don't change anything. return error msg as feedback.
              this.response.shouldEndSession(false);
              this.response.speak("Invalid Move");
              this.emit(':responseReady');
            } else {
              // update the puzzleState and moveCount
              this.attributes['puzzleState'] = afterState;
              this.attributes['moveCount'] += 1;
              // update arduinoProxy
              params.Payload = JSON.stringify({
                "action": "update",
                "toMove": true,
                "startingPos": puzzle.getPosition(afterState),
                "endingPos": puzzle.getPosition(beforeState),
                "moving": false
              });
              lambda.invoke(params, function(error, data){
                if (error) {
                  console.log("error!"+ error);
                }
                if(data.Payload){
                  console.log("succeed with callback payload: "+JSON.stringify(data.Payload))
                }
              });
              // return Alexa response and waiting for nextMove
              if (puzzle.checkSucess(afterState)) {
                // if solved
                this.attributes['solved'] = true;
                this.response.speak("Okay, moving "+ movingDirection+ ". Congradulations! You have solved the puzzle!");
                this.emit(':responseReady');
              } else {
                this.response.shouldEndSession(false);
                this.response.speak("Okay, moving "+ movingDirection);
                this.emit(':responseReady');
              }
            }
          }
        }
      });
    },
    'CheckStatusIntent': function() {
      console.log(this.attributes['puzzleState']);
      this.response.shouldEndSession(false);
      this.response.speak("You could see your state in log.");
      this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function() {
      this.response.shouldEndSession(false);
      this.response.speak('There are four commands you could use:move up, move down, move left and, move right.')
          .listen('Try make a move.');
      this.emit(':responseReady');
    },
    "AMAZON.StopIntent": function() {
      console.log("STOPINTENT");
      this.response.shouldEndSession(false);
      this.response.speak("See you later!");
      this.emit(':responseReady');
    },
    "AMAZON.CancelIntent": function() {
      console.log("CANCELINTENT");
      this.response.speak("Goodbye!");
      this.emit(':responseReady');
    },
    'SessionEndedRequest': function () {
      console.log("SESSIONENDEDREQUEST");
      this.response.shouldEndSession(false);
      this.response.speak("Goodbye!");
      this.emit(':responseReady');
    },
    'Unhandled': function() {
      console.log("UNHANDLED");
      this.response.shouldEndSession(false);
      this.response.speak('Sorry, I didn\'t get that. Try saying Move Right or any other directions.')
      .listen('Try saying Move Right or any other directions.');
      this.response.shouldEndSession(false);
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

// HTTP POST function
//
// function httpPost(nextMove, callback) {
//     var post_data = {"move": nextMove};
//
//     var post_options = {
//         host:  'http://172.28.226.71',
//         port: '80',
//         path: '/',
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'User-Agent': 'Arduino/1.0',
//             'Content-Length': Buffer.byteLength(JSON.stringify(post_data))
//         }
//     };
//
//     var post_req = http.request(post_options, res => {
//         res.setEncoding('utf8');
//         var returnData = "";
//         res.on('data', chunk =>  {
//             returnData += chunk;
//         });
//         res.on('end', () => {
//             // this particular API returns a JSON structure:
//             // returnData: {"nextMove":"Left","status":"moving"}
//
//             callback(JSON.parse(returnData));
//
//         });
//     });
//     post_req.write(JSON.stringify(post_data));
//     post_req.end();
//
// }
