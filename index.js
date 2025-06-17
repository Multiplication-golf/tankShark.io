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
// const DOMPurify = require("dompurify");
const bcrypt = require("bcrypt");
const curse = require("curse-filter");
const jwt = require("jsonwebtoken");
const axios = require("axios");

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

function getRoomAndBoundingForBullets(roomkey) {
  var baseItems = [...food_squares[roomkey]?.bullets] || [];
  var otherRooms = getAdjacentRoomKeys(roomkey);
  otherRooms.forEach((_room_) => {
    baseItems.push(...food_squares[_room_].bullets);
  });
  return baseItems;
}

handleUpgrade(httpServer, "HTTP");
handleUpgrade(serverHttps, "HTTPS");

const helmet = require("helmet");
const protobuf = require("protobufjs");

const schema = `
syntax = "proto3";

message GameObject {
  float angle = 1;
  string color = 2; 
  float health = 3;
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
        "https://sdk.crazygames.com",
      ],
      imgSrc: ["'self'"],
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

app.use(helmet.frameguard({ action: "deny" }));

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
  "11.webp",
  "12.webp",
  "13.webp",
  "14.webp",
  "15.webp",
  "16.webp",
  "17.webp",
  "18.webp",
  "19.webp",
  "20.webp",
  "21.webp",
  "22.webp",
  "23.webp",
  "24.webp",
  "25.webp",
  "26.webp",
  "27.webp",
  "0.webp",
];

const skinDatalist = {
  "1.webp": "basic",
  "2.webp": "uncommon",
  "3.webp": "epic",
  "4.webp": "basic",
  "5.webp": "uncommon",
  "6.webp": "rare",
  "7.webp": "basic",
  "8.webp": "uncommon",
  "9.webp": "rare",
  "10.webp": "basic",
  "11.webp": "uncommon",
  "12.webp": "rare",
  "13.webp": "uncommon",
  "14.webp": "rare",
  "15.webp": "legendary",
  "16.webp": "basic",
  "17.webp": "uncommon",
  "18.webp": "rare",
  "19.webp": "basic",
  "20.webp": "uncommon",
  "21.webp": "rare",
  "22.webp": "uncommon",
  "23.webp": "rare",
  "24.webp": "epic",
  "25.webp": "basic",
  "26.webp": "uncommon",
  "27.webp": "rare",
  "0.webp": "basic",
};

async function hashPassword(password) {
  const saltRounds = 13;
  console.log(password, saltRounds);
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
}

async function comparePasswords(enteredPassword, hashedPassword) {
  const match = enteredPassword === hashedPassword;
  return match;
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

function reassignRoomItem(item) {
  for (const roomkey in food_squares) {
    var room = food_squares[roomkey];
    if (
      item.x >= room.bounds.x1 &&
      item.x <= room.bounds.x2 &&
      item.y >= room.bounds.y1 &&
      item.y <= room.bounds.y2
    ) {
      room.items.push(item);
      return true;
    }
  }
}

function reassignRoomBullet(bullet) {
  for (const roomkey in food_squares) {
    var room = food_squares[roomkey];
    if (
      bullet.x >= room.bounds?.x1 &&
      bullet.x <= room.bounds?.x2 &&
      bullet.y >= room.bounds?.y1 &&
      bullet.y <= room.bounds?.y2
    ) {
      room.bullets.push(bullet);
      break;
    }
  }
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

let frame = 0;

var levels = {};
fs.readFile("data/levelData.json", function (err, data) {
  levels = JSON.parse(data).levelData;
});

const pi = Math.PI;
const pi180 = pi / 180;
const piby2 = -pi / 2;
var response = new SAT.Response();

function writeToUserbase() {
  fs.writeFile(
    "data/users.json",
    JSON.stringify({ userbase: userbase }),
    function (err, data) {
      if (err) throw err;
    }
  );
}

fs.readFile("data/users.json", function (err, data) {
  if (err) throw err;
  data = JSON.parse(data);
  userbase = data.userbase;
  console.log("userbase", userbase);
});

// don't touch pls
const CONFIG = {
  levelMultiplyer: 1.2,
  updateInterval: 30,
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
  roadMaxConectLength: 600,
  map: {
    size: 5000,
    innersize: 4500,
    x: 0,
    y: 0,
    boundRange: 50,
    buildSize: 1000,
  },
  skincost: {
    basic: 199,
    uncommon: 349,
    rare: 449,
    epic: 899,
    legendary: 999,
  },
  messageIntervals: { long: 15 * 1000, short: 6 * 1000, medium: 10 * 1000 },
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
      bullets: [],
    };
    food_squares[k.toString()] = room;
    currentx += CONFIG.map.buildSize;
    k++;
  }
  currentx = -CONFIG.map.size;
  currenty += CONFIG.map.buildSize;
}

Object.freeze(CONFIG);

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
      sheller: { img: 15, level: 30 },
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
    autoRoting: true,
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
        bulletSize: 1,
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
        bulletSize: 1,
        bulletSpeed: 0.5,
        delay: 0,
        reloadM: 1,
        bullet_pentration: 0.3,
      },
    ],
  },
  sheller: {
    "size-m": 1.05,
    "speed-m": 0.9,
    "damage-m": 1,
    "health-m": 0.95,
    fov: 0.75,
    "BodyDamage-m": 1,
    "regen-m": 1,
    "reaload-m": 1.5,
    upgrades: {},
    cannons: [
      {
        type: "sheller",
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
  dronetanks: ["directer"],
};

Object.freeze(tankmeta);

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

function deleteTeamBase(id) {
  for (const roomkey in food_squares) {
    var room = food_squares[roomkey];
    if (typeof room === "function") continue;
    room.items = room.items.filter((item) => item.teamId !== id);
  }
  bullets = bullets.filter((bullet) => bullet.id !== id);
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
    textcolor = "black",
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
    textcolor: textcolor,
  };
  announcements.push(newAnnouncement);
}

function between(x, min, max) {
  return x >= min && x <= max;
}

function MathHypotenuse(x, y) {
  return Math.sqrt(x * x + y * y);
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

function isPointInTriangle(point, vertexA, vertexB, vertexC) {
  const area =
    0.5 *
    (-vertexB.y * vertexC.x +
      vertexA.y * (-vertexB.x + vertexC.x) +
      vertexA.x * (vertexB.y - vertexC.y) +
      vertexB.x * vertexC.y);
  const s =
    (1 / (2 * area)) *
    (vertexA.y * vertexC.x -
      vertexA.x * vertexC.y +
      (vertexC.y - vertexA.y) * point.x +
      (vertexA.x - vertexC.x) * point.y);
  const t =
    (1 / (2 * area)) *
    (vertexA.x * vertexB.y -
      vertexA.y * vertexB.x +
      (vertexA.y - vertexB.y) * point.x +
      (vertexB.x - vertexA.x) * point.y);
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

function getTarget(cannon, tankdatacannon__) {
  let maxdistance = 2000;
  let fire_at__ = null;
  let target_enity_type = null;
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
        var angle = 0;
        if (cannon._type_ === "SwivelAutoCannon") {
          angle = Math.atan2(
            player.y - players[cannon.playerid].y, // y difference
            player.x - players[cannon.playerid].x // x difference
          );
        } else if (cannon._type_ === "bulletAuto") {
          let parentBullet = findBullet(cannon.playerid);
          angle = Math.atan2(
            player.y - parentBullet.y,
            player.x - parentBullet.x
          );
        } else {
          angle = Math.atan2(
            player.y - players[cannon.playerid].y, // y difference
            player.x - (players[cannon.playerid].x + offSet_x) // x difference
          );
        }

        if (cannon._type_ === "SwivelAutoCannon") {
          if (
            tankdatacannon__[cannon.autoindex]["offSet-x-multpliyer"] === -1
          ) {
            if (
              isTargetInSwivelRange(
                players[cannon.playerid].cannon_angle,
                angle * (180 / pi),
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
    var TX =
      cannon._type_ === "bulletAuto" ? cannon.x : players[cannon.playerid].x;
    var TY =
      cannon._type_ === "bulletAuto" ? cannon.y : players[cannon.playerid].y;
    getRoomAndBounding(TX, TY).items.forEach((item) => {
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
        var angle;
        if (cannon._type_ === "SwivelAutoCannon") {
          angle = Math.atan2(
            item.y - (players[cannon.playerid].y + cannon["y_"]),
            item.x - (players[cannon.playerid].x + cannon["x_"])
          );
        } else if (cannon._type_ === "bulletAuto") {
          let parentBullet = findBullet(cannon.playerid);
          angle = Math.atan2(item.y - parentBullet.y, item.x - parentBullet.x);
        } else {
          angle = Math.atan2(
            item.y - players[cannon.playerid].y,
            item.x - (players[cannon.playerid].x + offSet_x)
          );
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
  return { target: fire_at__, type: target_enity_type };
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
  var mybullet;
  for (const roomkey in food_squares) {
    var room = food_squares[roomkey];
    mybullet = room.bullets.find((v) => id === v.uniqueid);
    if (mybullet) break;
  }
  return mybullet;
}

function toSATPolygon(vertices, points = []) {
  vertices = vertices ? vertices : [0, 0, 0];
  const len = vertices.length;
  for (let i = 0; i < len; i++) {
    points[i] = new SAT.Vector(vertices[i].x, vertices[i].y);
  }
  return new SAT.Polygon(new SAT.Vector(0, 0), points.slice(0, len));
}

function normalizeAngle(angle) {
  return angle % 360;
}

// Rotates a point (cannonOffsetX, cannonOffsetY) around the origin by playerRotation (in radians)
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
  console.log("1346", v);
};

function isTargetInSwivelRange(playerRotation, targetAngle, offset_degress) {
  // Normalize player's rotation and target angle
  let playerRotation_ = normalizeAngle_2(playerRotation + offset_degress);
  targetAngle = normalizeAngle_2(targetAngle);

  // Define the swivel range around the player's current rotation
  const minSwivelAngle = normalizeAngle_2(
    playerRotation_ - 85 * (Math.PI / 180)
  ); // 90 degrees left of player
  const maxSwivelAngle = normalizeAngle_2(
    playerRotation_ + 85 * (Math.PI / 180)
  ); // 90 degrees right of player

  // Check if the target is within the swivel range
  if (minSwivelAngle <= maxSwivelAngle) {
    return minSwivelAngle <= targetAngle && targetAngle <= maxSwivelAngle;
  } else {
    // Handle the case where angles wrap around 0°
    return targetAngle >= minSwivelAngle || targetAngle <= maxSwivelAngle;
  }
}

function sortMessages(messages) {
  var keywords = {
    kill: 1,
    killed: 1.2,
    destroyed: 1,
    destroying: 2,
    destroyer: 0.8,
    base: 0.5,
    killer: 2,
    base: 0.5,
    team: 0.4,
    teammate: 0.6,
    traitor: 2,
    traitors: 2,
    "blown up": 1,
    "blown up by": 1,
    sluatered: 2.5,
  };
  messages.sort((messageA, messageB) => {
    var lA = messageA.length;
    var lB = messageB.length;
    var xA = 0;
    var xB = 0;
    var lKDA = messageA.likes - messageA.dislikes;
    var lKDB = messageB.likes - messageB.dislikes;
    var dateA = (Date.now() - messageA.date) * 200;
    var dateB = (Date.now() - messageB.date) * 200;
    for (const key in keywords) {
      if (messageA.text.split(" ").includes(key)) {
        xA += keywords[key];
      }
      if (messageB.text.split(" ").includes(key)) {
        xB += keywords[key];
      }
    }

    var weightA =
      -4 * (xA - 6) * (xA - 6) +
      100 -
      2 * xA +
      (lA + 32) / 25 +
      Math.pow(dateA + 32, -1) / 25 +
      Math.pow(lKDA, 1.5) * 5.5;
    var weightB =
      -4 * (xB - 6) * (xB - 6) +
      100 -
      2 * xB +
      (lB + 32) / 25 +
      Math.pow(dateB + 32, -1) / 25 +
      Math.pow(lKDB, 1.5) * 5.5;

    return weightA - weightB;
  });
}

function createExsplosion(
  enityId,
  x,
  y,
  {
    id = null,
    createbullet = true,
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
      id: id,
      uniqueid: Date.now() + Math.random(),
      cannonIndex: 0,
      exspandRate: (maxsize - size) / (lifeSpan / 16),
    };
    reassignRoomBullet(bullet);
  }
}

function calculateTax(score, maxScore) {
  // Ensure score doesn't exceed maxScore
  score = Math.min(score, maxScore);

  // Use a quadratic growth function for a smoother, slower increase
  let tax = Math.pow(score / maxScore, 1.5); // Adjust exponent for smoother growth

  // Ensuring the tax rate stays within 0 to 1
  return Math.min(0.9, Math.max(0, tax));
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

function killplayer(id) {
  roads = roads.filter((road) => {
    if (road.id === id) {
      return false;
    }
    return true;
  });
  hidden_broswers = hidden_broswers.filter((interval) => {
    if (id === interval.id) {
      clearInterval(interval.interval);
      return false;
    }
    return true;
  });
  deadplayers.push(id);
  teamlist = teamlist.filter((team) => {
    var teamplayers = team.players;
    teamplayers = teamplayers.filter((player) => {
      return player.id !== id;
    });
    team.players = teamplayers;
    if (teamplayers.length === 0) {
      deleteTeamBase(team.teamID);
      return false;
    }
    if (team.owner.id === id) {
      if (teamplayers.length !== 0) {
        if (team.lowerLevelPlayers.length > 0) {
          team.owner = team.lowerLevelPlayers[0];
          emit("newOwner", {
            teamID: team.teamID,
            playerid: team.lowerLevelPlayers[0].id,
          });
          PendingJoinRequests.forEach((_request) => {
            if (_request.owner === id) {
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
            if (_request.owner === id) {
              _request.owner = teamplayers[0].id;
            }
          });
        }
      } else {
        deleteTeamBase(team.teamID);
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
      (__index__) => __index__.id !== id
    );
    leader_board.hidden = leader_board.hidden.filter(
      (__index__) => __index__.id !== id
    );
    emit("boardUpdate", {
      leader_board: leader_board.shown,
    });
  } catch (e) {
    console.log("killplayer", e);
  }
  emit("playerLeft", id);
  players[id].state = "dead";
  players[id].dead = true;
  return;
}

function limitedLog(message, ...optionalParams) {
  if (logCounter < LOG_LIMIT) {
    console.log("1695", message, ...optionalParams);
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

  // Ensure reloadStat is a valid number, default to 1 if undefined
  let reloadStat = players[cannon.playerid]?.statsTree?.["Bullet Reload"] ?? 1;

  // Prevent denominator from being zero or negative
  let denominator = Math.max(0.5, 3.5 - (reloadStat - 1) / 3);

  // Clamp adjustment to a reasonable maximum step to avoid overshooting
  let maxStep = 0.15; // radians per update, adjust as needed
  let adjustment = Math.min(Math.abs(deltaAngle) / denominator, maxStep);

  // If the angle difference is very small, snap to target
  if (Math.abs(deltaAngle) < 0.01) {
    cannon.angle = cannon.targetAngle;
  } else {
    cannon.angle += Math.sign(deltaAngle) * adjustment;
    cannon.angle = normalizeAngle_2(cannon.angle);
  }

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
    subtype: null,
    health: health_max,
    maxhealth: health_max,
    size: 50,
    healrate: 1,
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
    "respawn-raidis": undefined,
    lastDamaged: null,
    lastDamgers: [],
    goldenGears: null,
    cannons: null,
    boss: null,
    reload: Infinity,
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

  reassignRoomItem(fooditem);
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
    subtype: null,
    health: health_max,
    maxhealth: health_max,
    size: size,
    healrate: 1,
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
    lastDamaged: null,
    lastDamgers: [],
    goldenGears: null,
    cannons: null,
    boss: null,
    reload: Infinity,
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

  reassignRoomItem(fooditem);
}

for (let i = 0; i < getRandomInt(20, 25); i++) {
  let x = getRandomInt(-CONFIG.map.innersize, CONFIG.map.innersize);
  let y = getRandomInt(-CONFIG.map.innersize, CONFIG.map.innersize);
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
      x = getRandomInt(-CONFIG.map.innersize, CONFIG.map.innersize);
      y = getRandomInt(-CONFIG.map.innersize, CONFIG.map.innersize);
    }
  }
  cors_taken.push({ x: x, y: y, id: randID });
  var type = "";
  var color = "";
  var health_max = "";
  var score_add = 0;
  var body_damage = 0;
  var weight = 0;

  type = "pentagon";
  color = "#C2A248";
  health_max = 100;
  score_add = 120;
  body_damage = 4;
  var size = 50;
  var weight = 10;

  let fooditem = {
    type: type,
    health: health_max,
    maxhealth: health_max,
    size: size,
    healrate: 1,
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
    lastDamaged: null,
    lastDamgers: [],
    goldenGears: getRandomInt(1, 3),
  };
  if (type === "pentagon") {
    const rawvertices = calculateRotatedPentagonVertices(
      fooditem.x,
      fooditem.y,
      fooditem.size,
      fooditem.angle
    );
    fooditem.vertices = rawvertices;
  }

  reassignRoomItem(fooditem);
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

var angle = 0;

var serverseed = crypto.randomUUID();

var invaled_requests = [];

const connections = [];

const allowedOrigins = [
  "https://tank-shark-io.vercel.app",
  "http://127.0.0.1:5501",
  "https://tankshark.fun/",
  "https://tankshark.fun",
  "https://tankshark.itch.io/tankshark",
  "https://tankshark.itch.io/tankshark/",
  "https://html-classic.itch.zone",
  "https://html-classic.itch.zone/",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS" + origin));
    }
  },
};

app.use(express.json({ limit: "1kb" }));

app.use(cors(corsOptions));

/*app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://127.0.0.1:5501");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});*/

app.disable("x-powered-by");

serverHttps.on("request", app);
httpServer.on("request", app);

let logCounter = 0;
const LOG_LIMIT = 1300;

app.use(express.json());

app.post("/currentbadge", (req, res) => {
  let badge = "";
  let playerScore = 0;
  if (req.body.userId) {
    var _player = userbase.find((_player) => {
      return comparePasswords(_player.userid, req.body.userId);
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
  writeToUserbase();
});

app.post("/currentgears", (req, res) => {
  var gears = 0;
  if (req.body.userId) {
    var _player = userbase.find((_player) => {
      return comparePasswords(_player.userid, req.body.userId);
    });

    if (_player !== undefined) {
      gears = _player.goldenGears;
    } else {
      gears = 0;
    }
    res.send({
      gears: gears,
      levelBoost: _player?.startLevels,
    });
  } else {
    gears = 0;
    res.send({
      gears: 0,
      levelBoost: 0,
    });
  }
  writeToUserbase();
});

app.get("/getteamdata", (req, res) => {
  var public_teams = [];
  public_teams = teamlist.map((team) => {
    if (!team.hidden) {
      team.taxInterval = null;
      var aScore = team.createTeamScore
        ? team.teamScore
        : players[team.owner.id].score;
      if (!team.createTeamScore) team.teamScore = aScore;
      return team;
    }
  });
  public_teams.sort((a, b) => {
    return a.teamScore - b.teamScore;
  });
  res.send({ leader_board: public_teams });
});

app.post("/buylevels", (req, res) => {
  var purchaseSuccsefull = "fail";
  if (req.body.userId) {
    var _player = userbase.find((_player) => {
      return comparePasswords(_player.userid, req.body.userId);
    });

    if (_player !== undefined) {
      if (_player.goldenGears >= 100) {
        _player.goldenGears -= 100;
        purchaseSuccsefull = "success";
        if (_player.startLevels === -1) _player.startLevels = 0;
        _player.startLevels += 15;
      } else {
        purchaseSuccsefull = "noEnoughCoins";
      }
      res.send({
        purchaseSuccsefull: purchaseSuccsefull,
        gears: _player?.goldenGears,
        levelBoost: _player?.startLevels,
      });
    } else {
      res.send({
        purchaseSuccsefull: "AccountError",
        gears: 0,
        levelBoost: 0,
      });
    }
  } else {
    res.send({
      purchaseSuccsefull: "noAccount",
      gears: 0,
      levelBoost: 0,
    });
  }
  writeToUserbase();
});

app.post("/skinpurchase", (req, res) => {
  var purchaseSuccsefull = "fail";
  var sysPuchaseBuild = {
    basic: [],
    uncommon: [],
    rare: [],
    epic: [],
    legendary: [],
  };
  if (req.body.userId && req.body.skinLevel) {
    var _player = userbase.find((_player) => {
      return comparePasswords(_player.userid, req.body.userId);
    });

    if (_player !== undefined) {
      var noPuchase = skinAllowlist.filter(
        (skin) => !_player.skins.includes(skin)
      );

      noPuchase.forEach((skin) => {
        switch (skinDatalist[skin]) {
          case "basic": {
            sysPuchaseBuild.basic.push(skin);
            break;
          }
          case "uncommon": {
            sysPuchaseBuild.uncommon.push(skin);
            break;
          }
          case "rare": {
            sysPuchaseBuild.rare.push(skin);
            break;
          }
          case "epic": {
            sysPuchaseBuild.epic.push(skin);
            break;
          }
          case "legendary": {
            sysPuchaseBuild.legendary.push(skin);
            break;
          }
        }
      });

      if (sysPuchaseBuild[req.body.skinLevel].length < 1) {
        res.send({
          purchaseSuccsefull: purchaseSuccsefull,
          gears: _player?.goldenGears,
          levelBoost: _player?.startLevels,
          i: -1,
          skinAllowlist: skinAllowlist,
        });
        return;
      }

      var index_$_ = getRandomInt(
        -1,
        sysPuchaseBuild[req.body.skinLevel].length - 2
      );
      function skinBuy(cost) {
        var addskin = sysPuchaseBuild[req.body.skinLevel][index_$_ + 1];
        if (_player.goldenGears >= cost) {
          _player.goldenGears -= cost;
          purchaseSuccsefull = "success";
          _player.skins.push(addskin);
        } else {
          purchaseSuccsefull = "noEnoughCoins";
        }
      }

      switch (req.body.skinLevel) {
        case "basic": {
          skinBuy(CONFIG.skincost.basic);
          break;
        }
        case "uncommon": {
          skinBuy(CONFIG.skincost.uncommon);
          break;
        }
        case "rare": {
          skinBuy(CONFIG.skincost.rare);
          break;
        }
        case "epic": {
          skinBuy(CONFIG.skincost.epic);
          break;
        }
        case "legendary": {
          skinBuy(CONFIG.skincost.legendary);
          break;
        }
      }

      if (purchaseSuccsefull === "success") {
        res.send({
          purchaseSuccsefull: purchaseSuccsefull,
          gears: _player?.goldenGears,
          levelBoost: _player?.startLevels,
          i: index_$_,
          skinAllowlist: skinAllowlist,
        });
      } else {
        res.send({
          purchaseSuccsefull: purchaseSuccsefull,
          gears: _player?.goldenGears,
          levelBoost: _player?.startLevels,
          i: -1,
          skinAllowlist: skinAllowlist,
        });
      }
    } else {
      res.send({
        purchaseSuccsefull: "AccountError",
        gears: 0,
        levelBoost: 0,
      });
    }
  } else {
    res.send({
      purchaseSuccsefull: "noAccount",
      gears: 0,
      levelBoost: 0,
    });
  }
  writeToUserbase();
});

app.post("/submit-feedback", (req, res) => {
  const { name, message } = req.body;

  if (!name || !message) {
    return res.status(400).send("All fields are required.");
  }

  fs.writeFileSync(
    "data/feedback.txt",
    JSON.stringify({ name, message }) + "\n",
    { flag: "a" },
    function (err) {
      if (err) throw err;
      console.log("Date written to file, ", filename);
    }
  );
  writeToUserbase();
});

app.get("/leaderboard", (req, res) => {
  var userbaseb = userbase.sort((entrieA, entrieB) => {
    var scoresumA = entrieA.scores.reduce((a, score) => a + score.score, 0);
    var scoresumB = entrieB.scores.reduce((a, score) => a + score.score, 0);
    return scoresumB - scoresumA;
  });
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
    badge ??= "/badges/1.webp";
    board = { username: board.username, score: scoresumA, badge: badge };
    postLeaderBorad.push(board);
  });

  res.send({
    leader_board: postLeaderBorad,
  });
});

app.post("/skindata", (req, res) => {
  if (req.body.userId) {
    var _player = userbase.find((_player) => {
      return comparePasswords(_player.userid, req.body.userId);
    });

    var skinCounts = { basic: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    var allowedskins = {};
    Object.keys(skinDatalist).forEach((ele) => {
      if (!_player.skins.includes(ele)) allowedskins[ele] = skinDatalist[ele];
    });
    for (const skin in allowedskins) {
      console.log(allowedskins[skin]);
      switch (allowedskins[skin]) {
        case "basic": {
          skinCounts.basic++;
          break;
        }
        case "uncommon": {
          skinCounts.uncommon++;
          break;
        }
        case "rare": {
          skinCounts.rare++;
          break;
        }
        case "epic": {
          skinCounts.epic++;
          break;
        }
        case "legendary": {
          skinCounts.legendary++;
          break;
        }
      }
    }

    if (_player !== undefined) {
      res.send({
        skins: _player.skins,
        skindata: skinDatalist,
        skinCounts: skinCounts,
      });
    } else {
      res.send({
        skins: ["0.webp"],
        skindata: skinDatalist,
        skinCounts: skinCounts,
      });
    }
  } else {
    res.send({
      skins: ["0.webp"],
      skindata: skinDatalist,
      skinCounts: skinCounts,
    });
  }
  writeToUserbase();
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

  if (
    req.socket.remoteAddress !==
      fs.readFileSync("C:/Certs/websocket/fetchIP.txt", "utf8") &&
    req.socket.remoteAddress !== "127.0.0.1" &&
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
  }, 999);

  let stateupdate = null;
  let isSetUp = false;
  socket.on("message", (message) => {
    try {
      var { type, data } = JSON.parse(message);
    } catch (e) {
      console.log("Error parsing message:", e.message);
      socket.close(1007, "Invalid JSON format");
      return;
    }

    current++;
    if (current >= 1000) {
      socket.close(1000, "Too many requests");
      return;
    }

    if (isSetUp)
      if (players[connection.playerId]?.dead) {
        return;
      }
    try {
      switch (type) {
        case "newPlayer": {
          (async function () {
            var newId = crypto.randomUUID();
            data.dead = false;
            isSetUp = true;
            Object.defineProperty(players, `${newId}`, {
              value: data,
              writable: false,
              configurable: false,
              enumerable: true,
            });

            players[newId].id = newId;
            players[newId].username = await curse.filter(
              players[newId].username
            );
            console.log(
              "username",
              await curse.filter(players[newId].username)
            );
            socket.send(JSON.stringify({ type: "newId", data: newId }));
            connection.playerId = newId;
            connections.forEach((con) => {
              if (con.socket === connection.socket) {
                con.playerId = newId;
              }
            });
            data.speedBoost = 1;
            if (!skinAllowlist.includes(data.skin)) {
              socket.close(
                1007,
                "You hacker, your IP has been permently banned"
              );
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
            emit("playerJoined", data);
            emit("autoCannonUPDATE-ADD", autocannons);
            emit("colorUpgrades", CONFIG.colorUpgardes);
            emit("Levels", levels);
            emit("NewMessages", messages);
            emit("Config", CONFIG);
            emit("teamColorUpgrades", CONFIG.colorTeamUpgardes);

            console.log("data sent");

            socket.send(
              JSON.stringify({ type: "RETURNtankmeta", data: tankmeta })
            );
            data.score = 0;
            var public_teams = [];
            public_teams = teamlist.map((team) => {
              if (!team.hidden) {
                team.taxInterval = null;
                return team;
              }
            });

            if (data.teamKey) {
              var team = teamlist.find((team_) => {
                console.log(data.teamKey, team_.teamKey);
                return data.teamKey == team_.teamKey;
              });
              console.log(team);
              if (team) {
                if (!team.private) {
                  team.players.push({
                    username: players[data.id].username,
                    id: data.id,
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
                  emit("JoinTeamSuccess", { id: newId, teamId: team.teamID });
                  createAnnocment(
                    "You joined a private team successfuly",
                    newId,
                    {
                      color: "green",
                      delay: CONFIG.messageIntervals.medium,
                    }
                  );
                } else {
                  socket.send(
                    JSON.stringify({
                      type: "requestJoin",
                      data: { teamname: team.name },
                    })
                  );
                  JoinRequests.push({
                    requester: newId,
                    owner: team.owner.id,
                    teamID: team.teamID,
                  });
                }
              } else if (data.teamKey !== null) {
                createAnnocment("Bad key!", newId, {
                  color: "red",
                  delay: CONFIG.messageIntervals.long,
                });
              }
              if (data.isCrazy) {
                createAnnocment(
                  "Did you know you can invite freinds to your team? To do so simply click the invite button in crazy games",
                  newId,
                  {
                    color: "blue",
                    delay: CONFIG.messageIntervals.long,
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
            console.log("cors sent");
            if (data.userId) {
              (async function () {
                try {
                  if (
                    data.token &&
                    Object.keys(data.token).length > 0 &&
                    data.token != null &&
                    data.token !== undefined
                  ) {
                    const DecodeCGToken = async (_token) => {
                      let key = "";

                      try {
                        const resp = await axios.get(
                          "https://sdk.crazygames.com/publicKey.json"
                        );
                        key = resp.data["publicKey"];
                      } catch (e) {
                        console.error(
                          "Failed to fetch CrazyGames public key",
                          e
                        );
                      }

                      if (!key) {
                        throw new Error(
                          "Key is empty when decoding CrazyGames token"
                        );
                      }

                      const payload = jwt.verify(_token, key, {
                        algorithms: ["RS256"],
                      });
                      return payload;
                    };
                    console.log("token", data.token);
                    const raw = await DecodeCGToken(data.token);
                    console.log("rawtoken", raw);
                    const userID_ = raw.userId;
                    const token = await hashPassword(userID_);
                    var isUserFound = userbase.find((_player) => {
                      return comparePasswords(_player.userid, token);
                    });
                    if (isUserFound !== undefined) {
                      let score__$ = isUserFound.scores.reduce((a, b) => {
                        return a + b.score;
                      }, 0);
                      if (score__$ >= 50000000) {
                        badge = "/badges/10.webp";
                      } else if (score__$ >= 25000000) {
                        badge = "/badges/9.webp";
                      } else if (score__$ >= 10000000) {
                        badge = "/badges/8.webp";
                      } else if (score__$ >= 5000000) {
                        badge = "/badges/7.webp";
                      } else if (score__$ >= 2500000) {
                        badge = "/badges/6.webp";
                      } else if (score__$ >= 1000000) {
                        badge = "/badges/5.webp";
                      } else if (score__$ >= 500000) {
                        badge = "/badges/4.webp";
                      } else if (score__$ >= 250000) {
                        badge = "/badges/3.webp";
                      } else if (score__$ >= 100000) {
                        badge = "/badges/2.webp";
                      } else {
                        badge = "/badges/1.webp";
                      }
                      socket.send(
                        JSON.stringify({ type: "resovleID", data: {} })
                      );
                      socket.send(
                        JSON.stringify({
                          type: "badgeToplayer",
                          data: { badge: badge },
                        })
                      );
                      if (!isUserFound.skins.includes(data.skin)) {
                        socket.close(
                          1007,
                          "You hacker, your IP has been permently banned"
                        );
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
                    } else {
                      userbase.push({
                        userid: token,
                        scores: [],
                        username: data.username,
                        skins: ["0.webp"],
                        goldenGears: 0,
                        startLevels: 0,
                      });
                    }
                    console.log("user setup complete");
                  }
                } catch (e) {
                  console.log("2699", e);
                  (async function () {
                    var newid = await hashPassword(crypto.randomUUID());
                    players[newId].userId = newid;
                    userbase.push({
                      userid: newid,
                      scores: [],
                      username: data.username,
                      skins: ["0.webp"],
                      goldenGears: 0,
                      startLevels: 0,
                    });
                    socket.send(
                      JSON.stringify({ type: "newid", data: { newid: newid } })
                    );
                    badge = "/badges/1.webp";
                  })();
                }
              })();
              if (!data.token) {
                var _player = userbase.find((_player) => {
                  return comparePasswords(_player.userid, data.userId);
                });

                if (_player !== undefined) {
                  _player.username = data.username;
                  let score__$ = _player.scores.reduce((a, b) => {
                    return a + b.score;
                  }, 0);
                  if (score__$ >= 50000000) {
                    badge = "/badges/10.webp";
                  } else if (score__$ >= 25000000) {
                    badge = "/badges/9.webp";
                  } else if (score__$ >= 10000000) {
                    badge = "/badges/8.webp";
                  } else if (score__$ >= 5000000) {
                    badge = "/badges/7.webp";
                  } else if (score__$ >= 2500000) {
                    badge = "/badges/6.webp";
                  } else if (score__$ >= 1000000) {
                    badge = "/badges/5.webp";
                  } else if (score__$ >= 500000) {
                    badge = "/badges/4.webp";
                  } else if (score__$ >= 250000) {
                    badge = "/badges/3.webp";
                  } else if (score__$ >= 100000) {
                    badge = "/badges/2.webp";
                  } else {
                    badge = "/badges/1.webp";
                  }
                  socket.send(JSON.stringify({ type: "resovleID", data: {} }));
                  data.score = levels[_player.startLevels];
                  _player.startLevels = -1;
                  if (!_player.skins.includes(data.skin)) {
                    socket.close(
                      1007,
                      "You hacker, your IP has been permently banned"
                    );
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
                } else {
                  (async function () {
                    var newid = await hashPassword(crypto.randomUUID());
                    players[newId].userId = newid;
                    userbase.push({
                      userid: newid,
                      scores: [],
                      username: data.username,
                      skins: ["0.webp"],
                      goldenGears: 0,
                      startLevels: 0,
                    });
                    if (players[newId].skin !== "0.webp") {
                      socket.close(
                        1007,
                        "You hacker, your IP has been permently banned"
                      );
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
                    socket.send(
                      JSON.stringify({ type: "newid", data: { newid: newid } })
                    );
                    badge = "/badges/1.webp";
                  })();
                }
              }
            } else if (!data.token) {
              (async function () {
                var newid = await hashPassword(crypto.randomUUID());
                socket.send(
                  JSON.stringify({ type: "newid", data: { newid: newid } })
                );
                players[newId].userId = newid;
                userbase.push({
                  userid: newid,
                  scores: [],
                  username: data.username,
                  skins: ["0.webp"],
                  goldenGears: 0,
                  startLevels: 0,
                });
                if (players[newId].skin !== "0.webp") {
                  socket.close(
                    1007,
                    "You hacker, your IP has been permently banned"
                  );
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
                badge = "/badges/1.webp";
              })();
            }
            if (!data.token) {
              socket.send(
                JSON.stringify({
                  type: "badgeToplayer",
                  data: { badge: badge },
                })
              );
            }
            console.log("userbase initilized");
            emit("new_X_Y", { x: x, y: y, id: newId });
            players[newId].x = x;
            players[newId].y = y;
            createExsplosion(
              Math.random() * Math.random() * Date.now(),
              x + data.screenWidth / 2,
              y + data.screenHeight / 2
            );
            leader_board.hidden.push({
              id: newId,
              score: data.score,
              name: data.username,
              badge: badge,
            });
            if (!leader_board.shown[10]) {
              leader_board.shown.push({
                id: newId,
                score: data.score,
                name: data.username,
                badge: badge,
              });
            }
            if (leader_board.shown[10]) {
              if (0 > leader_board.shown[10].score) {
                leader_board.shown.push({
                  id: newId,
                  score: data.score,
                  name: data.username,
                  badge: badge,
                });
              }
              if (0 > leader_board.shown[10].score) {
                leader_board.shown[10] = {
                  id: newId,
                  score: data.score,
                  name: data.username,
                  badge: badge,
                };
              }
            }
            console.log("leader board built");

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
            console.log("intervals created");
            socket.send(
              JSON.stringify({
                type: "playerScore",
                data: {
                  bulletId: newId,
                  socrepluse: data.score,
                },
              })
            );
            console.log("user data recived:", data);
          })();

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
          data.id = connection.playerId;
          if (!players[data.id]) break;
          let myTeam = teamlist.find((team) => team.teamID === data.teamId);
          if (!myTeam) break;
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
                  { color: "red", delay: CONFIG.messageIntervals.short }
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
                  { color: "red", delay: CONFIG.messageIntervals.short }
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
                    delay: CONFIG.messageIntervals.short,
                  });
                }
              } else {
                createAnnocment(
                  `Not enough Team score. The team has ${myTeam.teamScore}`,
                  data.id,
                  { color: "red", delay: CONFIG.messageIntervals.short }
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
                    delay: CONFIG.messageIntervals.short,
                  });
                }
              } else {
                createAnnocment(
                  `Not enough score. You have ${players[data.id].score}`,
                  data.id,
                  { color: "red", delay: CONFIG.messageIntervals.short }
                );
              }
            }
          } else if ("buildBase" === data.upgradeType) {
            if (myTeam.createTeamScore) {
              if (!myTeam.upgrades.teamBuilding.built) {
                myTeam.teamScore -= 10000;
                let base = {
                  type: `octagon${myTeam.teamID}`,
                  health: 2000,
                  maxhealth: 2000,
                  size: 500,
                  angle: 0,
                  healrate: 4,
                  x: players[myTeam.owner.id].x - 600,
                  y: players[myTeam.owner.id].y,
                  centerX: players[myTeam.owner.id].x - 600,
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
                  lastDamaged: null,
                  lastDamgers: [],
                };
                var basesheild = {
                  type: "sheild",
                  bullet_distance: Infinity,
                  transparency: 0.5,
                  speed: 0,
                  size: 650,
                  angle: 0,
                  bullet_damage: -1,
                  distanceTraveled: 0,
                  vertices: null,
                  bullet_pentration: 0,
                  x: players[myTeam.owner.id].x - 600,
                  y: players[myTeam.owner.id].y,
                  lifespan: 0,
                  health: 10,
                  xstart: players[myTeam.owner.id].x - 600,
                  ystart: players[myTeam.owner.id].y,
                  id: myTeam.teamID,
                  uniqueid: randID,
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
                reassignRoomItem(base);
                reassignRoomBullet(basesheild);
              } else {
                createAnnocment(
                  `The team base has all ready been built`,
                  data.id,
                  { color: "orange", delay: CONFIG.messageIntervals.short }
                );
              }
            } else {
              if (players[data.id].score >= 10000) {
                if (!myTeam.upgrades.teamBuilding.built) {
                  let base = {
                    type: `octagon${myTeam.teamID}`,
                    health: 2000,
                    maxhealth: 2000,
                    size: 500,
                    angle: 0,
                    healrate: 4,
                    x: players[myTeam.owner.id].x - 600,
                    y: players[myTeam.owner.id].y,
                    centerX: players[myTeam.owner.id].x - 600,
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
                    lastDamaged: null,
                    lastDamgers: [],
                  };
                  var basesheild = {
                    type: "sheild",
                    bullet_distance: Infinity,
                    transparency: 0.5,
                    speed: 0,
                    size: 650,
                    angle: 0,
                    bullet_damage: -1,
                    distanceTraveled: 0,
                    vertices: null,
                    bullet_pentration: 0,
                    x: players[myTeam.owner.id].x - 600,
                    y: players[myTeam.owner.id].y,
                    lifespan: 0,
                    health: 10,
                    xstart: players[myTeam.owner.id].x - 600,
                    ystart: players[myTeam.owner.id].y,
                    id: myTeam.teamID,
                    teamID: myTeam.teamID,
                    uniqueid: randID,
                  };
                  const rawvertices = calculateRotatedOctagonVertices(
                    base.x,
                    base.y,
                    base.size,
                    base.angle
                  );
                  base.vertices = rawvertices;
                  myTeam.upgrades.teamBuilding.built = true;
                  myTeam.upgrades.teamBuilding.polygonId = `teamBase:${myTeam.teamID}`;
                  reassignRoomItem(base);
                  reassignRoomBullet(basesheild);
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
                    { color: "orange", delay: CONFIG.messageIntervals.short }
                  );
                }
              } else {
                createAnnocment(
                  `Not enough score. You have ${players[data.id].score}`,
                  data.id,
                  { color: "red", delay: CONFIG.messageIntervals.short }
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
          data.id = connection.playerId;
          players[data.id].autoFiring = data.autoFiring;
          break;
        }

        case "premotePlayer": {
          data.premotor = players[connection.playerId];
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
              { color: "green", delay: CONFIG.messageIntervals.short }
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
              { color: "green", delay: CONFIG.messageIntervals.short }
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
          data.premotor = players[connection.playerId];
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
          if (data.premotor.id === myTeam.owner.id) {
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
              { color: "orange", delay: CONFIG.messageIntervals.medium }
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
              { color: "orange", delay: CONFIG.messageIntervals.short }
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
          (async function () {
            data.owner = {};
            data.owner.id = connection.playerId;
            data.owner.username = players[connection.playerId].username;
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
                  socket.send("Vote", { teamID: team.teamID });
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
                { color: "orange", delay: CONFIG.messageIntervals.short }
              );
              data.createTeamScore = true;
            }

            data.messages = [];
            data.name = await curse.filter(data.name);
            data.description = await curse.filter(data.description);

            if (govType === "Constitutional") {
              var powers = CONFIG.powers.Constitutional;
              data.constitution = `
                Constitution of ${data.name}
                =========================
                
                Preamble:
                This document establishes the foundation and governance structure of ${
                  data.name
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
              }, ${
                powers.lowerlevelpowers.canKick ? "Kick Members" : "No Kicking"
              }.
                
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
                if (!players[player.id]) return;
                if (
                  players[player.id].score > 0 &&
                  data.owner.id !== player.id
                ) {
                  var Scheduledtax =
                    players[player.id].score * data.ScheduledBasedTax;
                  players[player.id].score =
                    players[player.id].score - Scheduledtax;
                  if (data.createTeamScore) {
                    data.teamScore += Scheduledtax;
                    public_teams = teamlist.map((team) => {
                      if (!team.hidden) {
                        team.taxInterval = null;
                        return team;
                      }
                    });
                    emit("pubteamlist", public_teams);
                    createAnnocment(
                      `Tax Taken ${data.ScheduledBasedTax}%`,
                      player.id,
                      { color: "red", delay: CONFIG.messageIntervals.short }
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

            let code = Math.floor(100000 * Math.random());
            data.teamKey = code;
            teamKeys.push(code);
            createAnnocment(
              `The join code is ${code}`,
              data.owner.id,
              CONFIG.messageIntervals.long
            );
            createAnnocment(
              `put this into the url bar like this: tankshark.fun/?team=code when someone wants to join`,
              data.owner.id,
              { delay: CONFIG.messageIntervals.long }
            );
            emit("pubteamlist", public_teams);
          })();
          break;
        }

        case "postBite": {
          (async function () {
            data.id = connection.playerId;
            if (!players[data.id]) return;
            const clean = await curse.filter(data.message);
            var team = teamlist.find((team) => team.teamID === data.teamID);
            if (clean.length > 255) {
              createAnnocment("Message is too long", data.id, {
                color: "red",
                delay: CONFIG.messageIntervals.short,
              });
              return;
            }
            team.messages.push({
              message: clean,
              poster: data.id,
              randomID: Math.floor(Math.random() * 1000000),
              username: players[data.id].username,
              date: Date.now(),
              likes: 0,
              dislikes: 0,
              likers: {},
              dislikers: {},
            });
            sortMessages(team.messages);
            console.log("3758", team.messages);
            emitTeam("postBiteMessage", team.messages, team.teamID);
            return;
          })();
          break;
        }

        case "likeDislike": {
          var team = teamlist.find(
            (team) => team.teamID === players[connection.playerId].team
          );
          var message = team.find((message) => {
            data.id === message.randomID;
          });
          if (data.type === 0) {
            if (message.likers[data.id]) {
              message.likes -= 1;
              delete message.likers[data.id];
            } else {
              message.likes += 1;
              message.likers[data.id] = true;
            }
          } else if (data.type === 1) {
            if (message.dislikers[data.id]) {
              message.dislikes -= 1;
              delete message.dislikers[data.id];
            } else {
              message.dislikes += 1;
              message.dislikers[data.id] = true;
            }
          }
          break;
        }

        case "playerJoinedTeam": {
          data.id = connection.playerId;
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
          data.id = connection.playerId;
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
          data.playerId = connection.playerId;
          let MYteam = teamlist.find((team) => {
            return team.teamID === data.teamID;
          });
          if (
            players[data.playerId].team !== data.teamID ||
            players[data.playerId].team !== MYteam.teamID ||
            data.playerId !== MYteam.owner.id
          ) {
            socket.close(403, "invalid delete");
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
          deleteTeamBase(data.teamID);
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
          data.id = connection.playerId;
          var autoAngle = data.autoAngle;
          var turnhide = setInterval(() => {
            autoAngle += 4 / 5;
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
            socket.send(JSON.stringify({ type: "autoAngle", data: autoAngle }));
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
                    var [X, Y] = rotatePointAroundPlayer(
                      offSet_x,
                      0,
                      data.angle
                    );
                    cannon["x_"] = X;
                    cannon["y_"] = Y;
                  }
                }
              });
            });
          }, 15);
          hidden_broswers.push({ interval: turnhide, id: data.id });
          break;
        }

        case "playerSend": {
          (async function (params) {
            data.id = connection.playerId;
            data.text = await curse.filter(data.text);
            emit("playerMessage", {
              text: data.text,
              exspiretime: CONFIG.messageIntervals.short,
              id: data.id,
              hidetime: Date.now() + 2500,
            });
            messages.push({
              text: data.text,
              exspiretime: CONFIG.messageIntervals.short,
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
          })();
          break;
        }

        case "unrotating": {
          data.id = connection.playerId;
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
          data.id = connection.playerId;
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
          data.playerid = connection.playerId;
          autocannons.push(data);
          let cannonsplayer = tankmeta[players[data.playerid].__type__].cannons;
          let cannonamountplayer = Object.keys(cannonsplayer).length;
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
          data.id = connection.playerId;
          if (!players[data.id]) {
            invaled_requests.push(data.id);
            break;
          }
          if (data.skin) {
            socket.close(999, "You hacker your IP has been permently banned");
            return false;
          }
          var tankdata = tankmeta[data.__type__];
          players[connection.playerId].maxhealth *= tankdata["health-m"];
          players[connection.playerId].speed *= tankdata["speed-m"];
          players[connection.playerId].size *= tankdata["size-m"];
          players[connection.playerId].bodyDamage *= tankdata["BodyDamage-m"];
          players[connection.playerId].__type__ *= data.__type__;
          players[connection.playerId].FOV += tankdata.fov;
          players[connection.playerId].Regenspeed *= tankdata["regen-m"];
          emit("type_Change", data);
          break;
        }

        case "playerCannonWidth": {
          data.id = connection.playerId;
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
          data.id = connection.playerId;
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

        case "playerMoved": {
          data.id = connection.playerId;
          if (!players[data.id]) return;
          players[data.id].x = data.x;
          players[data.id].y = data.y;
          if (!data.last) {
            return;
          }
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
          data.id = connection.playerId;
          if (!players[data.id]) return;
          players[data.id].size += data.plus;
          break;
        }

        case "Autofire": {
          let fire_at = null;
          let cannon = data.cannon;

          data.playerId = connection.playerId;
          data._cannon.playerid = connection.playerId;
          data.cannon.playerid = data.playerId;
          cannon._type_ = cannon.type;
          cannon.autoindex = data.autoindex;
          var mecannons = autocannons.find((cannons___0_0) => {
            return data._cannon.CannonID === cannons___0_0.CannonID;
          });

          if (cannon._type_ === "SwivelAutoCannon") {
            var offSet_x = data.tankdatacannon__[cannon.autoindex]["offSet-x"];
            if (
              data.tankdatacannon__[cannon.autoindex]["offSet-x"] === "playerX"
            ) {
              offSet_x = players[cannon.playerid].size * CONFIG.playerBaseSize;
            }
            if (
              data.tankdatacannon__[cannon.autoindex]["offSet-x-multpliyer"]
            ) {
              offSet_x *= -1;
            }
            console.log(
              "anglemangle",
              players[cannon.playerid].cannon_angle * (180 / Math.PI),
              players[cannon.playerid].cannon_angle,
              offSet_x
            );
            var [x, y] = rotatePointAroundPlayer(
              offSet_x,
              0,
              players[cannon.playerid].cannon_angle
            );
            cannon["x_"] = x;
            cannon["y_"] = y;
          } else {
            var offSet_x = data.tankdatacannon__[cannon.autoindex]["offSet-x"];
            if (
              data.tankdatacannon__[cannon.autoindex]["offSet-x"] === "playerX"
            ) {
              offSet_x = players[cannon.playerid].size * CONFIG.playerBaseSize;
            }
            if (
              data.tankdatacannon__[cannon.autoindex]["offSet-x-multpliyer"]
            ) {
              offSet_x *= -1;
            }
          }
          var targetData = getTarget(cannon, data.tankdatacannon__);
          fire_at = targetData.target;
          let speedUP = 0;

          if (fire_at === null) return;

          let cannon_life = cannon["life-time"] || 0;
          if (players[data.playerId].statsTree["Bullet Speed"] !== 1) {
            speedUP =
              players[data.playerId].statsTree["Bullet Speed"] *
              CONFIG.levelMultiplyer;
          }

          let bullet_speed__ = data.bullet_speed * cannon["bulletSpeed"];

          var bulletdistance =
            (bullet_speed__ + speedUP) * 100 * (data.bullet_size / 6);
          var __type = "basic";
          var health = 8;
          let angle = 0;

          if (cannon._type_ === "SwivelAutoCannon") {
            console.log(cannon["y_"], cannon["x_"]);
            angle = Math.atan2(
              fire_at.y - (players[cannon.playerid].y + cannon["y_"]),
              fire_at.x - (players[cannon.playerid].x + cannon["x_"])
            );
          } else {
            angle = Math.atan2(
              fire_at.y - players[data.playerId].y,
              fire_at.x - (players[cannon.playerid].x + offSet_x)
            );
          }
          // mecannons.angle = angle;

          // emit("autoCannonUPDATE-ANGLE", {
          //   angle: mecannons.angle,
          //   cannon_ID: mecannons.CannonID,
          // });

          let bullet_size_l = data.bullet_size * cannon["bulletSize"];

          var offSet_x = cannon["offSet-x"];
          if (cannon["offSet-x"] === "playerX") {
            offSet_x =
              (players[data.playerId].size / 2) * CONFIG.playerBaseSize;
          }

          var xxx = cannon["cannon-width"] - bullet_size_l;
          var yyy = cannon["cannon-height"] - bullet_size_l;
          var angle_ = angle + cannon["offset-angle"];

          let rotated_offset_x =
            (offSet_x + xxx) * Math.cos(angle_) -
            (cannon["offSet-y"] + yyy) * Math.sin(angle_);
          let rotated_offset_y =
            (offSet_x + xxx) * Math.sin(angle_) +
            (cannon["offSet-y"] + yyy) * Math.cos(angle_);

          if (cannon._type_ === "SwivelAutoCannon") {
            var bullet_start_x =
              players[cannon.playerid].x + cannon["x_"] + rotated_offset_x;
            var bullet_start_y =
              players[cannon.playerid].y + cannon["y_"] + rotated_offset_y;
          } else {
            var bullet_start_x = players[cannon.playerid].x + rotated_offset_x;
            var bullet_start_y = players[cannon.playerid].y + rotated_offset_y;
            console.log(
              angle_,
              bullet_start_y,
              bullet_start_x,
              players[cannon.playerid].x,
              players[cannon.playerid].y,
              rotated_offset_y
            );
          }

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
            xstart: players[cannon.playerid].x,
            ystart: players[cannon.playerid].y,
            id: data.playerId,
            uniqueid: identdfire,
            Zlevel: 2,
          };

          for (let l = 0; l < 10; l++) {
            setTimeout(() => {
              data._cannon.cannonWidth -= 1.5;
              emit("CannonWidthUpdate", {
                CannonID: data._cannon.CannonID,
                cannonWidth: data._cannon.cannonWidth,
              });
            }, 10 * l);
            setTimeout(() => {
              data._cannon.cannonWidth += 1.5;
              emit("CannonWidthUpdate", {
                CannonID: data._cannon.CannonID,
                cannonWidth: data._cannon.cannonWidth,
              });
            }, 20 * l); // Updated to prevent overlap
          }

          reassignRoomBullet(bullet);
          break;
        }

        case "playerCannonMoved": {
          data.id = connection.playerId;
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
          data.playerID = connection.playerId;
          if (!players[data.playerID]) {
            invaled_requests.push(data.playerID);
            return;
          }
          players[data.playerID].state = data.state;
          broadcast("statechangeUpdate", data, socket);
          break;
        }

        case "healrate": {
          data.id = connection.playerId;
          if (!players[data.id]) {
            invaled_requests.push(data.id);
            return;
          }
          players[data.id].playerReheal = data.playerReheal;
          break;
        }

        case "AddplayerHealTime": {
          data.id = connection.playerId;
          if (!players[data.id]) {
            invaled_requests.push(data.id);
            return;
          }
          players[data.id].maxhealth = data.maxhealth;
          players[data.id].playerHealTime = data.playerHealTime;
          emit("updaterHeal", { ID: data.id, HEALTime: data.playerHealTime });
          if (
            data.playerHealTime > players[data.id].Regenspeed &&
            players[data.id].health < players[data.id].maxhealth
          ) {
            let healer = setInterval(function () {
              if (!players[data.id]) {
                clearInterval(healer);
                return;
              }
              players[data.id].health += players[data.id].playerReheal;
              if (players[data.id].health >= players[data.id].maxhealth) {
                players[data.id].health = players[data.id].maxhealth;
                clearInterval(healer);
              }
              if (
                players[data.id].playerHealTime < players[data.id].Regenspeed
              ) {
                players[data.id].health -= players[data.id].playerReheal;
                clearInterval(healer);
              }
              emit("playerHeal", {
                HEALTH: players[data.id].health,
                id: data.id,
              });
            }, 50);
          }
          break;
        }

        case "playerHealintterupted": {
          data.id = connection.playerId;
          if (!players[data.id]) {
            invaled_requests.push(data.id);
            break;
          }
          players[data.id].playerHealTime = 0;
          emit("updaterHeal", { id: data.id, HEALTime: 0 });
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
              killplayer(player.id);
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
              killplayer(player.id);
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
            console.log("4877", error);
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
          data.id = connection.playerId;
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
          } else {
            data.wander = new (function () {})();
          }
          if (data.type === "roadMap") {
            var road = {
              x: data.x,
              y: data.y,
              id: data.id,
              uniqueid: data.uniqueid,
              multiplyer:
                tankmeta[players[data.id].__type__].cannons[data.cannonIndex]
                  .multiplyer,
            };
            roads.push(road);
            data.road = road;
            console.log(road);
          } else {
            data.road = {};
          }
          data.Zlevel = data.Zlevel ? data.Zlevel : 1;

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
              players[data.id].statsTree["Bullet Speed"] *
              CONFIG.levelMultiplyer;
            data.speed += speedUP;
          }
          data.lookedAt = false;
          reassignRoomBullet(data);
          if (data.type === "trap") {
            setTimeout(() => {
              // hacky soltion to remove the data
              data.distanceTraveled = 100e10;
            }, data.lifespan * 1000);
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
                if (playerID !== data.id && !sameTeam) {
                  var distance = MathHypotenuse(
                    player.x - data.x,
                    player.y - data.y
                  );
                  if (distance < maxdistance) {
                    maxdistance = distance;
                    fire_at = player;
                  }
                }
              }
              if (maxdistance > CONFIG.playerItemSightRange) {
                getRoomAndBounding(data.x, data.y).items.forEach((item) => {
                  var distance = MathHypotenuse(
                    item.x - data.x,
                    item.y - data.y
                  );
                  if (distance < maxdistance) {
                    maxdistance = distance;
                    fire_at = item;
                  }
                });
              }
              let speedUP = 0;
              if (fire_at === null) return;

              if (players[data.id].statsTree["Bullet Speed"] !== 1) {
                speedUP =
                  players[data.id].statsTree["Bullet Speed"] *
                  CONFIG.levelMultiplyer;
              }
              let cannon_life = 0;

              let bullet_speed__ =
                (data.speed / 1.3) * cannon["bulletSpeed"] * 5;
              var bulletdistance =
                (bullet_speed__ + speedUP) * 100 * (data.size / 6);
              var __type = "basic";
              var health = 8;

              let angle = Math.atan2(
                fire_at.y - data.y, // y difference
                fire_at.x - data.x // x difference
              );

              let bullet_size_l = (data.size * cannon["bulletSize"]) / 1.8;

              if (cannon["offSet-x"] === "playerX") {
                offSet_x = (players[data.id].size / 2) * CONFIG.playerBaseSize;
              }

              var xxx = data.size / 5 - bullet_size_l * 0.2;
              var yyy = data.size / 10 - bullet_size_l * 1.2;
              var angle_ = angle;

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
              if (players[data.id].statsTree["Bullet Damage"] !== 1) {
                damageUP =
                  (players[data.id].statsTree["Bullet Damage"] *
                    CONFIG.levelMultiplyer) /
                  (data.bullet_damage ** 2 / (data.bullet_damage / 10));
              }
              let PentrationPluse = 0;
              if (players[data.id].statsTree["Bullet Pentration"] !== 1) {
                PentrationPluse =
                  players[data.id].statsTree["Bullet Pentration"] *
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
                id: data.id,
                uniqueid: identdfire,
                Zlevel: 3,
                cannonIndex: data.cannonIndex,
              };

              reassignRoomBullet(bullet____);

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
              setTimeout(() => {
                let canfire = true;
                bullet_intervals.forEach((intervals) => {
                  if (intervals.id === data.uniqueid) {
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
            bullet_intervals.push({ canfire: true, id: data.uniqueid });
          } else if (data.type === "rocketer") {
            let __reload__ = 1;
            let cannon =
              tankmeta[players[data.id].__type__]["cannons"][data.parentindex];
            function auto_bullet() {
              if (players[data.id].statsTree["Bullet Speed"] !== 1) {
                speedUP =
                  players[data.id].statsTree["Bullet Speed"] *
                  CONFIG.levelMultiplyer;
              }
              let cannon_life = 0;

              let bullet_speed__ = (data.speed / 5) * cannon["bulletSpeed"];
              var bulletdistance =
                (bullet_speed__ + speedUP) * 25 * (data.size / 7);
              var __type = "basic";
              var health = 8;

              let angle = data.angle - pi;

              let bullet_size_l = (data.size * cannon["bulletSize"]) / 1.2;

              let randomNumber = generateRandomNumber(-0.2, 0.2);

              var offSet_x = cannon["offSet-x"];
              if (cannon["offSet-x"] === "playerX") {
                offSet_x = (players[data.id].size / 2) * CONFIG.playerBaseSize;
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
              if (players[data.id].statsTree["Bullet Damage"] !== 1) {
                damageUP =
                  (players[data.id].statsTree["Bullet Damage"] *
                    CONFIG.levelMultiplyer) /
                  (data.bullet_damage ** 2 / (data.bullet_damage / 10));
              }
              let PentrationPluse = 0;
              if (players[data.id].statsTree["Bullet Pentration"] !== 1) {
                PentrationPluse =
                  players[data.id].statsTree["Bullet Pentration"] *
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
                id: data.id,
                uniqueid: identdfire,
                Zlevel: 3,
                cannonIndex: data.cannonIndex,
              };

              reassignRoomBullet(bullet____);
              var interval__;
              setTimeout(() => {
                let canfire = true;
                bullet_intervals.forEach((intervals) => {
                  if (intervals.id === data.uniqueid) {
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
            bullet_intervals.push({ canfire: true, id: data.uniqueid });
          }
          break;
        }

        case "MouseAway": {
          data.id = connection.playerId;
          if (!players[data.id]) break;
          players[data.id].mousestate = "held";
          break;
        }

        case "MousestateUpdate": {
          data.id = connection.playerId;
          if (!players[data.id]) break;
          players[data.id].mousestate = "up";
          break;
        }

        case "FOVUpdate": {
          data.id = connection.playerId;
          if (!players[data.id]) break;
          let player = players[data.id];
          player.canvasW = data.canvasW;
          player.canvasH = data.canvasH;
          player.screenWidth = data.screenW;
          player.screenHeight = data.screenH;
          player.FOV = data.scaleFactor;
          break;
        }

        default: {
          console.log("Unknown action:", type);
          console.log("Empty action received.");
        }
      }
    } catch (e) {
      console.log("5366", e);
      socket.close(1003, "Invalid data received.");
      return;
    }
  });

  socket.on("close", () => {
    try {
      roads = roads.filter((road) => {
        if (road.id === connection.playerId) {
          return false;
        }
        return true;
      });
    } catch (e) {
      console.log("5381", e);
    }
    try {
      IPs = IPs.splice(IPs.indexOf(req.socket.remoteAddress), 1);
    } catch (e) {
      console.log("5386", e);
    }
    try {
      hidden_broswers = hidden_broswers.filter((interval) => {
        if (connection.playerId === interval.id) {
          clearInterval(interval.interval);
          return false;
        }
        return true;
      });
    } catch (e) {
      console.log("5397", e);
    }
    try {
      const index = () => {
        var realindex = -1;
        connection.forEach((connection_, index) => {
          if (connection.playerId === connection_.playerId) {
            realindex = index;
          }
        });
        return realindex;
      };
      deadplayers = deadplayers.splice(
        deadplayers.indexOf(connection.playerId),
        1
      );
      if (index !== -1) {
        connections.splice(index, 1); // Remove the connection from the list
      }
    } catch (e) {
      console.log("5417", e);
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
      console.log("5430", e);
    }
    try {
      var _player = userbase.find((_player_) => {
        return comparePasswords(
          _player_.userid,
          players[connection.playerId]?.userId
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
      writeToUserbase();
    } catch (e) {
      console.log("5458", e);
    }
    try {
      clearInterval(stateupdate);
      if (players[connection.playerId]) {
        clearTimeout(players[connection.playerId]?.stateTimeout);
      }
    } catch (e) {
      console.log("5466", e);
    }
    try {
      teamlist = teamlist.filter((team) => {
        var teamplayers = team.players;
        teamplayers = teamplayers.filter((player) => {
          return player.id !== connection.playerId;
        });
        team.players = teamplayers;
        if (teamplayers.length === 0) {
          clearInterval(team.taxInterval);
          deleteTeamBase(team.teamID);
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
            deleteTeamBase(team.teamID);
            return false;
          }
        }
        return true;
      });
    } catch (e) {
      console.log("5514", e);
    }
    try {
      var public_teams = [];
      public_teams = teamlist.map((team) => {
        if (!team.hidden) {
          team.taxInterval = null;
          team.powers = {};
          return team;
        }
      });
    } catch (e) {
      console.log("5526", e);
    }
    try {
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
    } catch (e) {
      console.log("5543", e);
    }
  });

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

let buildArray = [];
let deadlist = [];

function gameLoop() {
  setInterval(() => {
    frame++;

    autocannons.forEach((cannon) => {
      if (cannon._type_ !== "bulletAuto") {
        if (players[cannon.playerid] == undefined) return;
        var tankdatacannon__ =
          tankmeta[players[cannon.playerid].__type__]["cannons"];
      } else if (cannon._type_ === "bulletAuto") {
        var par_ = findBullet(cannon.playerid);
        if (par_ == null || players[par_.id] === undefined) return;
        var tankdatacannon__ = tankmeta[players[par_.id].__type__]["cannons"];
        cannon.x = par_.x;
        cannon.y = par_.y;
      }

      if (cannon._type_ === "SwivelAutoCannon") {
        var offSet_x = tankdatacannon__[cannon.autoindex]["offSet-x"];
        if (tankdatacannon__[cannon.autoindex]["offSet-x"] === "playerX") {
          offSet_x = players[cannon.playerid].size * CONFIG.playerBaseSize;
        }
        if (tankdatacannon__[cannon.autoindex]["offSet-x-multpliyer"]) {
          offSet_x *= -1;
        }
        var [x, y] = rotatePointAroundPlayer(
          offSet_x,
          0,
          players[cannon.playerid].cannon_angle
        );
        cannon["x_"] = x;
        cannon["y_"] = y;
      }
      try {
        var targetData = getTarget(cannon, tankdatacannon__);
      } catch {
        console.log(cannon);
      }

      var fire_at__ = targetData.target;
      var target_enity_type = targetData.type;

      if (fire_at__ !== undefined && fire_at__ !== null) {
        var angle;
        if (cannon._type_ === "SwivelAutoCannon") {
          angle = Math.atan2(
            fire_at__.y - (players[cannon.playerid].y + cannon["y_"]),
            fire_at__.x - (players[cannon.playerid].x + cannon["x_"])
          );
        } else if (cannon._type_ === "bulletAuto") {
          angle = Math.atan2(fire_at__.y - par_.y, fire_at__.x - par_.x);
        } else {
          angle = Math.atan2(
            fire_at__.y - players[cannon.playerid].y,
            fire_at__.x - players[cannon.playerid].x
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
            Math.abs(cannon.angle - cannon.targetAngle) > 0.05
          ) {
            console.log(cannon.angle, cannon.targetAngle);
            if (cannon._type_ === "bulletAuto") {
              var reload_1 = players[par_.id].statsTree["Bullet Reload"] - 1;
            } else {
              var reload_1 =
                players[cannon.playerid].statsTree["Bullet Reload"] - 1;
            }
            cannon.angle +=
              Math.abs(cannon.angle - cannon.targetAngle) /
              (3.5 - reload_1 / 2);
            emit("autoCannonUPDATE-ANGLE", {
              angle: cannon.angle,
              cannon_ID: cannon.CannonID,
            });
          } else if (
            cannon.angle > cannon.targetAngle &&
            Math.abs(cannon.angle - cannon.targetAngle) > 0.05
          ) {
            if (cannon._type_ === "bulletAuto") {
              var reload_1 = players[par_.id].statsTree["Bullet Reload"] - 1;
            } else {
              var reload_1 =
                players[cannon.playerid].statsTree["Bullet Reload"] - 1;
            }
            cannon.angle -=
              Math.abs(cannon.angle - cannon.targetAngle) /
              (3.5 - reload_1 / 2);
            emit("autoCannonUPDATE-ANGLE", {
              angle: cannon.angle,
              cannon_ID: cannon.CannonID,
            });
          }
        } else if (Math.abs(cannon.angle - cannon.targetAngle) > 0.001) {
          moveCannonAngle(cannon);
        }
      }
    });

    for (const roomkey in food_squares) {
      var room = food_squares[roomkey];
      if (typeof room === "function") continue;
      for (let i = 0; i < room.items.length; i++) {
        let item = room.items[i];
        let index = i;
        if (
          !(
            item.x >= room.bounds.x1 &&
            item.x <= room.bounds.x2 &&
            item.y >= room.bounds.y1 &&
            item.y <= room.bounds.y2
          )
        ) {
          reassignRoomItem(item);
          room.items.splice(i, 1);
          continue;
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
          var target = {
            x: null,
            distanceX: CONFIG.bossLookUpRange,
            y: null,
            distanceY: CONFIG.bossLookUpRange,
          };
          for (const playerId in players) {
            var player = players[playerId];
            if (
              target.distanceX > Math.abs(player.x - item.x) ||
              target.distanceY > Math.abs(player.y - item.y)
            ) {
              target = {
                x: player.x,
                distanceX: Math.abs(player.x - item.x),
                distanceY: Math.abs(player.y - item.y),
                y: player.y,
              };
            }
          }
          let __angle = Math.atan2(target.y - item.y, target.x - item.x);
          if (target.x && target.y) {
            var newX = item.x + item.speed * Math.cos(__angle);
            var newY = item.y + item.speed * Math.sin(__angle);
          } else {
            var newX = item.x;
            var newY = item.y;
          }
          item.centerX = newX;
          item.centerY = newY;
          item.x = newX;
          item.y = newY;
          item.boss.x = item.x;
          item.boss.y = item.y;
          item.angle = __angle;
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
                x: cannon.x,
                y: cannon.y,
                lifespan: 0,
                health: 10,
                xstart: cannon.x,
                ystart: cannon.y,
                id: cannon.id,
                uniqueid: randID,
                boundtype: "square",
                wander: new Wanderer(
                  cannon.x,
                  cannon.y,
                  item.size,
                  cannon.x,
                  cannon.y,
                  3,
                  cannon.current,
                  "arc"
                ),
                cannon: cannon,
              };

              reassignRoomBullet(bullet____);
              let boss = item.boss;
              for (let l = 0; l < 10; l++) {
                setTimeout(() => {
                  boss.cannons[i].cannonW -= 1;
                }, 20 * l);
                setTimeout(() => {
                  boss.cannons[i].cannonW += 1;
                }, 40 * l);
              }
            }
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
                x: cannon.x,
                y: cannon.y,
                lifespan: 0,
                health: 10,
                xstart: cannon.x,
                ystart: cannon.y,
                id: cannon.id,
                uniqueid: randID,
                boundtype: "triangle",
                wander: new Wanderer(
                  cannon.x,
                  cannon.y,
                  item.size,
                  cannon.x,
                  cannon.y,
                  4,
                  cannon.current,
                  "arc"
                ),
                cannon: cannon,
                boss: item.boss,
              };
              reassignRoomBullet(bullet____);
              let boss = item.boss;
              for (let l = 0; l < 10; l++) {
                setTimeout(() => {
                  boss.cannons[i].cannonW -= 1;
                }, 20 * l);
                setTimeout(() => {
                  boss.cannons[i].cannonW += 1;
                }, 40 * l);
              }
            }
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
          item.transparency =
            1 - (Date.now() - item.deathtime) / CONFIG.fadeRate;
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
                item.lastDamaged = Date.now();
                item.lastDamgers.push(player.id);
                item.lastDamgers = item.lastDamgers.splice(0, 2);
              }

              if (player.health < 0 && !sameteam) {
                emit("playerDied", {
                  playerID: player.id,
                  rewarder: null,
                  reward: null,
                });
                killplayer(player.id);
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
                    public_teams = teamlist.map((team) => {
                      if (!team.hidden) {
                        team.taxInterval = null;
                        return team;
                      }
                    });
                    emit("pubteamlist", public_teams);
                  } else {
                    emit("playerScore", {
                      bulletId: team.owner.id,
                      socrepluse: reward * team.simpleTax,
                    });
                  }

                  var complexTax =
                    reward *
                    (calculateTax(player.score, 10000000) / team.playerTax);
                  if (team.owner.id !== player.id || team.createTeamScore) {
                    reward -= complexTax;
                  }
                  if (team.createTeamScore) {
                    team.teamScore += complexTax / 1.5;
                    public_teams = teamlist.map((team) => {
                      if (!team.hidden) {
                        team.taxInterval = null;
                        return team;
                      }
                    });
                    emit("pubteamlist", public_teams);
                  } else {
                    emit("playerScore", {
                      bulletId: team.owner.id,
                      socrepluse: complexTax,
                    });
                    players[team.owner.id].score += complexTax;
                  }
                }
                player.score += reward;
                emit("playerScore", {
                  bulletId: player.id,
                  socrepluse: reward,
                });
                console.log(reward, "ram");
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

                var valueOp = getRandomInt(1, 15);
                var type = "";
                var color = "";
                var health_max = "";
                var score_add = 0;
                var body_damage = 0;
                if (item.goldenGears) {
                  var _player = userbase.find((_player) => {
                    return comparePasswords(_player.userid, player.userId);
                  });
                  if (_player) {
                    _player.goldenGears += 1;
                    createAnnocment(
                      _player.username +
                        " has collected a golden gear! Total: " +
                        _player.goldenGears,
                      player.id,
                      { delay: CONFIG.messageIntervals.long, color: "gold" }
                    );
                  }
                  valueOp = 16;
                }
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
                    case 16: // Adjusted to 9-10 for pentagon
                      type = "pentagon";
                      color = "#C2A248";
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
                if (!item["respawn-raidis"]) {
                  var goldenGears = item.goldenGears ? item.goldenGears : null;
                  var fooditem = {
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
                    lastDamaged: null,
                    lastDamgers: [],
                    goldenGears: goldenGears,
                  };
                } else {
                  var fooditem = {
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
                    "respawn-raidis": item["respawn-raidis"],
                    lastDamaged: null,
                    lastDamgers: [],
                  };
                }
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
                  reassignRoomItem(fooditem);
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

                room.items.splice(i, 1);
                continue;
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
        if (
          !item.isdead &&
          Date.now() - item.lastDamaged > 30 * 1000 &&
          item.health < item.maxhealth
        ) {
          item.health += item.healrate / 40;
        }
        var bulletsToTest = getRoomAndBoundingForBullets(roomkey);
        for (let i = 0; i < bulletsToTest.length; i++) {
          var bullet = bulletsToTest[i];
          if (
            Math.abs(bullet.x - item.x) < item.size * 2 + bullet.size * 2 &&
            Math.abs(bullet.y - item.y) < item.size * 2 + bullet.size * 2
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

            if (!collisionCheck || sameteam) continue;
            const damage =
              (bullet.bullet_damage / (item.size + bulletSpeed) +
                bullet.bullet_pentration) /
              5;

            item.lastDamaged = Date.now();
            item.lastDamgers.push(bullet.id);
            item.lastDamgers = item.lastDamgers.splice(0, 2);

            if (
              damage >= item.health &&
              bullet.type !== "FreeNecromancer" &&
              bullet.type !== "FreeSwarm"
            ) {
              if (!players[bullet.id]) {
                console.error(bullet.id);
                console.error(players);
                continue;
              }
              var reward = item.score_add;

              if (player.team !== null) {
                var team = teamlist.find((team) => team.teamID === player.team);
                if (team.owner.id !== player.id || team.createTeamScore) {
                  reward -= reward * team.simpleTax;
                }
                if (team.createTeamScore) {
                  team.teamScore += (reward * team.simpleTax) / 2;
                  public_teams = teamlist.map((team) => {
                    if (!team.hidden) {
                      team.taxInterval = null;
                      return team;
                    }
                  });
                  emit("pubteamlist", public_teams);
                } else if (team.owner.id !== player.id) {
                  emit("playerScore", {
                    bulletId: team.owner.id,
                    socrepluse: reward * team.simpleTax,
                  });
                }

                var complexTax =
                  reward *
                  (calculateTax(player.score, 10000000) / team.playerTax);
                if (team.owner.id !== player.id || team.createTeamScore) {
                  reward -= complexTax;
                }
                if (team.createTeamScore) {
                  team.teamScore += complexTax / 1.5;
                  var public_teams = [];
                  public_teams = teamlist.map((team) => {
                    if (!team.hidden) {
                      team.taxInterval = null;
                      return team;
                    }
                  });
                  emit("pubteamlist", public_teams);
                } else if (team.owner.id !== player.id) {
                  emit("playerScore", {
                    bulletId: team.owner.id,
                    socrepluse: complexTax,
                  });
                  players[team.owner.id].score += complexTax;
                }
              }

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
                console.log(reward, "bullet");
              }

              var randID = Math.random() * index * Date.now();

              cors_taken = cors_taken.filter((cor) => {
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

              var valueOp = getRandomInt(1, 15);
              var type = "";
              if (item.goldenGears) {
                var _player = userbase.find((_player) => {
                  return comparePasswords(
                    _player.userid,
                    players[bullet.id].userId
                  );
                });
                if (_player) {
                  _player.goldenGears += 1;
                  createAnnocment(
                    _player.username +
                      " has collected a golden gear! Total: " +
                      _player.goldenGears,
                    bullet.id,
                    { delay: CONFIG.messageIntervals.long, color: "gold" }
                  );
                }
                valueOp = 16;
              }
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
                  case 16: // Adjusted to 9-10 for pentagon
                    type = "pentagon";
                    color = "#C2A248";
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
                var goldenGears = item.goldenGears ? item.goldenGears : null;
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
                  lastDamaged: null,
                  lastDamgers: [],
                  goldenGears: goldenGears,
                };
              }
              if (item["respawn-raidis"]) {
                var goldenGears = item.goldenGears ? item.goldenGears : null;
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
                  lastDamaged: null,
                  lastDamgers: [],
                  goldenGears: goldenGears,
                };
              }
              let recoilY, recoilX;
              if (bullet.type !== "expoled") {
                recoilX =
                  ((bullet.size / item.weight) *
                    bullet.speed *
                    Math.cos(bullet.angle)) /
                  4;
                recoilY =
                  ((bullet.size / item.weight) *
                    bullet.speed *
                    Math.sin(bullet.angle)) /
                  4;
              }
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
                reassignRoomItem(fooditem__XX);
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
                1 - (bullet.distanceTraveled / bullet.bullet_distance) * 2.5 <
                0.001
                  ? 0.001
                  : 1 -
                    (bullet.distanceTraveled / bullet.bullet_distance) * 2.5;
            }
          }
        }
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
          continue;
        }
        if (item.isdead) {
          if (Date.now() >= item.deathtime + CONFIG.deathTime) {
            console.log("deado");
            room.items.splice(i, 1);
            continue;
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
          continue;
        }
      }
      for (let i = 0; i < room.bullets.length; i++) {
        let bullet = room.bullets[i];
        let WanderControlled = false;
        if (
          !(
            bullet.x >= room.bounds?.x1 &&
            bullet.x <= room.bounds?.x2 &&
            bullet.y >= room.bounds?.y1 &&
            bullet.y <= room.bounds?.y2
          )
        ) {
          reassignRoomBullet(bullet);
          room.bullets.splice(i, 1);
          bullets.push(bullet);
          continue;
        }
        if (bullet.type === "directer") {
          try {
            if (!players[bullet.id]?.autoFiring && players[bullet.id]) {
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
            } else if (players[bullet.id]?.autoFiring) {
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
                    fire_at_ = player;
                  }
                }
              }
              if (maxdistance > CONFIG.playerItemSightRange) {
                getRoomAndBounding(bullet.x, bullet.y).items.forEach(
                  (item_) => {
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
                      fire_at_ = item_;
                    }
                  }
                );
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
            console.log("7045", e);
            if (players[bullet.id]) {
              emit("dronekilled", { droneID: bullet.id });
            }
            room.bullets.splice(i, 1);
            continue;
          }
        }
        let collied = false;
        if (bullet.type === "FreeNecromancer" || bullet.type === "FreeSwarm") {
          // choose a player to attak
          if (frame % 3 === 0) {
            var maxdistance = 600;
            var maxfov = 2400;
            var target = { x: bullet.x, y: bullet.y, distance: undefined };
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
            if (foundTarget && target?.distance < maxdistance) {
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
          } else if (bullet.target?.distance < 600 && bullet.boss) {
            var boss = bullet.boss;
            bullet.wander.setBaseXY(boss.x, boss.y);
            var newX = bullet.x + bullet.speed * Math.cos(bullet.angle);
            var newY = bullet.y + bullet.speed * Math.sin(bullet.angle);
            bullet.wander.setXY(newX, newY);
          } else if (
            bullet.target &&
            bullet.target?.distance > 600 &&
            bullet.target?.distance < 2400 && bullet.boss
          ) {
            var boss = bullet.boss;
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
          bullet.type === "trap" ||
          bullet.type === "roadMap" ||
          bullet.type === "directer" ||
          (bullet.type !== "FreeNecromancer" &&
            bullet.type !== "sheild" &&
            bullet.type !== "FreeSwarm" &&
            bullet.type !== "sheller")
        ) {
          if (
            bullet.bullet_distance - bullet.distanceTraveled <
              200 / (bullet.speed / 2) &&
            (bullet.type === "roadMap" || bullet.type === "trap")
          ) {
            bullet.speed -=
              (bullet.bullet_distance - bullet.distanceTraveled) /
              (85 / (bullet.speed * 2));
            if (bullet.speed <= 0) bullet.speed = 0;
          }

          for (let i = 0; i < room.bullets.length; i++) {
            var bullet_ = room.bullets[i];

            if (
              bullet.id !== bullet_.id &&
              !WanderControlled &&
              !(
                players[bullet?.id]?.team === players[bullet_?.id]?.team &&
                players[bullet?.id]?.team !== null &&
                players[bullet_?.id]?.team !== null
              ) &&
              Math.abs(bullet.x - bullet_.x) <
                bullet.size * 1.5 + bullet_.size * 1.5 &&
              Math.abs(bullet.y - bullet_.y) <
                bullet.size * 1.5 + bullet_.size * 1.5 &&
              !(
                (bullet.speed !== 0 &&
                  bullet.speed !== 0 &&
                  (!bullet_.speed || !bullet.speed) &&
                  bullet.type === "trap") ||
                bullet.type === "roadMap"
              )
            ) {
              const dx = bullet.x - bullet_.x;
              const dy = bullet.y - bullet_.y;

              const mag = Math.sqrt(dx * dx + dy * dy);
              const nx = dx / mag;
              const ny = dy / mag;

              const vx = Math.cos(bullet.angle);
              const vy = Math.sin(bullet.angle);

              const dot = vx * nx + vy * ny;

              const rx = vx - 2 * dot * nx;
              const ry = vy - 2 * dot * ny;

              bullet.angle = Math.atan2(ry, rx);
              const dx2 = bullet_.x - bullet.x;
              const dy2 = bullet_.y - bullet.y;

              const mag2 = Math.sqrt(dx * dx + dy * dy);
              const nx2 = dx2 / mag2;
              const ny2 = dy2 / mag2;

              const vx2 = Math.cos(bullet_.angle);
              const vy2 = Math.sin(bullet_.angle);

              const dot2 = vx2 * nx2 + vy2 * ny2;

              const rx2 = vx - 2 * dot2 * nx;
              const ry2 = vy - 2 * dot2 * ny;

              bullet_.angle = Math.atan2(ry2, rx2);
              bullet.speed -=
                (bullet_.bullet_pentration * bullet_.size + bullet_.speed) /
                1000;
              bullet.distanceTraveled +=
                (bullet_.bullet_pentration * bullet_.size + bullet_.speed) /
                500;
              bullet_.speed -=
                (bullet_.bullet_pentration * bullet.size + bullet.speed) / 1000;
              bullet_.distanceTraveled +=
                (bullet.bullet_pentration * bullet.size + bullet.speed) / 500;
            }
            if (
              bullet.id === bullet_.id &&
              bullet.uniqueid !== bullet_.uniqueid &&
              players[bullet.id] &&
              players[bullet_.id] &&
              bullet.type === "trap" &&
              bullet_.type === "trap" &&
              Math.abs(bullet.x - bullet_.x) <
                bullet.size * 2 + bullet_.size * 2 &&
              Math.abs(bullet.y - bullet_.y) <
                bullet.size * 2 + bullet_.size * 2
            ) {
              if (bullet.speed > 2) {
                const dx = bullet.x - bullet_.x;
                const dy = bullet.y - bullet_.y;

                const mag = Math.sqrt(dx * dx + dy * dy);
                const nx = dx / mag;
                const ny = dy / mag;

                const rx =
                  Math.cos(bullet.angle) -
                  2 * Math.cos(bullet.angle) * nx +
                  Math.sin(bullet.angle) * ny * nx;
                const ry =
                  Math.sin(bullet.angle) -
                  2 * Math.cos(bullet.angle) * nx +
                  Math.sin(bullet.angle) * ny * ny;

                bullet.angle = Math.atan2(ry, rx);
              } else {
                var repluseAngle = Math.atan2(
                  bullet.y - bullet_.y,
                  bullet.x - bullet_.x
                );
                collied = true;
                newX__ = (bullet_.size / 25) * Math.cos(repluseAngle);
                newY__ = (bullet_.size / 25) * Math.sin(repluseAngle);
              }
            }
            if (
              bullet.id === bullet_.id &&
              bullet.uniqueid !== bullet_.uniqueid &&
              (bullet.type === "FreeNecromancer" ||
                bullet.type === "FreeSwarm" ||
                bullet.type === "directer") &&
              Math.abs(bullet.x - bullet_.x) <
                bullet.size * 2 + bullet_.size * 2 &&
              Math.abs(bullet.y - bullet_.y) <
                bullet.size * 2 + bullet_.size * 2
            ) {
              var repluseAngle = Math.atan2(
                bullet.y - bullet_.y,
                bullet.x - bullet_.x
              );
              collied = true;
              newX__ = (bullet_.size / 100) * Math.cos(repluseAngle);
              newY__ = (bullet_.size / 100) * Math.sin(repluseAngle);
            }
          }
        } else if (bullet.type !== "sheild") {
          for (let i = 0; i < bullets.length; i++) {
            var bullet_ = bullets[i];
            if (WanderControlled) return;

            if (
              bullet.id !== bullet_.id &&
              !players[bullet.id]?.team === players[bullet_.id]?.team &&
              players[bullet.id]?.team !== null &&
              players[bullet_.id]?.team !== null &&
              Math.abs(bullet.x - bullet_.x) <
                bullet.size * 2 + bullet_.size * 2 &&
              Math.abs(bullet.y - bullet_.y) <
                bullet.size * 2 + bullet_.size * 2
            ) {
              bullet.bullet_distance -=
                bullet_.speed *
                (bullet_.size / 5 +
                  Math.cos(Math.abs(bullet.angle - bullet_.angle)));
            }
          }
        }
        if (
          -(bullet.distanceTraveled - bullet.bullet_distance) <
            25 * bullet.speed ** 2 &&
          bullet.type !== "sheild" &&
          bullet.type !== "trap" &&
          bullet.type !== "roadMap"
        ) {
          bullet.transparency =
            1 - (bullet.distanceTraveled / (bullet.bullet_distance + 5)) ** 3 <
            0.001
              ? 0.001
              : 1 -
                (bullet.distanceTraveled / (bullet.bullet_distance + 5)) ** 3;
        } else if (bullet.type === "trap" || bullet.type === "roadMap") {
          if (bullet.fireDate + bullet.lifeSpan * 1000 - Date.now() < 1000) {
            bullet.transparency =
              (bullet.fireDate + bullet.lifeSpan * 1000 - Date.now()) / 500;
          }
        }

        for (const playerId in players) {
          var player = players[playerId];
          let player40 = player.size * CONFIG.playerBaseSize;
          if (bullet.type !== "sheild") {
            var sameTeam =
              players[bullet.id]?.team === players[playerId]?.team &&
              players[bullet.id]?.team !== null &&
              players[playerId]?.team !== null;
          } else {
            var sameTeam = bullet.teamID == players[playerId]?.team;
          }
          if (player.state !== "start") {
            let con = false;
            if (bullet.boundtype === "square") {
              const rawvertices = calculateSquareVertices(
                bullet.x,
                bullet.y,
                bullet.size,
                bullet.angle
              );
              if (
                Math.abs(player.x - bullet.x) <
                  2 * player40 + 2 * bullet.size &&
                Math.abs(player.y - bullet.y) <
                  2 * player40 + 2 * bullet.size &&
                bullet.id !== player.id
              ) {
                var collisionCheck = isPlayerCollidingWithPolygon(
                  player,
                  rawvertices
                );
                con = collisionCheck[0];
              }
            } else if (bullet.boundtype === "triangle") {
              const rawvertices = calculateTriangleVertices(
                bullet.x,
                bullet.y,
                bullet.size,
                bullet.angle
              );
              if (
                Math.abs(player.x - bullet.x) <
                  2 * player40 + 2 * bullet.size &&
                Math.abs(player.y - bullet.y) <
                  2 * player40 + 2 * bullet.size &&
                bullet.id !== player.id
              ) {
                var collisionCheck = isPlayerCollidingWithPolygon(
                  player,
                  rawvertices
                );
                con = collisionCheck[0];
              }
            } else {
              con =
                Math.abs(player.x - bullet.x) <
                  2 * player40 + 2 * bullet.size &&
                Math.abs(player.y - bullet.y) <
                  2 * player40 + 2 * bullet.size &&
                bullet.id !== player.id;
            }
            if (con) {
              if (!sameTeam) {
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
                    ((player.size + 22) / bullet.speed);
                  bullet.bullet_distance -=
                    bullet.size / (bullet.bullet_pentration + 10);
                }
                emit("bulletDamage", {
                  playerID: player.id,
                  playerHealth: player.health,
                });
                if (player.health <= 0) {
                  try {
                    var reward = Math.round(
                      player.score / (20 + players[bullet.id].score / 10000)
                    );
                    if (player.team !== null) {
                      var team = teamlist.find(
                        (team) => team.teamID === player.team
                      );
                      if (team.owner.id !== player.id || team.createTeamScore) {
                        reward -= reward * team.simpleTax;
                      }
                      if (team.createTeamScore) {
                        team.teamScore += (reward * team.simpleTax) / 2;
                        var public_teams = [];
                        public_teams = teamlist.map((team) => {
                          if (!team.hidden) {
                            team.taxInterval = null;
                            return team;
                          }
                        });
                        emit("pubteamlist", public_teams);
                      } else {
                        emit("playerScore", {
                          bulletId: team.owner.id,
                          socrepluse: reward * team.simpleTax,
                        });
                      }
                      var complexTax =
                        reward * ((player.score / 100000) * playerTax);
                      if (team.owner.id !== player.id || team.createTeamScore) {
                        reward -= complexTax;
                      }
                      if (team.createTeamScore) {
                        team.teamScore += complexTax / 1.5;
                        var public_teams = [];
                        public_teams = teamlist.map((team) => {
                          if (!team.hidden) {
                            team.taxInterval = null;
                            return team;
                          }
                        });
                        emit("pubteamlist", public_teams);
                      } else {
                        emit("playerScore", {
                          bulletId: team.owner.id,
                          socrepluse: complexTax,
                        });
                      }
                    }
                  } catch (e) {
                    console.log("7452", bullet.id);
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
                      bullet.id,
                      {
                        color: "black",
                        trans: 0.3,
                        delay: CONFIG.messageIntervals.medium,
                      }
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
                  killplayer(player.id);
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
                    console.log("7496", e);
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
                    var knockBackX =
                      bullet.exspandRate * Math.cos(realPushBackAngle);
                    var knockBackY =
                      bullet.exspandRate * Math.sin(realPushBackAngle);
                  }
                  emit("bouceBack", {
                    response: { x: knockBackX, y: knockBackY },
                    playerID: player.id,
                  });
                }
              }
              if (bullet.type === "sheild" && sameTeam) {
                if (player.health < player.maxhealth)
                  player.health -= bullet.bullet_damage;
                emit("bulletHeal", {
                  playerID: player.id,
                  playerHealth: player.health,
                });
              }
            }
          }
        }
        if (bullet.type === "expoled") {
          bullet.size += bullet.exspandRate;
          if (Date.now() > bullet.endTime) {
            room.bullets.splice(i, 1);
            continue;
          }
        }
        if (bullet.distanceTraveled <= bullet.bullet_distance) {
          bullet.x = newX;
          bullet.y = newY;
          if (bullet.type === "roadMap") {
            let road = bullet.road;
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

          bullets.push(bullet);
          continue;
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
        } else if (bullet.type === "sheller") {
          createExsplosion(Math.random() * 100000, bullet.x, bullet.y, {
            createbullet: true,
            dealsDamgage: true,
            id: bullet.id,
          });
        }

        bullet_intervals.forEach((__bullet_) => {
          if (bullet.uniqueid === __bullet_.id) {
            __bullet_.canfire = false;
          }
        });
        room.bullets.splice(i, 1);
        continue;
      }
    }

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
            { x: triroad[0].road.x, y: triroad[0].road.y },
            { x: triroad[1].road.x, y: triroad[1].road.y },
            { x: triroad[2].road.x, y: triroad[2].road.y }
          )
        ) {
          player.speedBoost = triroad[0].road.multiplyer;
        } else {
          player.speedBoost = 1;
        }
        //console.log(triroad[0].road.id === playerID,)
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
    bullets = [];
    deadlist = [];
  }, CONFIG.updateInterval);
}

