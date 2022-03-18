const socket = io(); //können wir hier verwenden wegen Zeile in chat.html
const chatBox = document.querySelector('.chat-box'); //class aus chat.html
const connectedUsers = document.getElementById('connectedUsers');
const chatMessageForm = document.getElementById('chat-message-form');
const GLOBAL_USERNAME = location.search.substring(10);
//Variablen fuer Tipp-Status
//var _typingIndicator = document.querySelector('.typingUsers');
const _input = document.querySelector('#chatmessage');
var vTypingState;
var timeStamp1;

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

socket.on('typingUsers', typingArray =>{
    showTypingUsers(typingArray);
    })

//Tipp-Status an Backend senden
function commTypingUsers(){
    if (vTypingState != "active") {
        vTypingState = "active";
        socket.emit('sendTypingStatus', GLOBAL_USERNAME)
        }
    setTimeout(inputTimer, 3000);
}

function inputTimer() {
    var timeStamp2 = Date.now();
    if ((timeStamp2-timeStamp1)>2900){
    removeTypingUser();
    }
}

//Tipp-Status aktualisieren
function showTypingUsers(typingList){
    while(document.getElementById('typingX')){
        let item = document.getElementById('typingX');
        typingUsers.removeChild(item);
    }
    typingList.map(typingX =>
        {const li = document.createElement('li');
        li.setAttribute('id', 'typingX');
        if(typingX==GLOBAL_USERNAME){
            li.appendChild(document.createTextNode("Du tippst gerade..."));
            typingUsers.appendChild(li)
        } else{
            li.appendChild(document.createTextNode(typingX+" tippt gerade..."));
            typingUsers.appendChild(li)
         }
        })
}

//Anzeige von Tippenden Nutzern beenden
function removeTypingUser(){
    if (vTypingState != "not-active"){
        vTypingState = "not-active";
        socket.emit('typingStop', GLOBAL_USERNAME);
    }

}

//Tippen registrieren
function initTypingIndicator() {
    _input.onkeydown = function() {
        timeStamp1 = Date.now();
        commTypingUsers();
    }
}

initTypingIndicator();