"use strict";

const express = require("express");
const app = express();
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");
const SAT = require("sat");
const { setTimeout } = require("timers");
const WebSocket = require("ws");
const cors = require("cors");

const options = {
  key: fs.readFileSync(
    "C:/Certs/websocket/websocketpointer.duckdns.org-key.pem"
  ),
  cert: fs.readFileSync(
    "C:/Certs/websocket/websocketpointer.duckdns.org-chain.pem"
  ),
  passphrase: fs.readFileSync("C:/Certs/websocket/authkey.txt", "utf8").trim(),
};

const httpServer = http.createServer();
const serverHttps = https.createServer(options);

const wss = new WebSocket.Server({ noServer: true });

function handleUpgrade(server, name) {
  server.on("upgrade", (req, socket, head) => {
    console.log(`[${name}] Upgrade request from`, req.socket.remoteAddress);

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });
}

function getAdjacentRoomKeys(roomkey, range = 1000) {
  var structRooms = [];
  var returnKeys = [];

  var buildDistance = (range - (range % 1000)) / 1000;

  for (let i = 0; i < 10; i++) {
    structRooms.push([]);
    for (let c = 0; c < 10; c++) {
      structRooms[i].push(`${i * 10 + c}`);
    }
  }
  var indexI = (parseInt(roomkey) - (parseInt(roomkey) % 10)) / 10;
  //console.log(indexI)
  var indexC = parseInt(roomkey) % 10;

  const rows = structRooms.length;
  const cols = structRooms[indexI]?.length || 0;

  for (let i = -buildDistance; i <= buildDistance; i++) {
    for (let j = -buildDistance; j <= buildDistance; j++) {
      if (i === 0 && j === 0) continue; // Skip the center element itself
      const newRow = indexI + i;
      const newCol = indexC + j;
      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
        returnKeys.push(structRooms[newRow][newCol]);
      }
    }
  }
  return returnKeys;
}

function getRoomAndBounding(x, y) {
  let room_ = null;
  for (const roomkey in food_squares) {
    var room = food_squares[roomkey];
    if (
      x >= room.bounds?.x1 &&
      x <= room.bounds?.x2 &&
      y >= room.bounds?.y1 &&
      y <= room.bounds?.y2
    ) {
      room_ = roomkey;
    }
  }
  var baseItems = [...food_squares[room_]?.items] || [];
  room_ ??= "0";
  var otherRooms = getAdjacentRoomKeys(room_);
  otherRooms.forEach((_room_) => {
    baseItems.push(...food_squares[_room_].items);
  });
  return { items: baseItems };
}

handleUpgrade(httpServer, "HTTP");
handleUpgrade(serverHttps, "HTTPS");

const helmet = require("helmet");
const protobuf = require("protobufjs");
const { connect } = require("http2");

const schema = `
syntax = "proto3";

message GameObject {
  float angle = 1;
  string color = 2; 
  int32 health = 3;
  int32 maxhealth = 4;
  float size = 5;
  string type = 6;
  float weight = 7;
  float x = 8;
  float y = 9;
  float transparency = 10; 
  double randomID = 11;
}

message GameObjectList {
  repeated GameObject objects = 1;
}
`;

async function runProtobufExample() {
  const root = await protobuf.parse(schema).root;
  const GameObject = root.lookupType("GameObject");

  const gameObject = {
    angle: 294,
    color: "Gold",
    health: 10,
    maxhealth: 10,
    size: 50,
    type: "square",
    weight: 3,
    x: 4535.7837601949805,
    y: -4492.806481930626,
    transparency: 0.8,
    randomID: 34985984385.6,
  };

  // Encode the data into Protobuf (binary format)
  const buffer = GameObject.encode(gameObject).finish();
}

runProtobufExample();

app.use(helmet.noSniff());

app.use(
  helmet.hsts({
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true, // Apply to all subdomains
    preload: true, // Allow preloading in browsers
  })
);

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // Only allow content from the same origin
      scriptSrc: [
        "'self'",
        "https://cdn.jsdelivr.net/npm/protobufjs@7.4.0/dist/light/protobuf.min.js",
        "'unsafe-eval'",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://fonts.gstatic.com",
        "https://multiplication-golf.containers.piwik.pro",
        "https://sdk.crazygames.com"
      ],
      imgSrc: ["'self'", ],
      connectSrc: [
        "'self'",
        "ws://127.0.0.1:4000",
        "wss://127.0.0.1:4000",
        "wss://websocketpointer.duckdns.org:443",
        "wss://deip-io3.glitch.me/",
      ], // Restrict fetch/XHR/WebSockets
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
      "unsafe-eval": [
        "https://cdnjs.cloudflare.com/ajax/libs/protobufjs/7.2.5/protobuf.min.js",
      ],
    },
  })
);

app.use(helmet.frameguard({ action: 'deny' }));

app.use(express.static(path.join(__dirname, "public")));

/*
 * documention is needed for each of these arrays/objects
 * An example object should be provided
 */

const skinAllowlist = [
  "1.webp",
  "2.webp",
  "3.webp",
  "4.webp",
  "5.webp",
  "6.webp",
  "7.webp",
  "8.webp",
  "9.webp",
  "10.webp",
  "0.webp",
];

function assignRooms(item) {
  let found = false;
  var thisroom = {};
  try {
    for (const roomkey in food_squares) {
      var room = food_squares[roomkey];
      //console.log(room.bounds)
      if (
        item.x >= room.bounds?.x1 &&
        item.x <= room.bounds?.x2 &&
        item.y >= room.bounds?.y1 &&
        item.y <= room.bounds?.y2
      ) {
        thisroom = room;
      }
    }
    thisroom.items.push(item);
  } catch {
    console.log("room", room, item.x, item.y);
  }
}

function getRoom(x, y) {
  let thisroom = null;
  for (const roomkey in food_squares) {
    var room = food_squares[roomkey];
    if (
      x >= room.bounds?.x1 &&
      x <= room.bounds?.x2 &&
      y >= room.bounds?.y1 &&
      y <= room.bounds?.y2
    ) {
      thisroom = room;
    }
  }
  return thisroom;
}

function getKeyRoom(x, y) {
  let thisroom = null;
  for (const roomkey in food_squares) {
    var room = food_squares[roomkey];

    if (
      x >= room.bounds?.x1 &&
      x <= room.bounds?.x2 &&
      y >= room.bounds?.y1 &&
      y <= room.bounds?.y2
    ) {
      thisroom = roomkey;
    }
  }
  return thisroom;
}

function reassignRoom(item, room) {
  let found = false;
  var thisroom = {};
  for (const roomkey in food_squares) {
    var room = food_squares[roomkey];
    if (
      item.x >= room.bounds?.x1 &&
      item.x <= room.bounds?.x2 &&
      item.y >= room.bounds?.y1 &&
      item.y <= room.bounds?.y2
    ) {
      thisroom = room;
    }
  }
  thisroom?.items?.push(item);
}

let players = {};
/**/

let bullets = [];
/**/

let food_squares = {};
/**/

let cors_taken = [];
/**/

let leader_board = { shown: [], hidden: [] };
/**/

let autocannons = [];
/**/

let badIP = {};
/**/

let IPs = [];
/**/

let bullet_intervals = [];
/**/

let hidden_broswers = [];
/**/

let messages = [];
/**/

let teamlist = [];
/**/

let teamKeys = [];
/**/

let bosses = [];
/**/

let userbase = [];
/**/

let deadplayers = [];
/**/

let announcements = [];
/**/

let roads = [];
/**/

let roadsectors = [];
/**/

let JoinRequests = [];
/**/

let PendingJoinRequests = [];
/**/

let buildMiniMapTeams = [];
/**/

let explosions = [];
/**/

/* warning very senstive*/
let purge_limit = 5;

let frame = 0;

var levels = {};
fs.readFile("data/levelData.json", function (err, data) {
  levels = JSON.parse(data).levelData;
  console.log(levels);
});

const sqrt23 = Math.sqrt(3);
const pi = Math.PI;
const pi180 = pi / 180;
const sqrt3 = Math.sqrt(3);
const piby2 = -pi / 2;
var response = new SAT.Response();

fs.readFile("data/users.json", function (err, data) {
  if (err) throw err;
  data = JSON.parse(data);
  userbase = data.userbase;
  console.log(userbase);
});

// don't touch pls
const CONFIG = {
  levelMultiplyer: 1.2,
  updateInterval: 75,
  numberOfFoodItems: { low: 400, high: 500 },
  numberOfPentagons: { low: 50, high: 75 },
  rotationSpeed: { triangleSquare: 0.5, pentagon: 0.25, bosses: 0.01 },
  precision: 0.001,
  baseFireInterval: 750,
  scaleUp: 0.008,
  droneRange: 2.5,
  playerBaseSize: 40,
  bossLookUpRange: 1300,
  playerPlayerSightRange: 5000,
  playerItemSightRange: 1300,
  fadeRate: 150,
  deathTime: 200,
  itemCollisionRangeMultiplyer: 1.5,
  playerCollisionRangeMultiplyer: 2,
  roadMaxConectLength: 300,
  map: {
    size: 5000,
    innersize: 4500,
    x: 0,
    y: 0,
    boundRange: 50,
    buildSize: 1000,
  },
  badgeLevels: [
    { minScore: 50000000, maxScore: null, badge: "/badges/10.webp" },
    { minScore: 25000000, maxScore: 49999999, badge: "/badges/9.webp" },
    { minScore: 10000000, maxScore: 24999999, badge: "/badges/8.webp" },
    { minScore: 5000000, maxScore: 9999999, badge: "/badges/7.webp" },
    { minScore: 2500000, maxScore: 4999999, badge: "/badges/6.webp" },
    { minScore: 1000000, maxScore: 2499999, badge: "/badges/5.webp" },
    { minScore: 500000, maxScore: 999999, badge: "/badges/4.webp" },
    { minScore: 250000, maxScore: 499999, badge: "/badges/3.webp" },
    { minScore: 100000, maxScore: 249999, badge: "/badges/2.webp" },
    { minScore: 0, maxScore: 99999, badge: "/badges/1.webp" },
  ],
  colorUpgardes: [
    "#f54242",
    "#fa8050",
    "#fab350",
    "#fcf25b",
    "#57f75c",
    "#42fcf6",
    "#5181fc",
    "#5c14f7",
  ],
  colorTeamUpgardes: [
    "#f54242f1",
    "#fa8050f1",
    "#fab350f1",
    "#fcf25bf1",
    "#57f75cf1",
    "#42fcf6f1",
    "#5181fcf1",
    "#5c14f7f1",
  ],
  colorGradeint: { radius: 60, build: { 0: 0.0, 1: 0.4, 2: 1 } },
  govermentTypes: ["Anarchy", "Democracy", "Communist", "Constitutional"],
  default: "Anarchy",
  canVote: ["Democracy", "Constitutional"],
  PayesSelfTaxes: ["Anarchy", "Democracy", "Constitutional"],
  PayesSelfStrictTaxes: ["Democracy", "Constitutional"],
  powers: {
    Anarchy: {
      canKick: true,
      canTakeScore: false,
      supportsCoOwners: false,
      canChangeConstitution: undefined,
      canDedicatePower: false,
      lowerlevelpowers: undefined,
      canDededicatePower: false,
    },
    Democracy: {
      canKick: null,
      canTakeScore: true,
      supportsCoOwners: { Samelevel: false, Lowerlevel: true },
      canChangeConstitution: undefined,
      canDedicatePower: true,
      lowerlevelpowers: {
        canDedicatePower: true,
        canKick: false,
        canTakeScore: false,
        canDededicatePower: false,
      },
      canDededicatePower: false,
    },
    Communist: {
      canKick: true,
      canTakeScore: true,
      supportsCoOwners: { Samelevel: true, Lowerlevel: true },
      canChangeConstitution: undefined,
      canDedicatePower: true,
      lowerlevelpowers: {
        canDedicatePower: false,
        canKick: false,
        canTakeScore: { can: true, limit: 5000 },
        canDededicatePower: true,
      },
      canDededicatePower: true,
    },
    Constitutional: {
      canKick: { definedPower: null },
      canTakeScore: { definedPower: null },
      supportsCoOwners: { Samelevel: false, Lowerlevel: false },
      canChangeConstitution: { definedPower: null },
      canDedicatePower: true,
      lowerlevelpowers: {
        canDedicatePower: false,
        canKick: false,
        canTakeScore: false,
        canDededicatePower: false,
      },
      canDededicatePower: false,
    },
  },
};

let currentx = -CONFIG.map.size;
let currenty = -CONFIG.map.size;

let k = 0;

for (let i = 0; i < 10; i++) {
  for (let e = 0; e < 10; e++) {
    let room = {
      bounds: {
        x1: currentx,
        x2: currentx + CONFIG.map.buildSize,
        y1: currenty,
        y2: currenty + CONFIG.map.buildSize,
      },
      items: [],
    };
    food_squares[k.toString()] = room;
    currentx += CONFIG.map.buildSize;
    k++;
  }
  currentx = -CONFIG.map.size;
  currenty += CONFIG.map.buildSize;
}

food_squares.assignRoom = (item) => {
  assignRooms(item);
};

Object.freeze(CONFIG);

console.log(getAdjacentRoomKeys("35"));

const tankmeta = {
  basic: {
    "size-m": 1,
    "speed-m": 1,
    "damage-m": 1,
    "health-m": 1,
    "regen-m": 1,
    fov: 0,
    "BodyDamage-m": 1,
    "reaload-m": 1,
    upgrades: {
      twin: { img: 1, level: 15 },
      flank: { img: 2, level: 15 },
      sniper: { img: 3, level: 15 },
      "mechiane gun": { img: 4, level: 15 },
      spreader: { img: 5, level: 15 },
      rammer: { img: 6, level: 15 },
      traper: { img: 7, level: 15 },
      directer: { img: 8, level: 15 },
      autobasic: { img: 9, level: 15 },
      autoduo: { img: 10, level: 15 },
      autoShooter: { img: 11, level: 30 },
      rocketer: { img: 12, level: 30 },
      smasher: { img: 13, level: 30 },
      paver: { img: 14, level: 30 },
    },
    cannons: [
      {
        type: "basicCannon",
        "cannon-width": 90,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 1,
        bulletSpeed: 0.9,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 1,
      },
    ],
  },
  twin: {
    "size-m": 1,
    "speed-m": 0.95,
    "damage-m": 1,
    "health-m": 1,
    fov: 0,
    "BodyDamage-m": 1,
    "regen-m": 1,
    "reaload-m": 1.3,
    upgradeLevel: 30,
    upgrades: ["twin", "sniper"],
    cannons: [
      {
        type: "basicCannon",
        "cannon-width": 90,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": -20,
        "offset-angle": 0,
        bulletSize: 1,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 0.9,
      },
      {
        type: "basicCannon",
        "cannon-width": 90,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": 20,
        "offset-angle": 0,
        bulletSize: 1,
        bulletSpeed: 0.5,
        delay: 0.5,
        reloadM: 1,
        bullet_pentration: 0.9,
      },
    ],
  },
  flank: {
    "size-m": 1,
    "speed-m": 0.98,
    "damage-m": 1,
    "health-m": 1,
    "regen-m": 1,
    fov: 0,
    "BodyDamage-m": 1.1,
    "reaload-m": 1.2,
    upgradeLevel: 30,
    upgrades: ["twin", "sniper"],
    cannons: [
      {
        type: "basicCannon",
        "cannon-width": 90,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 1,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 0.8,
      },
      {
        type: "basicCannon",
        "cannon-width": 70,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 3.14159,
        bulletSize: 1,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 0.8,
      },
    ],
  },
  sniper: {
    "size-m": 1.05,
    "speed-m": 0.9,
    "damage-m": 1,
    "health-m": 0.95,
    fov: 0.2,
    "BodyDamage-m": 1,
    "regen-m": 1,
    "reaload-m": 1.5,
    upgrades: {},
    cannons: [
      {
        type: "basicCannon",
        "cannon-width": 120,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 1,
        bulletSpeed: 1.5,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 1.6,
      },
    ],
  },
  "mechiane gun": {
    "size-m": 1.05,
    "speed-m": 1,
    "damage-m": 1,
    "health-m": 1,
    fov: -0.01,
    "BodyDamage-m": 1,
    "reaload-m": 0.75,
    "regen-m": 1,
    upgradeLevel: 30,
    upgrades: {
      twin: 1,
      sniper: 2,
      flank: 3,
      "mechiane gun": 4,
    },
    cannons: [
      {
        type: "trapezoid",
        "cannon-width-top": 70,
        "cannon-height": 50,
        "cannon-width-bottom": 40,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 1.05,
        bulletSpeed: 1,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 0.9,
      },
    ],
  },
  spreader: {
    "size-m": 1.05,
    "speed-m": 1.5,
    "damage-m": 0.9,
    "health-m": 1.1,
    fov: 0,
    "BodyDamage-m": 1,
    "reaload-m": 0.8,
    "regen-m": 1,
    upgradeLevel: 30,
    upgrades: {
      twin: 1,
      sniper: 2,
      flank: 3,
      "mechiane gun": 4,
    },
    cannons: [
      {
        type: "trapezoid",
        "cannon-width-top": 55,
        "cannon-height": 40,
        "cannon-width-bottom": 50,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 1.05,
        bulletSpeed: 0.9,
        delay: 0.1,
        reloadM: 1,
        bullet_pentration: 0.9,
      },
      {
        type: "basicCannon",
        "cannon-width": 75,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 1,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 1,
      },
    ],
  },
  rammer: {
    "size-m": 1,
    "speed-m": 1.2,
    "damage-m": 1,
    "health-m": 1,
    fov: 0,
    "BodyDamage-m": 1,
    "reaload-m": 0.7,
    "regen-m": 1,
    upgrades: {},
    cannons: [
      {
        type: "basicCannon",
        "cannon-width": 90,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": -0.785398,
        bulletSize: 1,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 0.9,
      },
      {
        type: "basicCannon",
        "cannon-width": 90,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0.785398,
        bulletSize: 1,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 0.9,
      },
    ],
  },
  traper: {
    "size-m": 1,
    "speed-m": 0.95,
    "damage-m": 1,
    fov: 0,
    "health-m": 0.95,
    "BodyDamage-m": 1,
    "regen-m": 1.1,
    "max-traps": 10,
    "reaload-m": 1.5,
    upgrades: {},
    cannons: [
      {
        type: "trap",
        "cannon-width": 70,
        "cannon-height": 30,
        "trap-to-cannon-ratio": 0.8,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 1,
        bulletSpeed: 1.5,
        delay: 0,
        reloadM: 1,
        "life-time": 10,
        bullet_pentration: 1.6,
      },
    ],
  },
  directer: {
    "size-m": 1,
    "speed-m": 1.05,
    "damage-m": 1,
    "health-m": 0.9,
    "regen-m": 1,
    fov: 0, // change later when fov is working
    "BodyDamage-m": 1,
    "reaload-m": 1.5,
    upgrades: {},
    cannons: [
      {
        type: "directer",
        "cannon-width-top": 70,
        "cannon-height": 25,
        "cannon-width-bottom": 50,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 1,
        bulletSpeed: 0.5,
        "max-drones": 6,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 1,
      },
    ],
  },
  autobasic: {
    "size-m": 1,
    "speed-m": 1,
    "damage-m": 1,
    "health-m": 1,
    "regen-m": 1,
    fov: 0,
    "BodyDamage-m": 1,
    "reaload-m": 1,
    upgrades: {},
    cannons: [
      {
        type: "basicCannon",
        "cannon-width": 90,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 1,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 1,
      },
      {
        type: "autoCannon",
        "cannon-width": 35,
        "cannon-height": 15,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 0.8,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1.5,
        bullet_pentration: 0.9,
      },
    ],
  },
  autoduo: {
    "size-m": 1,
    "speed-m": 1,
    "damage-m": 1,
    "health-m": 1,
    "regen-m": 1,
    fov: 0,
    AutoRoting: true,
    "BodyDamage-m": 1,
    "reaload-m": 1,
    upgrades: {},
    cannons: [
      {
        type: "SwivelAutoCannon",
        "cannon-width": 35,
        "cannon-height": 15,
        "offSet-x": "playerX",
        "offSet-x-multpliyer": -1,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 0.8,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1.5,
        bullet_pentration: 0.9,
      },
      {
        type: "SwivelAutoCannon",
        "cannon-width": 35,
        "cannon-height": 15,
        "offSet-x": "playerX",
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 0.8,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1.5,
        bullet_pentration: 0.9,
      },
    ],
  },
  autoShooter: {
    "size-m": 1,
    "speed-m": 1,
    "damage-m": 1,
    "health-m": 1,
    "regen-m": 1,
    fov: 0,
    "BodyDamage-m": 1,
    "reaload-m": 1,
    upgrades: {},
    cannons: [
      {
        type: "AutoBulletCannon",
        "cannon-width": 110,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 1,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1.3,
        bullet_pentration: 1,
      },
    ],
  },
  rocketer: {
    "size-m": 1,
    "speed-m": 1,
    "damage-m": 1,
    "health-m": 1,
    "regen-m": 1,
    fov: 0,
    "BodyDamage-m": 1,
    "reaload-m": 1,
    upgradeLevel: 30,
    upgrades: {},
    cannons: [
      {
        type: "rocketer",
        "cannon-width-top": 30,
        "cannon-height": 50,
        "cannon-width-bottom": 50,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0,
        bulletSize: 0.8,
        bulletSpeed: 2,
        delay: 0,
        reloadM: 1.3,
        bullet_pentration: 1,
      },
    ],
  },
  smasher: {
    "size-m": 1,
    "speed-m": 1.2,
    "damage-m": 1.1,
    "health-m": 1.4,
    fov: 0,
    AutoRoting: true,
    "BodyDamage-m": 1.3,
    "regen-m": 1.2,
    "reaload-m": 0.1,
    upgrades: {},
    cannons: [],
    decor: [
      {
        type: "octaspinner",
        speed: 1,
        size: 54,
        offsetX: 0,
        offsetY: 0,
        offsetAngle: 0,
      },
      {
        type: "octaspinner",
        speed: 1,
        size: 54,
        offsetX: 0,
        offsetY: 0,
        offsetAngle: 0.39269908169,
      },
    ],
  },
  paver: {
    "size-m": 1,
    "speed-m": 1.2,
    "damage-m": 1,
    "health-m": 1,
    fov: 0,
    "BodyDamage-m": 1,
    "reaload-m": 0.7,
    "regen-m": 1,
    upgrades: {},
    cannons: [
      {
        type: "paver",
        multiplyer: 1.02,
        "trap-to-cannon-ratio": 0.8,
        "cannon-width": 80,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": -0.785398,
        bulletSize: 0.5,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 0.3,
      },
      {
        type: "paver",
        multiplyer: 1.02,
        "trap-to-cannon-ratio": 0.8,
        "cannon-width": 80,
        "cannon-height": 30,
        "offSet-x": 0,
        "offSet-y": 0,
        "offset-angle": 0.785398,
        bulletSize: 0.5,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 0.3,
      },
    ],
  },
  dronetanks: ["directer"],
};

Object.freeze(tankmeta);

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

function createAnnocment(
  text,
  sender,
  {
    delay = 1000,
    color = "black",
    priority = 0,
    trans = 0.8,
    rounding = 8,
    timestand = 500,
  } = {}
) {
  var randID = Math.random() * Date.now();
  var newAnnouncement = {
    text: text,
    color: color,
    rounding: rounding,
    priority: priority,
    expiretime: Date.now() + delay,
    shovedowndate: Date.now() + delay + timestand,
    startdowndate: Date.now() + delay,
    trans: trans,
    killtime: Date.now() + delay + timestand * 5,
    id: randID,
    sender: sender,
  };
  announcements.push(newAnnouncement);
}

function between(x, min, max) {
  return x >= min && x <= max;
}

function MathHypotenuse(x, y) {
  return Math.sqrt(x * x + y * y);
}

