const chatForm = document.getElementById('chat-form'); //aus chat.html id 'chat-form' verbinden
const socket = io(); //können wir hier verwenden wegen Zeile in chat.html

socket.on('message', message => {
    console.log(message);
    //outputMessage(message); //Nachricht an DOM

    //Focus auf neue Nachricht
    //chatMessages.scrollTop = chatMessages.scrollHeight;
});