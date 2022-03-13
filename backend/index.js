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

//Message storing
const PATH_MESSAGES = "backend/messages.json";
/*var MESSAGES = [];
MESSAGES = JSON.parse(readFileSync(PATH_MESSAGES, {encoding: 'utf-8'}));*/
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
            while(i <= MESSAGES.length){       
                socket.emit('message', MESSAGES[i]); 
                i++;
        }

        //Nachricht an alle verbundenen Clients, dass neuer USer im Chat
        socket.broadcast.emit('message', `${username} ist dem Chat beigetreten`);

        io.emit('connectedUsers', userArray);

        //Wait for sent messages (other users)
        socket.on('chatMessage', chatMessage => {
            //console.log("Chat-Message: " + chatMessage);
            io.emit('message',`${username}: ${chatMessage}`);
            MESSAGES.push(`${username}: ${chatMessage}`);
            writeFileSync(PATH_MESSAGES, JSON.stringify(MESSAGES), { encoding: 'utf8' });
            
        });

        //Still issues because of connection interrupt after changing index.html -> chat.html
        socket.on('disconnect', () => {
            /*if(!(GLOBAL_USERNAME === "")){
                const logofftext = GLOBAL_USERNAME + ' hat den Chat oder die Lobby verlassen!'
                console.log(logofftext);
                io.emit('message', logofftext); //Nachricht an alle verbundenen Clients
            }*/
            io.emit('message', `${username} hat den Chat verlassen`);
            deleteDisconnectedUsersFromArray(userArray, username);
            io.emit('connectedUsers', userArray);
        });
    })

    /*socket.on('username', username => {
        GLOBAL_USERNAME = `${username}(${socket.id})`; //über socket.id eindeutig identifizierbar
        userArray.push(GLOBAL_USERNAME);
        console.log(userArray.map(user=> user));
        const welcomeText = `${username}(${socket.id})` + " joined the chat!";
        console.log(welcomeText);
        io.emit('username', welcomeText); 
    });*/
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`)); //run Server

function deleteDisconnectedUsersFromArray(userArray, username){
    userArray.splice(userArray.indexOf(username),1)
}

//function writeMessageToJson() {  
//}