function mmalizeAngleRadians(angle) {
  while (angle >= Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

function calculateTriangleVertices(x, y, sideLength, angle) {
  const rad = angle * (Math.PI / 180);
  const radius = sideLength / Math.sqrt(3);

  const vertices = [];

  for (let i = 0; i < 3; i++) {
    const theta = rad + i * ((2 * Math.PI) / 3);
    const vx = x + radius * Math.cos(theta);
    const vy = y + radius * Math.sin(theta);
    vertices.push({ x: vx, y: vy });
  }

  return vertices;
}

function calculateRotatedPentagonVertices(cx, cy, r, rotation) {
  const R = r;
  const angleOffset = piby2 + rotation;
  const vertices = new Array(5);

  for (let i = 0; i < 5; i++) {
    const angle = (2 * pi * i) / 5 + angleOffset;
    const x = cx + R * Math.cos(angle);
    const y = cy + R * Math.sin(angle);
    vertices[i] = { x, y };
  }

  return vertices;
}

function calculateRotatedOctagonVertices(cx, cy, r, rotation) {
  const R = r;
  const angleOffset = piby2 + rotation;
  const vertices = new Array(8);

  for (let i = 0; i < 8; i++) {
    const angle = (2 * pi * i) / 8 + angleOffset;
    const x = cx + R * Math.cos(angle);
    const y = cy + R * Math.sin(angle);
    vertices[i] = { x, y };
  }

  return vertices;
}

function isPointInTriangle(p, a, b, c) {
  const area =
    0.5 * (-b.y * c.x + a.y * (-b.x + c.x) + a.x * (b.y - c.y) + b.x * c.y);
  const s =
    (1 / (2 * area)) *
    (a.y * c.x - a.x * c.y + (c.y - a.y) * p.x + (a.x - c.x) * p.y);
  const t =
    (1 / (2 * area)) *
    (a.x * b.y - a.y * b.x + (a.y - b.y) * p.x + (b.x - a.x) * p.y);
  const u = 1 - s - t;

  return s >= 0 && t >= 0 && u >= 0;
}

function buildTriArray(roads) {
  let roads_ = [...roads];
  let triRoads = [];
  roads_.forEach((road) => {
    var connectors = [];
    if (!players[road.id]) return;

    roads_.forEach((_road) => {
      if (connectors.length > 2 || road === _road || !players[road.id]) return;
      var distance = MathHypotenuse(_road.x - road.x, _road.y - road.y);
      let sameTeam =
        players[road.id].team === players[_road.id].team &&
        players[road.id].team !== null &&
        players[_road.id].team !== null;
      if (
        distance < CONFIG.roadMaxConectLength &&
        (sameTeam || road.id === _road.id)
      ) {
        connectors.push({ road: _road, distance: distance });
        connectors.sort((a, b) => {
          return a.distance - b.distance;
        });
        connectors = connectors.splice(0, 3);
      }
    });
    while (connectors.length < 3) {
      connectors.push({ road: road, distance: 0 });
    }
    triRoads.push(connectors);
  });
  return triRoads;
}

function calculateSquareVertices(cx, cy, size, angle) {
  var halfSize = size / 2;

  var angleRad = angle * pi180;
  var cosAngle = Math.cos(angleRad);
  var sinAngle = Math.sin(angleRad);

  let vertices = [
    { x: -halfSize, y: -halfSize },
    { x: halfSize, y: -halfSize },
    { x: halfSize, y: halfSize },
    { x: -halfSize, y: halfSize },
  ];

  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];
    const rotatedX = vertex.x * cosAngle - vertex.y * sinAngle;
    const rotatedY = vertex.x * sinAngle + vertex.y * cosAngle;
    vertices[i] = { x: rotatedX + cx, y: rotatedY + cy };
  }

  return vertices;
}

function findBullet(id) {
  return bullets.find((bullet) => id === bullet.uniqueid);
}

function toSATPolygon(vertices, points = []) {
  const len = vertices.length;
  for (let i = 0; i < len; i++) {
    points[i] = new SAT.Vector(vertices[i].x, vertices[i].y);
  }
  return new SAT.Polygon(new SAT.Vector(0, 0), points.slice(0, len));
}

function normalizeAngle(angle) {
  return angle % 360;
}

function rotatePointAroundPlayer(cannonOffsetX, cannonOffsetY, playerRotation) {
  // Convert player rotation to radians for math
  const playerRotationRad = playerRotation * (Math.PI / 180);

  // Rotate cannon's offset position based on player rotation
  const rotatedX =
    cannonOffsetX * Math.cos(playerRotationRad) -
    cannonOffsetY * Math.sin(playerRotationRad);
  const rotatedY =
    cannonOffsetX * Math.sin(playerRotationRad) +
    cannonOffsetY * Math.cos(playerRotationRad);

  return [rotatedX, rotatedY];
}

function findThisBoss(id) {
  let boss = bosses.find((boss) => {
    let found = false;
    boss.cannons.forEach((cannon) => {
      found = id === cannon.id;
    });
    return found;
  });
  return boss;
}

const log = (...a) => {
  var v = JSON.stringify(a);
  v = v.slice(1, v.length - 1);
  console.log(v);
};

/*var reg = /^\D\w*@\D\w*\.com$/
var str = "abc@gmail.com"
console.log(reg.test(str))*/

function isTargetInSwivelRange(
  playerRotation,
  targetAngle,
  logging,
  offset_degress
) {
  // Normalize player's rotation and target angle
  playerRotation = normalizeAngle(playerRotation + offset_degress);
  targetAngle = normalizeAngle(targetAngle);

  // Define the swivel range around the player's current rotation
  const minSwivelAngle = normalizeAngle(playerRotation - 85); // 90 degrees left of player
  const maxSwivelAngle = normalizeAngle(playerRotation + 85); // 90 degrees right of player

  // Check if the target is within the swivel range
  if (minSwivelAngle <= maxSwivelAngle) {
    return minSwivelAngle <= targetAngle && targetAngle <= maxSwivelAngle;
  } else {
    // Handle the case where angles wrap around 0°
    return targetAngle >= minSwivelAngle || targetAngle <= maxSwivelAngle;
  }
}

function createExsplosion(
  enityId,
  x,
  y,
  {
    createbullet = true,
    doesDamage = false,
    damage = 1,
    dealsDamgage = { players: true, shapes: false },
    knockBack = { players: true, shapes: true },
    startTime = Date.now(),
    lifeSpan = 750,
    size = 50,
    maxsize = 100,
    layers = [
      { color: "red", size: 5, transMinus: 0.09 },
      { color: "orange", size: 4, transMinus: 0.05 },
      { color: "yellow", size: 1, transMinus: -0.1 },
    ],
    trans = 0.7,
    fading = 0.0,
    fadingRate = trans / (lifeSpan / 16),
  } = {}
) {
  var rings = [];

  var totalSize = layers.reduce((a, c) => (a += c.size), 0);

  layers.forEach((item) => {
    rings.push({
      color: item.color,
      size: size * (item.size / totalSize),
      transMinus: item.transMinus,
    });
  });

  let newExsposion = {
    damage: damage,
    startTime: startTime,
    endTime: startTime + lifeSpan,
    rings: rings,
    trans: trans,
    fading: fading,
    fadingRate: fadingRate,
    size: size,
    maxsize: maxsize,
    exspandRate: (maxsize - size) / (lifeSpan / 16),
    innerRadius: 0,
    totalRingSize: totalSize,
    enityId: enityId,
    dealsDamgage: dealsDamgage,
    knockBack: knockBack,
    x: x,
    y: y,
  };
  explosions.push(newExsposion);

  if (createbullet) {
    var bullet = {
      type: "expoled",
      bullet_distance: 300,
      speed: 0,
      size: size,
      angle: 0,
      bullet_damage: 3,
      distanceTraveled: 0,
      vertices: null,
      bullet_pentration: 5,
      x: x,
      y: y,
      lifespan: 0,
      parentindex: 0,
      health: Infinity,
      xstart: x,
      ystart: y,
      endTime: startTime + lifeSpan,
      id: null,
      uniqueid: Date.now() + Math.random(),
      cannonIndex: 0,
      exspandRate: (maxsize - size) / (lifeSpan / 16),
    };
    bullets.push(bullet);
  }
}

function calculateTax(score, maxScore) {
  // Ensure score doesn't exceed maxScore
  score = Math.min(score, maxScore);

  // Use a quadratic growth function for a smoother, slower increase
  let tax = Math.pow(score / maxScore, 1.5); // Adjust exponent for smoother growth

  // Ensuring the tax rate stays within 0 to 1
  return Math.min(1, Math.max(0, tax));
}

createExsplosion("ksiejf48jfo910q");
log(explosions);

function isBulletCollidingWithPolygon(circle, polygonVertices) {
  var circleSAT;
  circleSAT = new SAT.Circle(new SAT.Vector(circle.x, circle.y), circle.size);
  const polygonSAT = toSATPolygon(polygonVertices);
  var collided = SAT.testCirclePolygon(circleSAT, polygonSAT);
  return collided;
}

function isPlayerCollidingWithPolygon(circle, polygonVertices) {
  response.clear();

  let circleSAT = new SAT.Circle(
    new SAT.Vector(circle.x, circle.y),
    circle.size * CONFIG.playerBaseSize
  );
  const polygonSAT = toSATPolygon(polygonVertices);
  var collided = SAT.testCirclePolygon(circleSAT, polygonSAT, response);
  return [collided, response];
}

function midpointCalc(verts) {
  let returnArray = [];
  verts.forEach((vert, i) => {
    var temp = { x: 0, y: 0 };
    temp.x =
      i + 1 < verts.length
        ? (vert.x + verts[i + 1].x) / 2
        : (vert.x + verts[0].x) / 2;
    temp.y =
      i + 1 < verts.length
        ? (vert.y + verts[i + 1].y) / 2
        : (vert.y + verts[0].y) / 2;
    returnArray.push(temp);
  });
  return returnArray;
}

function finder_(data) {
  let index___ = autocannons.findIndex(
    (cannon) => data._cannon.CannonID === cannon.CannonID
  );
  if (index___ !== -1) {
    let cannon = autocannons[index___];
    return [cannon, index___];
  }
  return undefined;
}

function generateRandomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function rearrange() {
  if (leader_board.shown.length <= 1) {
    return;
  }
  leader_board.shown.sort(function (a, b) {
    return a.score - b.score;
  });
  leader_board.shown.reverse(); // huh
}

function confirmplayerradia(_x, _y) {
  for (const player in players) {
    let player_ = players[player];
    if (
      between(
        player_.x,
        _x - (player_.size + CONFIG.map.boundRange),
        _x + (player_.size + CONFIG.map.boundRange)
      ) &&
      between(
        player_.y,
        _y - (player_.size + CONFIG.map.boundRange),
        _y + (player_.size + CONFIG.map.boundRange)
      )
    ) {
      return false; // Overlap detected
    }
  }
  return true; // No overlap
}

function limitedLog(message, ...optionalParams) {
  if (logCounter < LOG_LIMIT) {
    console.log(message, ...optionalParams);
    logCounter++;
  } else if (logCounter === LOG_LIMIT) {
    console.log("Logging limit reached. Further logs will be suppressed.");
    logCounter++; // Increment one last time to stop this message from repeating
  }
}

function normalizeAngle_2(angle) {
  if (typeof angle !== "number" || isNaN(angle)) {
    limitedLog("normalizeAngle received invalid input:", angle);
    return 0; // Fallback to 0
  }
  return ((angle + Math.PI) % (2 * Math.PI)) - Math.PI;
}

function moveCannonAngle(cannon) {
  let deltaAngle = normalizeAngle_2(cannon.targetAngle - cannon.angle);

  let reloadStat = players[cannon.playerid]?.statsTree?.["Bullet Reload"];

  let denominator = 3.5 - (reloadStat - 1) / 3;

  let adjustment = Math.abs(deltaAngle) / denominator;

  cannon.angle += Math.sign(deltaAngle) * adjustment;
  cannon.angle = normalizeAngle_2(cannon.angle);

  emit("autoCannonUPDATE-ANGLE", {
    angle: cannon.angle,
    cannon_ID: cannon.CannonID,
  });
}

for (let i = 0; i < getRandomInt(400, 500); i++) {
  var randID = Math.random() * i * Date.now();
  let x = getRandomInt(-CONFIG.map.innersize, CONFIG.map.innersize);
  let y = getRandomInt(-CONFIG.map.innersize, CONFIG.map.innersize);
  for (let j = 0; j < cors_taken.length; j++) {
    if (
      between(
        x,
        cors_taken[j].x - CONFIG.map.boundRange,
        cors_taken[j].x + CONFIG.map.boundRange
      ) &&
      between(
        y,
        cors_taken[j].y - CONFIG.map.boundRange,
        cors_taken[j].y + CONFIG.map.boundRange
      )
    ) {
      x = getRandomInt(-CONFIG.map.size, CONFIG.map.size);
      y = getRandomInt(-CONFIG.map.size, CONFIG.map.size);
    }
  }
  cors_taken.push({ x: x, y: y, id: randID });
  const valueOp__A = getRandomInt(1, 16);
  var type = "";
  var color = "";
  var health_max = "";
  var score_add = 0;
  var body_damage = 0;
  var weight = 0;
  switch (true) {
    case between(valueOp__A, 1, 9): // Adjusted to 1-6 for square
      type = "square";
      color = "Gold";
      health_max = 10;
      score_add = 10;
      body_damage = 2;
      weight = 3;
      break;
    case between(valueOp__A, 10, 13): // Adjusted to 7-8 for triangle
      type = "triangle";
      color = "Red";
      health_max = 15;
      score_add = 15;
      body_damage = 3.5;
      weight = 5;
      break;
    case between(valueOp__A, 14, 15): // Adjusted to 9-10 for pentagon
      type = "pentagon";
      color = "#579bfa";
      health_max = 100;
      score_add = 120;
      body_damage = 4;
      weight = 10;
      break;
  }
  let fooditem = {
    type: type,
    health: health_max,
    maxhealth: health_max,
    size: 50,
    angle: getRandomInt(0, 180),
    x: x,
    y: y,
    centerX: x,
    centerY: y,
    weight: weight,
    body_damage: body_damage,
    scalarX: getRandomInt(-100, 100),
    scalarY: getRandomInt(-100, 100),
    vertices: null,
    color: color,
    score_add: score_add,
    randomID: randID,
  };
  if (type === "square") {
    const rawvertices = calculateSquareVertices(
      fooditem.x,
      fooditem.y,
      fooditem.size,
      fooditem.angle
    );
    fooditem.vertices = rawvertices;
  }
  if (type === "triangle") {
    const rawvertices = calculateTriangleVertices(
      fooditem.x,
      fooditem.y,
      fooditem.size,
      fooditem.angle
    );
    fooditem.vertices = rawvertices;
  }
  if (type === "pentagon") {
    const rawvertices = calculateRotatedPentagonVertices(
      fooditem.x,
      fooditem.y,
      fooditem.size,
      fooditem.angle
    );
    fooditem.vertices = rawvertices;
  }

  food_squares.assignRoom(fooditem);
}

for (let i = 0; i < getRandomInt(50, 75); i++) {
  let x = getRandomInt(-1000, 1000);
  let y = getRandomInt(-1000, 1000);
  var randID = Math.random() * i * Date.now();
  for (let j = 0; j < cors_taken.length; j++) {
    if (
      between(
        x,
        cors_taken[j].x - CONFIG.map.boundRange,
        cors_taken[j].x + CONFIG.map.boundRange
      ) &&
      between(
        y,
        cors_taken[j].y - CONFIG.map.boundRange,
        cors_taken[j].y + CONFIG.map.boundRange
      )
    ) {
      x = getRandomInt(-1000, 1000);
      y = getRandomInt(-1000, 1000);
    }
  }
  cors_taken.push({ x: x, y: y, id: randID });
  const valueOp = getRandomInt(1, 10);
  var type = "";
  var color = "";
  var health_max = "";
  var score_add = 0;
  var body_damage = 0;
  var weight = 0;

  type = "pentagon";
  color = "#579bfa";
  health_max = 100;
  score_add = 120;
  body_damage = 4;
  if (valueOp === 5) {
    var size = 150;
    score_add = 3000;
    health_max = 1000;
    body_damage = 9;
    var weight = 300;
  } else {
    var size = 50;
    var weight = 10;
  }

  let fooditem = {
    type: type,
    health: health_max,
    maxhealth: health_max,
    size: size,
    angle: getRandomInt(0, 180),
    x: x,
    y: y,
    centerX: x,
    centerY: y,
    weight: weight,
    body_damage: body_damage,
    scalarX: getRandomInt(-100, 100),
    scalarY: getRandomInt(-100, 100),
    vertices: null,
    color: color,
    score_add: score_add,
    randomID: randID,
    "respawn-raidis": 1000,
  };
  if (type === "square") {
    const rawvertices = calculateSquareVertices(
      fooditem.x,
      fooditem.y,
      fooditem.size,
      fooditem.angle
    );
    fooditem.vertices = rawvertices;
  }
  if (type === "triangle") {
    const rawvertices = calculateTriangleVertices(
      fooditem.x,
      fooditem.y,
      fooditem.size,
      fooditem.angle
    );
    fooditem.vertices = rawvertices;
  }
  if (type === "pentagon") {
    const rawvertices = calculateRotatedPentagonVertices(
      fooditem.x,
      fooditem.y,
      fooditem.size,
      fooditem.angle
    );
    fooditem.vertices = rawvertices;
  }

  food_squares.assignRoom(fooditem);
}

function getRandomTime(instancevars) {
  let min = instancevars.waitTime.low;
  let max = instancevars.waitTime.high;
  return (Math.random() * (max - min + 1) + min) * 1000;
}

function getRandom(min, max) {
  return Math.random() * (max - min + 1) + min;
}

function moveAngle(instancevars) {
  if (instancevars.locked) return;
  if (instancevars.Direction === "positive") {
    instancevars.angle += instancevars.arcSpeed;
  } else if (instancevars.Direction === "negative") {
    instancevars.angle -= instancevars.arcSpeed;
  }
}

function moveTarget(instancevars) {
  if (instancevars.locked) return;
  instancevars.targetX =
    instancevars.baseX +
    instancevars.wanderRadius * Math.cos(instancevars.angle);
  instancevars.targetY =
    instancevars.baseY +
    instancevars.wanderRadius * Math.sin(instancevars.angle);

  if (instancevars.randomCrossInterval()) {
    if (getRandomRole(0, 3) && instancevars.crissCross) {
      instancevars.locked = true;
      instancevars.goingStriaght = true;
      instancevars.randAngle = getRandom(-Math.PI, Math.PI);
      instancevars.targetxX =
        instancevars.baseX +
        instancevars.wanderRadius * Math.cos(instancevars.randAngle);
      instancevars.targetyY =
        instancevars.baseY +
        instancevars.wanderRadius * Math.sin(instancevars.randAngle);
    } else {
      instancevars.locked = true;
      setTimeout(() => {
        instancevars.locked = false;
      }, getRandomTime(instancevars));
    }
  }
}

function straightMoveTarget(instancevars) {
  if (!instancevars.locked) return;
  if (!instancevars.goingStriaght) return;
  instancevars.angle = reAling2(instancevars);
  instancevars.targetX += instancevars.speed * Math.cos(instancevars.angle);
  instancevars.targetY += instancevars.speed * Math.sin(instancevars.angle);
  if (isAtTarget(instancevars)) {
    instancevars.locked = false;
    instancevars.goingStriaght = false;
  }
}

function isAtTarget(instancevars) {
  return (
    Math.abs(instancevars.x - instancevars.targetX) < instancevars.speed * 2 &&
    Math.abs(instancevars.y - instancevars.targetY) < instancevars.speed * 2
  );
}

function getRandomRole(end, start) {
  return Math.floor(getRandom(end, start)) === 1;
}

function reAling(instancevars) {
  return Math.atan2(
    instancevars.targetY - instancevars.y,
    instancevars.targetX - instancevars.x
  );
}

function reAling2(instancevars) {
  return Math.atan2(
    instancevars.targetyY - instancevars.targetY,
    instancevars.targetxX - instancevars.targetX
  );
}

function Wanderer( // class but what ever
  x,
  y,
  wanderRadius,
  baseX,
  baseY,
  speed,
  i,
  wanderType = "arc",
  {
    bound = true,
    frameSpeed = 2,
    waitTime = { low: 0.1, high: 0.3 },
    reAlingcheckSpeed = 4,
    allowInner = true,
    minimumWanderDistance = 5,
    arcSpeed = 0.01266667901,
    AngleDiffrence = 50,
    Direction = "positive",
    crissCross = true,
    randomCrossInterval = getRandomRole(0, 3),
  } = {}
) {
  var instancevars = {
    randomCrossInterval: () => {
      return getRandomRole(0, 100);
    },
  };
  instancevars.x = x;
  instancevars.y = y;
  instancevars.wanderRadius = wanderRadius;
  instancevars.baseX = baseX;
  instancevars.baseY = baseY;
  instancevars.speed = speed;
  instancevars.i = i;
  instancevars.targetX = x;
  instancevars.targetY = y;
  instancevars.angle = 0.1;
  instancevars.reachedTarget = false;
  instancevars.locked = false;
  instancevars.wanderType = wanderType;
  instancevars.crissCross = crissCross;
  instancevars.goingStriaght = false;
  instancevars.realAngle = 0;
  instancevars.waitTime = waitTime;
  if (instancevars.wanderType === "straight") {
    instancevars.allowInner = allowInner;
    if (instancevars.allowInner) {
      instancevars.minimumWanderDistance = minimumWanderDistance;
    }
  } else if (instancevars.wanderType === "arc") {
    instancevars.allowInner = false;
    instancevars.AngleDiffrence = AngleDiffrence * (Math.PI / 180);
    instancevars.Direction = Direction;
    instancevars.arcSpeed = arcSpeed;
    if (instancevars.Direction === "netral") {
    }
  } else {
    throw Error("wander type must be [arc] or [straight]");
  }
  this.think = function () {
    instancevars.realAngle = reAling(instancevars);
    if (instancevars.wanderType === "arc") {
      moveAngle(instancevars);
      moveTarget(instancevars);
      if (instancevars.crissCross) {
        straightMoveTarget(instancevars);
      }
    }
  };
  this.returnAngle = function () {
    return instancevars.realAngle;
  };
  this.setBaseXY = function (x, y) {
    instancevars.tempBaseX = x;
    instancevars.tempBaseY = y;
    instancevars.baseX = x;
    instancevars.baseY = y;
  };
  this.setXY = function (x, y) {
    instancevars.x = x;
    instancevars.y = y;
  };
}

console.log("a", getRoomAndBounding(1000, 2300).items.length);

var angle = 0;

var serverseed = crypto.randomUUID();

var invaled_requests = [];

const connections = [];

const allowedOrigins = [
  "https://tank-shark-io.vercel.app",
  "http://127.0.0.1:5501",
  "https://tankshark.fun/",
  "https://tankshark.fun",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

app.use(cors(corsOptions));

/*app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5501");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});*/

app.disable("x-powered-by");

serverHttps.on("request", () => console.log("HTTP request"));

serverHttps.on("upgrade", (req, socket, head) => {
  console.log("Upgrade request");
});

serverHttps.on("request", app);
httpServer.on("request", app);

let logCounter = 0;
const LOG_LIMIT = 1300;

app.use(express.json());

app.post("/currentbadge", (req, res) => {
  console.log("currentbadge request", req.body.userId);
  let badge = "";
  let playerScore = 0;
  if (req.body.userId) {
    var _player = userbase.find((_player) => {
      return Math.abs(_player.userid - req.body.userId) < 0.0001;
    });

    if (_player !== undefined) {
      playerScore = _player.scores.reduce((a, b) => {
        return a + b.score;
      }, 0);
      badge = CONFIG.badgeLevels.find((badgeLevel) => {
        if (
          between(
            playerScore,
            badgeLevel.minScore,
            badgeLevel.maxScore !== null ? badgeLevel.maxScore : Infinity
          )
        ) {
          return badgeLevel.badge;
        }
      });
    } else {
      badge = "/badges/1.png";
    }
  } else {
    badge = "/badges/1.png";
  }
  res.send({
    badge: badge,
    playerScore: playerScore,
    levelData: CONFIG.badgeLevels,
  });
});

app.post("/submit-feedback", (req, res) => {
  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).send("All fields are required.");
  }

  console.log(req.body);
  fs.writeFileSync(
    "data/feedback.txt",
    JSON.stringify({ name, message }) + "\n",
    { flag: "a" },
    function (err) {
      if (err) throw err;
      console.log("Date written to file, ", filename);
    }
  );
});

app.get("/leaderboard", (req, res) => {
  console.log("ooo");
  var userbaseb = userbase
    .sort((entrieA, entrieB) => {
      var scoresumA = entrieA.scores.reduce((a, score) => a + score.score, 0);
      var scoresumB = entrieB.scores.reduce((a, score) => a + score.score, 0);
      return scoresumA - scoresumB;
    })
    .reverse();
  console.log(userbaseb);
  var preLeaderBoard = userbaseb;
  var postLeaderBorad = [];
  preLeaderBoard.forEach((board) => {
    var scoresumA = board.scores.reduce((a, score) => a + score.score, 0);

    var badge = CONFIG.badgeLevels.find((badgeLevel) => {
      if (
        between(
          scoresumA,
          badgeLevel.minScore,
          badgeLevel.maxScore !== null ? badgeLevel.maxScore : Infinity
        )
      ) {
        return badgeLevel.badge;
      }
    });
    badge ??= "/badges/1.png";
    board = { username: board.username, score: scoresumA, badge: badge };
    postLeaderBorad.push(board);
  });

  res.send({
    leader_board: postLeaderBorad,
  });
});

