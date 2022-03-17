const path = require('path'); 
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const {writeFileSync, readFileSync, existsSync } = require('fs');

// Server
const app = express();
const server = http.createServer(app);
const io = socketio(server); //Socketio für Server verwenden

//var GLOBAL_USERNAME = '';
const userArray = [];
const typingArray = [];

//Message storing
const PATH_MESSAGES = "backend/messages.json";
/*MESSAGES = JSON.parse(readFileSync(PATH_MESSAGES, {encoding: 'utf-8'}));*/
const MESSAGES = existsSync(PATH_MESSAGES) ? JSON.parse(readFileSync(PATH_MESSAGES, {
    encoding: 'utf-8'
})) : [];
//console.log("Stored messages: " + MESSAGES);

//Ordner als Standard setzen -> mit __dirname aktuelles Verzeichnis
app.use(express.static(path.join(__dirname, '../frontend'))); 

io.on('connection', socket =>{

    socket.on('sendUsername', GLOBAL_USERNAME =>{
        const username = `${GLOBAL_USERNAME}(${socket.id})`;
        userArray.push(username);
        
        //Nachricht an neu verbundenen Clients
        socket.emit('message', 'Welcome to DHBW Chat'); 
            let i = 0;
            while(i <= MESSAGES.length-1){  //brauchen hier ein -1 sonst ein leeres div     
                socket.emit('message', MESSAGES[i]); 
                i++;
        }

        //Nachricht an alle verbundenen Clients, dass neuer USer im Chat
        socket.broadcast.emit('message', `${username} ist dem Chat beigetreten`);

        io.emit('connectedUsers', userArray);

        //Wait for sent messages (other users)
        socket.on('chatMessage', chatMessage => {
            //console.log("Chat-Message: " + chatMessage);
            socket.broadcast.emit('message', username + '<br/>' + chatMessage);
            MESSAGES.push(username + '<br/>' + chatMessage);
            writeFileSync(PATH_MESSAGES, JSON.stringify(MESSAGES), { encoding: 'utf8' }); 
        });

        //Still issues because of connection interrupt after changing index.html -> chat.html
        socket.on('disconnect', () => {
            io.emit('message', `${username} hat den Chat verlassen`);
            deleteDisconnectedUsersFromArray(userArray, username);
            io.emit('connectedUsers', userArray);
        });
    })

    //Tipp-Status
    socket.on('sendTypingStatus', GLOBAL_USERNAME =>{
        const typingUser = GLOBAL_USERNAME;
        typingArray.push(typingUser);
        io.emit('typingUsers', typingArray);
        socket.on('typingStop', () => {
            deleteNotTypingUsers(typingArray, typingUser);
            io.emit('typingUsers', typingArray);
        })
    })
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`)); //run Server

function deleteDisconnectedUsersFromArray(userArray, username){
    userArray.splice(userArray.indexOf(username),1)
}

function deleteNotTypingUsers(typingArray, typingUser){
    typingArray.splice(typingArray.indexOf(typingUser),1)
}