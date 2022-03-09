const path = require('path'); 
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

// Server
const app = express();
const server = http.createServer(app);
const io = socketio(server); //Socketio für Server verwenden

//Ordner als Standard setzen -> mit __dirname aktuelles Verzeichnis
app.use(express.static(path.join(__dirname, 'frontend'))); 

io.on('connection', socket =>{

    //Nachricht an neu verbundenen Clients
    socket.emit('message', 'Welcome to DHBW Chat'); 

    socket.on('username', username => {
        console.log(username + " joined the chat!");
        const welcomeText = username + " joined the chat!";
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
        console.log('User hat den Chat verlassen');
        io.emit('message', 'User hat den Chat verlassen'); //Nachricht an alle verbundenen Clients
        
    })
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`)); //run Server