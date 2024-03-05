const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3001 });

var clients = [[], [], [], []];
var initMsg = ["", "", "", ""];
var targetWs = [];
targetWs[0] = new WebSocket("wss://widgetdata.tradingview.com/socket.io/websocket?from=embed-widget%2Fmarket-overview%2F&date=2024_03_01-10_50&page-uri=www.tradingview.com%2Fwidget-wizard%2Fen%2Flight%2Fmarket-overview%2F", {
	origin: 'https://www.tradingview.com'
});
targetWs[1] = new WebSocket("wss://widgetdata.tradingview.com/socket.io/websocket?from=embed-widget%2Fticker-tape%2F&date=2024_03_01-10_50&page-uri=www.tradingview.com%2Fwidget-wizard%2Fen%2Flight%2Fticker-tape%2F", {
	origin: 'https://www.tradingview.com'
});
targetWs[2] = new WebSocket("wss://widgetdata.tradingview.com/socket.io/websocket?from=embed-widget%2Fsingle-quote%2F&date=2024_03_01-10_50&page-uri=www.tradingview.com%2Fwidget-wizard%2Fen%2Flight%2Fsingle-ticker%2F", {
	origin: 'https://www.tradingview.com'
});
targetWs[3] = new WebSocket("wss://widgetdata.tradingview.com/socket.io/websocket?from=embed-widget%2Fadvanced-chart%2F&date=2024_03_01-10_50&page-uri=www.tradingview.com%2Fwidget-wizard%2Fen%2Flight%2Fadvanced-chart%2F", {
	origin: 'https://www.tradingview.com'
});

function broadcast(id, message) {
	console.log(id);
	clients[id].forEach((client) => {
		if (client.readyState === WebSocket.OPEN) {
			client.send(message);
		}
	});
}

targetWs[0].on('message', (message) => {
	const binaryData = Buffer.from(message); // Example binary data
	const text = binaryData.toString('utf8');

	if(!initMsg[0]) {
		initMsg[0] = text;
		console.log(text);
	}

	broadcast(0, text);
});
targetWs[1].on('message', (message) => {
	const binaryData = Buffer.from(message); // Example binary data
	const text = binaryData.toString('utf8');
	if(!initMsg[1]) {
		initMsg[1] = text;
		console.log(text);
	}
	broadcast(1, text);
});
targetWs[2].on('message', (message) => {
	const binaryData = Buffer.from(message); // Example binary data
	const text = binaryData.toString('utf8');
	if(!initMsg[2]) {
		initMsg[2] = text;
		console.log(text);
	}
	broadcast(2, text);
});
targetWs[3].on('message', (message) => {
	const binaryData = Buffer.from(message); // Example binary data
	const text = binaryData.toString('utf8');
	if(!initMsg[3]) {
		initMsg[3] = text;
		console.log(text);
	}
	broadcast(3, text);
});


let connections = 0;
wss.on('connection', (ws, req) => {
	
	var id = -1;
	if (req.url.indexOf("watchlists.html") > -1) {
		id = 0;
	}
	if (req.url.indexOf("tickers.html") > -1) {
		id = 1;
	}
	if (req.url.indexOf("singleticker.html") > -1) {
		id = 2;
	}
	if (req.url.indexOf("chart.html") > -1) {
		id = 3;
	}
	if(id == -1) return;
	console.log(req.url);
	connections++;
	console.log("new add ", id, " ", connections);
	if(initMsg[id]) {
		if (ws.readyState === WebSocket.OPEN) {
			ws.send(initMsg[id]); 
			console.log("sent1");
		}
	}else {
		if(ws.readyState == WebSocket.OPEN) {
			ws.send('~m~346~m~{"session_id":"<0.4949.2378>_dal-charts-5-wgt-webchart-4@dal-compute-5","timestamp":1709512185,"timestampMs":1709512185140,"release":"registry.xtools.tv/tvbs_release/webchart:release_207-48","studies_metadata_hash":"0f1da59be5cb3ebc5873b524e394cf0792c5339d","auth_scheme_vsn":2,"protocol":"json","via":"209.58.153.118:443","javastudies":["3.64"]}');
			console.log("sent2");
		}
	}
	clients[id].push(ws);

	// Proxy messages between the client and the target server
	ws.on('message', (message) => {
		try {
			if(targetWs[id].readyState == WebSocket.OPEN) {
				targetWs[id].send(message);
			}
		} catch (e) {
			console.error(e);
		}
	});

	ws.on('close', () => {
		clients[id].splice(clients[id].indexOf(ws), 1);
		connections--;
		console.log("close one ", id, " ", connections);
	});

});
