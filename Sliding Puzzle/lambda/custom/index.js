const Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = "amzn1.ask.skill.366897d9-f60f-4e9d-83cb-a731c5855e6f"; // APP_ID is your skill id which can be found in the Amazon developer console where you create the skill.
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
	'LaunchRequest': function(){
		this.emit(':tell',"Welcome to JigsawPuzzle!");
	},

	'InitializeIntent': function() {
		// emit response
		this.emit(':tell', 'Enjoy the game!')
	}
};