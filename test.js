const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');
const path = require('path');



// Load SSL cert and key
const server = https.createServer({
    key: fs.readFileSync('C:/Certs/websocket/websocketpointer.duckdns.org-key.pem'),
    cert: fs.readFileSync('C:/Certs/websocket/websocketpointer.duckdns.org-chain.pem'),
    passphrase: fs.readFileSync("C:/Certs/websocket/authkey.txt", "utf8").trim()
  });

// Create WebSocket server attached to HTTPS server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  console.log('New client connected from', req.socket.remoteAddress);

  ws.on('message', (message) => {
    console.log('Received:', message.toString());
    ws.send(`Echo: ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.on('error', (err) => {
    log('HTTPS Server error', err);
  });
  
  // HTTP request handler (optional, debug incoming HTTPS traffic)
  server.on('request', (req, res) => {
    log(`Incoming HTTPS request`, {
      method: req.method,
      url: req.url,
      headers: req.headers
    });
    res.writeHead(200);
    res.end('WebSocket server is up\n');
  });
  
  // WebSocket-level error debug
  wss.on('error', (err) => {
    log('WebSocket Server error', err);
  });

// Start listening on port 4000
server.listen(4000, () => {
  console.log('🔒 HTTPS/WebSocket server listening on port 4000');
});