let illegalIPs = [];

fs.readFile("data/illegal.json", function (err, data) {
  if (err) throw err;
  illegalIPs = JSON.parse(data);
});

// is the server open ^(*_*)^
app.get("/ping", (req, res) => {
  res.send("pong");
});
console.log(fs.readFileSync("C:/Certs/websocket/fetchIP.txt", "utf8"))
wss.on("connection", (socket, req) => {
  let connection = {
    socket: socket,
    playerId: null,
    IP: req.socket.remoteAddress,
  };
  let handshaked = false;
  connections.push(connection);
  IPs.push(req.socket.remoteAddress);

  let duplicateIPs = IPs.filter((e, i, a) => a.indexOf(e) !== i);

  console.log(req.socket.remoteAddress);
  if (
    req.socket.remoteAddress !==
      fs.readFileSync("C:/Certs/websocket/fetchIP.txt", "utf8") && req.socket.remoteAddress !== "127.0.0.1" &&
    duplicateIPs.length > 0
  ) {
    duplicateIPs.forEach((duplicateIP) => {
      connections
        .find((con) => con.IP === duplicateIP)
        .socket.close(1000, "Duplicate IP detected");
    });
  }
  if (illegalIPs.includes(req.socket.remoteAddress)) {
    socket.close(999, "You hacker your IP has been permently banned");
    return false;
  }

  let current = 0;

  setInterval(() => {
    current = 0;
  }, 998);

  let stateupdate = null;
  socket.on("message", (message) => {
    const { type, data } = JSON.parse(message);

    current++;
    if (current >= 1000) {
      socket.close(1000, "Too many requests");
      return;
    }
    switch (type) {
      case "newPlayer": {
        var newId = crypto.randomUUID();
        Object.defineProperty(players, `${newId}`, {
          value: data,
          writable: false,
          configurable: false,
          enumerable: true,
        });
        players[newId].id = newId;
        socket.send(JSON.stringify({ type: "newId", data: newId }));
        connection.playerId = newId;
        connections.forEach((con) => {
          if (con.socket === connection.socket) {
            con.playerId = newId;
          }
        });
        if (!skinAllowlist.includes(data.skin)) {
          socket.close(1007, "You hacker, your IP has been permently banned");
          illegalIPs.push(req.socket.remoteAddress);
          fs.writeFile(
            "data/illegal.json",
            JSON.stringify(illegalIPs),
            function (err, data) {
              if (err) throw err;
            }
          );
          return false;
        }
        var badge;
        console.log("players", players);
        emit("playerJoined", data); // Emit playerJoined event to notify all clients
        emit("autoCannonUPDATE-ADD", autocannons);
        emit("colorUpgrades", CONFIG.colorUpgardes);
        emit("Levels", levels);
        emit("NewMessages", messages);
        emit("Config", CONFIG);
        emit("teamColorUpgrades", CONFIG.colorTeamUpgardes);

        socket.send(JSON.stringify({ type: "RETURNtankmeta", data: tankmeta }));
        var public_teams = [];
        public_teams = teamlist.map((team) => {
          if (!team.hidden) {
            team.taxInterval = null;
            return team;
          }
        });

        if (data.teamKey) {
          var team = teamKeys[data.teamKey];
          if (team) {
            emit("playerJoinedTeam", { id: newId, teamId: team });
            createAnnocment("You joined a private team successfuly", newId, {
              color: "green",
            });
          } else if (data.teamKey !== null) {
            createAnnocment("Bad key!", newId, { color: "red" });
          } else if (data.isCrazy) {
            createAnnocment(
              "Did you know you can invite freinds to your team? To do so simply click the invite button in crazy games",
              newId,
              {
                color: "blue",
              }
            );
          }
        }
        emit("pubteamlist", public_teams);
        let x, y;
        do {
          x = getRandomInt(-CONFIG.map.innersize, CONFIG.map.innersize);
          y = getRandomInt(-CONFIG.map.innersize, CONFIG.map.innersize);
        } while (
          cors_taken.some(
            (c) =>
              between(
                x,
                c.x - CONFIG.map.boundRange,
                c.x + CONFIG.map.boundRange
              ) &&
              between(
                y,
                c.y - CONFIG.map.boundRange,
                c.y + CONFIG.map.boundRange
              )
          ) ||
          !confirmplayerradia(x, y)
        );
        if (data.userId) {
          var _player = userbase.find((_player) => {
            return Math.abs(_player.userid - data.userId) < 0.001;
          });

          if (_player !== undefined) {
            _player.username = data.username;
            let score__$ = _player.scores.reduce((a, b) => {
              return a + b.score;
            }, 0);
            if (score__$ >= 50000000) {
              badge = "/badges/10.png";
            } else if (score__$ >= 25000000) {
              badge = "/badges/9.png";
            } else if (score__$ >= 10000000) {
              badge = "/badges/8.png";
            } else if (score__$ >= 5000000) {
              badge = "/badges/7.png";
            } else if (score__$ >= 2500000) {
              badge = "/badges/6.png";
            } else if (score__$ >= 1000000) {
              badge = "/badges/5.png";
            } else if (score__$ >= 500000) {
              badge = "/badges/4.png";
            } else if (score__$ >= 250000) {
              badge = "/badges/3.png";
            } else if (score__$ >= 100000) {
              badge = "/badges/2.png";
            } else {
              badge = "/badges/1.png";
            }
          } else {
            var newid =
              Math.floor(Math.random() * 7779) +
              Date.now() * Math.random() +
              Date.now() / 213984238 +
              Math.random();
            players[newId].userId = newid;
            userbase.push({
              userid: newid,
              scores: [],
              username: data.username,
            });
            socket.send(
              JSON.stringify({ type: "newid", data: { newid: newid } })
            );
            badge = "/badges/1.png";
          }
        } else {
          var newid =
            Math.floor(Math.random() * 7779) +
            Date.now() * Math.random() +
            Date.now() / 213984238 +
            Math.random();
          socket.send(
            JSON.stringify({ type: "newid", data: { newid: newid } })
          );
          players[newId].userId = newid;
          userbase.push({ userid: newid, scores: [], username: data.username });
          badge = "/badges/1.png";
        }
        socket.send(
          JSON.stringify({ type: "badgeToplayer", data: { badge: badge } })
        );
        emit("new_X_Y", { x: x, y: y, id: newId });
        players[newId].x = x;
        players[newId].y = y;
        createExsplosion("ksiejf48jfq", x + 400, y + 400);
        leader_board.hidden.push({
          id: newId,
          score: 0,
          name: data.username,
          badge: badge,
        });
        if (!leader_board.shown[10]) {
          leader_board.shown.push({
            id: newId,
            score: 0,
            name: data.username,
            badge: badge,
          });
        }
        if (leader_board.shown[10]) {
          if (0 > leader_board.shown[10].score) {
            leader_board.shown.push({
              id: newId,
              score: 0,
              name: data.username,
              badge: badge,
            });
          }
          if (0 > leader_board.shown[10].score) {
            leader_board.shown[10] = {
              id: newId,
              score: 0,
              name: data.username,
              badge: badge,
            };
          }
        }

        emit("boardUpdate", {
          leader_board: leader_board.shown,
        });
        let statecycle = 0;
        let state = "start";
        var start = setInterval(() => {
          try {
            players[newId].state = data.state;
            let _data = {
              state: state,
              playerID: newId,
            };
            emit("statechangeUpdate", _data, socket);
          } catch {
            start = null;
          }
        }, CONFIG.updateInterval);
        stateupdate = setInterval(() => {
          statecycle += 1;
          let _data__ = {
            state: state,
            statecycle: statecycle,
            playerID: newId,
          };
          emit("statecycleUpdate", _data__);
        }, CONFIG.updateInterval);

        console.log(newId, players[newId]);
        players[newId].stateTimeout = setTimeout(() => {
          start = null;
          state = "normal";
          players[newId].state = state ?? "start";
          let _data = {
            state: state,
            statecycle: statecycle,
            playerID: newId,
          };
          if (players[newId]) {
            players[newId].state = _data.state;
            emit("statechangeUpdate", _data, socket);
            setTimeout(() => {
              players[newId].state = _data.state;
              emit("statechangeUpdate", _data, socket);
            }, 300);
          }
        }, 6000);

        break;
      }

      case "HANDSHAKE": {
        if (handshaked) return;
        (function () {
          handshaked = true;
          const handshake =
            Date.now() +
            "-" +
            (Math.floor(Math.random() * 1000) +
              Date.now() * Math.random() +
              Date.now() / 1387 +
              Math.random()) *
              serverseed;
          socket.send(JSON.stringify({ type: "handshake", data: handshake }));
        })();
        break;
      }

      case "updatePlayer": {
        emit("playerUpdated", data); // Emit playerUpdated event if needed
        break;
      }

      case "requestUpgrade": {
        if (!players[data.id]) break;
        let myTeam = teamlist.find((team) => team.teamID === data.teamId);
        if (!myTeam) break;
        console.log(data);
        var upgradeStat = (upgradetype) => {
          myTeam.players.forEach((player) => {
            if (upgradetype === "health") {
              players[player.id].health =
                (players[player.id].health / 2) * CONFIG.levelMultiplyer;
              players[player.id].maxhealth =
                players[player.id].maxhealth * CONFIG.levelMultiplyer;
            } else if (upgradetype === "Regen") {
              let Regen = players[player.id].statsTree[upgradetype];
              let Regenspeed = 30 - 30 * (Regen / 10);
              players[player.id].Regenspeed = Regenspeed;
              emit("healerRestart", {
                id: player.id,
                Regenspeed: Regenspeed,
              });
            } else if (upgradetype === "Body Damage") {
              players[player.id].bodyDamage *= CONFIG.levelMultiplyer;
            } else if (upgradetype === "Speed") {
              players[player.id].speed *= CONFIG.levelMultiplyer;
            }

            broadcast("statsTreeRestart", {
              stats: players[player.id].statsTree,
              id: player.id,
            });

            if (
              upgradetype !== "Bullet Pentration" ||
              upgradetype !== "Bullet Speed" ||
              upgradetype !== "Bullet Damage"
            ) {
              emit("UpdateStatTree", {
                id: player.id,
                StatUpgradetype: upgradetype,
                levelmultiplyer: CONFIG.levelMultiplyer,
                doUpgrade: false,
              });
            } else {
              emit("UpdateStatTree", {
                id: player.id,
                StatUpgradetype: upgradetype,
                levelmultiplyer: CONFIG.levelMultiplyer,
                doUpgrade: true,
              });
            }
          });
        };
        if ("miniMap" === data.upgradeType) {
          if (myTeam.createTeamScore) {
            if (myTeam.createTeamScore >= 3000) {
              myTeam.upgrades.canTrack = true;
              buildMiniMapTeams.push(myTeam.teamID);
              myTeam.teamScore -= 3000;
            } else {
              createAnnocment(
                `Not enough Team score. The team has ${myTeam.teamScore}`,
                data.id,
                { color: "red", delay: 3000 }
              );
            }
          } else {
            if (players[data.id].score >= 3000) {
              myTeam.upgrades.canTrack = true;
              buildMiniMapTeams.push(myTeam.teamID);
              players[data.id].score -= 3000;
              leader_board.hidden.forEach((__index__) => {
                if (__index__.id === myTeam.owner.id) {
                  let isshown = false;
                  __index__.score -= 3000;
                  isshown = leader_board.shown.find((__index__) => {
                    if (__index__.id === myTeam.owner.id) {
                      return true;
                    }
                  });
                  if (leader_board.shown[10]) {
                    if (leader_board.shown[10].score < __index__.score) {
                      leader_board.shown[10] = __index__;
                    }
                  } else if (!leader_board.shown[10] && !isshown) {
                    leader_board.shown.push(__index__);
                  }
                }
              });
              leader_board.shown.forEach((__index__) => {
                if (__index__.id === myTeam.owner.id) {
                  __index__.score -= 3000;
                }
              });
              emit("boardUpdate", {
                leader_board: leader_board.shown,
              });
              emit("playerScore", {
                bulletId: myTeam.owner.id,
                socrepluse: -3000,
              });
            } else {
              createAnnocment(
                `Not enough score. You have ${players[data.id].score}`,
                data.id,
                { color: "red", delay: 3000 }
              );
            }
          }
        } else if ("statUpgrade" === data.upgradeType) {
          if (myTeam.createTeamScore) {
            if (myTeam.createTeamScore >= 200) {
              if (myTeam.stats[data.stat] < 8) {
                myTeam.stats[data.stat] += 1;
                var upgradetype = data.upgradeType;
                upgradeStat(upgradetype);
                myTeam.teamScore -= 200;
              } else {
                createAnnocment(`Stat has reached it max limit`, data.id, {
                  color: "orange",
                  delay: 3000,
                });
              }
            } else {
              createAnnocment(
                `Not enough Team score. The team has ${myTeam.teamScore}`,
                data.id,
                { color: "red", delay: 3000 }
              );
            }
          } else {
            if (players[data.id].score >= 200) {
              if (myTeam.stats[data.stat] < 8) {
                myTeam.stats[data.stat] += 1;
                var upgradetype = data.upgradeType;
                upgradeStat(upgradetype);
                players[data.id].score -= 200;
                leader_board.hidden.forEach((__index__) => {
                  if (__index__.id === myTeam.owner.id) {
                    let isshown = false;
                    __index__.score -= 200;
                    isshown = leader_board.shown.find((__index__) => {
                      if (__index__.id === myTeam.owner.id) {
                        return true;
                      }
                    });
                    if (leader_board.shown[10]) {
                      if (leader_board.shown[10].score < __index__.score) {
                        leader_board.shown[10] = __index__;
                      }
                    } else if (!leader_board.shown[10] && !isshown) {
                      leader_board.shown.push(__index__);
                    }
                  }
                });
                leader_board.shown.forEach((__index__) => {
                  if (__index__.id === myTeam.owner.id) {
                    __index__.score -= 200;
                  }
                });
                emit("boardUpdate", {
                  leader_board: leader_board.shown,
                });
                emit("playerScore", {
                  bulletId: myTeam.owner.id,
                  socrepluse: -200,
                });
              } else {
                createAnnocment(`Stat has reached it max limit`, data.id, {
                  color: "orange",
                  delay: 3000,
                });
              }
            } else {
              createAnnocment(
                `Not enough score. You have ${players[data.id].score}`,
                data.id,
                { color: "red", delay: 3000 }
              );
            }
          }
        } else if ("buildBase" === data.upgradeType) {
          if (myTeam.createTeamScore) {
            if (myTeam.createTeamScore >= 10000) {
              if (!myTeam.upgrades.teamBuilding.built) {
                myTeam.teamScore -= 10000;
                let base = {
                  type: `octagon${myTeam.teamID}`,
                  health: 2000,
                  maxhealth: 2000,
                  size: 500,
                  angle: 0,
                  healrate: 1,
                  x: players[myTeam.owner.id].x - 600,
                  y: players[myTeam.owner.id].y,
                  centerX: players[myTeam.owner.id].x,
                  centerY: players[myTeam.owner.id].y,
                  weight: Infinity,
                  body_damage: 10,
                  scalarX: 0,
                  scalarY: 0,
                  vertices: null,
                  color: "['#A0DDFA','#b3ffff']",
                  score_add: 9000,
                  randomID: `teamBase:${myTeam.teamID}`,
                  respawn: false,
                  teamId: myTeam.teamID,
                };
                const rawvertices = calculateRotatedOctagonVertices(
                  base.x,
                  base.y,
                  base.size,
                  base.angle
                );
                base.vertices = rawvertices;
                myTeam.upgrades.teamBuilding.built = true;
                myTeam.upgrades.teamBuilding.polygonId = `teamBase:${myTeam.teamID}
                `;
                food_squares.assignRoom(base);
              } else {
                createAnnocment(
                  `The team base has all ready been built`,
                  data.id,
                  { color: "orange", delay: 3000 }
                );
              }
            } else {
              createAnnocment(
                `Not enough Team score. The team has ${myTeam.teamScore}`,
                data.id,
                { color: "red", delay: 3000 }
              );
            }
          } else {
            if (players[data.id].score >= 10000 || true) {
              if (!myTeam.upgrades.teamBuilding.built) {
                let base = {
                  type: `octagon${myTeam.teamID}`,
                  health: 2000,
                  maxhealth: 2000,
                  size: 500,
                  angle: 0,
                  healrate: 1,
                  x: players[myTeam.owner.id].x - 600,
                  y: players[myTeam.owner.id].y,
                  centerX: players[myTeam.owner.id].x,
                  centerY: players[myTeam.owner.id].y,
                  weight: Infinity,
                  body_damage: 10,
                  scalarX: 0,
                  scalarY: 0,
                  vertices: null,
                  color: "['#A0DDFA','#b3ffff']",
                  score_add: 9000,
                  randomID: myTeam.teamID,
                  respawn: false,
                  teamId: myTeam.teamID,
                };
                console.log("base", base);
                const rawvertices = calculateRotatedOctagonVertices(
                  base.x,
                  base.y,
                  base.size,
                  base.angle
                );
                base.vertices = rawvertices;
                myTeam.upgrades.teamBuilding.built = true;
                myTeam.upgrades.teamBuilding.polygonId = `teamBase:${myTeam.teamID}`;
                food_squares.assignRoom(base);
                players[myTeam.owner.id].score -= 10000;
                leader_board.hidden.forEach((__index__) => {
                  if (__index__.id === myTeam.owner.id) {
                    let isshown = false;
                    __index__.score -= 10000;
                    isshown = leader_board.shown.find((__index__) => {
                      if (__index__.id === myTeam.owner.id) {
                        return true;
                      }
                    });
                    if (leader_board.shown[10]) {
                      if (leader_board.shown[10].score < __index__.score) {
                        leader_board.shown[10] = __index__;
                      }
                    } else if (!leader_board.shown[10] && !isshown) {
                      leader_board.shown.push(__index__);
                    }
                  }
                });
                leader_board.shown.forEach((__index__) => {
                  if (__index__.id === myTeam.owner.id) {
                    __index__.score -= 10000;
                  }
                });
                emit("playerScore", {
                  bulletId: myTeam.owner.id,
                  socrepluse: -10000,
                });
              } else {
                createAnnocment(
                  `The team base has all ready been built`,
                  data.id,
                  { color: "orange", delay: 3000 }
                );
              }
            } else {
              createAnnocment(
                `Not enough score. You have ${players[data.id].score}`,
                data.id,
                { color: "red", delay: 3000 }
              );
            }
          }
        }

        var public_teams = [];
        public_teams = teamlist.map((team) => {
          if (!team.hidden) {
            team.taxInterval = null;
            return team;
          }
        });
        emit("pubteamlist", public_teams);

        break;
      }

      case "autoFiringUpdate": {
        players[data.id].autoFiring = data.autoFiring;
        break;
      }

      case "premotePlayer": {
        if (
          !data.players.includes(data.player) ||
          data.lowerLevelPlayers.includes(data.player)
        ) {
          badIP[req.socket.remoteAddress].warnings ??= 0;
          badIP[req.socket.remoteAddress].warnings += 1;
          createAnnocment(
            `ID Error: id not indexed or has all ready premoted; Your IP has been logged you have ${
              badIP[req.socket.remoteAddress].warnings
            } warnings`,
            data.id,
            { color: "red", delay: 20000 }
          );
          break;
        }
        let myTeam = teamlist.find((team) => team.teamID === data.myTeamID);
        if (data.premotor.id === myTeam.owner.id) {
          if (!myTeam.powers.canDedicatePower) {
            badIP[req.socket.remoteAddress].warnings ??= 0;
            badIP[req.socket.remoteAddress].warnings += 1;
            createAnnocment(
              `Premission Error: premission denied; Your IP has been logged you have ${
                badIP[req.socket.remoteAddress].warnings
              } warnings`,
              data.id,
              { color: "red", delay: 20000 }
            );
            break;
          }
          data.lowerLevelPlayers.push(data.player);
          createAnnocment(
            `You have successfully promoted ${
              players[data.player.id].username
            } to a higher level player in ${myTeam.teamname}.`,
            data.player.id,
            { color: "green", delay: 5000 }
          );
        }
        if (data.lowerLevelPlayers.includes(data.premotor)) {
          if (!myTeam.powers.lowerlevelpowers.canDedicatePower) {
            badIP[req.socket.remoteAddress].warnings ??= 0;
            badIP[req.socket.remoteAddress].warnings += 1;
            createAnnocment(
              `Premission Error: premission denied; Your IP has been logged you have ${
                badIP[req.socket.remoteAddress].warnings
              } warnings`,
              data.id,
              { color: "red", delay: 20000 }
            );
            break;
          }
          data.lowerLevelPlayers.push(data.player);
          createAnnocment(
            `You have successfully promoted ${
              players[data.player.id].username
            } to a higher level player in ${myTeam.teamname}, by ${
              data.premotor.username
            }.`,
            data.player.id,
            { color: "green", delay: 5000 }
          );
        }
        var public_teams = [];
        public_teams = teamlist.map((team) => {
          if (!team.hidden) {
            team.taxInterval = null;
            return team;
          }
        });
        emit("pubteamlist", public_teams);

        break;
      }

      case "demotePlayer": {
        if (
          !data.players.includes(data.player) ||
          !data.lowerLevelPlayers.includes(data.player)
        ) {
          badIP[req.socket.remoteAddress].warnings ??= 0;
          badIP[req.socket.remoteAddress].warnings += 1;
          createAnnocment(
            `ID Error: id not indexed or not found the highrank lists; Your IP has been logged you have ${
              badIP[req.socket.remoteAddress].warnings
            } warnings`,
            data.id,
            { color: "red", delay: 20000 }
          );
          break;
        }
        let myTeam = teamlist.find((team) => team.teamID === data.myTeamID);
        if (data.premotor.id === MYteam.owner.id) {
          if (!myTeam.powers.canDededicatePower) {
            badIP[req.socket.remoteAddress].warnings ??= 0;
            badIP[req.socket.remoteAddress].warnings += 1;
            createAnnocment(
              `Premission Error: premission denied; Your IP has been logged you have ${
                badIP[req.socket.remoteAddress].warnings
              } warnings`,
              data.id,
              { color: "red", delay: 20000 }
            );
            break;
          }
          data.lowerLevelPlayers.splice(
            data.lowerLevelPlayers.indexOf(data.player),
            1
          );
          createAnnocment(
            `You have demoted ${players[data.player.id].username} by ${
              data.premotor.username
            }.`,
            data.player.id,
            { color: "orange", delay: 5000 }
          );
        }
        if (data.lowerLevelPlayers.includes(data.premotor)) {
          if (!myTeam.powers.lowerlevelpowers.canDededicatePower) {
            badIP[req.socket.remoteAddress].warnings ??= 0;
            badIP[req.socket.remoteAddress].warnings += 1;
            createAnnocment(
              `Premission Error: premission denied; Your IP has been logged you have ${
                badIP[req.socket.remoteAddress].warnings
              } warnings`,
              data.id,
              { color: "red", delay: 20000 }
            );
            break;
          }
          data.lowerLevelPlayers.splice(
            data.lowerLevelPlayers.indexOf(data.player),
            1
          );
          createAnnocment(
            `You have demoted ${players[data.player.id].username} by ${
              data.premotor.username
            }.`,
            data.player.id,
            { color: "orange", delay: 5000 }
          );
        }
        var public_teams = [];
        public_teams = teamlist.map((team) => {
          if (!team.hidden) {
            team.taxInterval = null;
            return team;
          }
        });
        emit("pubteamlist", public_teams);

        break;
      }

      case "newTeamCreated": {
        var id =
          Math.floor(Math.random() * 54968) +
          Date.now() * Math.random() +
          Date.now() / 489587 +
          Math.random();
        data.teamID = id;
        data.players = [
          { id: data.owner.id, username: players[data.owner.id].username },
        ];

        let govType = CONFIG.default;
        govType = data.govType ?? govType;

        data.rules = {
          govermentType: govType,
          overthroughAllowed: true,
          vote: () => {
            if (govType in CONFIG.canVote) {
              socket.send("Vote", { teamID });
            }
          },
        };

        data.upgrades = {
          canTrack: false,
          teamPowers: false,
          teamBuilding: {
            built: false,
            level: null,
            polygonId: null,
            boosts: {
              speed: 1,
              health: 1,
              cannons: {},
            },
            health: 2000,
          },
        };

        data.stats = {
          Health: 0,
          "Body Damage": 0,
          Regen: 0,
          "Bullet Pentration": 0,
          "Bullet Speed": 0,
          "Bullet Damage": 0,
          "Bullet Reload": 0,
          Speed: 0,
        };

        if (CONFIG.PayesSelfStrictTaxes.includes(govType)) {
          createAnnocment(
            "Some configerations were overridden due to team type",
            data.owner.id,
            { color: "orange", delay: 4000 }
          );
          data.createTeamScore = true;
        }

        if (govType === "Constitutional") {
          var powers = CONFIG.powers.Constitutional;
          data.constitution = `
            Constitution of ${data.teamname}
            =========================
            
            Preamble:
            This document establishes the foundation and governance structure of ${
              data.teamname
            }, ensuring fairness, transparency, and growth for all members.
            
            Article I - General Information:
            - Founder: ${data.owner.username} (ID: ${data.owner.id})
            - Description: ${data.description}
            - Government Type: ${data.govType}
            - Private: ${data.isPrivate ? "Yes" : "No"}
            - Hidden: ${data.hidden ? "Yes" : "No"}
            
            Article II - Economic Policy:
            - Creation Score Required: ${
              data.createTeamScore ? "Enabled" : "Disabled"
            }
            - Simple Tax Rate: ${data.simpleTax}%
            - Player-Based Tax Rate: ${data.playerTax}%
            - Scheduled Tax: ${
              data.ScheduledBasedTax
                ? `Yes (Interval: ${data.ScheduledBasedTaxInterval})`
                : "No"
            }
            
            Article III - Amendments:
            Future amendments to this constitution shall be proposed and voted upon by members according to the governing structure defined herein.

            Article IIII - Departments:
            Future players apointed by ${
              data.owner.username
            } will have power defined by here after. Appointed players will be apoint these powers: ${
            powers.lowerlevelpowers.canDedicatePower
              ? "Dedicate Power"
              : "No Dedication"
          }, ${powers.lowerlevelpowers.canKick ? "Kick Members" : "No Kicking"}.
            
            Ratified by ${
              data.owner.username
            } on ${new Date().toLocaleDateString()}.
            `;
        }

        if (data.createTeamScore) {
          data.teamScore = 0;
        }
        data.taxInterval = setInterval(() => {
          data.players.forEach((player) => {
            console.log(player);
            if (!players[player.id]) return;
            if (players[player.id].score > 0 && data.owner.id !== player.id) {
              var Scheduledtax =
                players[player.id].score * data.ScheduledBasedTax;
              players[player.id].score =
                players[player.id].score - Scheduledtax;
              if (data.createTeamScore) {
                data.teamScore += Scheduledtax;
                createAnnocment(
                  `Tax Taken ${data.ScheduledBasedTax}%`,
                  player.id,
                  { color: "red" }
                );
                emit("playerScore", {
                  bulletId: data.owner.id,
                  socrepluse: -Scheduledtax,
                });
              } else {
                players[data.owner.id].score += Scheduledtax;
                leader_board.hidden.forEach((__index__) => {
                  if (__index__.id === data.owner.id) {
                    let isshown = false;
                    __index__.score += Scheduledtax;
                    isshown = leader_board.shown.find((__index__) => {
                      if (__index__.id === data.owner.id) {
                        return true;
                      }
                    });
                    if (leader_board.shown[10]) {
                      if (leader_board.shown[10].score < __index__.score) {
                        leader_board.shown[10] = __index__;
                      }
                    } else if (!leader_board.shown[10] && !isshown) {
                      leader_board.shown.push(__index__);
                    }
                  }
                });
                leader_board.shown.forEach((__index__) => {
                  if (__index__.id === data.owner.id) {
                    __index__.score += Scheduledtax;
                  }
                });
                emit("playerScore", {
                  bulletId: data.owner.id,
                  socrepluse: -Scheduledtax,
                });
              }
              leader_board.hidden.forEach((__index__) => {
                if (__index__.id === player.id) {
                  let isshown = false;
                  __index__.score -= Scheduledtax;
                  isshown = leader_board.shown.find((__index__) => {
                    if (__index__.id === player.id) {
                      return true;
                    }
                  });
                  if (leader_board.shown[10]) {
                    if (leader_board.shown[10].score < __index__.score) {
                      leader_board.shown[10] = __index__;
                    }
                  } else if (!leader_board.shown[10] && !isshown) {
                    leader_board.shown.push(__index__);
                  }
                }
              });
              leader_board.shown.forEach((__index__) => {
                if (__index__.id === player.id) {
                  __index__.score -= Scheduledtax;
                }
              });
            }
          });
        }, data.ScheduledBasedTaxInterval * 60 * 1000);

        data.powers = CONFIG.powers[data.govType];

        if (data.powers.canDedicatePower) {
          console.log("Created lowerLevelPlayers");
          data.lowerLevelPlayers = [];
        }

        teamlist.push(data);
        players[data.owner.id].team = data.teamID;
        emit("playerJoinedTeam", {
          id: data.owner.id,
          teamId: data.teamID,
        });
        var public_teams = [];

        public_teams = teamlist.map((team) => {
          if (!team.hidden) {
            team.taxInterval = null;
            return team;
          }
        });

        var PlayerTeam = teamlist.find((team) => team.teamID === id);
        if (PlayerTeam.hidden) {
          let code = Math.floor(100000 * Math.random());
          teamKeys.push(code);
          createAnnocment(`The join code is ${code}`, data.owner.id, 3000);
          createAnnocment(
            `put this into the url bar like this: tankshark.fun/?team=code when someone wants to join`,
            data.owner.id,
            3000
          );
        }
        emit("pubteamlist", public_teams);
        break;
      }

      case "playerJoinedTeam": {
        let MYteam = teamlist.find((team) => {
          return team.teamID === data.teamId;
        });
        if (!MYteam.private) {
          players[data.id].team = data.teamId;
          MYteam.players.push({
            username: players[data.id].username,
            id: data.id,
          });
          socket.send(JSON.stringify({ type: "JoinTeamSuccess", data: {} }));
          emit("playerJoinedTeam", { id: data.id, teamId: data.teamId });
          var public_teams = [];
          public_teams = teamlist.map((team) => {
            if (!team.hidden) {
              team.taxInterval = null;
              team.powers = {};
              return team;
            }
          });
          emit("pubteamlist", public_teams);
        } else {
          socket.send(
            JSON.stringify({
              type: "requestJoin",
              data: { teamname: MYteam.name },
            })
          );
          JoinRequests.push({
            requester: data.id,
            owner: MYteam.owner.id,
            teamID: MYteam.teamID,
          });
        }
        break;
      }

      case "allowNo": {
        var request = PendingJoinRequests.find(
          (_request) => _request.callbackID === data.callbackID
        );
        PendingJoinRequests.splice(PendingJoinRequests.indexOf(request), 1);
        break;
      }

      case "allowYes": {
        emit("JoinTeamSuccess", { id: data.requester });
        var request = PendingJoinRequests.find(
          (_request) => _request.callbackID === data.callbackID
        );
        PendingJoinRequests.splice(PendingJoinRequests.indexOf(request), 1);
        players[data.requester].team = data.teamID;
        let MYteam = teamlist.find((team) => {
          return team.teamID === data.teamID;
        });
        MYteam.players.push({
          username: players[data.requester].username,
          id: data.requester,
        });
        emit("playerJoinedTeam", { id: data.requester, teamId: data.teamID });
        var public_teams = [];
        public_teams = teamlist.map((team) => {
          if (!team.hidden) {
            team.taxInterval = null;
            return team;
          }
        });
        emit("pubteamlist", public_teams);
        break;
      }

      case "playerLeftTeam": {
        let MYteam = teamlist.find((team) => {
          return team.teamID === players[data.id]?.team;
        });
        players[data.id].team = null;
        MYteam.players.splice(
          MYteam.players.indexOf({
            username: players[data.id].username,
            id: data.id,
          }),
          1
        );
        if (data.id === MYteam.owner.id) {
          let teamplayers = MYteam.players;
          if (teamplayers.length !== 0) {
            MYteam.owner = teamplayers[0];
            emit("newOwner", {
              teamID: MYteam.teamID,
              playerid: teamplayers[0].id,
            });
            PendingJoinRequests.forEach((_request) => {
              if (_request.owner === data.id) {
                _request.owner = teamplayers[0].id;
              }
            });
          } else {
            teamplayers.forEach((player) => {
              emit("playerJoinedTeam", { id: player.id, teamId: null });
            });
            clearInterval(MYteam.taxInterval);
            teamlist.splice(teamlist.indexOf(MYteam, 1));
          }
        }
        emit("playerJoinedTeam", { id: data.id, teamId: null });
        let public_teams = [];
        public_teams = teamlist.map((team) => {
          if (!team.hidden) {
            team.taxInterval = null;
            return team;
          }
        });
        emit("pubteamlist", public_teams);
        break;
      }

      case "deleteTeam": {
        let MYteam = teamlist.find((team) => {
          return team.teamID === data.teamID;
        });
        if (
          players[data.playerId].team !== data.teamID ||
          players[data.playerId].team !== MYteam.teamID ||
          data.playerId !== MYteam.owner.id
        ) {
          socket.close(500, "invalid delete");
        }
        MYteam.players.forEach((player) => {
          emit("playerJoinedTeam", { id: player.id, teamId: null });
        });
        clearInterval(MYteam.taxInterval);
        teamlist.splice(teamlist.indexOf(MYteam, 1));
        let public_teams = [];
        public_teams = teamlist.map((team) => {
          if (!team.hidden) {
            team.taxInterval = null;
            return team;
          }
        });
        for (const roomkey in food_squares) {
          var room = food_squares[roomkey];
          if (typeof room === "function") continue;
          room.items = room.items.filter((item) => 
            item.id !== team.teamID
          );
        }
        emit("pubteamlist", public_teams);
        break;
      }

      case "kickplayer": {
        let MYteam = teamlist.find((team) => {
          return team.teamID === players[data.id].team;
        });
        if (!MYteam.powers.canKick) {
          badIP[req.socket.remoteAddress].warnings ??= 0;
          badIP[req.socket.remoteAddress].warnings += 1;
          createAnnocment(
            `Premission Error: premission denied; Your IP has been logged you have ${
              badIP[req.socket.remoteAddress].warnings
            } warnings`,
            data.id,
            { color: "red", delay: 20000 }
          );
        }
        players[data.id].team = null;
        MYteam.players.splice(
          MYteam.players.indexOf({
            username: players[data.id].username,
            id: data.id,
          }),
          1
        );
        emit("playerJoinedTeam", { id: data.id, teamId: null });
        let public_teams = [];
        public_teams = teamlist.map((team) => {
          if (!team.hidden) {
            team.taxInterval = null;
            return team;
          }
        });
        emit("pubteamlist", public_teams);
        break;
      }

      case "rotate": {
        var autoAngle = data.autoAngle;
        var turnhide = setInterval(() => {
          autoAngle += 4;
          if (359.8 <= autoAngle) {
            autoAngle = 0;
          }
          let radians = autoAngle * (Math.PI / 180);
          var MouseX_ =
            50 * Math.cos(radians) + players[data.id].screenWidth / 2;
          var MouseY_ =
            50 * Math.sin(radians) + players[data.id].screenHeight / 2;
          let angle = Math.atan2(
            MouseY_ - players[data.id].screenHeight / 2,
            MouseX_ - players[data.id].screenWidth / 2
          );
          if (!players[data.id]) {
            invaled_requests.push(data.id);
            return;
          }
          players[data.id].cannon_angle = autoAngle;
          players[data.id].MouseX = MouseX_;
          players[data.id].MouseY = MouseY_;
          var data_ = {
            id: data.id,
            cannon_angle: angle,
            MouseX: MouseX_,
            MouseY: MouseY_,
          };
          smartbroadcast("playerCannonUpdated", data_, socket);

          data.autoIntevals.forEach((Inteval) => {
            let autoID = Inteval.autoID;
            let angle = autoAngle;

            autocannons.forEach((cannon) => {
              if (cannon.CannonID === autoID && players[cannon.playerid]) {
                if (cannon._type_ === "SwivelAutoCannon") {
                  var tankdatacannondata =
                    tankmeta[players[cannon.playerid].__type__].cannons[
                      cannon.autoindex
                    ];
                  var offSet_x = tankdatacannondata["offSet-x"];
                  if (tankdatacannondata["offSet-x"] === "playerX") {
                    offSet_x =
                      players[cannon.playerid].size * CONFIG.playerBaseSize;
                  }
                  if (tankdatacannondata["offSet-x-multpliyer"]) {
                    offSet_x *= -1;
                  }
                  var [X, Y] = rotatePointAroundPlayer(offSet_x, 0, angle);
                  cannon["x_"] = X;
                  cannon["y_"] = Y;
                }
              }
            });
          });

          socket.send(
            JSON.stringify({
              type: "playerCannonUpdatedInactive",
              data: {
                MouseX_: MouseX_,
                MouseY_: MouseY_,
                autoAngle: autoAngle,
              },
            })
          );
          data.autoIntevals.forEach((Inteval) => {
            autocannons.forEach((cannon) => {
              if (cannon.CannonID === Inteval.autoID) {
                if (cannon._type_ === "SwivelAutoCannon") {
                  var tankdatacannondata =
                    tankmeta[players[cannon.playerid].__type__].cannons[
                      cannon.autoindex
                    ];
                  var offSet_x = tankdatacannondata["offSet-x"];
                  if (tankdatacannondata["offSet-x"] === "playerX") {
                    offSet_x =
                      players[cannon.playerid].size * CONFIG.playerBaseSize;
                  }
                  if (tankdatacannondata["offSet-x-multpliyer"]) {
                    offSet_x *= -1;
                  }
                  var [X, Y] = rotatePointAroundPlayer(offSet_x, 0, data.angle);
                  cannon["x_"] = X;
                  cannon["y_"] = Y;
                }
              }
            });
          });
        }, 75);
        hidden_broswers.push({ interval: turnhide, id: data.id });
        break;
      }

      case "playerSend": {
        emit("playerMessage", {
          text: data.text,
          exspiretime: 3000,
          id: data.id,
          hidetime: Date.now() + 2500,
        });
        messages.push({
          text: data.text,
          exspiretime: 3000,
          id: data.id,
          hidetime: Date.now() + 2500,
        });
        let index_ = messages.indexOf({
          text: data.text,
          exspiretime: data.exspiretime,
          id: data.id,
          hidetime: Date.now() + 2500,
        });
        setTimeout(() => {
          messages = messages.splice(0, index_);
        }, data.exspiretime);
      }

      case "unrotating": {
        hidden_broswers.filter((interval) => {
          if (data.id === interval.id) {
            clearInterval(interval.interval);
            return false;
          }
          return true;
        });
        break;
      }

      case "windowStateChange": {
        if (players[data.id] === undefined) return;
        var truefalse = data.vis === "visible";
        players[data.id].visible = truefalse;
        if (truefalse) {
          for (const player in players) {
            var player_ = players[player];
            //if (data.id === player_.id) return;
            emit("playerCannonUpdated", {
              id: player_.id,
              cannon_angle: player_.cannon_angle,
              receiver: data.id,
            });
          }
        }
        break;
      }

      case "autoCannonADD": {
        autocannons.push(data);
        let cannosplayer = tankmeta[players[data.playerid].__type__].cannons;
        let cannonamountplayer = Object.keys(cannosplayer).length;
        let find = function () {
          let cannons = 0;
          autocannons.forEach((cannon) => {
            if (cannon.playerid === data.playerid) {
              if (
                cannon._type_ === "autoCannon" ||
                cannon._type_ === "SwivelAutoCannon"
              ) {
                cannons += 1;
              }
            }
          });
          return cannons;
        };
        let index = find();
        let autoindex = cannonamountplayer - index;
        let cannon__index = autocannons.indexOf(data);
        let cannon = autocannons[cannon__index];
        cannon.autoindex = autoindex;
        emit("autoCannonUPDATE-ADD", autocannons);
        break;
      }

      case "typeChange": {
        if (!players[data.id]) {
          invaled_requests.push(data.id);
          break;
        }
        if (data.skin) {
          socket.close(999, "You hacker your IP has been permently banned");
          return false;
        }
        if (data.id !== connection.playerId) {
          // Do somethin here like put the cleints eyes out for hacken
          console.warn("PLAYERS hacken man");
          return "ahhhh";
        }
        for (const prop in data) {
          let tempData = data[prop];
          players[connection.playerId][prop] = tempData;
        }
        console.log(players[connection.playerId]);
        emit("type_Change", data);
        break;
      }

      case "playerCannonWidth": {
        if (!players[data.id]) {
          invaled_requests.push(data.id);
          break;
        }
        players[data.id].cannonW = data.cannonW;
        broadcast(
          "playerCannonWidthUpdate",
          { id: data.id, cannonW: data.cannonW },
          socket
        );
        break;
      }

      case "statUpgrade": {
        if (!players[data.id]) return;
        var upgradetype = data.Upgradetype;

        players[data.id].statsTree[data.Upgradetype] += data.UpgradeLevel;

        if (upgradetype === "health") {
          players[data.id].health =
            (players[data.id].health / 2) * CONFIG.levelMultiplyer;
          players[data.id].maxhealth =
            players[data.id].maxhealth * CONFIG.levelMultiplyer;
        } else if (upgradetype === "Regen") {
          let Regen = players[data.id].statsTree[data.Upgradetype];
          let Regenspeed = 30 - 30 * (Regen / 10);
          players[data.id].Regenspeed = Regenspeed;
          emit("healerRestart", { id: data.id, Regenspeed: Regenspeed });
        } else if (upgradetype === "Body Damage") {
          players[data.id].bodyDamage *= CONFIG.levelMultiplyer;
        } else if (upgradetype === "Speed") {
          players[data.id].speed *= CONFIG.levelMultiplyer;
        }

        broadcast("statsTreeRestart", {
          stats: players[data.id].statsTree,
          id: data.id,
        });

        if (
          upgradetype !== "Bullet Pentration" ||
          upgradetype !== "Bullet Speed" ||
          upgradetype !== "Bullet Damage"
        ) {
          emit("UpdateStatTree", {
            id: data.id,
            StatUpgradetype: upgradetype,
            levelmultiplyer: CONFIG.levelMultiplyer,
            doUpgrade: false,
          });
        } else {
          emit("UpdateStatTree", {
            id: data.id,
            StatUpgradetype: upgradetype,
            levelmultiplyer: CONFIG.levelMultiplyer,
            doUpgrade: true,
          });
        }
        break;
      }

      case "auto-x-update": {
        autocannons.forEach((cannon) => {
          if (cannon.CannonID === data.autoID && players[cannon.playerid]) {
            if (cannon._type_ === "SwivelAutoCannon") {
              var tankdatacannondata =
                tankmeta[players[cannon.playerid].__type__].cannons[
                  cannon.autoindex
                ];
              var offSet_x = tankdatacannondata["offSet-x"];
              if (tankdatacannondata["offSet-x"] === "playerX") {
                offSet_x =
                  players[cannon.playerid].size * CONFIG.playerBaseSize;
              }
              if (tankdatacannondata["offSet-x-multpliyer"]) {
                offSet_x *= -1;
              }
              var [X, Y] = rotatePointAroundPlayer(offSet_x, 0, data.angle);
              cannon["x_"] = X;
              cannon["y_"] = Y;
            }
          }
        });
        break;
      }

      case "playerMoved": {
        if (!players[data.id]) return;
        players[data.id].x = data.x;
        players[data.id].y = data.y;
        if (!data.last) {
          return;
        }
        let player = players[data.id];
        let hasfoodchanged = false;
        /*food_squares = food_squares.filter((item, index) => {
        const distanceX = Math.abs(player.x - item.x);
        const distanceY = Math.abs(player.y - item.y);
        
        let size__ = player.size * 80 + item.size * 1.5;
        if (!(distanceX < size__ && distanceY < size__)) return true;

        var collisionCheck = isPlayerCollidingWithPolygon(
          player,
          item.vertices
        );

        if (collisionCheck[0]) {
          hasfoodchanged = true;
          let damageplayer = item.body_damage;
          let damageother = player["bodyDamage"];
          if (player.state !== "start") {
            player.health -= damageplayer;
          }

          if (player.health < 0) {
            emit("playerDied", {
              playerID: player.id,
              rewarder: null,
              reward: null,
            });
            players = Object.entries(players).reduce(
              (newPlayers, [key, value]) => {
                if (key !== player.id) {
                  newPlayers[key] = value;
                }
                return newPlayers;
              },
              {}
            );
          }

          emit("bouceBack", { response: collisionCheck, playerID: player.id });
          if (0 > item.health) {
            player.score += item.score_add;
            emit("playerScore", {
              bulletId: player.id,
              socrepluse: item.score_add,
            });
            leader_board.hidden.forEach((__index__) => {
              if (__index__.id === player.id) {
                __index__.score += item.score_add;
                let isshown = false;
                leader_board.shown.forEach(() => {
                  if (__index__.id === player.id) {
                    isshown = true;
                  }
                });
                if (leader_board.shown[10]) {
                  if (leader_board.shown[10].score < __index__.score) {
                    leader_board.shown[10] = __index__;
                  }
                } else if (!leader_board.shown[10] && !isshown) {
                  leader_board.shown.push(__index__);
                }
              }
            });
            leader_board.shown.forEach((__index__) => {
              if (__index__.id === player.id) {
                __index__.score += item.score_add;
              }
            });
            rearrange();
            emit("boardUpdate", {
              leader_board: leader_board.shown,
            });

            cors_taken.filter((cor) => {
              if (cor.id === item.randomID) {
                return false;
              } else {
                return true;
              }
            });

            let respawnrai = item["respawn-raidis"] || 4500;
            let x, y;
            do {
              x = getRandomInt(-respawnrai, respawnrai);
              y = getRandomInt(-respawnrai, respawnrai);
            } while (
              cors_taken.some(
                (c) =>
                  between(x, c.x - 50, c.x + 50) &&
                  between(y, c.y - 50, c.y + 50)
              )
            );
            let randID = Math.random() * index * Date.now();

            cors_taken.push({ x, y, id: randID });

            const valueOp = getRandomInt(1, 15);
            var type = "";
            var color = "";
            var health_max = "";
            var score_add = 0;
            var body_damage = 0;
            var weight = 0;
            if (!item["respawn-raidis"]) {
              switch (true) {
                case between(valueOp, 1, 10): // Adjusted to 1-6 for square
                  type = "square";
                  color = "Gold";
                  health_max = 10;
                  score_add = 10;
                  body_damage = 2;
                  weight = 3;
                  break;
                case between(valueOp, 11, 13): // Adjusted to 7-8 for triangle
                  type = "triangle";
                  color = "Red";
                  health_max = 15;
                  score_add = 15;
                  body_damage = 3.5;
                  weight = 5;
                  break;
                case between(valueOp, 14, 15): // Adjusted to 9-10 for pentagon
                  type = "pentagon";
                  color = "#579bfa";
                  health_max = 100;
                  score_add = 120;
                  body_damage = 4;
                  weight = 10;
                  break;
              }
            } else {
              const valueOp2 = getRandomInt(1, 10);

              type = "pentagon";
              color = "#579bfa";
              health_max = 100;
              score_add = 120;
              body_damage = 4;
              if (valueOp2 === 5) {
                var size = 150;
                score_add = 3000;
                health_max = 1000;
                body_damage = 9;
                weight = 300;
              } else {
                var size = 50;
                weight = 10;
              }
            }
            let fooditem = {
              type: type,
              health: health_max,
              maxhealth: health_max,
              size: 50,
              angle: getRandomInt(0, 180),
              x: x,
              y: y,
              centerX: x,
              centerY: y,
              weight: weight,
              body_damage: body_damage,
              scalarX: getRandomInt(-100, 100),
              scalarY: getRandomInt(-100, 100),
              vertices: null,
              color: color,
              score_add: score_add,
              randomID: randID,
            };
            if (type === "square") {
              const rawvertices = calculateSquareVertices(
                fooditem.x,
                fooditem.y,
                fooditem.size,
                fooditem.angle
              );
              fooditem.vertices = rawvertices;
            }
            if (type === "triangle") {
              const rawvertices = calculateTriangleVertices(
                fooditem.x,
                fooditem.y,
                fooditem.size,
                fooditem.angle
              );
              fooditem.vertices = rawvertices;
            }
            if (type === "pentagon") {
              const rawvertices = calculateRotatedPentagonVertices(
                fooditem.x,
                fooditem.y,
                fooditem.size,
                fooditem.angle
              );
              fooditem.vertices = rawvertices;
            }

            food_squares.push(fooditem);
            emit("bulletUpdate", bullets);

            return false;
          } else {
            if (player.state !== "start") {
              item.health -= damageother;
            }
          }

          if (player.state !== "start") {
            emit("shapeDamage", {
              PlayerId: player.id,
              playerDamage: damageplayer,
              shapes: food_squares,
            });
          }
        }
        return true;
      });*/
        broadcast("playerMoved", data, socket);
        break;
      }

      case "Sizeup": {
        if (!players[data.id]) return;
        players[data.id].size += data.plus;
        break;
      }

      case "Autofire": {
        let maxdistance = CONFIG.playerPlayerSightRange;
        let fire_at = null;
        let cannon = data.cannon;
        for (const playerID in players) {
          let player = players[playerID];
          var sameTeam =
            player.team === players[data.playerId].team &&
            player.team !== null &&
            players[data.playerId].team !== null;
          if (
            playerID !== data.playerId &&
            player.state !== "start" &&
            !sameTeam
          ) {
            var distance = MathHypotenuse(player.x - data.x, player.y - data.y);
            if (distance < maxdistance) {
              let angle = Math.atan2(
                player.y - players[data.playerId].y, // y difference
                player.x - players[data.playerId].x // x difference
              );
              if (
                tankmeta[players[data.playerId].__type__]["cannons"][
                  data.extracannon_
                ].type === "SwivelAutoCannon"
              ) {
                if (
                  tankmeta[players[data.playerId].__type__]["cannons"][
                    data.extracannon_
                  ]["offSet-x-multpliyer"] === -1
                ) {
                  if (
                    isTargetInSwivelRange(
                      players[data.playerId].cannon_angle,
                      (angle * 180) / pi,
                      true,
                      180
                    )
                  ) {
                    maxdistance = distance;
                    fire_at = player;
                  }
                } else {
                  if (
                    isTargetInSwivelRange(
                      players[data.playerId].cannon_angle,
                      (angle * 180) / pi,
                      true,
                      0
                    )
                  ) {
                    maxdistance = distance;
                    fire_at = player;
                  }
                }
              } else {
                maxdistance = distance;
                fire_at = player;
              }
            }
          }
        }
        if (maxdistance > CONFIG.playerItemSightRange) {
          getRoomAndBounding(
            players[data.playerId].x,
            players[data.playerId].y
          ).items.forEach((item) => {
            var distance = MathHypotenuse(
              item.x - data.playerX,
              item.y - data.playerY
            );
            if (distance < maxdistance) {
              let angle = Math.atan2(
                item.y - players[data.playerId].y, // y difference
                item.x - players[data.playerId].x // x difference
              );
              if (
                tankmeta[players[data.playerId].__type__]["cannons"][
                  data.extracannon_
                ].type === "SwivelAutoCannon"
              ) {
                if (
                  tankmeta[players[data.playerId].__type__]["cannons"][
                    data.extracannon_
                  ]["offSet-x-multpliyer"] === -1
                ) {
                  if (
                    isTargetInSwivelRange(
                      players[data.playerId].cannon_angle,
                      (angle * 180) / pi,
                      true,
                      180
                    )
                  ) {
                    maxdistance = distance;
                    fire_at = item;
                  }
                } else {
                  if (
                    isTargetInSwivelRange(
                      players[data.playerId].cannon_angle,
                      (angle * 180) / pi,
                      true,
                      0
                    )
                  ) {
                    maxdistance = distance;
                    fire_at = item;
                  }
                }
              } else {
                maxdistance = distance;
                fire_at = item;
              }
            }
          });
        }
        let speedUP = 0;
        if (fire_at === null) return;

        let cannon_life = cannon["life-time"] || 0;
        if (players[data.playerId].statsTree["Bullet Speed"] !== 1) {
          speedUP =
            players[data.playerId].statsTree["Bullet Speed"] *
            CONFIG.levelMultiplyer;
        }

        let bullet_speed__ = data.bullet_speed * cannon["bulletSpeed"];
        if (
          cannon["type"] === "basicCannon" ||
          cannon["type"] === "trapezoid"
        ) {
          var bulletdistance = bullet_speed__ * 100 * (data.bullet_size / 6);
          var __type = "basic";
          var health = 8;
        } else if (cannon["type"] === "trap") {
          var bulletdistance = bullet_speed__ * 70 * (data.bullet_size / 20);
          var __type = "trap";
          var health = 10;
        } else if (cannon["type"] === "directer") {
          var bulletdistance = 100;
          var __type = "directer";
          var health = 10;
        } else if (
          cannon["type"] === "autoCannon" ||
          cannon["type"] === "SwivelAutoCannon"
        ) {
          var bulletdistance =
            (bullet_speed__ + speedUP) * 100 * (data.bullet_size / 6);
          var __type = "basic";
          var health = 8;
        }
        let angle = Math.atan2(
          fire_at.y - data.playerY, // y difference
          fire_at.x - data.playerX // x difference
        );

        let bullet_size_l = data.bullet_size * cannon["bulletSize"];

        let randomNumber = generateRandomNumber(-0.2, 0.2);

        var offSet_x = cannon["offSet-x"];
        if (cannon["offSet-x"] === "playerX") {
          offSet_x = (players[data.playerId].size / 2) * CONFIG.playerBaseSize;
        }

        if (cannon["type"] === "basicCannon" || cannon["type"] === "trap") {
          var xxx = cannon["cannon-width"] - bullet_size_l;
          var yyy = cannon["cannon-height"] - bullet_size_l;
          var angle_ = angle + cannon["offset-angle"];
        } else if (cannon["type"] === "trapezoid") {
          var angle_ = angle + cannon["offset-angle"] + randomNumber;
          var xxx = cannon["cannon-width-top"] - bullet_size_l;
          var yyy =
            cannon["cannon-height"] -
            bullet_size_l * 2 -
            (cannon["cannon-width-top"] / 2) * Math.random();
        } else if (
          cannon["type"] === "autoCannon" ||
          cannon["type"] === "SwivelAutoCannon"
        ) {
          var xxx = cannon["cannon-width"] - bullet_size_l;
          var yyy = cannon["cannon-height"] - bullet_size_l;
          var angle_ = angle + cannon["offset-angle"];
        }

        let rotated_offset_x =
          (offSet_x + xxx) * Math.cos(angle_) -
          (cannon["offSet-y"] + yyy) * Math.sin(angle_);
        let rotated_offset_y =
          (offSet_x + xxx) * Math.sin(angle_) +
          (cannon["offSet-y"] + yyy) * Math.cos(angle_);
        let bullet_start_x = data.playerX + rotated_offset_x;
        let bullet_start_y = data.playerY + rotated_offset_y;
        // lol
        let identdfire = Date.now() + Math.random();
        let damageUP = 0;
        if (players[data.playerId].statsTree["Bullet Damage"] !== 1) {
          damageUP =
            (players[data.playerId].statsTree["Bullet Damage"] *
              CONFIG.levelMultiplyer) /
            (data.bullet_damage ** 2 / (data.bullet_damage / 10));
        }
        let PentrationPluse = 0;
        if (players[data.playerId].statsTree["Bullet Pentration"] !== 1) {
          PentrationPluse =
            players[data.playerId].statsTree["Bullet Pentration"] *
            CONFIG.levelMultiplyer;
        }

        let bullet = {
          type: __type,
          bullet_distance: bulletdistance,
          speed: bullet_speed__ + speedUP,
          size: bullet_size_l,
          angle: angle_,
          bullet_damage: data.bullet_damage * cannon["bulletSize"] + damageUP,
          distanceTraveled: 0,
          vertices: null,
          bullet_pentration:
            data.bullet_pentration * cannon["bullet_pentration"] +
            PentrationPluse,
          x: bullet_start_x,
          y: bullet_start_y,
          lifespan: cannon_life,
          health: health,
          xstart: data.playerX,
          ystart: data.playerY,
          id: data.playerId,
          uniqueid: identdfire,
          Zlevel: 2,
        };

        for (let l = 0; l < 10; l++) {
          setTimeout(() => {
            data._cannon.cannonWidth -= 1;
            emit("CannonWidthUpdate", {
              CannonID: data._cannon.CannonID,
              cannonWidth: data._cannon.cannonWidth,
            });
          }, 10 * l);
          setTimeout(() => {
            data._cannon.cannonWidth += 1;
            emit("CannonWidthUpdate", {
              CannonID: data._cannon.CannonID,
              cannonWidth: data._cannon.cannonWidth,
            });
          }, 20 * l); // Updated to prevent overlap
        }

        bullets.push(bullet);
        var [_index_, CO] = finder_(data);
        break;
      }

      case "playerCannonMoved": {
        if (!players[data.id]) {
          invaled_requests.push(data.id);
          return;
        }
        players[data.id].cannon_angle = data.cannon_angle;
        players[data.id].MouseX = data.MouseX;
        players[data.id].MouseY = data.MouseY;
        smartbroadcast("playerCannonUpdated", data, socket);
        break;
      }

      case "statechange": {
        if (!players[data.playerID]) {
          invaled_requests.push(data.playerID);
          return;
        }
        players[data.playerID].state = data.state;
        broadcast("statechangeUpdate", data, socket);
        break;
      }

      case "healrate": {
        if (!players[data.id]) {
          invaled_requests.push(data.id);
          return;
        }
        players[data.playerId].playerReheal = data.playerReheal;
        break;
      }

      case "AddplayerHealTime": {
        if (!players[data.ID]) {
          invaled_requests.push(data.ID);
          return;
        }
        players[data.ID].maxhealth = data.maxhealth;
        players[data.ID].playerHealTime = data.playerHealTime;
        emit("updaterHeal", { ID: data.ID, HEALTime: data.playerHealTime });
        if (
          data.playerHealTime > players[data.ID].Regenspeed &&
          players[data.ID].health < players[data.ID].maxhealth
        ) {
          let healer = setInterval(function () {
            if (!players[data.ID]) {
              clearInterval(healer);
              return;
            }
            players[data.ID].health += players[data.ID].playerReheal;
            if (players[data.ID].health >= players[data.ID].maxhealth) {
              players[data.ID].health = players[data.ID].maxhealth;
              clearInterval(healer);
            }
            if (players[data.ID].playerHealTime < players[data.ID].Regenspeed) {
              players[data.ID].health -= players[data.ID].playerReheal;
              clearInterval(healer);
            }
            emit("playerHeal", {
              HEALTH: players[data.ID].health,
              ID: data.ID,
            });
          }, 50);
        }
        break;
      }

      case "playerHealintterupted": {
        if (!players[data.ID]) {
          invaled_requests.push(data.id);
          return;
        }
        players[data.ID].playerHealTime = 0;
        emit("updaterHeal", { ID: data.ID, HEALTime: 0 });
        break;
      }

      case "playerCollided": {
        try {
          if (players[data.id_other].state !== "start") {
            players[data.id_other].health -= data.damagegiven;
          } // Swap damagegiven and damagetaken
          if (players[data.id_self].state !== "start") {
            players[data.id_self].health -= data.damagetaken;
          }
          if (players[data.id_other].health <= 0) {
            let player = players[data.id_other];
            let player2 = players[data.id_self];
            var reward = Math.round(
              player.score / (20 + players[player2.id].score / 10000)
            );
            emit("playerScore", { bulletId: player2.id, socrepluse: reward });
            emit("playerDied", {
              playerID: player.id,
              rewarder: player2.id,
              reward: reward,
            });
            players = Object.entries(players).reduce(
              (newPlayers, [key, value]) => {
                if (key !== player.id) {
                  newPlayers[key] = value;
                }
                return newPlayers;
              },
              {}
            );
          }
          if (players[data.id_self].health <= 0) {
            let player = players[data.id_self];
            let player2 = players[data.id_other];
            var reward = Math.round(
              player.score / (20 + players[player2.id].score / 10000)
            );
            emit("playerScore", { bulletId: player2.id, socrepluse: reward });
            emit("playerDied", {
              playerID: player.id,
              rewarder: player2.id,
              reward: reward,
            });
            players = Object.entries(players).reduce(
              (newPlayers, [key, value]) => {
                if (key !== player.id) {
                  newPlayers[key] = value;
                }
                return newPlayers;
              },
              {}
            );
          }
        } catch (error) {
          console.log(error);
          return;
        }

        emit("playerDamaged", {
          player1: players[data.id_other],
          ID1: data.id_other,
          player2: players[data.id_self],
          ID2: data.id_self,
        });
        break;
      }

      case "playerUPDATE": {
        players[data.id] = data;
        break;
      }

      case "deletAuto": {
        autocannons.filter((cannons___0_0) => {
          if (cannons___0_0.playerid === connection.playerId) {
            return false;
          }
          return true;
        });
        break;
      }

      case "bulletFired": {
        if (!players[data.id]) return;
        if (!players[data.id].statsTree) return;

        if (tankmeta.dronetanks.includes(players[data.id].__type__)) {
          data.wander = new Wanderer(
            data.xstart,
            data.ystart,
            players[data.id].size * 120,
            players[data.id].x,
            players[data.id].y,
            data.speed,
            101,
            "arc",
            { arcSpeed: 0.006 }
          );
          data.setBaseXY = () => {
            for (const playerid in players) {
              if (playerid === data.id) {
                var player = players[playerid];
                data.wander.setBaseXY(player.x, player.y);
              }
            }
          };
        }
        if (data.type === "roadMap") {
          roads.push({
            x: data.x,
            y: data.y,
            id: data.id,
            uniqueid: data.uniqueid,
            multiplyer:
              tankmeta[players[data.id].__type__].cannons[data.cannonIndex]
                .multiplyer,
          });
        }

        var sedoRoom = getKeyRoom(data.x, data.y) ?? "room-0";
        data.sedoRoomKey = sedoRoom;

        let damageUP = 0;
        if (players[data.id].statsTree["Bullet Damage"] !== 1) {
          damageUP =
            (players[data.id].statsTree["Bullet Damage"] *
              CONFIG.levelMultiplyer) /
            (data.bullet_damage ** 2 / (data.bullet_damage / 5));
          data.bullet_damage += damageUP;
        }
        let PentrationPluse = 0;
        if (players[data.id].statsTree["Bullet Pentration"] !== 1) {
          PentrationPluse =
            players[data.id].statsTree["Bullet Pentration"] *
            CONFIG.levelMultiplyer;
          data.bullet_pentration += PentrationPluse;
        }
        let speedUP = 0;
        if (players[data.id].statsTree["Bullet Speed"] !== 1) {
          speedUP =
            players[data.id].statsTree["Bullet Speed"] * CONFIG.levelMultiplyer;
          data.speed += speedUP;
        }
        bullets.push(data);
        let indexbullet = bullets.indexOf(data);
        let bullet = bullets[indexbullet];
        if (data.type === "trap") {
          setTimeout(() => {
            // hacky soltion to remove the bullet
            bullet.distanceTraveled = 100e10;
          }, bullet.lifespan * 1000);
        }
        if (data.type === "AutoBullet") {
          let autoID =
            getRandomInt(-10000, 10000) *
            Date.now() *
            getRandomInt(-1000, 1000);
          let auto_cannon = {
            CannonID: autoID,
            playerid: data.uniqueid,
            angle: 0.000000001,
            _type_: "bulletAuto",
            cannonWidth: 0,
          };
          autocannons.push(auto_cannon);
          let cannosplayer = tankmeta[players[data.id].__type__].cannons;
          let cannonamountplayer = Object.keys(cannosplayer).length;
          let find = function () {
            let cannons = 0;
            autocannons.forEach((cannon) => {
              if (cannon.playerid === data.playerid) {
                if (
                  cannon._type_ === "autoCannon" ||
                  cannon._type_ === "SwivelAutoCannon" ||
                  cannon._type_ === "bulletAuto"
                ) {
                  cannons += 1;
                }
              }
            });
            return cannons;
          };
          let index = find();
          let autoindex = cannonamountplayer - index;
          if (autoindex === cannonamountplayer) {
            autoindex -= 1;
          }
          let cannon__index = autocannons.indexOf(auto_cannon);
          let cannon = autocannons[cannon__index];
          cannon.autoindex = autoindex;
          emit("autoCannonUPDATE-ADD", autocannons);
          let __reload__ = 1;
          for (
            let i = 0;
            i < players[data.id].statsTree["Bullet Reload"];
            ++i
          ) {
            __reload__ *= CONFIG.levelMultiplyer;
          }
          function auto_bullet() {
            let maxdistance = CONFIG.playerPlayerSightRange;
            let fire_at = null;
            let cannon =
              tankmeta[players[data.id].__type__]["cannons"][autoindex];
            for (const playerID in players) {
              let player = players[playerID];
              var sameTeam =
                player.team === players[data.id].team &&
                player.team !== null &&
                players[data.id].team !== null;
              if (playerID !== bullet.id && !sameTeam) {
                var distance = MathHypotenuse(
                  player.x - bullet.x,
                  player.y - bullet.y
                );
                if (distance < maxdistance) {
                  let angle = Math.atan2(
                    player.y - bullet.y, // y difference
                    player.x - bullet.x // x difference
                  );

                  maxdistance = distance;
                  fire_at = player;
                }
              }
            }
            if (maxdistance > CONFIG.playerItemSightRange) {
              getRoomAndBounding(bullet.x, bullet.y).items.forEach((item) => {
                var distance = MathHypotenuse(
                  item.x - bullet.x,
                  item.y - bullet.y
                );
                if (distance < maxdistance) {
                  let angle = Math.atan2(
                    item.y - bullet.y, // y difference
                    item.x - bullet.x // x difference
                  );

                  maxdistance = distance;
                  fire_at = item;
                }
              });
            }
            let speedUP = 0;
            if (fire_at === null) return;

            if (players[bullet.id].statsTree["Bullet Speed"] !== 1) {
              speedUP =
                players[bullet.id].statsTree["Bullet Speed"] *
                CONFIG.levelMultiplyer;
            }
            let cannon_life = 0;

            let bullet_speed__ = (data.speed / 1.3) * cannon["bulletSpeed"] * 5;
            var bulletdistance =
              (bullet_speed__ + speedUP) * 100 * (bullet.size / 6);
            var __type = "basic";
            var health = 8;

            let angle = Math.atan2(
              fire_at.y - bullet.y, // y difference
              fire_at.x - bullet.x // x difference
            );

            let bullet_size_l = (bullet.size * cannon["bulletSize"]) / 1.8;

            let randomNumber = generateRandomNumber(-0.2, 0.2);

            var offSet_x = cannon["offSet-x"];
            if (cannon["offSet-x"] === "playerX") {
              offSet_x = (players[bullet.id].size / 2) * CONFIG.playerBaseSize;
            }

            var xxx = bullet.size / 5 - bullet_size_l * 0.2;
            var yyy = bullet.size / 10 - bullet_size_l * 1.2;
            var angle_ = angle;

            let rotated_offset_x =
              (bullet.size + xxx) * Math.cos(angle_) -
              (bullet.size / 2 + yyy) * Math.sin(angle_);
            let rotated_offset_y =
              (bullet.size + xxx) * Math.sin(angle_) +
              (bullet.size / 2 + yyy) * Math.cos(angle_);
            let bullet_start_x = data.x + rotated_offset_x;
            let bullet_start_y = data.y + rotated_offset_y;
            // lol
            let identdfire =
              (Date.now() + Math.random()) * Date.now() * 3 * Math.random();
            let damageUP = 0;
            if (players[bullet.id].statsTree["Bullet Damage"] !== 1) {
              damageUP =
                (players[bullet.id].statsTree["Bullet Damage"] *
                  CONFIG.levelMultiplyer) /
                (data.bullet_damage ** 2 / (data.bullet_damage / 10));
            }
            let PentrationPluse = 0;
            if (players[bullet.id].statsTree["Bullet Pentration"] !== 1) {
              PentrationPluse =
                players[bullet.id].statsTree["Bullet Pentration"] *
                CONFIG.levelMultiplyer;
            }

            let bullet____ = {
              type: __type,
              bullet_distance: bulletdistance,
              speed: bullet_speed__ + speedUP,
              size: bullet_size_l,
              angle: angle_,
              bullet_damage:
                data.bullet_damage * cannon["bulletSize"] + damageUP,
              distanceTraveled: 0,
              vertices: null,
              bullet_pentration:
                data.bullet_pentration * cannon["bullet_pentration"] +
                PentrationPluse,
              x: bullet_start_x,
              y: bullet_start_y,
              lifespan: cannon_life,
              health: health,
              xstart: data.x,
              ystart: data.y,
              id: bullet.id,
              uniqueid: identdfire,
              Zlevel: 3,
              cannonIndex: data.cannonIndex,
            };

            bullets.push(bullet____);

            for (let l = 0; l < 10; l++) {
              setTimeout(() => {
                auto_cannon.cannonWidth -= 1;
                emit("CannonWidthUpdate", {
                  CannonID: auto_cannon.CannonID,
                  cannonWidth: auto_cannon.cannonWidth,
                });
              }, 10 * l);
              setTimeout(() => {
                auto_cannon.cannonWidth += 1;
                emit("CannonWidthUpdate", {
                  CannonID: auto_cannon.CannonID,
                  cannonWidth: auto_cannon.cannonWidth,
                });
              }, 20 * l); // Updated to prevent overlap
            }

            var interval__;
            var reload_bullet = setTimeout(() => {
              let canfire = true;
              bullet_intervals.forEach((intervals) => {
                if (intervals.id === bullet.uniqueid) {
                  canfire = intervals.canfire;
                  interval__ = intervals;
                }
              });
              if (!canfire) {
                var index_1 = bullet_intervals.indexOf(interval__);
                if (index_1 !== -1 && canfire === false) {
                  bullet_intervals.splice(index_1, 1);
                }
                return;
              }
              __reload__ = 1;
              for (
                let i = 0;
                i < players[data.id].statsTree["Bullet Reload"];
                ++i
              ) {
                __reload__ /= CONFIG.levelMultiplyer - 0.1;
              }
              auto_bullet();
            }, 750 * tankmeta[players[data.id].__type__]["reaload-m"] * cannon["reloadM"] * __reload__ * 2);
          }
          setTimeout(() => {
            __reload__ = 1;
            for (
              let i = 0;
              i < players[data.id].statsTree["Bullet Reload"];
              ++i
            ) {
              __reload__ /= CONFIG.levelMultiplyer - 0.1;
            }
            auto_bullet();
          }, 750 * tankmeta[players[data.id].__type__]["reaload-m"] * cannon["reloadM"] * __reload__ * 2);
          bullet_intervals.push({ canfire: true, id: bullet.uniqueid });
        } else if (data.type === "rocketer") {
          let __reload__ = 1;
          let cannon =
            tankmeta[players[data.id].__type__]["cannons"][data.parentindex];
          function auto_bullet() {
            if (players[bullet.id].statsTree["Bullet Speed"] !== 1) {
              speedUP =
                players[bullet.id].statsTree["Bullet Speed"] *
                CONFIG.levelMultiplyer;
            }
            let cannon_life = 0;

            let bullet_speed__ = (data.speed / 5) * cannon["bulletSpeed"];
            var bulletdistance =
              (bullet_speed__ + speedUP) * 25 * (bullet.size / 7);
            var __type = "basic";
            var health = 8;

            let angle = data.angle - pi;

            let bullet_size_l = (bullet.size * cannon["bulletSize"]) / 1.2;

            let randomNumber = generateRandomNumber(-0.2, 0.2);

            var offSet_x = cannon["offSet-x"];
            if (cannon["offSet-x"] === "playerX") {
              offSet_x = (players[bullet.id].size / 2) * CONFIG.playerBaseSize;
            }

            var xxx = cannon["cannon-width-top"] / 5 - bullet_size_l * 1.5;
            var yyy =
              cannon["cannon-height"] / 5 -
              bullet_size_l * 2 -
              (cannon["cannon-width-top"] / 5 / 2) * Math.random();
            var angle_ = angle + randomNumber;

            let rotated_offset_x =
              (data.size + xxx) * Math.cos(angle_) -
              (data.size / 2 + yyy) * Math.sin(angle_);
            let rotated_offset_y =
              (data.size + xxx) * Math.sin(angle_) +
              (data.size / 2 + yyy) * Math.cos(angle_);
            let bullet_start_x = data.x + rotated_offset_x;
            let bullet_start_y = data.y + rotated_offset_y;

            // lol
            let identdfire =
              (Date.now() + Math.random()) * Date.now() * 3 * Math.random();
            let damageUP = 0;
            if (players[bullet.id].statsTree["Bullet Damage"] !== 1) {
              damageUP =
                (players[bullet.id].statsTree["Bullet Damage"] *
                  CONFIG.levelMultiplyer) /
                (data.bullet_damage ** 2 / (data.bullet_damage / 10));
            }
            let PentrationPluse = 0;
            if (players[bullet.id].statsTree["Bullet Pentration"] !== 1) {
              PentrationPluse =
                players[bullet.id].statsTree["Bullet Pentration"] *
                CONFIG.levelMultiplyer;
            }

            let bullet____ = {
              type: __type,
              bullet_distance: bulletdistance,
              speed: bullet_speed__ + speedUP,
              size: bullet_size_l,
              angle: angle_,
              bullet_damage:
                data.bullet_damage * cannon["bulletSize"] + damageUP,
              distanceTraveled: 0,
              vertices: null,
              bullet_pentration:
                data.bullet_pentration * cannon["bullet_pentration"] +
                PentrationPluse,
              x: bullet_start_x,
              y: bullet_start_y,
              lifespan: cannon_life,
              health: health,
              xstart: data.x,
              ystart: data.y,
              id: bullet.id,
              uniqueid: identdfire,
              Zlevel: 3,
              cannonIndex: data.cannonIndex,
            };

            bullets.push(bullet____);
            var interval__;
            var reload_bullet = setTimeout(() => {
              let canfire = true;
              bullet_intervals.forEach((intervals) => {
                if (intervals.id === bullet.uniqueid) {
                  canfire = intervals.canfire;
                  interval__ = intervals;
                }
              });
              if (!canfire) {
                var index_1 = bullet_intervals.indexOf(interval__);
                if (index_1 !== -1 && !canfire) {
                  bullet_intervals.splice(index_1, 1);
                }
                return;
              }
              __reload__ = 1;
              for (
                let i = 0;
                i < players[data.id].statsTree["Bullet Reload"];
                ++i
              ) {
                __reload__ /= CONFIG.levelMultiplyer;
              }
              auto_bullet();
            }, 500 * tankmeta[players[data.id].__type__]["reaload-m"] * cannon["reloadM"] * __reload__ * 2);
          }
          setTimeout(() => {
            __reload__ = 1;
            for (
              let i = 0;
              i < players[data.id].statsTree["Bullet Reload"];
              ++i
            ) {
              __reload__ /= CONFIG.levelMultiplyer;
            }
            auto_bullet();
          }, 500 * tankmeta[players[data.id].__type__]["reaload-m"] * cannon["reloadM"] * __reload__ * 2);
          bullet_intervals.push({ canfire: true, id: bullet.uniqueid });
        }
        emit("bulletUpdate", bullets); // Broadcast to all clients
        break;
      }

      case "MouseAway": {
        if (!players[data.id]) break;
        players[data.id].mousestate = "held";
        break;
      }

      case "MousestateUpdate": {
        if (!players[data.id]) break;
        players[data.id].mousestate = "up";
        break;
      }

      case "FOVUpdate": {
        if (!players[data.id]) break;
        let player = players[data.id];
        player.canvasW = data.canvasW;
        player.canvasH = data.canvasH;
        player.screenWidth = data.screenW;
        player.screenHeight = data.screenH;
        player.FOV = data.scaleFactor;
        break;
      }

      case "playerDied": {
        roads = roads.filter((road) => {
          if (road.id === connection.playerId) {
            return false;
          }
          return true;
        });
        hidden_broswers = hidden_broswers.filter((interval) => {
          if (connection.playerId === interval.id) {
            clearInterval(interval.interval);
            return false;
          }
          return true;
        });
        deadplayers.push(connection.playerId);
        teamlist = teamlist.filter((team) => {
          var teamplayers = team.players;
          teamplayers = teamplayers.filter((player) => {
            return player.id !== connection.playerId;
          });
          team.players = teamplayers;
          if (teamplayers.length === 0) {
            for (const roomkey in food_squares) {
              var room = food_squares[roomkey];
              if (typeof room === "function") continue;
              room.items.forEach((item, index) => {
                if (item.id === team.teamID) {
                  room.items.splice(index, 1);
                  return false;
                }
                return true;
              });
            }
            return false;
          }
          if (team.owner.id === connection.playerId) {
            if (teamplayers.length !== 0) {
              if (team.lowerLevelPlayers.length > 0) {
                team.owner = team.lowerLevelPlayers[0];
                emit("newOwner", {
                  teamID: team.teamID,
                  playerid: team.lowerLevelPlayers[0].id,
                });
                PendingJoinRequests.forEach((_request) => {
                  if (_request.owner === connection.playerId) {
                    _request.owner = team.lowerLevelPlayers[0].id;
                  }
                });
              } else {
                team.owner = teamplayers[0];
                emit("newOwner", {
                  teamID: team.teamID,
                  playerid: teamplayers[0].id,
                });
                PendingJoinRequests.forEach((_request) => {
                  if (_request.owner === connection.playerId) {
                    _request.owner = teamplayers[0].id;
                  }
                });
              }
            } else {
              for (const roomkey in food_squares) {
                var room = food_squares[roomkey];
                if (typeof room === "function") continue;
                room.items = room.items.filter((item) => 
                  item.id !== team.teamID
                );
              }
              return false;
            }
          }
          return true;
        });
        var public_teams = [];
        public_teams = teamlist.map((team) => {
          if (!team.hidden) {
            team.taxInterval = null;
            return team;
          }
        });
        emit("pubteamlist", public_teams);
        try {
          leader_board.shown = leader_board.shown.filter(
            (__index__) => __index__.id !== connection.playerId
          );
          leader_board.hidden = leader_board.hidden.filter(
            (__index__) => __index__.id !== connection.playerId
          );
          emit("boardUpdate", {
            leader_board: leader_board.shown,
          });
        } catch (e) {
          console.log(e);
        }
        emit("playerLeft", connection.playerId);
        break;
      }

      default: {
        console.log("Empty action received.");
      }
    }
  });

  setInterval(function () {
    for (const key in players) {
      if (!players[key].hasOwnProperty("id")) {
        delete players[key];
      }
    }
  }, 5000);

  socket.on("close", () => {
    roads = roads.filter((road) => {
      if (road.id === connection.playerId) {
        return false;
      }
      return true;
    });
    IPs = IPs.splice(IPs.indexOf(req.socket.remoteAddress), 1);
    hidden_broswers = hidden_broswers.filter((interval) => {
      if (connection.playerId === interval.id) {
        clearInterval(interval.interval);
        return false;
      }
      return true;
    });
    const index = connections.indexOf(socket);
    deadplayers = deadplayers.splice(
      deadplayers.indexOf(connection.playerId),
      1
    );
    if (index !== -1) {
      connections.splice(index, 1); // Remove the connection from the list
    }
    try {
      leader_board.shown = leader_board.shown.filter(
        (__index__) => __index__.id !== connection.playerId
      );
      leader_board.hidden = leader_board.hidden.filter(
        (__index__) => __index__.id !== connection.playerId
      );
      emit("boardUpdate", {
        leader_board: leader_board.shown,
      });
    } catch (e) {
      console.log(e);
    }
    try {
      var _player = userbase.find((_player_) => {
        return (
          Math.abs(_player_.userid - players[connection.playerId]?.userId) <
          0.01
        );
      });
      if (players[connection.playerId])
        _player.scores.push({
          score: players[connection.playerId].score,
          Date: Date.now(),
        });
      _player.scores.sort(function (a, b) {
        if (!a || !b) return false;
        return a.score - b.score;
      });
      _player.scores.reverse();
      _player.scores = _player.scores.slice(0, 10);
      fs.writeFile(
        "data/users.json",
        JSON.stringify({ userbase: userbase }),
        function (err, data) {
          if (err) throw err;
        }
      );
    } catch (e) {
      console.log(e);
    }
    clearInterval(stateupdate);
    if (players[connection.playerId]) {
      clearTimeout(players[connection.playerId]?.stateTimeout);
    }
    teamlist = teamlist.filter((team) => {
      var teamplayers = team.players;
      teamplayers = teamplayers.filter((player) => {
        return player.id !== connection.playerId;
      });
      team.players = teamplayers;
      if (teamplayers.length === 0) {
        clearInterval(team.taxInterval);
        for (const roomkey in food_squares) {
          var room = food_squares[roomkey];
          if (typeof room === "function") continue;
          room.items = room.items.filter((item) => 
            item.id !== team.teamID
          );
        }
        return false;
      }
      if (team.owner.id === connection.playerId) {
        if (teamplayers.length !== 0) {
          if (team.lowerLevelPlayers.length > 0) {
            team.owner = team.lowerLevelPlayers[0];
            emit("newOwner", {
              teamID: team.teamID,
              playerid: team.lowerLevelPlayers[0].id,
            });
            PendingJoinRequests.forEach((_request) => {
              if (_request.owner === connection.playerId) {
                _request.owner = team.lowerLevelPlayers[0].id;
              }
            });
          } else {
            team.owner = teamplayers[0];
            emit("newOwner", {
              teamID: team.teamID,
              playerid: teamplayers[0].id,
            });
            PendingJoinRequests.forEach((_request) => {
              if (_request.owner === connection.playerId) {
                _request.owner = teamplayers[0].id;
              }
            });
          }
        } else {
          clearInterval(team.taxInterval);
          for (const roomkey in food_squares) {
            var room = food_squares[roomkey];
            if (typeof room === "function") continue;
            room.items = room.items.filter((item) => 
              item.id !== team.teamID
            );
          }
          return false;
        }
      }
      return true;
    });
    var public_teams = [];
    public_teams = teamlist.map((team) => {
      if (!team.hidden) {
        team.taxInterval = null;
        team.powers = {};
        return team;
      }
    });
    emit("pubteamlist", public_teams);

    players = Object.entries(players).reduce((newPlayers, [key, value]) => {
      if (key !== connection.playerId) {
        newPlayers[key] = value;
      }
      return newPlayers;
    }, {});
    autocannons = autocannons.filter((cannons___0_0) => {
      return connection.playerId !== cannons___0_0.playerid;
    });
    emit("autoCannonUPDATE-ADD", autocannons);
    emit("playerLeft", { playerID: connection.playerId });
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

let loglimit = 10000;
let tempToPush = [];
let tempBulletToPush = [];
var limit = 0;
let buildArray = [];

setInterval(() => {
  frame++;
  // Filter and update bullets
  var deadlist = [];
  bullets = bullets.filter((bullet, i) => {
    let WanderControlled = false;
    if (bullet.type === "directer") {
      try {
        if (!players[bullet.id].autoFiring) {
          let recipracailFOV = 1 + (1 - players[bullet.id].FOV);
          let dx =
            players[bullet.id].x -
            players[bullet.id].canvasW / 2 +
            players[bullet.id].MouseX / players[bullet.id].FOV;

          let dy =
            players[bullet.id].y -
            players[bullet.id].canvasH / 2 +
            players[bullet.id].MouseY / players[bullet.id].FOV;

          let angle = Math.atan2(dy - bullet.y, dx - bullet.x);
          if (
            Math.abs(players[bullet.id].y - dy) < bullet.speed * 2 &&
            Math.abs(players[bullet.id].x - dx) < bullet.speed * 2
          ) {
            bullet.angle += 0.5 * (pi / 180);
          } else {
            bullet.angle = angle;
            if (players[bullet.id]?.mousestate === "held") {
              bullet.angle = Math.atan2(bullet.y - dy, bullet.x - dx);
            }
          }
        } else if (players[bullet.id].autoFiring) {
          let buildframe = {
            x: players[bullet.id].canvasW / CONFIG.droneRange,
            y: players[bullet.id].canvasH / CONFIG.droneRange,
          };
          var pointerAngle;
          let buildrect = {
            v1: players[bullet.id].x - buildframe.x,
            v2: players[bullet.id].x + buildframe.x,
            v3: players[bullet.id].y - buildframe.y,
            v4: players[bullet.id].y + buildframe.y,
          };
          let fire_at_ = null;
          let cannon =
            tankmeta[players[bullet.id].__type__]["cannons"][
              bullet.cannonIndex
            ];
          var maxdistance = 5001;
          for (const playerID in players) {
            let player = players[playerID];
            var sameTeam =
              player.team === players[bullet.id].team &&
              player.team !== null &&
              players[bullet.id].team !== null;
            if (playerID !== bullet.id && !sameTeam) {
              let distance = MathHypotenuse(
                player.x - bullet.x,
                player.y - bullet.y
              );
              if (
                player.x > buildrect.v1 &&
                player.x < buildrect.v2 &&
                player.y > buildrect.v3 &&
                player.y < buildrect.v4 &&
                distance < maxdistance
              ) {
                pointerAngle = Math.atan2(
                  player.y - bullet.y,
                  player.x - bullet.x
                );

                maxdistance = distance;
                console.log("player", player);
                fire_at_ = player;
              }
            }
          }
          //console.log(maxdistance)
          if (maxdistance > CONFIG.playerItemSightRange) {
            food_squares.forEach((item_) => {
              let distance = MathHypotenuse(
                item_.x - bullet.x,
                item_.y - bullet.y
              );
              if (
                item_.x > buildrect.v1 &&
                item_.x < buildrect.v2 &&
                item_.y > buildrect.v3 &&
                item_.y < buildrect.v4 &&
                distance < maxdistance
              ) {
                pointerAngle = Math.atan2(
                  item_.y - bullet.y,
                  item_.x - bullet.x
                );

                maxdistance = distance;
                //console.log("item",pointerAngle)
                fire_at_ = item_;
              }
            });
          }
          if (fire_at_) {
            bullet.angle = pointerAngle;
            var newX = bullet.x + bullet.speed * Math.cos(pointerAngle);
            var newY = bullet.y + bullet.speed * Math.sin(pointerAngle);
          }
          if (!fire_at_) {
            bullet.wander.think();
            bullet.setBaseXY();
            var pointerAngle_ = bullet.wander.returnAngle();
            bullet.angle = pointerAngle_;
            var newX = bullet.x + bullet.speed * Math.cos(pointerAngle_);
            var newY = bullet.y + bullet.speed * Math.sin(pointerAngle_);
          }
        } else {
          throw Error("dirty player state");
        }
      } catch (e) {
        // delet bad bullets
        console.log(e);
        if (players[bullet.id]) {
          emit("dronekilled", { droneID: bullet.id });
        }
        return false;
      }
    }
    let collied = false;
    if (bullet.type === "FreeNecromancer" || bullet.type === "FreeSwarm") {
      // choose a player to attak
      if (frame % 3 === 0) {
        var maxdistance = 600;
        var maxfov = 2400;
        var target = { x: bullet.x, y: bullet.y };
        var foundTarget = false;
        for (const playerId in players) {
          var player = players[playerId];
          let newdistance = MathHypotenuse(
            player.x - bullet.x,
            player.y - bullet.y
          );
          if (newdistance < maxfov) {
            target = { x: player.x, y: player.y, distance: newdistance };
            newdistance = maxdistance;
            foundTarget = true;
          }
        }
        if (foundTarget && distance < maxdistance) {
          bullet.target = target;
        } else if (foundTarget) {
          bullet.target = target;
        } else if (!foundTarget) {
          bullet.target = { x: 0, y: 0, distance: 4000 };
        }

        var __angle = Math.atan2(
          bullet.target.y - bullet.y,
          bullet.target.x - bullet.x
        );

        bullet.angle = __angle;
      }
      if (
        bullet.target &&
        bullet.target?.distance < CONFIG.playerBaseSize &&
        __angle !== 0
      ) {
        var newX = bullet.x;
        var newY = bullet.y;
        bullet.wander.setXY(bullet.x, bullet.y);
      } else if (bullet.target?.distance < 600) {
        var boss = findThisBoss(bullet.id);
        bullet.wander.setBaseXY(boss.x, boss.y);
        var newX = bullet.x + bullet.speed * Math.cos(bullet.angle);
        var newY = bullet.y + bullet.speed * Math.sin(bullet.angle);
        bullet.wander.setXY(newX, newY);
      } else if (
        bullet.target &&
        bullet.target?.distance > 600 &&
        bullet.target?.distance < 2400
      ) {
        var boss = findThisBoss(bullet.id);
        bullet.wander.think();
        bullet.wander.setBaseXY(boss.x, boss.y);
        let tempAngle = bullet.wander.returnAngle();
        var newX = bullet.x + bullet.speed * Math.cos(tempAngle);
        var newY = bullet.y + bullet.speed * Math.sin(tempAngle);
        bullet.wander.setXY(newX, newY);
      } else {
        bullet.wander.setXY(bullet.x, bullet.y);
        var newX = bullet.x;
        var newY = bullet.y;
      }
    } else {
      var newX = bullet.x + bullet.speed * Math.cos(bullet.angle);
      var newY = bullet.y + bullet.speed * Math.sin(bullet.angle);
    }
    var newX__;
    var newY__;
    if (
      bullet.type !== "directer" &&
      bullet.type !== "FreeNecromancer" &&
      bullet.type !== "FreeSwarm"
    ) {
      bullet.distanceTraveled += MathHypotenuse(
        newX - bullet.x,
        newY - bullet.y
      );

      if (
        !(
          bullet.x >= food_squares[bullet.sedoRoomKey]?.bounds?.x1 &&
          bullet.x <= food_squares[bullet.sedoRoomKey]?.bounds?.x2 &&
          bullet.y >= food_squares[bullet.sedoRoomKey]?.bounds?.y1 &&
          bullet.y <= food_squares[bullet.sedoRoomKey]?.bounds?.y2
        )
      ) {
        bullet.sedoRoomKey = getKeyRoom(newX, newY) ?? bullet.sedoRoomKey;
      }
    }

    if (
      bullet.type === "trap" ||
      bullet.type === "roadMap" ||
      bullet.type === "directer" ||
      bullet.type === "FreeSwarm" ||
      bullet.type === "FreeNecromancer"
    ) {
      if (
        bullet.bullet_distance - bullet.distanceTraveled < 200 &&
        bullet.type === "roadMap"
      ) {
        bullet.speed -= (bullet.bullet_distance - bullet.distanceTraveled) / 85;
        if (bullet.speed <= 0) bullet.speed = 0;
      }

      bullets.forEach((bullet_) => {
        let distance = MathHypotenuse(
          bullet.x - bullet_.x,
          bullet.y - bullet_.y
        );

        if (distance > 50 || WanderControlled) return;
        var bullet_speed = bullet.speed;

        if (
          distance < bullet.size * 2 + bullet_.size * 2 &&
          bullet.id !== bullet_.id &&
          !WanderControlled &&
          !(
            players[bullet?.id]?.team === players[bullet_?.id]?.team &&
            players[bullet?.id]?.team !== null &&
            players[bullet_?.id]?.team !== null
          )
        ) {
          if (
            (bullet_speed !== 0 &&
              bullet_speed !== 0 &&
              (!bullet_.speed || !bullet_speed) &&
              bullet.type === "trap") ||
            bullet.type === "roadMap"
          )
            return;
          bullet.bullet_distance -=
            bullet_.speed *
            (bullet_.size / 5 +
              Math.cos(Math.abs(bullet.angle - bullet_.angle)));
          bullet_.bullet_distance -=
            bullet_speed *
            (bullet.size / 2 +
              Math.cos(Math.abs(bullet.angle - bullet_.angle)));
        }
        if (
          distance < bullet.size * 1.25 + bullet_.size * 1.25 &&
          bullet.id === bullet_.id &&
          bullet.uniqueid !== bullet_.uniqueid &&
          bullet.type === bullet_.type &&
          bullet_speed !== 0 &&
          bullet_speed !== 0 &&
          players[bullet.id] &&
          players[bullet_.id] &&
          !(
            players[bullet.id]?.team === players[bullet_.id]?.team &&
            players[bullet.id]?.team !== null &&
            players[bullet_.id]?.team !== null
          ) &&
          bullet.type !== "FreeNecromancer" &&
          bullet.type !== "FreeSwarm"
        ) {
          var realangle =
            bullet_.angle === 0 ? bullet_.angle : getRandomInt(-pi, pi);
          newX__ = bullet.size * -0.9 * Math.sin(realangle);
          newY__ = bullet.size * -0.9 * Math.cos(realangle);
          collied = true;
          bullet_.x += -newX__;
          bullet_.y += -newY__;
        }
        if (
          distance < bullet.size * 1.25 + bullet_.size * 1.25 &&
          bullet.id === bullet_.id &&
          bullet.uniqueid !== bullet_.uniqueid &&
          bullet.type === bullet_.type &&
          (bullet.type === "FreeNecromancer" || bullet.type === "FreeSwarm") &&
          !WanderControlled
        ) {
          var realangle =
            bullet_.angle === 0 ? bullet_.angle : getRandomInt(-pi, pi);
          newX__ = bullet.size * -0.9 * Math.sin(realangle);
          newY__ = bullet.size * -0.9 * Math.cos(realangle);
          collied = true;
          bullet_.x += -newX__;
          bullet_.y += -newY__;
        }
      });

      const rawvertices = calculateTriangleVertices(
        bullet.x,
        bullet.y,
        bullet.size * 3,
        0
      );
      bullet.vertices = rawvertices;
    } else {
      bullets.forEach((bullet_) => {
        let distance = MathHypotenuse(
          bullet.x - bullet_.x,
          bullet.y - bullet_.y
        );

        if (distance > 50) return;
        var bullet_speed = bullet.speed || 10;

        var sameTeam =
          players[bullet.id]?.team === players[bullet_.id]?.team &&
          players[bullet.id]?.team !== null &&
          players[bullet_.id]?.team !== null;
        if (
          distance < bullet.size * 2 + bullet_.size * 2 &&
          bullet.id !== bullet_.id &&
          !sameTeam
        ) {
          bullet.bullet_distance -=
            bullet_.speed *
            (bullet_.size / 5 +
              Math.cos(Math.abs(bullet.angle - bullet_.angle)));
        }
      });
    }
    if (
      -(bullet.distanceTraveled - bullet.bullet_distance) <
      25 * bullet.speed ** 2
    ) {
      bullet.transparency =
        1 - bullet.distanceTraveled / bullet.bullet_distance < 0
          ? 0.000000000000001
          : 1 - bullet.distanceTraveled / bullet.bullet_distance;
    }

    for (const playerId in players) {
      var player = players[playerId];
      var distance = MathHypotenuse(player.x - bullet.x, player.y - bullet.y);
      let player40 = player.size * CONFIG.playerBaseSize;
      var sameTeam =
        players[bullet.id]?.team === players[playerId]?.team &&
        players[bullet.id]?.team !== null &&
        players[playerId]?.team !== null;
      if (player.state !== "start" && !sameTeam) {
        let bulletsize = bullet.size;
        let con = false;
        if (bullet.boundtype === "square") {
          const rawvertices = calculateSquareVertices(
            bullet.x,
            bullet.y,
            bullet.size,
            bullet.angle
          );
          if (
            distance < 2 * player40 + bullet.size &&
            bullet.id !== player.id
          ) {
            var collisionCheck = isPlayerCollidingWithPolygon(
              player,
              rawvertices
            );
            con = collisionCheck[0];
          }
          if (bullet.boundtype === "triangle") {
            const rawvertices = calculateTriangleVertices(
              bullet.x,
              bullet.y,
              bullet.size,
              bullet.angle
            );
            if (
              distance < 2 * player40 + bullet.size &&
              bullet.id !== player.id
            ) {
              var collisionCheck = isPlayerCollidingWithPolygon(
                player,
                rawvertices
              );
              con = collisionCheck[0];
            }
          } else {
            con = false;
          }
        } else {
          con = distance < player40 + bullet.size && bullet.id !== player.id;
        }
        if (con) {
          if (bullet.type === "trap" || bullet.type === "roadMap") {
            player.health -=
              (bullet.bullet_damage - 3.8) /
              (player.size + 6 / bullet.size + 3);
            bullet.bullet_distance /=
              bullet.size / (bullet.bullet_pentration + 10);
          } else if (
            bullet.type === "directer" ||
            bullet.type === "FreeNecromancer" ||
            bullet.type === "FreeSwarm"
          ) {
            player.health -=
              (bullet.bullet_damage - 4.4) /
              (player.size + 6 / bullet.size + 5);
            bullet.bullet_distance -=
              bullet.size / (bullet.bullet_pentration + 10);
          } else {
            player.health -=
              (bullet.bullet_damage - 3.8) /
              ((player.size + 12) / bullet.speed);
            bullet.bullet_distance -=
              bullet.size / (bullet.bullet_pentration + 10);
          }
          emit("bulletDamage", {
            playerID: player.id,
            playerHealth: player.health,
            BULLETS: bullets,
          });
          if (player.health <= 0) {
            try {
              var reward = Math.round(
                player.score / (20 + players[bullet.id].score / 10000)
              );
              if (player.team !== null) {
                var team = teamlist.find((team) => team.teamID === player.team);
                if (team.owner.id !== player.id || team.createTeamScore) {
                  reward -= reward * team.simpleTax;
                }
                if (team.createTeamScore) {
                  team.teamScore += (reward * team.simpleTax) / 2;
                } else {
                  emit("playerScore", {
                    bulletId: team.owner.id,
                    socrepluse: reward * team.simpleTax,
                  });
                }
                var complexTax = reward * ((player.score / 100000) * playerTax);
                if (team.owner.id !== player.id || team.createTeamScore) {
                  reward -= complexTax;
                }
                if (team.createTeamScore) {
                  team.teamScore += complexTax / 1.5;
                } else {
                  emit("playerScore", {
                    bulletId: team.owner.id,
                    socrepluse: complexTax,
                  });
                }
              }
            } catch (e) {
              console.log(bullet.id);
            }
            if (players[bullet.id]) {
              player.score += reward;
              emit("playerScore", {
                bulletId: bullet.id,
                socrepluse: reward,
                kill: true,
              });
              createAnnocment(
                `You killed ${player.username}'s ${player.__type__}`,
                bullet.id
              );
            } else {
              var boss = bosses.find(
                (boss_) => boss_.cannons[0].id === bullet.id
              );
              boss.score += reward;
            }
            emit("playerDied", {
              playerID: player.id,
              rewarder: bullet.id,
              reward: reward,
            });
            try {
              leader_board.shown.forEach((__index__) => {
                if (__index__.id === player.id) {
                  leader_board.shown.splice(
                    leader_board.shown.indexOf(__index__)
                  );
                }
              });
              leader_board.hidden.forEach((__index__) => {
                if (__index__.id === player.id) {
                  leader_board.hidden.splice(
                    leader_board.hidden.indexOf(__index__)
                  );
                }
              });
              emit("boardUpdate", {
                leader_board: leader_board.shown,
              });
            } catch (e) {
              console.log(e);
            }
            leader_board.hidden.forEach((__index__) => {
              if (__index__.id === bullet.id) {
                __index__.score += reward;
                let isshown = false;
                isshown = leader_board.shown.find((__index__) => {
                  if (__index__.id === bullet.id) {
                    return true;
                  }
                });
                if (leader_board.shown[10]) {
                  if (leader_board.shown[10].score < __index__.score) {
                    leader_board.shown[10] = __index__;
                  }
                } else if (!leader_board.shown[10] && !isshown) {
                  leader_board.shown.push(__index__);
                }
              }
            });
            leader_board.shown.forEach((__index__) => {
              if (__index__.id === bullet.id) {
                __index__.score += reward;
              }
            });
            rearrange();
            emit("boardUpdate", {
              leader_board: leader_board.shown,
            });
          } else {
            if (bullet.type !== "expoled") {
              var knockBackX = bullet.speed * Math.cos(bullet.angle);
              var knockBackY = bullet.speed * Math.sin(bullet.angle);
            } else {
              var realPushBackAngle = Math.atan2(
                bullet.x - player.x,
                bullet.y - player.y
              );
              var knockBackX = bullet.exspandRate * Math.cos(realPushBackAngle);
              var knockBackY = bullet.exspandRate * Math.sin(realPushBackAngle);
            }
            emit("bouceBack", {
              response: { x: knockBackX, y: knockBackY },
              playerID: player.id,
            });
          }
        }
      }
    }
    if (bullet.type === "expoled") {
      bullet.size += bullet.exspandRate;
      if (Date.now() > bullet.endTime) {
        return false;
      }
    }
    if (bullet.distanceTraveled <= bullet.bullet_distance) {
      bullet.x = newX;
      bullet.y = newY;
      if (bullet.type === "roadMap") {
        let road = roads.find((road) => road.uniqueid === bullet.uniqueid);
        road.x = newX;
        road.y = newY;
      }
      if (bullet.type === "directer") {
        bullet.wander.setXY(newX, newY);
      }
      if (collied) {
        bullet.x += newX__;
        bullet.y += newY__;
      }

      return true;
    }

    if (bullet.type === "directer") {
      emit("dronekilled", { droneID: bullet.id });
    } else if (bullet.type === "roadMap") {
      let road = roads.find((road) => road.uniqueid === bullet.uniqueid);
      roads = roads.splice(roads.indexOf(road), 1);
    } else if (
      bullet.type === "FreeNecromancer" ||
      bullet.type === "FreeSwarm"
    ) {
      deadlist.push(bullet.id);
    } else if (bullet.type === "AutoBullet") {
      autocannons = autocannons.filter((cannon) => {
        if (bullet.id === cannon.playerid) return false;
        return true;
      });
    }

    bullet_intervals.forEach((__bullet_) => {
      if (bullet.uniqueid === __bullet_.id) {
        __bullet_.canfire = false;
      }
    });
    return false;
  });

  autocannons.forEach((cannon) => {
    let maxdistance = 2000;
    let fire_at__ = null;
    let target_enity_type = null;
    if (cannon._type_ !== "bulletAuto") {
      if (players[cannon.playerid] == undefined) return;
      var tankdatacannon__ =
        tankmeta[players[cannon.playerid].__type__]["cannons"];
    } else if (cannon._type_ === "bulletAuto") {
      let par_ = findBullet(cannon.playerid);
      if (par_ == null || players[par_.id] === undefined) return;
      var tankdatacannon__ = tankmeta[players[par_.id].__type__]["cannons"];
    }

    for (const playerID in players) {
      let player = players[playerID];
      if (
        playerID !== cannon.playerid &&
        players[cannon.playerid] &&
        !(
          players[playerID].team === players[cannon.playerid].team &&
          players[playerID].team !== null &&
          players[cannon.playerid].team !== null
        )
      ) {
        var offSet_x = tankdatacannon__[cannon.autoindex]["offSet-x"];
        if (tankdatacannon__[cannon.autoindex]["offSet-x"] === "playerX") {
          offSet_x = players[cannon.playerid].size * CONFIG.playerBaseSize;
        }
        if (tankdatacannon__[cannon.autoindex]["offSet-x-multpliyer"]) {
          offSet_x *= -1;
        }
        if (cannon["x_"]) {
          var distance = MathHypotenuse(
            player.x - (players[cannon.playerid].x + cannon["x_"]),
            player.y - (players[cannon.playerid].y + cannon["y_"])
          );
        } else if (cannon._type_ === "bulletAuto") {
          let parentBullet = findBullet(cannon.playerid);
          var distance = MathHypotenuse(
            player.x - parentBullet.x,
            player.y - parentBullet.y
          );
        } else {
          var distance = MathHypotenuse(
            player.x - (players[cannon.playerid].x + offSet_x),
            player.y - players[cannon.playerid].y
          );
        }
        if (distance < maxdistance) {
          if (cannon._type_ === "SwivelAutoCannon") {
            var angle = Math.atan2(
              player.y - players[cannon.playerid].y, // y difference
              player.x - players[cannon.playerid].x // x difference
            );
          } else if (cannon._type_ === "bulletAuto") {
            let parentBullet = findBullet(cannon.playerid);
            var angle = Math.atan2(
              player.y - parentBullet.y,
              player.x - parentBullet.x
            );
          } else {
            var angle = Math.atan2(
              player.y - players[cannon.playerid].y, // y difference
              player.x - (players[cannon.playerid].x + offSet_x) // x difference
            );
          }

          if (cannon._type_ !== "bulletAuto") {
            var playerRadangle = (players[cannon.playerid].angle * pi) / 180;
          }
          if (cannon._type_ === "bulletAuto") {
            var playerRadangle =
              (players[__parentBullet__.id].angle * pi) / 180;
          }

          if (cannon._type_ === "SwivelAutoCannon") {
            if (
              tankmeta[players[cannon.playerid].__type__]["cannons"][
                cannon.autoindex
              ]["offSet-x-multpliyer"] === -1
            ) {
              if (
                isTargetInSwivelRange(
                  players[cannon.playerid].cannon_angle,
                  angle * (180 / pi),
                  true,
                  180
                )
              ) {
                maxdistance = distance;
                fire_at__ = player;
                target_enity_type = "player";
              }
            } else {
              if (
                isTargetInSwivelRange(
                  players[cannon.playerid].cannon_angle,
                  angle * (180 / pi),
                  true,
                  0
                )
              ) {
                maxdistance = distance;
                fire_at__ = player;
                target_enity_type = "player";
              }
            }
          } else {
            maxdistance = distance;
            fire_at__ = player;
            target_enity_type = "player";
          }
        }
      }
    }
    if (maxdistance > CONFIG.playerItemSightRange) {
      if (cannon._type_ === "bulletAuto") {
        var __parentBullet__ = findBullet(cannon.playerid);
      }
      getRoomAndBounding(
        players[cannon.playerid].x,
        players[cannon.playerid].y
      ).items.forEach((item) => {
        var offSet_x = tankdatacannon__[cannon.autoindex]["offSet-x"];
        if (tankdatacannon__[cannon.autoindex]["offSet-x"] === "playerX") {
          offSet_x = players[cannon.playerid].size * CONFIG.playerBaseSize;
        }
        if (tankdatacannon__[cannon.autoindex]["offSet-x-multpliyer"]) {
          offSet_x *= -1;
        }
        if (cannon["x_"]) {
          var distance = MathHypotenuse(
            item.x - (players[cannon.playerid].x + cannon["x_"]),
            item.y - (players[cannon.playerid].y + cannon["y_"])
          );
        } else if (cannon._type_ === "bulletAuto") {
          let parentBullet = findBullet(cannon.playerid);
          var distance = MathHypotenuse(
            item.x - parentBullet.x,
            item.y - parentBullet.y
          );
        } else {
          var distance = MathHypotenuse(
            item.x - (players[cannon.playerid].x + offSet_x),
            item.y - players[cannon.playerid].y
          );
        }
        if (distance < maxdistance) {
          if (cannon._type_ === "SwivelAutoCannon") {
            var angle = Math.atan2(
              item.y - players[cannon.playerid].y, // y difference
              item.x - players[cannon.playerid].x // x difference
            );
          } else if (cannon._type_ === "bulletAuto") {
            let parentBullet = findBullet(cannon.playerid);
            var angle = Math.atan2(
              item.y - parentBullet.y,
              item.x - parentBullet.x
            );
          } else {
            var angle = Math.atan2(
              item.y - players[cannon.playerid].y, // y difference
              item.x - (players[cannon.playerid].x + offSet_x) // x difference
            );
          }

          if (cannon._type_ !== "bulletAuto") {
            var playerRadangle = (players[cannon.playerid].angle * pi) / 180;
          }
          if (cannon._type_ === "bulletAuto") {
            var playerRadangle =
              (players[__parentBullet__.id].angle * pi) / 180;
          }

          if (cannon._type_ === "SwivelAutoCannon") {
            if (
              tankmeta[players[cannon.playerid].__type__]["cannons"][
                cannon.autoindex
              ]["offSet-x-multpliyer"] === -1
            ) {
              if (
                isTargetInSwivelRange(
                  players[cannon.playerid].cannon_angle,
                  angle * (180 / pi),
                  true,
                  180
                )
              ) {
                maxdistance = distance;
                fire_at__ = item;
                target_enity_type = "food";
              }
            } else {
              if (
                isTargetInSwivelRange(
                  players[cannon.playerid].cannon_angle,
                  angle * (180 / pi),
                  true,
                  0
                )
              ) {
                maxdistance = distance;
                fire_at__ = item;
                target_enity_type = "food";
              }
            }
          } else {
            maxdistance = distance;
            fire_at__ = item;
            target_enity_type = "food";
          }
        }
      });
    }
    if (target_enity_type === "player" && fire_at__) {
      if (cannon.targetID !== fire_at__.playerId) {
        if (cannon.angle < cannon.targetAngle) {
          cannon.angle += (cannon.targetAngle - cannon.angle) / 5;
        } else if (cannon.angle > cannon.targetAngle) {
          cannon.angle -= (cannon.angle - cannon.targetAngle) / 5;
        }
      }
    }
    if (target_enity_type === "food" && fire_at__) {
      if (cannon._type_ !== "SwivelAutoCannon") {
        if (
          cannon.angle < cannon.targetAngle &&
          Math.abs(cannon.angle - cannon.targetAngle) > 0.1
        ) {
          if (cannon._type_ === "bulletAuto") {
            var reload_1 =
              players[__parentBullet__.id].statsTree["Bullet Reload"] - 1;
          } else {
            var reload_1 =
              players[cannon.playerid].statsTree["Bullet Reload"] - 1;
          }
          cannon.angle +=
            Math.abs(cannon.angle - cannon.targetAngle) / (3.5 - reload_1 / 2);
          emit("autoCannonUPDATE-ANGLE", {
            angle: cannon.angle,
            cannon_ID: cannon.CannonID,
          });
        } else if (
          cannon.angle > cannon.targetAngle &&
          Math.abs(cannon.angle - cannon.targetAngle) > 0.1
        ) {
          if (cannon._type_ === "bulletAuto") {
            var reload_1 =
              players[__parentBullet__.id].statsTree["Bullet Reload"] - 1;
          } else {
            var reload_1 =
              players[cannon.playerid].statsTree["Bullet Reload"] - 1;
          }
          cannon.angle -=
            Math.abs(cannon.angle - cannon.targetAngle) / (3.5 - reload_1 / 2);
          emit("autoCannonUPDATE-ANGLE", {
            angle: cannon.angle,
            cannon_ID: cannon.CannonID,
          });
        }
      } else {
        moveCannonAngle(cannon);
      }
    }
    if (fire_at__ !== undefined && fire_at__ !== null) {
      if (cannon._type_ === "SwivelAutoCannon") {
        var angle = Math.atan2(
          fire_at__.y - (players[cannon.playerid].y + cannon["y_"]), // y difference
          fire_at__.x - (players[cannon.playerid].x + cannon["x_"]) // x difference
        );
      } else if (cannon._type_ === "bulletAuto") {
        var angle = Math.atan2(
          fire_at__.y - __parentBullet__.y, // y difference
          fire_at__.x - __parentBullet__.x // x difference
        );
      } else {
        var angle = Math.atan2(
          fire_at__.y - players[cannon.playerid].y, // y difference
          fire_at__.x - players[cannon.playerid].x // x difference
        );
      }

      cannon.targetAngle = angle;
      cannon.targetEntity = fire_at__;
      if (target_enity_type === "player") {
        cannon.targetID = fire_at__.playerId;
      }
      if (target_enity_type === "food") {
        cannon.targetID = fire_at__.randomID;
      }
    }
  });

  tempToPush = [];
  tempBulletToPush = [];
  for (const roomkey in food_squares) {
    var room = food_squares[roomkey];
    if (typeof room === "function") continue;
    room.items = room.items.filter((item, index) => {
      if (
        !(
          item.x >= room.bounds?.x1 &&
          item.x <= room.bounds?.x2 &&
          item.y >= room.bounds?.y1 &&
          item.y <= room.bounds?.y2
        )
      ) {
        reassignRoom(item, room);
        return false;
      }
      if (
        item.subtype !== "Enemyboss:Square" &&
        item.subtype !== "Enemyboss:Triangle"
      ) {
        item.x = item.centerX + item.scalarX * Math.cos(angle);
        item.y = item.centerY + item.scalarY * Math.sin(angle);
      } else if (
        item.subtype === "Enemyboss:Square" ||
        item.subtype === "Enemyboss:Triangle"
      ) {
        var maxdistance = CONFIG.bossLookUpRange;
        var target = { x: item.x, y: item.y };
        for (const playerId in players) {
          var player = players[playerId];
          let newdistance = MathHypotenuse(
            Math.abs(player.x - item.x),
            Math.abs(player.y - item.y)
          );
          if (newdistance < maxdistance) {
            target = { x: player.x, y: player.y };
            newdistance = maxdistance;
          }
        }
        let __angle = Math.atan2(target.y - item.y, target.x - item.x);
        let newX = item.x + item.speed * Math.cos(__angle);
        let newY = item.y + item.speed * Math.sin(__angle);
        item.centerX = newX;
        item.centerY = newY;
        item.x = newX;
        item.y = newY;
        item.updateXY(item.randomID, item.x, item.y);
      }
      if (item.type === "pentagon") {
        item.angle += CONFIG.rotationSpeed.pentagon;
      } else if (
        item.subtype !== "Enemyboss:Square" &&
        item.subtype !== "Enemyboss:Triangle" &&
        !/octagon/.test(item.type)
      ) {
        item.angle += CONFIG.rotationSpeed.triangleSquare;
      } else if (
        item.subtype === "Enemyboss:Square" ||
        item.subtype === "Enemyboss:Triangle"
      ) {
        item.angle += CONFIG.rotationSpeed.bosses;
      }
      if (item.angle >= 360) {
        item.angle = 0;
      }
      if (item.type === "square") {
        const rawvertices = calculateSquareVertices(
          item.x,
          item.y,
          item.size,
          item.angle
        );
        item.vertices = rawvertices;
      } else if (item.type === "triangle") {
        const rawvertices = calculateTriangleVertices(
          item.x,
          item.y,
          item.size,
          item.angle
        );
        item.vertices = rawvertices;
      } else if (item.type === "pentagon") {
        const rawvertices = calculateRotatedPentagonVertices(
          item.x,
          item.y,
          item.size,
          item.angle
        );
        item.vertices = rawvertices;
      } else if (/octagon/.test(item.type)) {
        const rawvertices = calculateRotatedOctagonVertices(
          item.x,
          item.y,
          item.size,
          item.angle
        );
        item.vertices = rawvertices;
      }
      let realtype = item.type;
      if (item.subtype === "Enemyboss:Square") {
        realtype = "square:boss";
        let points = midpointCalc(item.vertices);
        for (let i = 0; i < 4; i++) {
          item.cannons[i].x = points[i].x;
          item.cannons[i].y = points[i].y;
        }
        item.cannons.forEach((cannon, i) => {
          if (cannon.canfire && cannon.current < cannon.maxbullets) {
            cannon.current += 1;
            cannon.canfire = false;
            setTimeout(() => {
              cannon.canfire = true;
            }, item.reload);
            var randID = Math.random() * 3 * Date.now();
            let bullet____ = {
              type: "FreeNecromancer",
              bullet_distance: 1000,
              speed: 3,
              size: 50,
              angle: 0.1,
              bullet_damage: 6,
              distanceTraveled: 0,
              vertices: null,
              bullet_pentration: 1,
              x: item.x,
              y: item.y,
              lifespan: 0,
              health: 10,
              xstart: item.x,
              ystart: item.y,
              id: cannon.id,
              uniqueid: randID,
              boundtype: "square",
              wander: new Wanderer(
                item.x,
                item.y,
                item.size,
                item.x,
                item.y,
                3,
                cannon.current,
                "arc"
              ),
            };

            tempBulletToPush.push(bullet____);
            let boss = bosses.find((boss_) => item.randomID === boss_.id);
            for (let l = 0; l < 10; l++) {
              setTimeout(() => {
                boss.cannons[i].cannonW -= 1;
              }, 20 * l);
              setTimeout(() => {
                boss.cannons[i].cannonW += 1;
              }, 40 * l);
            }
          }
          if (deadlist.length !== 0) console.log(deadlist);
          deadlist.filter((itemx) => {
            if (cannon.id === itemx) {
              cannon.current -= 1;
              return false;
            }
            return true;
          });
        });
      }
      if (item.subtype === "Enemyboss:Triangle") {
        realtype = "triangle:boss";
        let points = midpointCalc(item.vertices);
        item.cannons[0].x = points[1].x;
        item.cannons[0].y = points[1].y;
        item.cannons.forEach((cannon, i) => {
          if (cannon.canfire && cannon.current < cannon.maxbullets) {
            cannon.current += 1;
            cannon.canfire = false;
            setTimeout(() => {
              cannon.canfire = true;
            }, item.reload);
            var randID = Math.random() * 3 * Date.now();
            let bullet____ = {
              type: "FreeSwarm",
              bullet_distance: 400,
              speed: 4,
              size: 5,
              angle: 0.1,
              bullet_damage: 4.5,
              distanceTraveled: 0,
              vertices: null,
              bullet_pentration: 1,
              x: item.x,
              y: item.y,
              lifespan: 0,
              health: 10,
              xstart: item.x,
              ystart: item.y,
              id: cannon.id,
              uniqueid: randID,
              boundtype: "triangle",
              wander: new Wanderer(
                cannon.x,
                cannon.y,
                item.size,
                item.x,
                item.y,
                4,
                cannon.current,
                "arc"
              ),
            };
            tempBulletToPush.push(bullet____);
            let boss = bosses.find((boss_) => item.randomID === boss_.id);
            for (let l = 0; l < 10; l++) {
              setTimeout(() => {
                boss.cannons[i].cannonW -= 1;
              }, 20 * l);
              setTimeout(() => {
                boss.cannons[i].cannonW += 1;
              }, 40 * l);
            }
          }
          if (deadlist.length !== 0) console.log(deadlist);
          deadlist.filter((itemx) => {
            if (cannon.id === itemx) {
              cannon.current -= 1;
              return false;
            }
            return true;
          });
        });
      }
      let return_ = true;
      if (item.isdead) {
        item.transparency = 1 - (Date.now() - item.deathtime) / CONFIG.fadeRate;
      }
      for (const playerId in players) {
        var player = players[playerId];
        let size__ =
          player.size *
            CONFIG.playerBaseSize *
            CONFIG.playerCollisionRangeMultiplyer +
          item.size * CONFIG.itemCollisionRangeMultiplyer;

        if (
          Math.abs(item.x - player.x) < size__ &&
          Math.abs(item.y - player.y) < size__
        ) {
          var sameteam = false;
          if (item.teamId) {
            sameteam =
              players[playerId].team === item.teamId &&
              players[playerId].team !== null;
          }
            var collisionCheck = isPlayerCollidingWithPolygon(
              player,
              item.vertices
            );

            if (collisionCheck[0]) {
              if (!sameteam) {
                var damageplayer = item.body_damage;
                var damageother = player["bodyDamage"];
                if (player.state !== "start") {
                  player.health -= damageplayer;
                }
              }

              if (player.health < 0 && !sameteam) {
                emit("playerDied", {
                  playerID: player.id,
                  rewarder: null,
                  reward: null,
                });
                players = Object.entries(players).reduce(
                  (newPlayers, [key, value]) => {
                    if (key !== player.id) {
                      newPlayers[key] = value;
                    }
                    return newPlayers;
                  },
                  {}
                );
              }

              emit("bouceBack", {
                response: collisionCheck[1].overlapV,
                playerID: player.id,
              });
              for (let i = 0; i < 10; i++) {
                var factor = item.weight / 5 < 1 ? 1 : item.weight / 5;
                setTimeout(() => {
                  let recoilX = collisionCheck[1].overlapV.x / 30;
                  let recoilY = collisionCheck[1].overlapV.y / 30;
                  item.x += recoilX / factor;
                  item.y += recoilY / factor;
                  item.centerX += recoilX / factor;
                  item.centerY += recoilY / factor;
                }, 50 * i);
              }
              if (0 >= item.health && !sameteam) {
                var reward = item.score_add;
                if (player.team !== null) {
                  var team = teamlist.find(
                    (team) => team.teamID === player.team
                  );
                  if (team.owner.id !== player.id || team.createTeamScore) {
                    reward -= reward * team.simpleTax;
                  }
                  if (team.createTeamScore) {
                    team.teamScore += (reward * team.simpleTax) / 2;
                  } else {
                    emit("playerScore", {
                      bulletId: team.owner.id,
                      socrepluse: reward * team.simpleTax,
                    });
                  }

                  console.log(reward * team.simpleTax);

                  var complexTax =
                    reward *
                    (calculateTax(player.score, 10000000) / team.playerTax);
                  if (team.owner.id !== player.id || team.createTeamScore) {
                    console.log(complexTax);
                    reward -= complexTax;
                  }
                  if (team.createTeamScore) {
                    team.teamScore += complexTax / 1.5;
                  } else {
                    emit("playerScore", {
                      bulletId: team.owner.id,
                      socrepluse: complexTax,
                    });
                    players[team.owner.id].score += complexTax;
                  }
                }
                console.log(reward);
                player.score += reward;
                emit("playerScore", {
                  bulletId: player.id,
                  socrepluse: reward,
                });
                leader_board.hidden.forEach((__index__) => {
                  if (__index__.id === player.id) {
                    __index__.score += reward;
                    let isshown = false;
                    isshown = leader_board.shown.find((__index__) => {
                      if (__index__.id === player.id) {
                        return true;
                      }
                    });
                    if (leader_board.shown[10]) {
                      if (leader_board.shown[10].score < __index__.score) {
                        leader_board.shown[10] = __index__;
                      }
                    } else if (!leader_board.shown[10] && !isshown) {
                      leader_board.shown.push(__index__);
                    }
                  }
                });
                leader_board.shown.forEach((__index__) => {
                  if (__index__.id === player.id) {
                    __index__.score += reward;
                  }
                });
                rearrange();
                emit("boardUpdate", {
                  leader_board: leader_board.shown,
                });

                cors_taken.filter((cor) => {
                  if (cor.id === item.randomID) {
                    return false;
                  } else {
                    return true;
                  }
                });

                let respawnrai = item["respawn-raidis"] || CONFIG.map.innersize;
                let x, y;
                do {
                  x = getRandomInt(-respawnrai, respawnrai);
                  y = getRandomInt(-respawnrai, respawnrai);
                } while (
                  cors_taken.some(
                    (c) =>
                      between(
                        x,
                        c.x - CONFIG.map.boundRange,
                        c.x + CONFIG.map.boundRange
                      ) &&
                      between(
                        y,
                        c.y - CONFIG.map.boundRange,
                        c.y + CONFIG.map.boundRange
                      )
                  )
                );
                let randID = Math.random() * index * Date.now();

                cors_taken.push({ x, y, id: randID });

                const valueOp = getRandomInt(1, 15);
                var type = "";
                var color = "";
                var health_max = "";
                var score_add = 0;
                var body_damage = 0;
                var weight = 0;
                if (!item["respawn-raidis"]) {
                  switch (true) {
                    case between(valueOp, 1, 10): // Adjusted to 1-6 for square
                      type = "square";
                      color = "Gold";
                      health_max = 10;
                      score_add = 10;
                      body_damage = 2;
                      weight = 3;
                      break;
                    case between(valueOp, 11, 13): // Adjusted to 7-8 for triangle
                      type = "triangle";
                      color = "Red";
                      health_max = 15;
                      score_add = 15;
                      body_damage = 3.5;
                      weight = 5;
                      break;
                    case between(valueOp, 14, 15): // Adjusted to 9-10 for pentagon
                      type = "pentagon";
                      color = "#579bfa";
                      health_max = 100;
                      score_add = 120;
                      body_damage = 4;
                      weight = 10;
                      break;
                  }
                } else {
                  const valueOp2 = getRandomInt(1, 10);

                  type = "pentagon";
                  color = "#579bfa";
                  health_max = 100;
                  score_add = 120;
                  body_damage = 4;
                  if (valueOp2 === 5) {
                    var size = 150;
                    score_add = 3000;
                    health_max = 1000;
                    body_damage = 9;
                    weight = 300;
                  } else {
                    weight = 10;
                    var size = 50;
                  }
                }
                let fooditem = {
                  type: type,
                  health: health_max,
                  maxhealth: health_max,
                  size: size,
                  angle: getRandomInt(0, 180),
                  x: x,
                  y: y,
                  centerX: x,
                  centerY: y,
                  body_damage: body_damage,
                  weight: weight,
                  scalarX: getRandomInt(-100, 100),
                  scalarY: getRandomInt(-100, 100),
                  vertices: null,
                  color: color,
                  score_add: score_add,
                  randomID: randID,
                };
                if (type === "square") {
                  const rawvertices = calculateSquareVertices(
                    fooditem.x,
                    fooditem.y,
                    fooditem.size,
                    fooditem.angle
                  );
                  fooditem.vertices = rawvertices;
                }
                if (type === "triangle") {
                  const rawvertices = calculateTriangleVertices(
                    fooditem.x,
                    fooditem.y,
                    fooditem.size,
                    fooditem.angle
                  );
                  fooditem.vertices = rawvertices;
                }
                if (type === "pentagon") {
                  const rawvertices = calculateRotatedPentagonVertices(
                    fooditem.x,
                    fooditem.y,
                    fooditem.size,
                    fooditem.angle
                  );
                  fooditem.vertices = rawvertices;
                }

                if (!item.isdead && !item.hasOwnProperty("respawn")) {
                  tempToPush.push(fooditem);
                }

                if (item.hasOwnProperty("respawn")) {
                  var myTeam = teamlist.find(
                    (team) => team.teamID === item.teamId
                  );
                  myTeam.upgrades.teamBuilding = {
                    built: false,
                    level: null,
                    polygonId: null,
                    boosts: {
                      speed: 1,
                      health: 1,
                      cannons: {},
                    },
                    health: 2000,
                  };
                }

                return false;
              } else if (player.state !== "start" && !sameteam) {
                  item.health -= damageother;
              }

              if (player.state !== "start" && !sameteam) {
                emit("shapeDamage", {
                  PlayerId: player.id,
                  playerDamage: damageplayer,
                  shapes: food_squares,
                });
              }
            }
          
        }
      }
      bullets.forEach((bullet) => {
        if (
          Math.abs(bullet.x - item.x) < item.size * 1.5 &&
          Math.abs(bullet.y - item.y) < item.size * 1.5
        ) {
          let collisionCheck = isBulletCollidingWithPolygon(
            bullet,
            item.vertices
          );

          if (bullet.type === "trap" || bullet.type === "roadMap") {
            var bulletSpeed = 4;
          } else {
            var bulletSpeed = bullet.speed || 0;
          }

          var sameteam = false;
          if (item.teamId) {
            sameteam =
              players[bullet.id]?.team === item.teamId &&
              players[bullet.id]?.team !== null;
          }

          if (!collisionCheck || sameteam) return;
          const damage =
            (bullet.bullet_damage / (item.size + bulletSpeed) +
              bullet.bullet_pentration) /
            5;

          if (
            damage >= item.health &&
            bullet.type !== "FreeNecromancer" &&
            bullet.type !== "FreeSwarm"
          ) {
            if (!players[bullet.id]) {
              console.error(bullet.id);
              console.error(players);
              return;
            }
            var reward = item.score_add;

            if (player.team !== null) {
              var team = teamlist.find((team) => team.teamID === player.team);
              if (team.owner.id !== player.id || team.createTeamScore) {
                reward -= reward * team.simpleTax;
              }
              if (team.createTeamScore) {
                team.teamScore += (reward * team.simpleTax) / 2;
              } else {
                emit("playerScore", {
                  bulletId: team.owner.id,
                  socrepluse: reward * team.simpleTax,
                });
              }

              console.log(reward * team.simpleTax);

              var complexTax =
                reward *
                (calculateTax(player.score, 10000000) / team.playerTax);
              if (team.owner.id !== player.id || team.createTeamScore) {
                console.log(complexTax);
                reward -= complexTax;
              }
              if (team.createTeamScore) {
                team.teamScore += complexTax / 1.5;
              } else {
                emit("playerScore", {
                  bulletId: team.owner.id,
                  socrepluse: complexTax,
                });
                players[team.owner.id].score += complexTax;
              }
            }

            console.log(reward);
            if (!item.isdead) {
              players[bullet.id].score += reward;

              leader_board.hidden.forEach((__index__) => {
                if (__index__.id === bullet.id) {
                  __index__.score += reward;
                  let isshown = false;
                  isshown = leader_board.shown.find((__index__) => {
                    if (__index__.id === bullet.id) {
                      return true;
                    }
                  });
                  if (leader_board.shown[10]) {
                    if (leader_board.shown[10].score < __index__.score) {
                      leader_board.shown[10] = __index__;
                    }
                  } else if (!leader_board.shown[10] && !isshown) {
                    leader_board.shown.push(__index__);
                  }
                }
              });
              leader_board.shown.forEach((__index__) => {
                if (__index__.id === bullet.id) {
                  __index__.score += reward;
                }
              });
              rearrange();
              emit("boardUpdate", {
                leader_board: leader_board.shown,
              });
              emit("playerScore", {
                bulletId: bullet.id,
                socrepluse: reward,
              });
            }

            var randID = Math.random() * index * Date.now();

            cors_taken.filter((cor) => {
              if (cor.id === item.randomID) {
                return false;
              } else {
                return true;
              }
            });

            let respawnrai = item["respawn-raidis"] || CONFIG.map.innersize;
            let x, y;
            do {
              x = getRandomInt(-respawnrai, respawnrai);
              y = getRandomInt(-respawnrai, respawnrai);
            } while (
              cors_taken.some(
                (c) =>
                  between(
                    x,
                    c.x - CONFIG.map.boundRange,
                    c.x + CONFIG.map.boundRange
                  ) &&
                  between(
                    y,
                    c.y - CONFIG.map.boundRange,
                    c.y + CONFIG.map.boundRange
                  )
              ) ||
              !confirmplayerradia(x, y)
            );

            cors_taken.push({ x, y, id: randID });

            const valueOp = getRandomInt(1, 15);
            var type = "";
            var color = "";
            var health_max = "";
            var score_add = 0;
            var body_damage = 0;
            var weight = 0;
            if (!item["respawn-raidis"]) {
              switch (true) {
                case between(valueOp, 1, 10): // Adjusted to 1-6 for square
                  type = "square";
                  color = "Gold";
                  health_max = 10;
                  score_add = 10;
                  body_damage = 2;
                  weight = 3;
                  break;
                case between(valueOp, 11, 13): // Adjusted to 7-8 for triangle
                  type = "triangle";
                  color = "Red";
                  health_max = 15;
                  score_add = 15;
                  body_damage = 3.5;
                  weight = 5;
                  break;
                case between(valueOp, 14, 15): // Adjusted to 9-10 for pentagon
                  type = "pentagon";
                  color = "#579bfa";
                  health_max = 100;
                  score_add = 120;
                  body_damage = 4;
                  weight = 10;
                  break;
              }
            } else {
              const valueOp2 = getRandomInt(1, 10);

              type = "pentagon";
              color = "#579bfa";
              health_max = 100;
              score_add = 120;
              body_damage = 4;
              if (valueOp2 === 5) {
                var size = 150;
                score_add = 3000;
                health_max = 1000;
                body_damage = 9;
                weight = 300;
              } else {
                var size = 50;
                weight = 10;
              }
            }
            if (!item["respawn-raidis"]) {
              var fooditem__XX = {
                type: type,
                health: health_max,
                maxhealth: health_max,
                size: 50,
                angle: getRandomInt(0, 180),
                x: x,
                y: y,
                centerX: x,
                centerY: y,
                weight: weight,
                body_damage: body_damage,
                scalarX: getRandomInt(-100, 100),
                scalarY: getRandomInt(-100, 100),
                vertices: null,
                color: color,
                score_add: score_add,
                randomID: randID,
              };
            }
            if (item["respawn-raidis"]) {
              var fooditem__XX = {
                type: type,
                health: health_max,
                maxhealth: health_max,
                size: size,
                angle: getRandomInt(0, 180),
                x: x,
                y: y,
                centerX: x,
                centerY: y,
                weight: weight,
                body_damage: body_damage,
                scalarX: getRandomInt(-100, 100),
                scalarY: getRandomInt(-100, 100),
                vertices: null,
                color: color,
                score_add: score_add,
                randomID: randID,
                "respawn-raidis": 1000,
              };
            }
            let recoilX =
              ((bullet.size / item.weight) *
                bullet.speed *
                Math.cos(bullet.angle)) /
              4;
            let recoilY =
              ((bullet.size / item.weight) *
                bullet.speed *
                Math.sin(bullet.angle)) /
              4;
            item.x += recoilX;
            item.y += recoilY;
            item.centerX += recoilX;
            item.centerY += recoilY;

            if (type === "triangle") {
              const rawvertices = calculateTriangleVertices(
                fooditem__XX.x,
                fooditem__XX.y,
                fooditem__XX.size,
                fooditem__XX.angle
              );
              fooditem__XX.vertices = rawvertices;
            } //
            if (type === "pentagon") {
              const rawvertices = calculateRotatedPentagonVertices(
                fooditem__XX.x,
                fooditem__XX.y,
                fooditem__XX.size,
                fooditem__XX.angle
              );
              fooditem__XX.vertices = rawvertices;
            }
            if (type === "square") {
              const rawvertices = calculateSquareVertices(
                fooditem__XX.x,
                fooditem__XX.y,
                fooditem__XX.size,
                fooditem__XX.angle
              );
              fooditem__XX.vertices = rawvertices;
            }
            if (!item.isdead && !item.hasOwnProperty("respawn")) {
              tempToPush.push(fooditem__XX);
            }

            if (item.hasOwnProperty("respawn")) {
              var myTeam = teamlist.find((team) => team.teamID === item.teamId);
              myTeam.upgrades.teamBuilding = {
                built: false,
                level: null,
                polygonId: null,
                boosts: {
                  speed: 1,
                  health: 1,
                  cannons: {},
                },
                health: 2000,
              };
            }

            bullet.distanceTraveled +=
              (bullet.size * 2) / bullet.bullet_pentration +
              bullet.size * 3 +
              40;

            if (bullet.bullet_pentration > item.size) {
              if (bullet.type === "triangle") {
                bullet.angle *= 5;
              }
            }

            if (!item.isdead) {
              item.deathtime = Date.now();
              item.isdead = true;
            }

            return_ = false;
          } else if (
            bullet.type !== "FreeNecromancer" &&
            bullet.type !== "FreeSwarm"
          ) {
            if (
              bullet.type !== "FreeNecromancer" &&
              bullet.type !== "FreeSwarm"
            ) {
              item.health -= damage;
            }
            let recoilX =
              ((bullet.size / item.weight) *
                bullet.speed *
                Math.cos(bullet.angle)) /
              4;
            let recoilY =
              ((bullet.size / item.weight) *
                bullet.speed *
                Math.sin(bullet.angle)) /
              4;
            item.x += recoilX;
            item.y += recoilY;
            item.centerX += recoilX;
            item.centerY += recoilY;
          } else {
            let recoilX =
              ((bullet.size / item.weight) *
                bullet.speed *
                Math.cos(bullet.angle)) /
              4;
            let recoilY =
              ((bullet.size / item.weight) *
                bullet.speed *
                Math.sin(bullet.angle)) /
              4;
            item.x += recoilX;
            item.y += recoilY;
            item.centerX += recoilX;
            item.centerY += recoilY;
          }
          if (
            bullet.type !== "FreeNecromancer" &&
            bullet.type !== "FreeSwarm"
          ) {
            bullet.distanceTraveled +=
              (bullet.size * 2) / bullet.bullet_pentration +
              bullet.size * 3 +
              40;

            bullet.distanceTraveled += 1; // for drones
          }

          if (
            -(bullet.distanceTraveled - bullet.bullet_distance) <
            25 * bullet.speed ** 2
          ) {
            bullet.transparency =
              1 - bullet.distanceTraveled / bullet.bullet_distance < 0
                ? 0.000000000000001
                : 1 - bullet.distanceTraveled / bullet.bullet_distance;
          }
        }
      });
      if (return_ === true && !item.isdead) {
        buildArray.push({
          angle: item.angle,
          color: item.color,
          health: item.health,
          maxhealth: item.maxhealth,
          size: item.size,
          type: realtype,
          weight: item.weight,
          x: item.x,
          y: item.y,
          transparency: item.transparency,
          randomID: item.randomID,
        });
        return return_;
      }
      if (item.isdead) {
        if (Date.now() >= item.deathtime + CONFIG.deathTime) {
          return false;
        }
      }
      if (item.isdead) {
        buildArray.push({
          angle: item.angle,
          color: item.color,
          health: item.health,
          maxhealth: item.maxhealth,
          size: item.size,
          type: realtype,
          weight: item.weight,
          x: item.x,
          y: item.y,
          transparency: item.transparency,
          randomID: item.randomID,
        });
        return true;
      }
    });
  }

  tempToPush.forEach((item) => {
    food_squares.assignRoom(item);
  });

  explosions = explosions.filter((exsplosion) => {
    exsplosion.trans -= exsplosion.fadingRate;
    exsplosion.innerRadius += exsplosion.exspandRate;
    exsplosion.size += exsplosion.exspandRate;
    exsplosion.rings.forEach((item) => {
      item.size += exsplosion.exspandRate;
    });
    if (Date.now() > exsplosion.endTime) {
      return false;
    }
    return true;
  });

  roadsectors = buildTriArray(roads);
  roadsectors.forEach((triroad) => {
    for (const playerID in players) {
      var player = players[playerID];
      let sameTeam =
        players[triroad[0].road.id].team === player.team &&
        player.team !== null &&
        player.team !== null;
      if (
        (triroad[0].road.id === playerID || sameTeam) &&
        isPointInTriangle(
          { x: player.x, y: player.y },
          { x: triroad[0].road.x, x: triroad[0].road.y },
          { x: triroad[1].road.x, x: triroad[1].road.y },
          { x: triroad[2].road.x, x: triroad[2].road.y }
        )
      ) {
        player.speedBoost = dataRoad[0].multiplyer;
      } else {
        player.speedBoost = 1;
      }
      emit("playerSpeedBoost", {
        id: playerID,
        speedMultiplyer: player.speedBoost,
      });
    }
  });

  buildMiniMapTeams.forEach((teamId) => {
    var miniMapSize = 150 / (CONFIG.map.size * 2);
    var teamPlayersXY = [];

    for (const playerId in players) {
      var player = players[playerId];
      if (teamId === player.teamId) {
        teamPlayersXY.push({
          x: player.x * miniMapSize,
          y: player.y * miniMapSize,
          id: playerId,
        });
      }
    }
    emitTeam("minimapUpdate", teamPlayersXY, teamId);
  });

  tempBulletToPush.forEach((item) => {
    bullets.push(item);
  });

  announcements = announcements.filter(
    (message) => message.killtime > Date.now()
  );

  emit("bulletUpdate", bullets);
  emit("bossUpdate", bosses);
  emit("roadUpdate", roadsectors);
  emit("explosionUpdate", explosions);
  requestEmit("requests", JoinRequests);
  messageEmit("announcements", announcements);
  createAndSendGameObjects(buildArray);
  buildArray = [];
}, CONFIG.updateInterval);

async function createAndSendGameObjects(playerArray) {
  const root = await protobuf.parse(schema).root;
  const GameObject = root.lookupType("GameObject");
  const GameObjectList = root.lookupType("GameObjectList");

  const gameObjectList = { objects: playerArray };

  const messageBuffer = GameObjectList.encode(gameObjectList).finish();

  smartemitBinary("gameUpdate", messageBuffer);
}

function createBoss(type_) {
  var boss = {};
  var fooditem = {};
  var updateXY = (id, x, y) => {
    let thisBoss = bosses.find((boss) => boss.id === id);
    thisBoss.x = x;
    thisBoss.y = y;
  };
  switch (type_) {
    case "Necromancer":
      let x = 0;
      let y = 0;
      type = "square";
      color = "Gold";
      var randID = Math.random() * 3 * Date.now();
      fooditem = {
        type: type,
        subtype: "Enemyboss:Square",
        health: 1500,
        maxhealth: 1500,
        size: 300,
        angle: getRandomInt(0, 180),
        x: x,
        y: y,
        centerX: x,
        centerY: y,
        speed: 0.2,
        body_damage: 7,
        cannons: [{}, {}, {}, {}],
        weight: 1000,
        scalarX: getRandomInt(-100, 100),
        scalarY: getRandomInt(-100, 100),
        vertices: null,
        color: color,
        score_add: 3500,
        randomID: randID,
        updateXY: updateXY,
        reload: 500,
      };
      var cannonID = Math.random() * 3 * Date.now();
      boss = {
        id: randID,
        score: 0,
        x: x,
        y: y,
        cannons: [
          { cannonW: 0, canfire: true, id: cannonID },
          { cannonW: 0, canfire: true, id: cannonID },
          { cannonW: 0, canfire: true, id: cannonID },
          { cannonW: 0, canfire: true, id: cannonID },
        ],
      };

      fooditem.cannons = [
        {
          type: "necromancerDrone",
          x: 0,
          y: 0,
          offsetAngle: 0,
          maxbullets: 10,
          current: 0,
          canfire: true,
          id: cannonID,
        },
        {
          type: "necromancerDrone",
          x: 0,
          y: 0,
          offsetAngle: 90,
          maxbullets: 10,
          current: 0,
          canfire: true,
          id: cannonID * 2,
        },
        {
          type: "necromancerDrone",
          x: 0,
          y: 0,
          offsetAngle: 180,
          maxbullets: 10,
          current: 0,
          canfire: true,
          id: cannonID * 3,
        },
        {
          type: "necromancerDrone",
          x: 0,
          y: 0,
          offsetAngle: 270,
          maxbullets: 10,
          current: 0,
          canfire: true,
          id: cannonID * 4,
        },
      ];
      break;
    case "Guardian":
      let x2 = 0;
      let y2 = 0;
      type = "triangle";
      color = "#ff7df8";
      var randID2 = Math.random() * 3 * Date.now();
      fooditem = {
        type: type,
        subtype: "Enemyboss:Triangle",
        health: 1250,
        maxhealth: 1250,
        size: 300,
        angle: getRandomInt(0, 180),
        x: x2,
        y: y2,
        centerX: x2,
        centerY: y2,
        speed: 0.4,
        body_damage: 7,
        cannons: [{}],
        weight: 1100,
        scalarX: getRandomInt(-100, 100),
        scalarY: getRandomInt(-100, 100),
        vertices: null,
        color: color,
        score_add: 3000,
        randomID: randID2,
        updateXY: updateXY,
        reload: 350,
      };
      var cannonID = Math.random() * 3 * Date.now();
      boss = {
        id: randID2,
        score: 0,
        x: x2,
        y: y2,
        cannons: [{ cannonW: 0, canfire: true, id: cannonID }],
      };

      fooditem.cannons = [
        {
          type: "SwarmCannon",
          x: 0,
          y: 0,
          offsetAngle: 0,
          maxbullets: 100,
          current: 0,
          canfire: true,
          id: cannonID,
        },
      ];
      break;
  }
  bosses.push(boss);
  food_squares.assignRoom(fooditem);
}

createBoss("Guardian");

function smartemitBinary(type, data) {
  connections.forEach((conn) => {
    if (
      conn.playerId == null ||
      (players[conn.playerId] == undefined &&
        deadplayers.indexOf(conn.playerId) === -1)
    )
      return;
    if (
      !(
        players[conn.playerId] == undefined &&
        deadplayers.indexOf(conn.playerId) === -1
      )
    )
      if (
        players[conn.playerId]?.visible ||
        deadplayers.indexOf(conn.playerId) !== -1
      ) {
        conn.socket.send(data); // Send binary data directly
      }
  });
}

function emit(type, data) {
  const message = JSON.stringify({ type, data });
  connections.forEach((conn) => {
    conn.socket.send(message);
  });
}

function broadcast(type, data, senderConn) {
  const message = JSON.stringify({ type, data });
  connections.forEach((conn) => {
    if (conn.socket !== senderConn) {
      conn.socket.send(message);
    }
  });
}

function emitTeam(type, data, teamId) {
  const message = JSON.stringify({ type, data });
  connections.forEach((conn) => {
    if (players[conn.playerId].teamId === teamId) {
      conn.socket.send(message);
    }
  });
}

function smartemit(type, data) {
  const message = JSON.stringify({ type, data });
  connections.forEach((conn) => {
    if (conn.playerId == null || players[conn.playerId] == undefined) return;
    if (players[conn.playerId].visible) {
      conn.socket.send(message);
    }
  });
}

function messageEmit(type, data2) {
  connections.forEach((conn) => {
    if (conn.playerId == null || players[conn.playerId] == undefined) return;
    let data = data2.filter((message) => {
      return message.sender === conn.playerId;
    });
    const message = JSON.stringify({ type, data });
    if (players[conn.playerId].visible) {
      conn.socket.send(message);
    }
  });
}

function requestEmit(type, data2) {
  connections.forEach((conn) => {
    if (conn.playerId == null || players[conn.playerId] == undefined) return;
    let splices = [];
    let data = data2.filter((request, i) => {
      if (request.owner === conn.playerId) {
        request.callbackID = Math.random() * 7;
        PendingJoinRequests.push(request);
        splices.push(i);
      }
      return request.owner === conn.playerId;
    });
    splices.forEach((s) => {
      data2 = data2.splice(s, 1);
    });
    const message = JSON.stringify({ type, data });
    if (data && data.length !== 0) {
      conn.socket.send(message);
    }
  });
}

function smartbroadcast(type, data, senderConn) {
  const message = JSON.stringify({ type, data });
  connections.forEach((conn) => {
    if (conn.playerId == null || players[conn.playerId] == undefined) return;
    if (conn.socket !== senderConn && players[conn.playerId].visible) {
      conn.socket.send(message);
    }
  });
}

const listener = serverHttps.listen(4000, "0.0.0.0", function () {
  console.log("Your app is listening on port " + listener.address().port);
});

const listener2 = httpServer.listen(4500, "0.0.0.0", function () {
  console.log("Your app is listening on port " + listener2.address().port);
});
