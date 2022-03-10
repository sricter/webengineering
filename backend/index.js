const path = require('path'); 
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

// Server
const app = express();
const server = http.createServer(app);
const io = socketio(server); //Socketio für Server verwenden
var globalUsername = '';


//Ordner als Standard setzen -> mit __dirname aktuelles Verzeichnis
app.use(express.static(path.join(__dirname, '../frontend'))); 

io.on('connection', socket =>{

    //Nachricht an neu verbundenen Clients
    socket.emit('message', 'Welcome to DHBW Chat'); 

    socket.on('username', username => {
        globalUsername = username;
        const welcomeText = username + " joined the chat!";
        console.log(welcomeText);
        io.emit('username', welcomeText);
    });

    //Nachricht an alle verbundenen Clients, dass neuer USer im Chat
    //socket.broadcast.emit('message', 'Neuer User im Chat');

    //Wait for sent messages (other users)
    socket.on('chatMessage', chatMessage => {
        console.log("Chat-Message: " + chatMessage);
        io.emit('message', chatMessage);
    });

    //Still issues because of connection interrupt after changing index.html -> chat.html
    socket.on('disconnect', () => {
        if(!(globalUsername === "")){
            const logofftext = globalUsername + ' hat den Chat verlassen!'
            console.log(logofftext);
            io.emit('message', logofftext); //Nachricht an alle verbundenen Clients
        }
    });
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`)); //run Server

function writeMessageToJson() {
    
}