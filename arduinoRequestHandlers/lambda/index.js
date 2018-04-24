const AWS = require('aws-sdk');
AWS.config.update({
  region: 'us-east-1'
});
var ddb = new AWS.DynamoDB({apiVersion: '2012-10-08'});

console.log("loading the arduinoRequestHandlers function");

exports.handler = function(event, context, callback) {
  console.log('Received event:', JSON.stringify(event, null, 2));
  if (event.Records != undefined){
    // response from DynamoDB
    callback();
  }

  if (event.action == undefined) {
    callback("400 Invalid Action");
  }

  var res = {};
  res.action = event.action;

  switch(event.action){
    case "update":
      update(event.toMove, event.startingPos, event.endingPos, event.moving, function(err, data){
        if (err) {
          res.error = err;
        } else {
          res.data = data;
        }
      });
    default:
      break;
  }

  callback(null, res);
}

// @param: bool toMove; Object startingPos, endingPos; bool moving.
const update = function(toMove, startingPos, endingPos, moving, callback) {
  var params = {
    TableName: 'arduinoProxy',
    Item: {
      'userId': {S: '1'},
      'toMove': {BOOL: toMove==undefined? false: toMove},
      'startingPos': {S: startingPos==undefined? 'null':JSON.stringify(startingPos)},
      'endingPos': {S: endingPos==undefined? 'null':JSON.stringify(endingPos)},
      'moving': {BOOL: moving==undefined? false: moving}
    }
  }

  ddb.putItem(params, function(err, data){
    if (err) {
      console.log("Error", err);
      callback(err);
    } else {
      console.log("Success", data);
      callback(null, data);
    }
  });
}
