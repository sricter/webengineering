const socket = io(); //können wir hier verwenden wegen Zeile in chat.html
const chatBox = document.querySelector('.chat-box'); //id aus chat.html
const connectedUsers = document.getElementById('connectedUsers');
const chatMessageForm = document.getElementById('chat-message-form');
const GLOBAL_USERNAME = location.search.substring(10);

//Username an backend übertragen
socket.emit('sendUsername', GLOBAL_USERNAME);

socket.on('connectedUsers', userArray =>{
    showUsers(userArray);
})

socket.on('message', message => {
    addMessageToDOM(message); //Nachricht an DOM
});

//socket.on('username', username => {
//    console.log(username);
//    addMessageToDOM(username);
//});


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
    //console.log(chatMessage);
    socket.emit('chatMessage', chatMessage);
});

//vielleicht ändern
function addMessageToDOM(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = message;
    chatBox.appendChild(div);
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