const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3001 });

let connections = 0;
wss.on('connection', (ws) => {
    connections ++;
    console.log("new add ", connections);
    // Extract the target WebSocket URL from the request (e.g., query parameters)
    const targetWs = new WebSocket("wss://widgetdata.tradingview.com/socket.io/websocket", {
      origin: 'https://www.tradingview.com'
    });

    // Proxy messages between the client and the target server
    ws.on('message', (message) => {
        try{
            targetWs.send(message);
        } catch(e) {
            console.error(e);
        }
    });

    targetWs.on('message', (message) => {
      const binaryData = Buffer.from(message); // Example binary data
      const text = binaryData.toString('utf8');
      try {
        ws.send(text);
      } catch(e) {
        console.error(e);
      }
      
    });

    ws.on('close', () => {
        targetWs.close();
        connections --;
        console.log("close one ", connections);
    });

    targetWs.on('close', () => {
        ws.close();
    });
});