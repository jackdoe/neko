var webSocket = new WebSocket("ws://localhost:4567/chat");
webSocket.onmessage = function (msg) { updateChat(msg); };

id("send").addEventListener("click", function () {
    sendMessage(id("message").value);
});

function sendMessage(message) {
    if (message !== "") {
        webSocket.send(message);
    }
}

function updateChat(msg) {
     id("chat").innerHTML = msg.data
}

function id(id) {
    return document.getElementById(id);
}
