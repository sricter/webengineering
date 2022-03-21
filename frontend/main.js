const socket = io(); //können wir hier verwenden wegen Zeile in chat.html
const chatBox = document.querySelector('.chat-box'); //class aus chat.html
const connectedUsers = document.getElementById('connectedUsers');
const chatMessageForm = document.getElementById('chat-message-form');
//Username aus URL ziehen
const GLOBAL_USERNAME = location.search.substring(10);
//Variablen fuer Tipp-Status
const _input = document.querySelector('#chatmessage');
var vTypingState;
var timeStamp1;

//Username an backend übertragen
socket.emit('sendUsername', GLOBAL_USERNAME);

//Verbundene User von backend empfangen
socket.on('connectedUsers', userArray =>{
    showUsers(userArray);
})

//Nachricht an DOM
socket.on('message', message => {
    addMessageToDOM(message); 
});

//Wenn auf "Nachricht senden" gedrückt wird -> Wert aus Input an backend senden
chatMessageForm.addEventListener('submit', (e) => {
    e.preventDefault(); //Default Value ignorieren (Sonst wird Verbindung neu aufgebaut)
    const chatMessage = e.target.elements.chatmessage.value;
    e.target.elements.chatmessage.value = '';
    //console.log(chatMessage); //Debug
    socket.emit('chatMessage', chatMessage);
    addMyMessageToDOM(chatMessage); //In Chatverlauf anzeigen
});

//Nachrichten der anderen Teilnehmer in Chatverlauf anzeigen
function addMessageToDOM(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = message;
    chatBox.appendChild(div);

    //Focus auf neue Nachricht
    chatBox.scrollTop = chatBox.scrollHeight
}

//Nachricht des Senders in Chatverlauf anzeigen
function addMyMessageToDOM(message){
    const div = document.createElement('div');
    div.classList.add('myMessage');
    div.innerHTML = message;
    chatBox.appendChild(div);

    //Focus auf neue Nachricht
    chatBox.scrollTop = chatBox.scrollHeight
}

//Aktive User anzeigen
function showUsers(userList){
    
    //Liste in DOM leeren
    while(document.getElementById('user')){
        let item = document.getElementById('user');
        //console.log(document.getElementById('user')) //Debug
        connectedUsers.removeChild(item);
    }

    userList.map(user => 
        {const li = document.createElement('li');
        li.setAttribute('id', 'user');
        li.appendChild(document.createTextNode(user));
        connectedUsers.appendChild(li)});
    
}

//Bei Antwort von backend Funktion showTypingUsers() anstoßen 
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

//Timer zur Löschung der Tipp-Anzeige nach spezifischer Zeit
function inputTimer() {
    var timeStamp2 = Date.now();
    if ((timeStamp2-timeStamp1)>2900){
    removeTypingUser();
    }
}

//Tipp-Status in HTML aktualisieren
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
//Einmaliges Antstoßen der Funktion
initTypingIndicator();