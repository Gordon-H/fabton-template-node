const sys = require('util');
const Stomp = require('stompjs');


var destination = '/mq';
var client = Stomp.overTCP('localhost', 61613);


var connect_callback = function () {
    console.log('connected ')
    // called back after the client is connected and authenticated to the STOMP server
    client.send("/queue/blockchain", {}, "Hello, STOMP,hahaha");
    const callback = function (message, s) {
        // called when the client receives a STOMP message from the server
        console.log('message')
        console.log(message)
        console.log(s)
        if (message.body) {
            console.log("got message with body " + message.body)
        } else {
            console.log("got empty message");
        }
    }
    var subscription = client.subscribe("blockchain", callback);
}
var error_callback = function (error) {
    // display the error's message header:
    console.log(error);
    console.log('======== end =========')
    // console.log(error);
};
var headers = {
    login: 'guest',
    passcode: 'guest',
    // 'client-id': 'my-client-id'
};
client.connect(headers, connect_callback, error_callback)
