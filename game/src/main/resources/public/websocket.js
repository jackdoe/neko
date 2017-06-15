var ws = new WebSocket("wss://neko.science/chat");
webSocket.onmessage = function (msg) { id("gameState").innerHTML = msg.data };

id("send").addEventListener("click", function () {
    sendMessage(id("message").value);
});

function sendMessage(message) {
    if (message !== "") {
        webSocket.send(message);
    }
}

function id(id) {
    return document.getElementById(id);
}
