const socket = io(); //können wir hier verwenden wegen Zeile in chat.html
const chatBox = document.querySelector('.chat-box'); //class aus chat.html
const connectedUsers = document.getElementById('connectedUsers');
const chatMessageForm = document.getElementById('chat-message-form');
const GLOBAL_USERNAME = location.search.substring(10);
//Variablen fuer Tipp-Status
var _typingIndicator = document.querySelector('.typingUsers');
var _input = document.querySelector('#chatmessage');

//Username an backend übertragen
socket.emit('sendUsername', GLOBAL_USERNAME);

socket.on('connectedUsers', userArray =>{
    showUsers(userArray);
})

socket.on('message', message => {
    addMessageToDOM(message); //Nachricht an DOM
});

// Chat massage submit -> (e) = event parameter
chatMessageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const chatMessage = e.target.elements.chatmessage.value;
    e.target.elements.chatmessage.value = '';
    //console.log(chatMessage);
    socket.emit('chatMessage', chatMessage);
    addMyMessageToDOM(chatMessage);
});

function addMessageToDOM(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = message;
    chatBox.appendChild(div);

    //Focus auf neue Nachricht
    chatBox.scrollTop = chatBox.scrollHeight
}

function addMyMessageToDOM(message){
    const div = document.createElement('div');
    div.classList.add('myMessage');
    div.innerHTML = message;
    chatBox.appendChild(div);

    //Focus auf neue Nachricht
    chatBox.scrollTop = chatBox.scrollHeight
}

function showUsers(userList){
    
    //Liste in DOM leeren
    while(document.getElementById('user')){
        let item = document.getElementById('user');
        console.log(document.getElementById('user'))
        connectedUsers.removeChild(item);
    }

    userList.map(user => 
        {const li = document.createElement('li');
        li.setAttribute('id', 'user');
        li.appendChild(document.createTextNode(user));
        connectedUsers.appendChild(li)});
    
}

//Tipp-Status an Backend senden
function commTypingUsers(){
    socket.emit('sendTypingStatus', GLOBAL_USERNAME)
    socket.on('typingUsers', typingArray =>{
        showTypingUsers(typingArray);
    })
}
//Tipp-Status aktualisieren
function showTypingUsers(typingList){
    while(document.getElementById('typingX')){
        let item = document.getElementById('typingX');
        typingUsers.removeChild(item);
    }
    typingList.map(typingN =>
        {const li = document.createElement('li');
        li.setAttribute('id', 'typingN');
        li.appendChild(document.createTextNode(typingN));
        typingUsers.appendChild(li)});
}

//Anzeige von Tippenden Nutzern beenden
function removeTypingUser(){
    socket.emit('typingStop');
}

//Tippen registrieren
function initTypingIndicator() {
    /*_input.onfocus = function(){
        showIndicator();
    };*/

    _input.onkeyup = function() {
        commTypingUsers();
    };

    _input.onblur = function(){
        removeTypingUser();
    };
}

initTypingIndicator();