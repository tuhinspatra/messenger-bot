//
// This is main file containing code implementing the Express server and functionality for the Express echo bot.
//
'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
var messengerButton = "<html><head><title>Facebook Messenger Bot </title></head><body><h1>Facebook Messenger Bot by <i><a href=\"https://twitter.com/mynameistsp\">armag</a></i></h1>This is a bot based on Messenger Platform. For more details, see their <a href=\"https://developers.facebook.com/docs/messenger-platform/guides/quick-start\">docs</a>.<br>The complete source code can be found on my <a href=\"https://github.com/armag-pro/messenger-bot\">GitHub repo</a>.<script src=\"https://button.glitch.me/button.js\" data-style=\"glitch\"></script><div class=\"glitchButton\" style=\"position:fixed;top:20px;right:20px;\"></div></body></html>";
var quizQs = ['My fav place is:','I was born in','I am:','I prefer','I have mounted a:','I have read:'];
var options = [ ['Las Vegas','Paris'],['West Bengal','Rajasthan'],['6.1+ ft','6.1- ft'],['Driving','Riding'],
			['Helicopter','Elephant'],['One Indian Girl','One night @ call centre']];
var Y = 'PAYLOAD_CORRECT_ANS';
var N = 'PAYLOAD_WRONG_ANS';
var correctAns = [[Y,N],[Y,N],[N,Y],[Y,N],[Y,N],[N,Y]];
// The rest of the code implements the routes for our Express server.
let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// Webhook validation
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }
});

// Display the web page
app.get('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write(messengerButton);
  res.end();
});

// Message processing
app.post('/webhook', function (req, res) {
  console.log(req.body);
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object === 'page') {
    
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.message) {
          receivedMessage(event);
        } else if (event.postback) {
          receivedPostback(event);   
        }  else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

// Incoming events handling
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var messageId = message.mid;

  var messageText = message.text;
  var messageQR = message.quick_reply;
  var messageAttachments = message.attachments;
  if (messageQR && messageText) {
	  for(var i = 0; i<quizQs.length;i++){
	  	if(messageText == options[i][0] || messageText == options[i][1]){
	  		if(messageQR.payload == Y){
			  sendTextMessage(senderID, "Correct!!! :D");
			 	sendImage(senderID,"https://media3.giphy.com/media/3ornjXIIShZ2MgyyHu/giphy.gif");


	  		}else {
			  sendTextMessage(senderID, "Nope...That's wrong :/");
			 sendImage(senderID,"https://cdn.meme.am/cache/instances/folder425/57312425.jpg");
			  
	  		}
	      	sendGenericMessage3(senderID);
	  		break;
	  	}
	  }

  } else if (messageText ) {
  
	    if(messageText.match(/^(follow|find|tuhin|twitter)$/i)) {
	        sendGenericMessage1(senderID);

	    } else if(messageText.match(/^(restart|start|again|play|Start\/Resume|quiz)$/i)) {
	        sendGenericMessage2(senderID);

	    } else if(messageText.match(/^(.*((^|\W)(i\sluv\su)(\W|\b)|(^|\W)(i\sluv\syou)(\W|\b)|(^|\W)(i\slove\su)(\W|\b)|(^|\W)(i\slove\syou)(\W|\b)|(^|\W)(i\slike\su)(\W|\b)).*)$/i)) {
	        sendTypingIndicatorOn(senderID);
	      	setTimeout(sendTypingIndicatorOff,6000);
		    setTimeout(function(){sendTextMessage(senderID, "Backspaced everything!!!")},6000);
		    setTimeout(function(){sendImage(senderID, "https://media2.giphy.com/media/xUA7aWi4gtOdAaX9q8/giphy.gif")},7500);

	    } else if(messageText.match(/^(.*((^|\W)no(\W|\b)|(^|\W)oops(\W|\b)|(^|\W)hmm(\W|\b)|(^|\W)ahem(\W|\b)|(^|\W)wtf(\W|\b)).*)$/i)) {
	        sendTextMessage(senderID, "😭");

	    } else if(messageText.match(/^(.*((^|\W)shit(\W|\b)|(^|\W)what(\W|\b)|(^|\W)idk(\W|\b)|(^|\W)wat(\W|\b)|(^|\W)dont(\W|\b)).*)$/i)) {
	        sendTextMessage(senderID, ":'(");

	    } else if(messageText.match(/^(.*((^|\W)bye(\W|\b)|(^|\W)bbye(\W|\b)|(^|\W)bubbye(\W|\b)|(^|\W)quit(\W|\b)|(^|\W)exit(\W|\b)).*)$/i)) {
	        sendTextMessage(senderID, "So soon...I was liking it so much.");
	        sendTextMessage(senderID, "You are so much fun to be around");
	        sendTextMessage(senderID, "do come back later please...");
	        sendTextMessage(senderID, "heres a quick link btw m.me/torquebull");
	        sendTextMessage(senderID, "^_^");

	    }  else if(messageText.match(/^(.*((^|\W)chat(\W|\b)|(^|\W)bot(\W|\b)|(^|\W)fb(\W|\b)|(^|\W)lyk(\W|\b)|(^|\W)like(\W|\b)).*)$/i)) {
	        sendTextMessage(senderID, "(y)");

	    }  else  if(messageText.match(/^(.*((^|\W)image(\W|\b)|(^|\W)img(\W|\b)|(^|\W)logo(\W|\b)|(^|\W)jpg(\W|\b)|(^|\W)tsp(\W|\b)).*)$/i)) {
		 	sendImage(senderID,"http://1d-paca.com/sites/default/files/imageupload/image_square/198440-logo-tsp-12042012-1749.jpg");
	       

	    } else if(messageText.match(/(video|vid)/i)) {
		  	sendVideo(senderID,"https://github.com/mediaelement/mediaelement-files/blob/master/big_buck_bunny.mp4");
	       

	    } else if(messageText.match(/^(.*((^|\W)sticker(\W|\b)|(^|\W)luv(\W|\b)|(^|\W)love(\W|\b)|(^|\W)wow(\W|\b)|(^|\W)gud(\W|\b)|(^|\W)good(\W|\b)).*)$/i)) {
		 	sendImage(senderID,"http://i.imgur.com/hJK1gUE.png");

	    } else {
	    	var replies = ['what do you mean by "' + messageText + '" ?', 'You look awesome!',
	      				'Not sure I understood that.','Sry what?','wtf','You know I like you', ':/',
	      				'hmm...','You dont make any sense!','Speak english!','try typing `follow` or `play`',
	      				'say `tuhin`!','Just type in `tsp`','-_-','10010011100 is that what you mean :|]',':v','<(") <(") <(")','what?? 8-)'];
	      	var ch = Math.floor(Math.random()*replies.length);
	        sendTextMessage(senderID, replies[ch]);
	    }

  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received and ignored :poop ");
    //sendTextMessage(senderID, JSON.stringify(messageAttachments));

  }
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  if(payload == 'twitter_follow_later'){
	  sendTextMessage(senderID, "No problem, but sure do it later! o.O");
  }
	else if(payload == 'quiz_play_later'){
	  sendTextMessage(senderID, "Oops...type quiz or play to start answering anytime later.");
	}
	else if(payload == 'quiz_play_begin'){
	  sendQuickReply(senderID,Math.floor(Math.random()*quizQs.length));

	} else if(payload == Y){
	  sendTextMessage(senderID, "Correct!!! :D");

	} else if(payload == N){
	  sendTextMessage(senderID, "Nope...That's wrong :/");

	} else if(payload == 'QUIZ_PAYLOAD'){
	        sendGenericMessage2(senderID);
	  

	} else if(payload == 'SHARE_LOCATION_PAYLOAD'){
	  sendQuickReplyLocation(senderID, "discarded");

	} else if(payload == 'SCORE_PAYLOAD'){
	 	sendImage(senderID,"http://www.wbaf2016.org/wp-content/uploads/2017/03/credit-score.png");

	  sendTextMessage(senderID, "who cares about the score :P \n\n\nMust say, your net is too slow for an image!");

	} else if(payload == 'GET_STARTED_PAYLOAD'){
	  sendImage(senderID, "https://media0.giphy.com/media/26xBwdIuRJiAIqHwA/giphy.gif");

	} else{
	  sendTextMessage(senderID, "Got it! O:)");
	}
}

