const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3001 });

var clients = [];

const targetWs = new WebSocket("wss://widgetdata.tradingview.com/socket.io/websocket", {
  origin: 'https://www.tradingview.com'
});

function broadcast(message) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

targetWs.on('message', (message) => {
  const binaryData = Buffer.from(message); // Example binary data
  const text = binaryData.toString('utf8');
  broadcast(text);
});


let connections = 0;
wss.on('connection', (ws) => {
    connections ++;
    console.log("new add ", connections);
    clients.push(ws);
    
    // Proxy messages between the client and the target server
    ws.on('message', (message) => {
        try{
            targetWs.send(message);
        } catch(e) {
            console.error(e);
        }
    });

    ws.on('close', () => {
        clients.splice(clients.indexOf(ws), 1);
        connections --;
        console.log("close one ", connections);
    });
    
});