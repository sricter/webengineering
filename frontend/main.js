const socket = io(); //können wir hier verwenden wegen Zeile in chat.html
const chatBox = document.querySelector('.chat-box'); //id aus chat.html

socket.on('message', message => {
    console.log(message);
    addMessageToDOM(message); //Nachricht an DOM

});

//vielleicht ändern
function addMessageToDOM(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = message;
    chatBox.appendChild(div);
}