//////////////////////////
// Sending helpers
//////////////////////////
function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function sendQuickReply(recipientId, ch) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text:quizQs[ch],
	    quick_replies:[
	      {
	        content_type:"text",
	        title:options[ch][0],
	        payload:correctAns[ch][0],
	      },
	      {
	        content_type:"text",
	        title:options[ch][1],
	        payload:correctAns[ch][1],
	      }
	    ]
    }
  };

  callSendAPI(messageData);
}

function sendQuickReplyLocation(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text:"Please share your location: O:)",
	    quick_replies:[
	      {
	        content_type:"location",
	      }
	    ]
    }
  };

  callSendAPI(messageData);
}

function sendImage(recipientId, imageUrl){
	var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment:{
	      type:"image",
	      payload:{
	        url: imageUrl
	      }
	    }
    }
  };

  callSendAPI(messageData);
}

function sendVideo(recipientId, videoUrl) {
	var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment:{
	      type:"video",
	      payload:{
	        url: videoUrl
	      }
	    }
    }
  };

  callSendAPI(messageData);
}

function sendGenericMessage1(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Find me on twitter",
            subtitle: "Follow me and Retweet me.",
            item_url: "https://twitter.com/mynameistsp",               
            image_url: "https://pbs.twimg.com/profile_images/1695114892/216776_147827421966054_100002163903678_298416_4623411_n_400x400.jpg",
            buttons: [{
              type: "web_url",
              url: "https://twitter.com/mynameistsp",
              title: "Open Twitter"
            }, {
              type: "element_share",
              
            }, {
              type: "postback",
              title: "Not now",
              payload: "twitter_follow_later",
            }],
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function sendGenericMessage2(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Answer 1 simple question",
            subtitle: "Let's see how much you know about me!",
            item_url: "https://www.britannica.com/quiz/browse",               
            image_url: "http://www.mathslogic.in/files/ready-quiz.gif",
            buttons: [{
              type: "postback",
              title: "Start Now!",
              payload: "quiz_play_begin",
            }, {
              type: "postback",
              title: "Not now",
              payload: "quiz_play_later",
            }],
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}
function sendGenericMessage3(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "Answer 1 more?",
            subtitle: "Lets see if you were just guessing!",
            item_url: "https://www.britannica.com/quiz/browse",               
            image_url: "https://i.ytimg.com/vi/H2Y1MIdj4sg/hqdefault.jpg",
            buttons: [{
              type: "postback",
              title: "Yass Please!",
              payload: "quiz_play_begin",
            }, {
              type: "postback",
              title: "Enough",
              payload: "quiz_play_later",
            }],
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function sendTypingIndicatorOn(recipientId){
	var messageData = {
		recipient:{
	  	id: recipientId
	  },
	  sender_action: "typing_on"
   	};
  callSendAPI(messageData);

}
function sendTypingIndicatorOff(recipientId){
	var messageData = {
		recipient:{
	  	id: recipientId
	  },
	  sender_action: "typing_off"
   	};
  callSendAPI(messageData);
   	
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: process.env.PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

// Set Express to listen out for HTTP requests
var server = app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port %s", server.address().port);
});