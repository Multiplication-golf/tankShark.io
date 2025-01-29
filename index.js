"use strict";

const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const SAT = require("sat");
const { setTimeout } = require("timers");
const WebSocket = require("ws");
const crypto = require("crypto");
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const fs = require("fs");
const helmet = require("helmet");
const protobuf = require("protobufjs");

// Define the Protobuf schema
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
}

message GameObjectList {
  repeated GameObject objects = 1;
}
`; 

async function runProtobufExample() {
    // Parse the schema and get the GameObject type
    const root = await protobuf.parse(schema).root;
    const GameObject = root.lookupType("GameObject");

    // Example GameObject data
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
        transparency: 0.8
    };

    // Encode the data into Protobuf (binary format)
    const buffer = GameObject.encode(gameObject).finish();
}

runProtobufExample();

app.use(helmet.noSniff());

app.use(helmet.hsts({
  maxAge: 31536000, // 1 year in seconds
  includeSubDomains: true, // Apply to all subdomains
  preload: true // Allow preloading in browsers
}));

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],  // Only allow content from the same origin
    scriptSrc: ["'self'","https://cdn.jsdelivr.net/npm/protobufjs@7.4.0/dist/light/protobuf.min.js", "'unsafe-eval'"], // Allow scripts from self and a trusted CDN
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com","https://fonts.gstatic.com"], // Allow inline styles (use cautiously)
    imgSrc: ["'self'", "https://images.com"], // Allow images from self and a trusted source
    connectSrc: ["'self'"], // Restrict fetch/XHR/WebSockets
    frameAncestors: ["'none'"], // Prevent embedding via <iframe>
    objectSrc: ["'none'"], // Prevent <object>, <embed>, <applet>
    upgradeInsecureRequests: [], // Upgrade HTTP requests to HTTPS
    'unsafe-eval': ["https://cdnjs.cloudflare.com/ajax/libs/protobufjs/7.2.5/protobuf.min.js"]
  }
}));

app.use(express.static(path.join(__dirname, "public")));
var port = process.env.PORT;
let players = {};
let bullets = [];
let food_squares = [];
let cors_taken = [];
let leader_board = { shown: [], hidden: [] };
let autocannons = [];
let bullet_intervals = [];
let hidden_broswers = [];
let messages = [];
let teamlist = [];
let playersjoined = [];
let userbase = [];
let food_squares_ = [];
let player_array = [];
/* warning very senstive*/
let purge_limit = 5;
let ColorUpgrades = [
  "#f54242",
  "#fa8050",
  "#fab350",
  "#fcf25b",
  "#57f75c",
  "#42fcf6",
  "#5181fc",
  "#5c14f7",
];

const levels = {
  0: 15,
  1: 28,
  2: 44,
  3: 67,
  4: 99,
  5: 143,
  6: 202,
  7: 279,
  8: 377,
  9: 500,
  10: 649,
  11: 829,
  12: 1042,
  13: 1290,
  14: 1578,
  15: 1908,
  16: 2283,
  17: 2706,
  18: 3179,
  19: 3707,
  20: 4292,
  21: 4937,
  22: 5645,
  23: 6419,
  24: 7262,
  25: 8177,
  26: 9167,
  27: 10235,
  28: 11384,
  29: 12617,
  30: 13937,
  31: 15348,
  32: 16851,
  33: 18451,
  34: 20149,
  35: 21950,
  36: 23855,
  37: 25869,
  38: 27993,
  39: 30231,
  40: 32586,
  41: 35061,
  42: 37659,
  43: 40383,
  44: 43236,
  45: 46221,
  46: 49341,
  47: 52599,
  48: 55998,
  49: 59541,
  50: 63231,
  51: 67071,
  52: 71064,
  53: 75213,
  54: 79522,
  55: 83992,
  56: 88628,
  57: 93431,
  58: 98406,
  59: 103554,
  60: 108880,
  61: 114385,
  62: 120074,
  63: 125948,
  64: 132012,
  65: 138267,
  66: 144718,
  67: 151366,
  68: 158216,
  69: 165269,
  70: 172530,
  71: 180000,
  72: 187684,
  73: 195583,
  74: 203702,
  75: 212042,
  76: 220608,
  77: 229401,
  78: 238426,
  79: 247684,
  80: 257180,
  81: 266915,
  82: 276894,
  83: 287118,
  84: 297592,
  85: 308317,
  86: 319298,
  87: 330536,
  88: 342036,
  89: 353799,
  90: 365830,
  91: 378130,
  92: 390704,
  93: 403553,
  94: 416682,
  95: 430092,
  96: 443788,
  97: 457771,
  98: 472046,
  99: 486614,
  100: 501480,
};

var pi = Math.PI;
var pi180 = pi / 180;
var sqrt23 = Math.sqrt(3) / 2;
var piby2 = -pi / 2;
var response = new SAT.Response();

fs.readFile("users.json", function (err, data) {
  if (err) throw err;
  data = JSON.parse(data);
  userbase = data.userbase;
  console.log(userbase);
});

const tankmeta = {
  basic: {
    "size-m": 1,
    "speed-m": 1,
    "damage-m": 1,
    "health-m": 1,
    "regen-m": 1,
    fov: 1,
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
        bulletSpeed: 0.5,
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
    fov: 1,
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
    fov: 1,
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
    fov: 1,
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
    fov: 1,
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
    fov: 1,
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
    fov: 1,
    "BodyDamage-m": 1,
    "reaload-m": 0.7,
    "regen-m": 1,
    upgradeLevel: 30,
    upgrades: ["twin", "sniper"],
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
    fov: 1,
    "health-m": 0.95,
    "BodyDamage-m": 1,
    "regen-m": 1.1,
    "max-traps": 10,
    "reaload-m": 1.5,
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
    fov: 1, // change later when fov is working
    "BodyDamage-m": 1,
    "reaload-m": 1.5,
    upgradeLevel: 15,
    upgrades: {
      twin: 1,
    },
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
    fov: 1,
    "BodyDamage-m": 1,
    "reaload-m": 1,
    upgradeLevel: 30,
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
    fov: 1,
    AutoRoting: true,
    "BodyDamage-m": 1,
    "reaload-m": 1,
    upgradeLevel: 30,
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
    fov: 1,
    "BodyDamage-m": 1,
    "reaload-m": 1,
    upgradeLevel: 30,
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
    fov: 1,
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
    fov: 1,
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
};

var levelmultiplyer = 1.2;

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
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

function calculateTriangleVertices(cx, cy, size, angle) {
  const height = sqrt23 * size;
  const halfSize = size / 2;

  // Convert the angle to radians
  const angleRad = angle * pi180;

  // Precalculate cos and sin of the angle to avoid repeating it
  const cosAngle = Math.cos(angleRad);
  const sinAngle = Math.sin(angleRad);

  let vertices = [
    { x: -halfSize, y: -height / 3 },
    { x: halfSize, y: -height / 3 },
    { x: 0, y: (2 * height) / 3 },
  ];

  for (let i = 0; i < vertices.length; i++) {
    const vertex = vertices[i];

    const rotatedX = vertex.x * cosAngle - vertex.y * sinAngle;
    const rotatedY = vertex.x * sinAngle + vertex.y * cosAngle;

    vertices[i] = { x: rotatedX + cx, y: rotatedY + cy };
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
    circle.size * 40
  );
  const polygonSAT = toSATPolygon(polygonVertices);
  var collided = SAT.testCirclePolygon(circleSAT, polygonSAT, response);
  return [collided, response];
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
} //

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
      between(player_.x, _x - (player_.size + 50), _x + (player_.size + 50)) &&
      between(player_.y, _y - (player_.size + 50), _y + (player_.size + 50))
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

//const Utils_ = new Utils();

for (let i = 0; i < getRandomInt(400, 500); i++) {
  var randID = Math.random() * i * Date.now();
  let x = getRandomInt(-5000, 5000);
  let y = getRandomInt(-5000, 5000);
  for (let j = 0; j < cors_taken.length; j++) {
    if (
      between(x, cors_taken[j].x - 50, cors_taken[j].x + 50) &&
      between(y, cors_taken[j].y - 50, cors_taken[j].y + 50)
    ) {
      x = getRandomInt(-5000, 5000);
      y = getRandomInt(-5000, 5000);
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

  food_squares.push(fooditem);
}

food_squares.forEach((shape, index) => {
  if (
    isNaN(shape.x) ||
    isNaN(shape.y) ||
    shape.size <= 0 ||
    !shape.vertices ||
    shape.vertices.some((v) => isNaN(v.x) || isNaN(v.y))
  ) {
    console.error("Malformed shape detected:", index, shape);
  }
});

for (let i = 0; i < getRandomInt(50, 75); i++) {
  let x = getRandomInt(-1000, 1000);
  let y = getRandomInt(-1000, 1000);
  var randID = Math.random() * i * Date.now();
  for (let j = 0; j < cors_taken.length; j++) {
    if (
      between(x, cors_taken[j].x - 50, cors_taken[j].x + 50) &&
      between(y, cors_taken[j].y - 50, cors_taken[j].y + 50)
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

  food_squares.push(fooditem);
}

var angle = 0;

const algorithm = "aes-256-cbc";
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

var serverseed = crypto.randomUUID();

var invaled_requests = [];

const UPDATE_INTERVAL = 75;
let speed = 0.00001;
const connections = [];

// Initialize a logging counter
let logCounter = 0;
const LOG_LIMIT = 1300; // Maximum number of logs

console.log("userbase", userbase);

wss.on("connection", (socket) => {
  let connection = { socket: socket, playerId: null };
  let handshaked = false;
  connections.push(connection);

  let stateupdate = null;
  socket.on("message", (message) => {
    const { type, data } = JSON.parse(message);

    if (type === "newPlayer") {
      players[data.id] = data;
      connection.playerId = data.id; // bind call
      connections.forEach((con) => {
        if (con.socket === connection.socket) {
          con.playerId = data.id;
        }
      });
      var badge;
      console.log(players);
      emit("playerJoined", data); // Emit playerJoined event to notify all clients
      emit("FoodUpdate", food_squares); // Emit FoodUpdate event to update food squares
      emit("autoCannonUPDATE-ADD", autocannons);
      emit("colorUpgrades", ColorUpgrades);
      emit("Levels", levels);
      emit("NewMessages", messages);
      var public_teams = [];
      teamlist.forEach((team) => {
        if (!team.private) {
          public_teams.push(team);
        }
      });
      emit("pubteamlist", public_teams);
      let x, y;
      do {
        x = getRandomInt(-4500, 4500);
        y = getRandomInt(-4500, 4500);
      } while (
        cors_taken.some(
          (c) =>
            between(x, c.x - 50, c.x + 50) && between(y, c.y - 50, c.y + 50)
        ) ||
        !confirmplayerradia(x, y)
      );
      if (data.userId) {
        console.log(userbase, data.userId);
        var _player = userbase.find((_player) => {
          console.log("a", _player.userid, data.userId);
          return Math.abs(_player.userid - data.userId) < 0.001;
        });
        console.log(_player);
        if (_player !== undefined) {
          console.log("_player", _player);
          let score__$ = _player.scores.reduce((a, b) => {
            console.log("a,b:", a, b);
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
          socket.send(
            JSON.stringify({ type: "newid", data: { newid: newid } })
          );
          players[data.id].userId = newid;
          userbase.push({ userid: newid, scores: [] });
          badge = "/badges/1.png";
          console.log("userbase 1199", userbase);
        }
      } else {
        var newid =
          Math.floor(Math.random() * 7779) +
          Date.now() * Math.random() +
          Date.now() / 213984238 +
          Math.random();
        console.log(1207);
        socket.send(JSON.stringify({ type: "newid", data: { newid: newid } }));
        console.log(typeof userbase, console.log(userbase));
        userbase.push({ userid: newid, scores: [] });
        badge = "/badges/1.png";
        players[data.id].userId = newid;
      }
      console.log("userbase", userbase);
      socket.send(
        JSON.stringify({ type: "badgeToplayer", data: { badge: badge } })
      );
      emit("new_X_Y", { x: x, y: y, id: data.id });
      players[data.id].x = x;
      players[data.id].y = y;
      leader_board.hidden.push({
        id: data.id,
        score: 0,
        name: data.username,
        badge: badge,
      });
      if (!leader_board.shown[10]) {
        leader_board.shown.push({
          id: data.id,
          score: 0,
          name: data.username,
          badge: badge,
        });
      }
      if (leader_board.shown[10]) {
        if (0 > leader_board.shown[10].score) {
          leader_board.shown.push({
            id: data.id,
            score: 0,
            name: data.username,
            badge: badge,
          });
        }
        if (0 > leader_board.shown[10].score) {
          leader_board.shown[10] = {
            id: data.id,
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
          players[data.id].state = data.state;
          let _data = {
            state: state,
            playerID: data.id,
          };
          emit("statechangeUpdate", _data, socket);
        } catch {
          start = null;
        }
      }, 50);
      stateupdate = setInterval(() => {
        statecycle += 1;
        let _data__ = {
          state: state,
          statecycle: statecycle,
          playerID: data.id,
        };
        emit("statecycleUpdate", _data__);
      }, 50);

      setTimeout(() => {
        start = null;
        state = "normal";
        let _data = { state: state, statecycle: statecycle, playerID: data.id };
        players[data.id].state = data.state;
        emit("statechangeUpdate", _data, socket);
        setTimeout(() => {
          players[data.id].state = _data.state;
          emit("statechangeUpdate", _data, socket);
        }, 300);
      }, 6000);

      return;
    }

    if (type === "HANDSHAKE") {
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
      return;
    }

    if (type === "updatePlayer") {
      emit("playerUpdated", data); // Emit playerUpdated event if needed
      return;
    }

    if (type === "newTeamCreated") {
      data.teamID =
        Math.floor(Math.random() * 54968) +
        Date.now() * Math.random() +
        Date.now() / 489587 +
        Math.random();
      data.players = [
        { id: data.owner.id, username: players[data.owner.id].username },
      ];
      teamlist.push(data);
      players[data.owner.id].team = data.teamID;
      emit("playerJoinedTeam", { id: data.owner.id, teamId: data.teamID });
      var public_teams = [];
      teamlist.forEach((team) => {
        if (!team.private) {
          public_teams.push(team);
        }
      });
      emit("pubteamlist", public_teams);
      return;
    }

    if (type === "playerJoinedTeam") {
      players[data.id].team = data.teamId;
      let MYteam = teamlist.find((team) => {
        return team.teamID === data.teamId;
      });
      MYteam.players.push({ username: players[data.id].username, id: data.id });
      emit("playerJoinedTeam", { id: data.id, teamId: data.teamId });
      var public_teams = [];
      teamlist.forEach((team) => {
        if (!team.private) {
          public_teams.push(team);
        }
      });
      emit("pubteamlist", public_teams);
      return;
    }

    if (type === "playerLeftTeam") {
      let MYteam = teamlist.find((team) => {
        return team.teamID === players[data.id].team;
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
        } else {
          teamplayers.forEach((player) => {
            emit("playerJoinedTeam", { id: player.id, teamId: null });
          });
          teamlist.splice(teamlist.indexOf(MYteam, 1));
        }
      }
      emit("playerJoinedTeam", { id: data.id, teamId: null });
      let public_teams = [];
      teamlist.forEach((team) => {
        if (!team.private) {
          public_teams.push(team);
        }
      });
      emit("pubteamlist", public_teams);
      return;
    }

    if (type === "deleteTeam") {
      let MYteam = teamlist.find((team) => {
        return team.teamID === data.teamID;
      });
      if (
        players[data.playerId].team !== data.teamID ||
        players[data.playerId].team !== MYteam.teamID ||
        data.playerId !== MYteam.owner.id
      ) {
        socket.close();
      }
      MYteam.players.forEach((player) => {
        emit("playerJoinedTeam", { id: player.id, teamId: null });
      });
      teamlist.splice(teamlist.indexOf(MYteam, 1));
      let public_teams = [];
      teamlist.forEach((team) => {
        if (!team.private) {
          public_teams.push(team);
        }
      });
      emit("pubteamlist", public_teams);
      return;
    }

    if (type === "kickplayer") {
      let MYteam = teamlist.find((team) => {
        return team.teamID === players[data.id].team;
      });
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
      teamlist.forEach((team) => {
        if (!team.private) {
          public_teams.push(team);
        }
      });
      emit("pubteamlist", public_teams);
    }

    if (type === "browserHidden") {
      var autoAngle = data.autoAngle;
      var turnhide = setInterval(() => {
        autoAngle += 0.2 / 10;
        if (359.8 <= autoAngle) {
          autoAngle = 0;
        }
        let radians = (Math.PI / 180) * autoAngle;
        var MouseX_ =
          50 * Math.cos(radians) +
          (data.canvaswidth / 2 - data.playerSize * data.FOV);
        var MouseY_ =
          50 * Math.sin(radians) +
          (data.canvasheight / 2 - data.playerSize * data.FOV);
        let angle = Math.atan2(
          MouseY_ - (data.canvasheight / 2 - data.playerSize * data.FOV),
          MouseX_ - (data.canvaswidth / 2 - data.playerSize * data.FOV)
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
          cannon_angle: autoAngle,
          MouseX: MouseX_,
          MouseY: MouseY_,
        };
        smartbroadcast("playerCannonUpdated", data_, socket);

        emit("playerCannonUpdatedInactive", {
          MouseX_: MouseX_,
          MouseY_: MouseY_,
        });
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
                  offSet_x = players[cannon.playerid].size * 40;
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
      return;
    }

    if (type === "playerSend") {
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

    if (type === "browserunHidden") {
      hidden_broswers.filter((interval) => {
        if (data.id === interval.id) {
          clearInterval(interval.interval);
          return false;
        }
        return true;
      });

      return;
    }

    if (type === "windowStateChange") {
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
      return;
    }

    if (type === "autoCannonADD") {
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
      return;
    }

    if (type === "getFood") {
      emit("FoodUpdate", food_squares);
      return;
    }

    if (type === "typeChange") {
      if (!players[data.id]) {
        invaled_requests.push(data.id);
        return;
      }
      players[data.id] = data;
      emit("type_Change", data);
      return;
    }

    if (type === "playerCannonWidth") {
      if (!players[data.id]) {
        invaled_requests.push(data.id);
        return;
      }
      players[data.id].cannonW = data.cannonW;
      broadcast(
        "playerCannonWidthUpdate",
        { id: data.id, cannonW: data.cannonW },
        socket
      );
      return;
    }

    if (type === "statUpgrade") {
      if (!players[data.id]) return;
      var upgradetype = data.Upgradetype;

      players[data.id].statsTree[data.Upgradetype] += data.UpgradeLevel;

      if (upgradetype === "health") {
        players[data.id].health =
          (players[data.id].health / 2) * levelmultiplyer;
        players[data.id].maxhealth =
          players[data.id].maxhealth * levelmultiplyer;
      } else if (upgradetype === "Regen") {
        let Regen = players[data.id].statsTree[data.Upgradetype];
        let Regenspeed = 30 - 30 * (Regen / 10);
        players[data.id].Regenspeed = Regenspeed;
        emit("healerRestart", { id: data.id, Regenspeed: Regenspeed });
      } else if (upgradetype === "Body Damage") {
        players[data.id].bodyDamage *= levelmultiplyer;
      } else if (upgradetype === "Speed") {
        players[data.id].speed *= levelmultiplyer;
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
          levelmultiplyer: levelmultiplyer,
          doUpgrade: false,
        });
      } else {
        emit("UpdateStatTree", {
          id: data.id,
          StatUpgradetype: upgradetype,
          levelmultiplyer: levelmultiplyer,
          doUpgrade: true,
        });
      }
      return;
    }

    if (type === "auto-x-update") {
      autocannons.forEach((cannon) => {
        if (cannon.CannonID === data.autoID) {
          if (cannon._type_ === "SwivelAutoCannon") {
            var tankdatacannondata =
              tankmeta[players[cannon.playerid].__type__].cannons[
                cannon.autoindex
              ];
            var offSet_x = tankdatacannondata["offSet-x"];
            if (tankdatacannondata["offSet-x"] === "playerX") {
              offSet_x = players[cannon.playerid].size * 40;
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
      return;
    }

    if (type === "playerMoved") {
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
      return;
    }

    if (type === "Autofire") {
      let maxdistance = 5000;
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
      if (maxdistance > 1300) {
        food_squares.forEach((item) => {
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
          players[data.playerId].statsTree["Bullet Speed"] * levelmultiplyer;
      }

      let bullet_speed__ = data.bullet_speed * cannon["bulletSpeed"];
      if (cannon["type"] === "basicCannon" || cannon["type"] === "trapezoid") {
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
        offSet_x = (players[data.playerId].size / 2) * 40;
      }

      if (cannon["type"] === "basicCannon" || cannon["type"] === "trap") {
        var xxx = cannon["cannon-width"] - bullet_size_l * 1.5;
        var yyy = cannon["cannon-height"] - bullet_size_l * 2;
        var angle_ = angle + cannon["offset-angle"];
      } else if (cannon["type"] === "trapezoid") {
        var angle_ = angle + cannon["offset-angle"] + randomNumber;
        var xxx = cannon["cannon-width-top"] - bullet_size_l * 1.5;
        var yyy =
          cannon["cannon-height"] -
          bullet_size_l * 2 -
          (cannon["cannon-width-top"] / 2) * Math.random();
      } else if (
        cannon["type"] === "autoCannon" ||
        cannon["type"] === "SwivelAutoCannon"
      ) {
        var xxx = cannon["cannon-width"] - bullet_size_l * 0.2;
        var yyy = cannon["cannon-height"] - bullet_size_l * 1.2;
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
            levelmultiplyer) /
          (data.bullet_damage ** 2 / (data.bullet_damage / 10));
      }
      let PentrationPluse = 0;
      if (players[data.playerId].statsTree["Bullet Pentration"] !== 1) {
        PentrationPluse =
          players[data.playerId].statsTree["Bullet Pentration"] *
          levelmultiplyer;
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

      bullets.push(bullet);
      var [_index_, CO] = finder_(data);
      return;
    }

    if (type === "playerCannonMoved") {
      if (!players[data.id]) {
        invaled_requests.push(data.id);
        return;
      }
      players[data.id].cannon_angle = data.cannon_angle;
      players[data.id].MouseX = data.MouseX;
      players[data.id].MouseY = data.MouseY;
      smartbroadcast("playerCannonUpdated", data, socket);
      return;
    }

    if (type === "statechange") {
      if (!players[data.playerID]) {
        invaled_requests.push(data.playerID);
        return;
      }
      players[data.playerID].state = data.state;
      broadcast("statechangeUpdate", data, socket);
      return;
    }

    if (type === "getTankMeta") {
      socket.send(JSON.stringify({ type: "RETURNtankmeta", data: tankmeta }));
      return;
    }

    if (type === "healrate") {
      if (!players[data.id]) {
        invaled_requests.push(data.id);
        return;
      }
      players[data.playerId].playerReheal = data.playerReheal;
      return;
    }

    if (type === "AddplayerHealTime") {
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
        emit("playerHealing", {
          playerID: data.ID,
          playerHealTime: data.playerHealTime,
        });

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
          emit("playerHeal", { HEALTH: players[data.ID].health, ID: data.ID });
        }, 50);
      }
      return;
    }

    if (type === "playerHealintterupted") {
      if (!players[data.ID]) {
        invaled_requests.push(data.id);
        return;
      }
      players[data.ID].playerHealTime = 0;
      emit("updaterHeal", { ID: data.ID, HEALTime: 0 });
      return;
    }

    if (type === "playerCollided") {
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
      return;
    }

    if (type === "playerUPDATE") {
      players[data.id] = data;
      return;
    }

    if (type === "deletAuto") {
      autocannons.filter((cannons___0_0) => {
        if (cannons___0_0.playerid === connection.playerId) {
          return false;
        }
        return true;
      });
      return;
    }

    if (type === "bulletFired") {
      if (!players[data.id]) return;
      if (!players[data.id].statsTree) return;

      let damageUP = 0;
      if (players[data.id].statsTree["Bullet Damage"] !== 1) {
        damageUP =
          (players[data.id].statsTree["Bullet Damage"] * levelmultiplyer) /
          (data.bullet_damage ** 2 / (data.bullet_damage / 5));
        data.bullet_damage += damageUP;
      }
      let PentrationPluse = 0;
      if (players[data.id].statsTree["Bullet Pentration"] !== 1) {
        PentrationPluse =
          players[data.id].statsTree["Bullet Pentration"] * levelmultiplyer;
        data.bullet_pentration += PentrationPluse;
      }
      let speedUP = 0;
      if (players[data.id].statsTree["Bullet Speed"] !== 1) {
        speedUP = players[data.id].statsTree["Bullet Speed"] * levelmultiplyer;
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
          getRandomInt(-10000, 10000) * Date.now() * getRandomInt(-1000, 1000);
        let auto_cannon = {
          CannonID: autoID,
          playerid: data.uniqueid,
          angle: 0.000000001,
          _type_: "bulletAuto",
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
        for (let i = 0; i < players[data.id].statsTree["Bullet Reload"]; ++i) {
          __reload__ *= levelmultiplyer;
        }
        function auto_bullet() {
          let maxdistance = 5000;
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
          if (maxdistance > 1300) {
            food_squares.forEach((item) => {
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
              players[bullet.id].statsTree["Bullet Speed"] * levelmultiplyer;
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
            offSet_x = (players[bullet.id].size / 2) * 40;
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
                levelmultiplyer) /
              (data.bullet_damage ** 2 / (data.bullet_damage / 10));
          }
          let PentrationPluse = 0;
          if (players[bullet.id].statsTree["Bullet Pentration"] !== 1) {
            PentrationPluse =
              players[bullet.id].statsTree["Bullet Pentration"] *
              levelmultiplyer;
          }

          let bullet____ = {
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
            xstart: data.x,
            ystart: data.y,
            id: bullet.id,
            uniqueid: identdfire,
            Zlevel: 3,
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
              __reload__ /= levelmultiplyer - 0.1;
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
            __reload__ /= levelmultiplyer - 0.1;
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
              players[bullet.id].statsTree["Bullet Speed"] * levelmultiplyer;
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
            offSet_x = (players[bullet.id].size / 2) * 40;
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
                levelmultiplyer) /
              (data.bullet_damage ** 2 / (data.bullet_damage / 10));
          }
          let PentrationPluse = 0;
          if (players[bullet.id].statsTree["Bullet Pentration"] !== 1) {
            PentrationPluse =
              players[bullet.id].statsTree["Bullet Pentration"] *
              levelmultiplyer;
          }

          let bullet____ = {
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
            xstart: data.x,
            ystart: data.y,
            id: bullet.id,
            uniqueid: identdfire,
            Zlevel: 3,
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
              __reload__ /= levelmultiplyer;
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
            __reload__ /= levelmultiplyer;
          }
          auto_bullet();
        }, 500 * tankmeta[players[data.id].__type__]["reaload-m"] * cannon["reloadM"] * __reload__ * 2);
        bullet_intervals.push({ canfire: true, id: bullet.uniqueid });
      }
      emit("bulletUpdate", bullets); // Broadcast to all clients
      return;
    }

    if (type === "resize") {
      if (!players[data.id]) return;
      players[data.id].screenWidth = data.screenWidth;
      players[data.id].screenHeight = data.screenHeight;
      return;
    }

    if (type === "MouseAway") {
      if (!players[data.id]) return;
      players[data.id].mousestate = "held";
    }

    if (type === "MousestateUpdate") {
      if (!players[data.id]) return;
      players[data.id].mousestate = "up";
    }

    if (type === "playerDied") {
      players = Object.entries(players).reduce((newPlayers, [key, value]) => {
        if (key !== data.id) {
          newPlayers[key] = value;
        }
        return newPlayers;
      }, {});
      teamlist = teamlist.filter((team) => {
        var teamplayers = team.players;
        teamplayers = teamplayers.filter((player) => {
          return player.id !== connection.playerId;
        });
        team.players = teamplayers;
        if (teamplayers.length === 0) {
          return false;
        }
        if (team.owner.id === connection.playerId) {
          if (teamplayers.length !== 0) {
            team.owner = teamplayers[0];
            emit("newOwner", {
              teamID: team.teamID,
              playerid: teamplayers[0].id,
            });
          } else {
            return false;
          }
        }
        return true;
      });
      var public_teams = [];
      teamlist.forEach((team) => {
        if (!team.private) {
          public_teams.push(team);
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
      emit("playerLeft", data.id);
      return;
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
    const index = connections.indexOf(socket);
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
      var _player = userbase.find((_player) => {
        return (
          Math.abs(_player.userid - players[connection.playerId].userId) < 0.001
        );
      });
      _player.scores.push({
        score: players[connection.playerId].score,
        Date: Date.now(),
      });
      _player.scores.sort(function (a, b) {
        return a.score - b.score;
      });
      _player.scores.reverse();
      _player.scores = _player.scores.slice(0, 10);
      fs.writeFile(
        "users.json",
        JSON.stringify({ userbase: userbase }),
        function (err, data) {
          if (err) throw err;
        }
      );
    } catch (e) {
      console.log(e);
    }
    clearInterval(stateupdate);
    teamlist = teamlist.filter((team) => {
      var teamplayers = team.players;
      teamplayers = teamplayers.filter((player) => {
        return player.id !== connection.playerId;
      });
      team.players = teamplayers;
      if (teamplayers.length === 0) {
        return false;
      }
      if (team.owner.id === connection.playerId) {
        if (teamplayers.length !== 0) {
          team.owner = teamplayers[0];
          emit("newOwner", {
            teamID: team.teamID,
            playerid: teamplayers[0].id,
          });
        } else {
          return false;
        }
      }
      return true;
    });
    var public_teams = [];
    teamlist.forEach((team) => {
      if (!team.private) {
        public_teams.push(team);
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
});

let loglimit = 10000;

setInterval(() => {
  // Filter and update bullets
  bullets = bullets.filter((bullet) => {
    if (bullet.type === "directer") {
      try {
        let dx =
          players[bullet.id].MouseX +
          players[bullet.id].x -
          players[bullet.id].screenWidth / 2 -
          bullet.x;
        let dy =
          players[bullet.id].MouseY +
          players[bullet.id].y -
          players[bullet.id].screenHeight / 2 -
          bullet.y;
        let angle = Math.atan2(dy, dx);
        bullet.angle = angle;
        if (players[bullet.id]?.mousestate === "held") {
          bullet.angle = -angle;
        }
      } catch (e) {
        // delet bad bullets
        if (players[bullet.id]) {
          emit("dronekilled", { droneID: bullet.id });
        }
        console.log(e);
        return false;
      }
    }
    let collied = false;
    let newX = bullet.x + bullet.speed * Math.cos(bullet.angle);
    let newY = bullet.y + bullet.speed * Math.sin(bullet.angle);
    var newX__;
    var newY__;
    if (bullet.type !== "directer") {
      bullet.distanceTraveled += MathHypotenuse(
        newX - bullet.x,
        newY - bullet.y
      );
    }

    if (bullet.type === "trap" || bullet.type === "directer") {
      if (
        bullet.bullet_distance - bullet.distanceTraveled < 200 &&
        bullet.type === "trap"
      ) {
        bullet.speed -= (bullet.bullet_distance - bullet.distanceTraveled) / 85;
        if (bullet.speed <= 0) bullet.speed = 0;
      }

      bullets.forEach((bullet_) => {
        let distance = MathHypotenuse(
          bullet.x - bullet_.x,
          bullet.y - bullet_.y
        );

        if (distance > 50) return;
        var bullet_speed = bullet.speed;

        if (
          distance < bullet.size * 2 + bullet_.size * 2 &&
          bullet.id !== bullet_.id &&
          !(
            players[bullet?.id]?.team === players[bullet_?.id]?.team &&
            players[bullet?.id]?.team !== null &&
            players[bullet_?.id]?.team !== null
          )
        ) {
          if (
            bullet_speed !== 0 &&
            bullet_speed !== 0 &&
            (!bullet_.speed || !bullet_speed) &&
            bullet.type === "trap"
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
          )
        ) {
          newX__ = bullet.size * -0.9 * Math.sin(bullet.angle - bullet_.angle);
          newY__ = bullet.size * -0.9 * Math.cos(bullet.angle - bullet_.angle);
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
      bullet.bullet_distance - bullet.distanceTraveled < 10 &&
      bullet.bullet_distance > 20 &&
      bullet.type !== "directer"
    ) {
      bullet.transparency =
        (bullet.bullet_distance - bullet.distanceTraveled) / 10;
    } else if (bullet.bullet_distance < 10) {
      bullet.transparency = bullet.bullet_distance / 10;
    }

    for (const playerId in players) {
      var player = players[playerId];
      var distance = MathHypotenuse(player.x - bullet.x, player.y - bullet.y);
      let player40 = player.size * 40;
      var sameTeam =
        players[bullet.id]?.team === players[playerId]?.team &&
        players[bullet.id]?.team !== null &&
        players[playerId]?.team !== null;
      if (player.state !== "start" && !sameTeam) {
        let bulletsize = bullet.size;

        if (distance < player40 + bullet.size && bullet.id !== player.id) {
          if (bullet.type === "trap") {
            player.health -=
              (bullet.bullet_damage - 3.8) /
              (player.size + 6 / bullet.size + 3);
            bullet.bullet_distance /=
              bullet.size / (bullet.bullet_pentration + 10);
          } else if (bullet.type === "directer") {
            player.health -=
              (bullet.bullet_damage - 4.4) /
              (player.size + 6 / bullet.size + 5);
            bullet.bullet_distance /=
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
            } catch (e) {
              console.log(bullet.id);
            }
            emit("playerScore", { bulletId: bullet.id, socrepluse: reward });
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
                leader_board.shown.forEach(() => {
                  if (__index__.id === bullet.id) {
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
              if (__index__.id === bullet.id) {
                __index__.score += reward;
              }
            });
            rearrange();
            emit("boardUpdate", {
              leader_board: leader_board.shown,
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
        }
      }
    }
    if (bullet.distanceTraveled < bullet.bullet_distance) {
      bullet.x = newX;
      bullet.y = newY;
      if (collied) {
        bullet.x += newX__;
        bullet.y += newY__;
      }

      return true;
    }
    if (bullet.type === "directer") {
      emit("dronekilled", { droneID: bullet.id });
    }

    if (bullet.type === "AutoBullet") {
      autocannons = autocannons.filter((cannon) => {
        if (bullet.id === cannon.playerid) return false;
        return true;
      });
    }
    bullet_intervals.forEach((__bullet_) => {
      if (bullet.uniqueid === __bullet_.id) {
        __bullet_.canfire = false; // kill in the next tick
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
          offSet_x = players[cannon.playerid].size * 40;
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
    if (maxdistance > 1300) {
      if (cannon._type_ === "bulletAuto") {
        var __parentBullet__ = findBullet(cannon.playerid);
      }
      food_squares.forEach((item) => {
        var offSet_x = tankdatacannon__[cannon.autoindex]["offSet-x"];
        if (tankdatacannon__[cannon.autoindex]["offSet-x"] === "playerX") {
          offSet_x = players[cannon.playerid].size * 40;
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
            Math.abs(cannon.angle - cannon.targetAngle) / (3.5 - reload_1 / 3);
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
            Math.abs(cannon.angle - cannon.targetAngle) / (3.5 - reload_1 / 3);
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

  let tempToPush = [];
  player_array = [];
  food_squares = food_squares.filter((item, index) => {
    item.x = item.centerX + item.scalarX * Math.cos(angle);
    item.y = item.centerY + item.scalarY * Math.sin(angle);
    if (item.type === "pentagon") {
      item.angle += 0.25;
    } else {
      item.angle += 0.5;
    }
    if (item.angle >= 360) {
      item.angle = 0;
    }
    angle += speed;
    if (item.type === "square") {
      const rawvertices = calculateSquareVertices(
        item.x,
        item.y,
        item.size,
        item.angle
      );
      item.vertices = rawvertices;
    }
    if (item.type === "triangle") {
      const rawvertices = calculateTriangleVertices(
        item.x,
        item.y,
        item.size,
        item.angle
      );
      item.vertices = rawvertices;
    }
    if (item.type === "pentagon") {
      const rawvertices = calculateRotatedPentagonVertices(
        item.x,
        item.y,
        item.size,
        item.angle
      );
      item.vertices = rawvertices;
    }
    let item2 = item;
    let gameObject = {
      angle: item2.angle,
      color: item2.color,
      health: item2.health,
      maxhealth: item2.maxhealth,
      size: item2.size,
      type: item2.type,
      weight: item2.weight,
      x: item2.x,
      y: item2.y,
      transparency:item2.transparency
    };

    player_array.push(gameObject);
    let return_ = true;
    if (item.isdead) {
      item.transparency = 1 - (Date.now() - item.deathtime) / 150;
    }
    for (const playerId in players) {
      var player = players[playerId];
      let distanceX = Math.abs(player.x - item.x);
      let distanceY = Math.abs(player.y - item.y);
      // for speed
      let size__ = player.size * 80 + item.size * 1.5;

      if (distanceX < size__ && distanceY < size__) {
        var collisionCheck = isPlayerCollidingWithPolygon(
          player,
          item.vertices
        );

        if (collisionCheck[0]) {
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

          console.log(collisionCheck[1].overlapV);
          emit("bouceBack", {
            response: collisionCheck[1].overlapV,
            playerID: player.id,
          });
          for (let i = 0; i < 10; i++) {
            var factor = (item.weight/5) < 1 ? 1 : (item.weight/5)
            console.log(factor)
            setTimeout(()=>{
              let recoilX = collisionCheck[1].overlapV.x/30;
              let recoilY = collisionCheck[1].overlapV.y/30;
              item.x += recoilX/factor;
              item.y += recoilY/factor;
              item.centerX += recoilX/factor;
              item.centerY += recoilY/factor;
            },50*i)
          }
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

            food_squares.push(fooditem);

            return false;
          } else {
            if (player.state !== "start") {
              item.health -= damageother;
            }
          }

          if (player.state !== "start") {
            emit("shapeDamage2", {
              PlayerId: player.id,
              playerDamage: damageplayer,
              shapes: food_squares,
            });
          }
        }
        //collisionCheck = null;
      }
    }
    bullets.forEach((bullet) => {
      let distance = MathHypotenuse(item.x - bullet.x, item.y - bullet.y);
      if (distance < 400) {
        let collisionCheck = isBulletCollidingWithPolygon(
          bullet,
          item.vertices
        );

        if (bullet.type === "trap") {
          var bulletSpeed = 4;
        } else {
          var bulletSpeed = bullet.speed || 0;
        }

        if (!collisionCheck) return;
        const damage =
          (bullet.bullet_damage * 4) / (item.size + bulletSpeed) +
          bullet.bullet_pentration; //

        if (damage >= item.health) {
          if (!players[bullet.id]) {
            console.log(bullet.id);
            console.log(players);
            return;
          }
          players[bullet.id].score += item.score_add;
          leader_board.hidden.forEach((__index__) => {
            if (__index__.id === bullet.id) {
              __index__.score += item.score_add;
              let isshown = false;
              leader_board.shown.forEach(() => {
                if (__index__.id === bullet.id) {
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
            if (__index__.id === bullet.id) {
              __index__.score += item.score_add;
            }
          });
          rearrange();
          emit("boardUpdate", {
            leader_board: leader_board.shown,
          });
          emit("playerScore", {
            bulletId: bullet.id,
            socrepluse: item.score_add,
          });

          var randID = Math.random() * index * Date.now();

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
                between(x, c.x - 50, c.x + 50) && between(y, c.y - 50, c.y + 50)
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
          if (!item.isdead) {
            tempToPush.push(fooditem__XX);
          }

          bullet.bullet_distance -=
            (bullet.size * 40) / bullet.bullet_pentration +
            bullet.size * 3 +
            40;
          if (bullet.bullet_pentration > item.size) {
            if (bullet.type === "triangle") {
              bullet.angle *= 5;
            }
          }
          //emit("FoodUpdate", food_squares);

          if (!item.isdead) {
            item.deathtime = Date.now();
            item.isdead = true;
          }

          return_ = false;
        } else {
          item.health -= damage;
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
        bullet.bullet_distance -=
          (bullet.size * 40) / bullet.bullet_pentration + bullet.size * 3 + 40;

        bullet.bullet_distance -= 1; // for drones
        if (
          bullet.bullet_distance - bullet.distanceTraveled <
            10 - 10 * Math.abs(bullet.speed - 1) &&
          bullet.bullet_distance > 20 &&
          bullet.type !== "directer"
        ) {
          bullet.transparency =
            ((bullet.bullet_distance - bullet.distanceTraveled) *
              bullet.speed) /
            (10 - 10 * Math.abs(bullet.speed - 1));
        } else if (bullet.bullet_distance < 10) {
          bullet.transparency = bullet.bullet_distance / 10;
        }
      }
    });
    if (return_ === true && !item.isdead) {
      return return_;
    }
    if (item.isdead) {
      if (Date.now() >= item.deathtime + 150) {
        return false;
      }
    }
    if (item.isdead) {
      return true;
    }
  });
  tempToPush.forEach((item) => {
    food_squares.push(item);
  });

  emit("bulletUpdate", bullets);
  createAndSendGameObjects(player_array);
}, UPDATE_INTERVAL);

async function createAndSendGameObjects(playerArray) {
  // Load and compile the Protobuf schema
  const root = await protobuf.parse(schema).root;
  const GameObject = root.lookupType('GameObject');
  const GameObjectList = root.lookupType('GameObjectList');

  // Convert player array to GameObject format (DO NOT encode here)
  const gameObjects = playerArray.map(item => ({
    angle: item.angle,
    color: item.color,
    health: item.health,
    maxhealth: item.maxhealth,
    size: item.size,
    type: item.type,
    weight: item.weight,
    x: item.x,
    y: item.y,
    transparency: item.transparency,
  }));

  // Create the GameObjectList (DO NOT encode here either)
  const gameObjectList = { objects: gameObjects };

  // Now encode the entire list properly
  const messageBuffer = GameObjectList.encode(gameObjectList).finish();

  // Send the binary message using smartemit()
  smartemitBinary("gameUpdate", messageBuffer);
}

function smartemitBinary(type, data) {
  connections.forEach((conn) => {
    if (conn.playerId == null || players[conn.playerId] == undefined) return;
    if (players[conn.playerId].visible) {
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

function smartemit(type, data) {
  const message = JSON.stringify({ type, data });
  connections.forEach((conn) => {
    if (conn.playerId == null || players[conn.playerId] == undefined) return;
    if (players[conn.playerId].visible) {
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

const listener = server.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
