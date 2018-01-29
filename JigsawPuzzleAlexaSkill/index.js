	exports.handler = (event, context, callback) => {
		
		try{
			if (event.session.new) {
				// New Session
				console.log("NEW SESSION")
			}

			switch(event.request.type) {
				case "LaunchRequest":
					console.log("LAUNCH REQUEST");
					context.succeed(
						generateResponse(buildSpeechletResponse("Welcome to JigsawPuzzle!", false),{})
					);
					break;
				case "IntentRequest":
					console.log("INTENT REQUEST");
					switch (event.request.intent.name) {
						case "Initialize":
							context.succeed(
								generateResponse(buildSpeechletResponse("JigsawPuzzle is successfully initialzed, enjoy the game!", true),{})
							);
							break;
						default:
							context.fail(`INVALID REQUEST TYPE: ${event.request.type}`)
					}
					break;
				case "SessionEndedRequest":
					console.log("SESSION ENDED REQUEST");
					break;
				default:
					context.fail(`INVALID REQUEST TYPE: ${event.request.type}`);
			}
			
		    // TODO implement
		    // callback(null, 'Hello from Lambda');

		} catch(error) {
			context.fail(`Exception: ${event.request.type}`)
		}

	};

	buildSpeechletResponse = (outputText, shouldEndSession) => {
		return {
			outputSpeech: {
				type: "Plaintext",
				text: outputText
			},
			shouldEndSession: shouldEndSession
		}
	}

	generateResponse = (speechletResponse, sessionAttributes) =>{
		return {
			version: "0.1",
			sessionAttributes: sessionAttributes,
			response: speechletResponse
		}
	}