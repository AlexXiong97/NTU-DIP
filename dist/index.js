const Alexa = require('alexa-sdk');

exports.handler = function (event, context, callback) {
	const alexa = Alexa.handler(event, context, callback);
	alexa.appId = "amzn1.ask.skill.930877b6-88a6-43ed-86d1-b4b8fbfeefd8"; // APP_ID is your skill id which can be found in the Amazon developer console where you create the skill.
	alexa.registerHandlers(handlers);
	alexa.execute();
};

const handlers = {
	'LaunchRequest': function () {
		this.emit('InitializeIntent');
	},

	'InitializeIntent': function () {
		// emit response
		this.emit(':tell', 'Welcome to JigsawPuzzle!');
	}
};