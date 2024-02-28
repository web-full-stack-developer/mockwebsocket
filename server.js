const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3000 });
const clients = [];

function broadcast(message) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on("connection", (ws) => {
  console.log("Client connected");
  clients.push(ws);

  // Handle messages from the client
  ws.on("message", (message) => {
    console.log(`Received message: ${typeof JSON.parse(message).data}`);

    // Echo the message back to the client
    broadcast(JSON.parse(message).data);
  });

  // Handle disconnection
  ws.on("close", () => {
    clients.splice(clients.indexOf(ws), 1);
    console.log("Client disconnected");
  });
});
