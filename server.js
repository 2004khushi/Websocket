import {WebSocketServer} from "ws";

//ws does heavy lifting under teh hood; when u pass a port to ws -> it realises that there's no https server to hijack so it spins up it's own internal nodejs  http server  automatically.
//creates smtg called ZOMBIE HTTP  server that only exist to listen for taht upgrad handshake and onec it sees a valid  websocket connection , it handles the lopgic and hold ts tCP connection open.
//in small project it's fine but in real world prodn we need to attach ws with express or fastapi; ONE PORT 2 PROTOCOLS.

// 0: connecting
// 1: open(only state where u can safely use .send()) === websocket.open
// 2: closing
// 3: closed

//just for the handshake it will create it is own internal http server ->
const wss = new WebSocketServer({ port: 8080 });

//connection event
//socket contains the individual connection with the client and request will have headers like cookies/ip address and etc from upgrade req
wss.on('connection', (socket,request) => {
    const ip = request.socket.remoteAddress;

    socket.on('message', (rawData) => {
        console.log({rawData});

        const data = rawData.toString();

        //get current list of all active sockets
        wss.clients.forEach(client => {
            if(client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(`Server broadcasting...: ${data}`);
            }
        })
    });


    socket.on('error', (err) => {
        console.log(`Error: ${err.message}: ${ip}`);
    });

    socket.on('close', () => {
        console.log(`Client closed!`);
    })

});


console.log('Server started');