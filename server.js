const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3000 });
const clients = [];
const logos = {}, pairs = {};

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
  ws.send(JSON.stringify({type: "logos", logos}));
  ws.send(JSON.stringify({type: "pairs", pairs}));
  // Handle messages from the client
  ws.on("message", (message) => {
    const data = JSON.parse(message).data;
    rjscount++;
    const t = _decode(data)
    
    // Echo the message back to the client
    // if (rjscount < 10) console.log(`Received message: ${t}`);
    if(rjscount == 10) console.log(logos, pairs);
    for (let e = 0; e < t.length; e++) {
      if (isValidJson(t[e])) {
        const obj = JSON.parse(t[e]);
        if(obj.p && obj.p.length >= 2) {
          const v = obj.p[1].v;
          const key = obj.p[1].n;

          if (key && v && v["base-currency-logoid"]) {
            logos[key] = {"base-currency-logoid": v["base-currency-logoid"], "currency-logoid": v["currency-logoid"]}          
          }
          if(key && v && v["logoid"]) {
            logos[key] = {"logoid": v["logoid"]}          
          }
          if(key && !pairs[key]) pairs[key] = {};
          if(key && v && v["lp"]) {
            pairs[key] = {...pairs[key], lp: v["lp"]};
          }
          if(key && v && v["ch"]) {
            pairs[key] = {...pairs[key], ch: v["ch"]};
          }
          if(key && v && v["chp"]) {
            pairs[key] = {...pairs[key], chp: v["chp"]};
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
