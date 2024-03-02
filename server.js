const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3001 });

wss.on('connection', (ws) => {
    // Extract the target WebSocket URL from the request (e.g., query parameters)
    const targetWs = new WebSocket("wss://widgetdata.tradingview.com/socket.io/websocket", {
      origin: 'http://localhost'
    });

    // Proxy messages between the client and the target server
    ws.on('message', (message) => {
        targetWs.send(message);
    });

    targetWs.on('message', (message) => {
      const binaryData = Buffer.from(message); // Example binary data
      const text = binaryData.toString('utf8');
        ws.send(text);
    });

    ws.on('close', () => {
        targetWs.close();
    });

    targetWs.on('close', () => {
        ws.close();
    });
});