let fails = 0;

(function game() {
  try {
    gameLoop();
  } catch (e) {
    fails++;
    if (fails < 5) {
      console.log("Game loop error:", e);
      console.log("tick: ", frame);
      console.log("Restarting game loop...");
      game();
      createAnnocment("Error encountered, restarting game loop...", null, {
        color: "red",
        delay: 45000,
      });
      messageEmit("announcements", announcements);
    } else {
      Object.keys(players).forEach((playerId) => {
        createAnnocment(
          "Fatal error encountered, server is restarting; Please report this on github",
          playerId,
          { color: "red", delay: 6000 }
        );
      });
      messageEmit("announcements", announcements);
      setTimeout(() => {
        connections.forEach((connection) => {
          connection.socket.close(999);
        });
      }, 5000);
    }
  }
})();

const root = protobuf.parse(schema).root;
const GameObjectList = root.lookupType("GameObjectList");

function createAndSendGameObjects(playerArray) {
  const gameObjectList = { objects: playerArray };

  const messageBuffer = GameObjectList.encode(gameObjectList).finish();

  smartemitBinary(messageBuffer);
}

function createBoss(type_) {
  var boss = {};
  var fooditem = {};
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
        reload: 500,
        lastDamaged: null,
        lastDamgers: [],
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
      fooditem.boss = boss;

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
        reload: 350,
        lastDamaged: null,
        lastDamgers: [],
      };
      var cannonID = Math.random() * 3 * Date.now();
      boss = {
        id: randID2,
        score: 0,
        x: x2,
        y: y2,
        cannons: [{ cannonW: 0, canfire: true, id: cannonID }],
      };
      fooditem.boss = boss;

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
  reassignRoomItem(fooditem);
}

createBoss("Guardian");

setInterval(() => {
  generateRandomNumber(0, 1) === 1
    ? createBoss("Guardian")
    : createBoss("Necromancer");
}, 1000 * 60 * 10);

function smartemitBinary(data) {
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
    if (players[conn.playerId].team === teamId) {
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
