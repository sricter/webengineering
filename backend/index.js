// import modules 
const path = require('path'); 
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const {writeFileSync, readFileSync, existsSync } = require('fs');

// Server Variablen definieren
const app = express();
const server = http.createServer(app);
const io = socketio(server); //Socketio für Server verwenden
const PORT = 3000;

//Array für aktive User und typing indicator
const userArray = [];
const typingArray = [];

//Message storing
const PATH_MESSAGES = "backend/messages.json";
// Nachrichten aus JSON File lesen und in Array kopieren
/*MESSAGES = JSON.parse(readFileSync(PATH_MESSAGES, {encoding: 'utf-8'}));*/
const MESSAGES = existsSync(PATH_MESSAGES) ? JSON.parse(readFileSync(PATH_MESSAGES, {
    encoding: 'utf-8'
})) : [];
//console.log("Stored messages: " + MESSAGES);

//Ordner als Standard setzen -> mit __dirname aktuelles Verzeichnis
//Info: run from backend/index.js
app.use(express.static(path.join(__dirname, '../frontend'))); 

// Gilt für neue Verbindung (Client)
io.on('connection', socket =>{

    //Neuer Username wird vom Client übermittelt
    socket.on('sendUsername', GLOBAL_USERNAME =>{
        //Eineindeutigkeit der User über Sockt ID 
        const username = `${GLOBAL_USERNAME}(${socket.id})`;
        userArray.push(username); //Hinzufügen zum User Array
        
        //Nachricht an neu verbundenen Clients
        socket.emit('message', 'Welcome to DHBW Chat'); 
            // Nachrichten aus Nachrichten Array werden an Client übermittelt
            let i = 0;
            while(i <= MESSAGES.length-1){  //brauchen hier ein -1 sonst ein leeres div     
                socket.emit('message', MESSAGES[i]); 
                i++;
        }

        //Nachricht an alle verbundenen Clients, dass neuer User im Chat
        socket.broadcast.emit('message', `${username} ist dem Chat beigetreten`);

        //Verbundenen User an Client übermitteln
        io.emit('connectedUsers', userArray);

        //Wait for sent messages (other users)
        socket.on('chatMessage', chatMessage => {
            //console.log("Chat-Message: " + chatMessage); //Debug
            //Nachticht an alle Teilnehmer übermitteln (Nicht an Sender)
            socket.broadcast.emit('message', username + '<br/>' + chatMessage);
            //Neue Nachricht zu Message Array hinzufügen
            MESSAGES.push(username + '<br/>' + chatMessage);
            //Aktualisiertes Array (Nachrichten) in JSON Datei sichern
            writeFileSync(PATH_MESSAGES, JSON.stringify(MESSAGES), { encoding: 'utf8' }); 
        });

        //Bei Disconnect eines Users User aus Userliste entfernen und Info an andere Teilnehmer geben
        socket.on('disconnect', () => {
            io.emit('message', `${username} hat den Chat verlassen`);
            deleteDisconnectedUsersFromArray(userArray, username);
            io.emit('connectedUsers', userArray);
        });
    })

    //Tipp-Status aktualisieren
    socket.on('sendTypingStatus', GLOBAL_USERNAME =>{
        const typingUser = GLOBAL_USERNAME;
        // Doppelte Einträge vermeiden
        var checkIncluded = typingArray.includes(typingUser);
        if (!checkIncluded){
            typingArray.push(typingUser);
        }
        io.emit('typingUsers', typingArray);
    })
    //Tipp-Status loeschen
    socket.on('typingStop', GLOBAL_USERNAME => {
        const typingUser = GLOBAL_USERNAME;
        deleteNotTypingUsers(typingArray, typingUser);
        io.emit('typingUsers', typingArray);
    })
});

//run Server
server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`)); 

function deleteDisconnectedUsersFromArray(userArray, username){
    userArray.splice(userArray.indexOf(username),1)
}

function deleteNotTypingUsers(typingArray, typingUser){
    typingArray.splice(typingArray.indexOf(typingUser),1)
}