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
    console.log('neue Connection');

    //Nachricht an neu verbundenen Clien
    socket.emit('message', 'Willkommen im Chat'); 

    //Nachricht an alle verbundenen Clients, dass neuer USer im Chat
    socket.broadcast.emit('message', 'Neuer User im Chat');

    socket.on('disconnect', () => {

        io.emit('message', 'User hat Chat den verlassen'); //Nachricht an alle verbundenen Clients
        
    })
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`)); //run Server