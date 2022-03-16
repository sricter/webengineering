const socket = io(); //können wir hier verwenden wegen Zeile in chat.html
const chatBox = document.querySelector('.chat-box'); //class aus chat.html
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