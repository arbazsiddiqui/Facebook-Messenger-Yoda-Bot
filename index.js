var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var unirest = require('unirest')
var app = express()

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'whatever') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        if (event.message && event.message.text) {
            text = event.message.text
            yodaSpeaks = ''
            //mashape api to yodafy the msg
            unirest.get("https://yoda.p.mashape.com/yoda?sentence=" + text)
                .header("X-Mashape-Key", "273VjJrKohmshTavLdHZNY4btKv4p14E0kkjsnyyZ1DJJSRGkN")
                .header("Accept", "text/plain")
                .end(function (result) {
                    console.log(result);
                    yodaSpeaks = result.body;
                    sendTextMessage(sender, String(yodaSpeaks))
                });
        }
    }
    res.sendStatus(200)
})

var token = "EAADuSZBHzv2UBAI1yVkZCV7PcmicMqOdXZCBorMZCn6ITDaG1ujkzXRuaZAYdzUy0MVohUydSkKFbCQ6XWbTw8hsTLE5tgsrJ3lsuqXmbulnADMMe3rZAewc1mwZA7lX5a8IQtGP08oMslJZBA0Ioja7bTU9BISI7ZBHywPsZBNWgwygZDZD"

function sendTextMessage(sender, text) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})