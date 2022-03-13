const socket = io(); //können wir hier verwenden wegen Zeile in chat.html
const chatBox = document.querySelector('.chat-box'); //id aus chat.html
const chatMessageForm = document.getElementById('chat-message-form');
var GLOBAL_USERNAME = '';

socket.on('message', message => {
    console.log(message);
    addMessageToDOM(message); //Nachricht an DOM
});

socket.on('username', username => {
    console.log(username);
    addMessageToDOM(username);
});


/*socket.on('disconnect', () => {
    if(!GLOBAL_USERNAME){
        const logofftext = GLOBAL_USERNAME + ' hat den Chat verlassen!'
        console.log(logofftext);
        io.emit('message', logofftext); //Nachricht an alle verbundenen Clients
    }
});*/

// Chat massage submit -> (e) = event parameter
chatMessageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const chatMessage = e.target.elements.chatmessage.value;
    e.target.elements.chatmessage.value = '';
    console.log(chatMessage);
    socket.emit('chatMessage', chatMessage);
});

//vielleicht ändern
function addMessageToDOM(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = message;
    chatBox.appendChild(div);
}