const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3000 });
const clients = [];
const pairs = {};

function broadcast(message) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
const s = "~m~";
let rjscount = 0;

function isValidJson(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

function _decode(e) {
  const t = [];
  let n, o;
  do {
    if (e.substring(0, 3) !== s)
      return t;
    n = "",
      o = "";
    const i = (e = e.substring(3)).length;
    for (let t = 0; t < i; t++) {
      if (o = Number(e.substring(t, t + 1)),
        Number(e.substring(t, t + 1)) !== o) {
        e = e.substring(n.length + s.length),
          n = Number(n);
        break
      }
      n += o
    }
    t.push(e.substring(0, n)),
      e = e.substring(n)
  } while ("" !== e);
  return t
}

wss.on("connection", (ws) => {
  console.log("Client connected");
  clients.push(ws);
  ws.send(JSON.stringify(pairs));
  // Handle messages from the client
  ws.on("message", (message) => {
    const data = JSON.parse(message).data;
    rjscount++;
    const t = _decode(data)
    
    // Echo the message back to the client
    if (rjscount < 10) console.log(`Received message: ${t}`);
    if(rjscount == 10) console.log(pairs);



    for (let e = 0; e < t.length; e++) {
      
      if (isValidJson(t[e])) {
        const obj = JSON.parse(t[e]);
        const v = obj.p[1].v;
        
        if (rjscount < 10 && v && v["base-currency-logoid"]) {
          pairs[obj.p[1].n] = {"base-currency-logoid": v["base-currency-logoid"], "currency-logoid": v["currency-logoid"]}          
        }
        if (rjscount < 10 && v && v["logoid"]) {
          pairs[obj.p[1].n] = {"logoid": v["logoid"]}          
        }
        if(rjscount < 10 && v) {
          if(pairs[obj.p[1].n]) {
            pairs[obj.p[1].n] = {...pairs[obj.p[1].n], lp: v["lp"], chp: v["chp"], ch: v["ch"]}
          } else {
            pairs[obj.p[1].n] = {lp: v["lp"], chp: v["chp"], ch: v["ch"]}
          }
          
        }
      }
    }
    broadcast(data);
  });

  // Handle disconnection
  ws.on("close", () => {
    clients.splice(clients.indexOf(ws), 1);
    console.log("Client disconnected");
  });
});
