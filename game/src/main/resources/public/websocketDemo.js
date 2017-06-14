var webSocket = new WebSocket("ws://localhost:4567/chat");
webSocket.onmessage = function (msg) { updateChat(msg); };
webSocket.onclose = function () { alert("WebSocket connection closed") };

id("send").addEventListener("click", function () {
    sendMessage(id("message").value);
});

//Send a message if it's not empty, then clear the input field
function sendMessage(message) {
    if (message !== "") {
        webSocket.send(message);
    }
}

function updateChat(msg) {
console.log(msg.data)
     document.getElementById("chat").innerHTML = msg.data
}

function insert(targetId, message) {
    id(targetId).insertAdjacentHTML("afterbegin", message);
}

function id(id) {
    return document.getElementById(id);
}
