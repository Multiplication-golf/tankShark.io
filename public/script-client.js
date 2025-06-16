// LOL, you little kids can't mess with my game
(async function () {
  /* Warning! DO NOT TOUCH */
  const isCrazyGames = false; /*window.location.origin.endsWith("crazygames.com");*/

  console.log(document.referrer);
  if (isCrazyGames) {
    // document.getElementsByTagName("body")[0].innerHTML +=
    //   '<script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>';

    try {
      await window.CrazyGames.SDK.init();
    } catch {
      console.error("SOMETHING went wrong, reloading to try again");
      setTimeout(() => {
        window.location.href = "/";
      }, 5000);
    }
    var available = window.CrazyGames.SDK.user.isUserAccountAvailable;
    if (available) {
      var user = await window.CrazyGames.SDK.user.getUser();
      document.getElementById("username").value = user.username;
    }
  }
  var token = null;
  if (isCrazyGames) {
    window.CrazyGames.SDK.game.loadingStart();
    if (available) {
      token = await window.CrazyGames.SDK.user.getUserToken();
    }
  }
  console.log(token);

  var badgelevels = {};
  // window.onbeforeunload = (evt) => {
  //   evt.preventDefault();
  // };

  var badgesToLoad = [
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

  var badgesIMGToLoad = [
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
  ];

  badgesIMGToLoad.forEach((badge) => {
    var img = new Image();
    img.src =
      !window.location.href.startsWith("http://127.0.0.1:5501/public/index.html")
        ? `/badges/${badge}`
        : `/public/badges/${badge}`;
    badgelevels[`/badges/${badge}`] = img;
  });

  function getMousePos(canvas, evt) {
    return {
      x: evt.clientX,
      y: evt.clientY,
    };
  }

  function getMiddleOfElement(element) {
    const rect = element.getBoundingClientRect();
    const middleX = rect.left + rect.width / 2;
    const middleY = rect.top + rect.height / 2;
    return { x: middleX, y: middleY };
  }

  const getMouseAngle = (canvas, x, y) => {
    var elePos = getMiddleOfElement(canvas);
    return Math.atan2(y - elePos.y, x - elePos.x);
  };

  function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  var username;

  const images = [];
  const imagePaths = [
    "0.webp",
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
  ]; // Array of image paths

  imagePaths.forEach((path) => {
    const img = new Image();
    img.src =
      (window.location.href.startsWith("http://127.0.0.1:5501/public/index.html")
        ? "/public/skins/"
        : "/skins/") + path;
    images.push(img);
  });

  var inverted = {};
  images.forEach((image___, i) => {
    inverted[`${i}.png`] = image___;
  });

  function loadProto() {
    // Define the schema directly as a JSON object
    const schema = {
      nested: {
        GameObject: {
          fields: {
            angle: { type: "float", id: 1 },
            color: { type: "string", id: 2 },
            health: { type: "float", id: 3 },
            maxhealth: { type: "int32", id: 4 },
            size: { type: "float", id: 5 },
            type: { type: "string", id: 6 },
            weight: { type: "float", id: 7 },
            x: { type: "float", id: 8 },
            y: { type: "float", id: 9 },
            transparency: { type: "float", id: 10 },
            randomID: { type: "double", id: 11 },
          },
        },
        GameObjectList: {
          fields: {
            objects: { rule: "repeated", type: "GameObject", id: 1 },
          },
        },
      },
    };

    // ignore error; does not interfer with aplication
    const root = protobuf.Root.fromJSON(schema);

    const GameObjectList = root.lookupType("GameObjectList");

    return GameObjectList;
  }

  // Function to decode the Protobuf message and return the type and data
  function decodeMessage(event) {
    var GameObjectList = loadProto();
    if (!event.data) {
      throw new Error("event.data is missing");
    }

    const buffer = new Uint8Array(event.data);

    const message = GameObjectList.decode(buffer);

    return message;
  }

  var canSeeChat = true;
  var darkMode = false;
  var canSeeLeaderBoard = true;
  var canSeeNames = true;

  function ongame() {
    document.getElementById("game").innerHTML = `
      <img
        src="./assets/youDied.webp"
        class="death-screen"
        itemprop="gameEvent"
        id="die"
        alt="death screen"
      />
      <div id="keyscontainer" class="keycontener">
        <svg width="6vh" height="6vh"></svg>
        <svg width="6vh" height="6vh" id="up">
          <rect
            width="6vh"
            height="6vh"
            rx="15"
            fill="rgba(255,255,255,0.8)"
            stroke="rgba(255,255,255,0.9)"
            stroke-width="1"
          />
          <text
            x="2vh"
            y="2.5vh"
            font-size="25"
            text-anchor="middle"
            alignment-baseline="middle"
          >
            W
          </text>
        </svg>
        <br />
        <svg width="6vh" height="6vh" id="left">
          <rect width="6vh" height="6vh" rx="15" fill="rgba(255,255,255,0.8)" />
          <text
            x="2vh"
            y="2.5vh"
            font-size="25"
            text-anchor="middle"
            alignment-baseline="middle"
          >
            A
          </text>
        </svg>
        <svg width="6vh" height="6vh" id="down">
          <rect width="6vh" height="6vh" rx="15" fill="rgba(255,255,255,0.8)" />
          <text
            x="2vh"
            y="2.5vh"
            font-size="25"
            text-anchor="middle"
            alignment-baseline="middle"
          >
            S
          </text>
        </svg>
        <svg width="6vh" height="6vh" id="right">
          <rect width="6vh" height="6vh" rx="15" fill="rgba(255,255,255,0.8)" />
          <text
            x="2vh"
            y="2.5vh"
            font-size="25"
            text-anchor="middle"
            alignment-baseline="middle"
          >
            D
          </text>
        </svg>
      </div>
      <div class="background-grid" id="gridDark"></div>
      <div class="background-grid" id="gridLight"></div>
      <div id="confermationScreen" class="shaded100">
        <div class="confimation-pop-up">
          <strong
            ><span class="join-text"
              >The hub will be unmoveble until it is destroyed by another
              team/player.<br />
              It will place just to your left. Choose your spot wisely!
              <br />
              <button class="allow-join" id="placeNo">
                <strong>no</strong></button
              ><button class="allow-join" id="placeYes">
                <strong>yes</strong>
              </button>
            </span></strong
          >
        </div>
      </div>
      <div class="UI-contaniner" id="container">
        <div class="bar-holder">
          <img
            itemprop="characterAttribute"
            src="./assets/barXP.png"
            class="bar-image"
            alt="level bar"
          />
        </div>
      </div>
      <div
        itemprop="characterAttribute"
        id="tanktiles"
        class="upgrade-tiles"
      ></div>
      <canvas id="ghostCanvas" class="ghost-canvas"></canvas>
      <div class="aling-center-10" id="teamMain">
        <div class="shadow-frame"></div>
        <div id="socialContainer">
          <div class="con-435874358">
            <div class="social-con">
              <div class="socialLevelDiv" id="social">
                <div class="socialContainer">
                  <div class="flexbuild">
                    <textarea
                      cols="30"
                      class="textsocial"
                      id="posttext"
                      maxlength="256"
                    ></textarea>
                    <button class="post-button" id="postBite">
                      Post a bite
                    </button>
                  </div>
                  <a style="font-size: 10px" href="./posting-policy.html"
                    >By posting your are agreeing to Tankshark's Posting Policy
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="outer-box">
          <div style="display: flex; height: 85%">
            <div class="inner-box">
              <span class="close-btn" id="Xbutton">X</span>
              <div class="containerA" id="teamcontainer">
                <div class="team">Team1</div>
                <div class="team">Team2</div>
                <div class="team">Team3</div>
                <div class="team">Team4</div>
              </div>
            </div>
            <div class="con-12849" id="upgradesBox">
              <div class="upgrades-box">
                <button class="upgrade-button" id="miniMap">
                  Upgrade mini-map player tracking: 3000
                </button>
                <div class="upgrade-button">
                  Upgrade stats: 200 per stat<br />
                  <div class="upgrade-div" id="upgradeHealth">Health</div>
                  <div class="upgrade-div" id="upgradeBodyDamage">
                    Body Damage
                  </div>
                  <div class="upgrade-div" id="upgradeRegen">Regen</div>
                  <div class="upgrade-div" id="upgradeBulletPentration">
                    Bullet Pentration
                  </div>
                  <div class="upgrade-div" id="upgradeBulletSpeed">
                    Bullet Speed
                  </div>
                  <div class="upgrade-div" id="upgradeBulletDamage">
                    Bullet Damage
                  </div>
                  <div class="upgrade-div" id="upgradeBulletReload">
                    Bullet Reload
                  </div>
                  <div class="upgrade-div" id="upgradeSpeed">Speed</div>
                </div>
                <button class="upgrade-button" id="HomeBaseUpgrade">
                  Build homebase: 10000
                </button>
              </div>
            </div>
          </div>
          <div style="display: block; height: 14%">
            <div class="button-container">
              <button class="btn btn-join" id="join/leave">Join</button>
              <button class="btn btn-create" id="create/delete">
                Create team
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="request-join" id="requestJoin">
        <strong
          ><span class="join-text"
            >Allow Join
            <br />
            <button class="allow-join" id="allowNo">
              <strong>no</strong></button
            ><button class="allow-join" id="allowYes">
              <strong>yes</strong>
            </button>
          </span></strong
        >
      </div>

      <div style="width: 100%">
        <div id="teambox" class="team-contaniner">
          <h1 class="high-index">Your team name</h1>
          <label class="label" for="checkbox">Hidden:</label>
          <label class="switch" id="checkbox">
            <input type="checkbox" id="hidden" class="null" />
            <span class="slider round" id="getval"></span>
          </label>
          <br /><br />
          <label class="label" for="checkbox2">Private:</label>
          <label class="switch" id="checkbox2">
            <input type="checkbox" id="private" class="null2" />
            <span class="slider round" id="getval2"></span>
          </label>

          <h2>Config</h2>
          <div class="scrollDiv" id="scrollDiv">
            <div class="configDiv">
              <div class="gear-holder">
                <img src="./assets/gear.png" style="width: 5vw; height: 5vw" />
              </div>
              <label class="label" for="teamDescription"
                >Team Description:</label
              >
              <input
                type="text"
                itemprop="description"
                id="teamDescription"
                placeholder="Enter your team's description"
                autocomplete="off"
                maxlength="200"
              />
              <br />
              <label class="label" for="teamSelcetor">Team type:</label>
              <br />
              <div id="teamSelcetor" class="aling-left">
                <div>
                  <input
                    type="radio"
                    id="Anarchy"
                    name="teamType"
                    value="Anarchy"
                    class="inlineRadio"
                    itemprop="gameMode"
                    checked
                  />
                  <label for="Anarchy">Anarchy</label>
                </div>

                <div>
                  <input
                    type="radio"
                    id="Democracy"
                    name="teamType"
                    value="Democracy"
                    class="inlineRadio"
                    itemprop="gameMode"
                  />
                  <label for="Democracy">Democracy</label>
                </div>

                <div>
                  <input
                    type="radio"
                    id="Communist"
                    name="teamType"
                    value="Communist"
                    class="inlineRadio"
                    itemprop="gameMode"
                  />
                  <label for="Communist">Communist</label>
                </div>

                <div>
                  <input
                    type="radio"
                    id="Constitutional"
                    name="teamType"
                    value="Constitutional"
                    class="inlineRadio"
                    itemprop="gameMode"
                  />
                  <label for="Constitutional">Constitutional</label>
                </div>
              </div>

              <div id="taxContiener" style="margin-top: 10%"></div>
              <div class="centerer">
                <div class="coolLineBreak"></div>
              </div>
              <h1>Taxes D:</h1>
              <label class="label" for="teamScore">Create a team score:</label>
              <label class="switch" id="teamScore_">
                <input type="checkbox" id="teamScore" class="null3" />
                <span class="slider round" id="getTeamScore"></span> </label
              ><br />
              <p class="addedInfo">
                Not creating a team score will foward the 50% of the score to
                you
              </p>
              <br />
              <input
                type="range"
                id="Simple"
                name="Simple"
                min="0"
                max="1.00"
                value="0.05"
                step="0.01"
                class="taxRange"
                list="markers"
              />
              <p for="Simple" class="taxLable">Flat tax rate</p>
              <br />
              <input
                type="range"
                id="scoreBased"
                name="scoreBased"
                min="0"
                max="1.00"
                value="0"
                step="0.01"
                class="taxRange"
                list="markers"
              />
              <p for="scoreBased" class="taxLable">
                Player's score based tax rate
              </p>
              <br />
              <input
                type="range"
                id="ScheduledBased"
                name="ScheduledBased"
                min="0"
                max="1.00"
                value="0"
                step="0.01"
                class="taxRange"
                list="markers"
              />
              <br />
              <select id="time-select" title="tax rate interval">
                <option value="1">1m</option>
                <option value="2">2m</option>
                <option value="4">4m</option>
                <option value="8">8m</option>
                <option value="16">16m</option>
                <option value="0.00016666666">0.01s (do it I dare you)</option>
              </select>
              <br />
              <p for="scoreBased">Scheduled tax rate</p>

              <datalist id="markers">
                <option value="0"></option>
                <option value="0.25"></option>
                <option value="0.50"></option>
                <option value="0.75"></option>
                <option value="1.00"></option>
              </datalist>
            </div>
          </div>

          <input
            type="text"
            id="teamname"
            itemprop="name"
            style="z-index: 10"
            placeholder="Enter your team name"
            autocomplete="given-name"
            maxlength="11"
          />
          <button id="teamButton" class="create-team-button">
            Create team
          </button>
        </div>
      </div>`;
    let getIP = document.getElementById("IP").value;

    const socket =
      new /*skill issus are comming to my server mohaa ha ha*/ WebSocket(getIP);
    socket.binaryType = "arraybuffer";

    let playerId = null; // Connect to the server
    var canvas = document.createElement("canvas");
    const Ghostcanvas = document.getElementById("ghostCanvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.getElementById("game").appendChild(canvas);
    canvas.id = "myCanvas";
    canvas.style["z-index"] = "5";
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.itemprop = "gamePlatform";

    document.getElementsByTagName("body")[0].style.cursor =
      window.location.href.startsWith("http://127.0.0.1:5501/public/index.html")
        ? `url('${window.location.origin}/public/targetpointer1.cur'), auto`
        : `url('${window.location.origin}/targetpointer1.cur'), auto`;
    var pi180 = Math.PI / 180;
    let lastTime = performance.now();
    let frameTimes = [];
    let fps = 0;

    var tankmeta = {
      basic: {
        "size-m": 1,
        "speed-m": 1,
        "damage-m": 1,
        "health-m": 1,
        "regen-m": 1,
        fov: 1,
        "BodyDamage-m": 1,
        "reaload-m": 1,
        upgradeLevel: 15,
        upgrades: {},
        cannons: [],
      },
    };

    var gridDark = document.getElementById("gridDark");
    var gridLight = document.getElementById("gridLight");

    var HANDSHAKE = {
      null: [{ null: null }],
      null: [{ null: null }],
      null: [{ null: "LOL" }],
    };

    var food_list = [];

    // 🎮 Player-Related Variables
    var players = {};
    var playerX = canvas.width / 2;
    var playerY = canvas.height / 2;
    var playerHealth = 100;
    var maxhealth = 100;
    var playerHealTime = 0;
    var playerReheal = 1;
    var playerSpeed = 10;
    var playerSize = 1;
    var playerBaseSize = 40;
    var bodyDamage = 3;
    var __type__ = "basic";
    var selected_class = null;
    var level = 0;
    var upgradePoints = 0;
    var maxUP = 8;
    var dead = false;
    var joinedTeam = false;
    var teamOn = null;
    var owner_of_team = false;
    var score = 0;
    var announcements = [];
    var playerMessages = [];
    var messaging = false;
    var blinking = false;

    // 🕹️ Movement & Controls
    var canmove = true;
    var canKeyPress = true;
    var speedBoost = 1;
    var canFire = true;
    var canFire2 = true;
    var keysPressed = {};
    var movementTimeouts = [];
    var autoRotating = false;
    var lockautoRotating = false;
    var autoAngle = 0;
    var MouseX_ = 0;
    var MouseY_ = 0;
    var MouseX = 0;
    var MouseY = 0;
    var firingIntervals = {};
    var firingInterval = null;

    // 💥 Combat & Weapons
    var bullets = [];
    var zlevelbullets = [];
    var roads = [];
    var autoFiring = false;
    var autoIntevals = [];
    var baseFireInterval = 750;
    var cannonFireData = [true];
    var bullet_damage = 10;
    var bullet_speed = 4;
    var bullet_size = 15;
    var swivelAngle = 0;
    var bullet_pentration = 2;
    var cannonWidth = [0];
    var drones = 0;
    var autocannons = [];

    // 🗺️ Map & Environment
    var mapLeft = -5000;
    var mapRight = 5000;
    var mapTop = -5000;
    var mapBottom = 5000;
    var boundrectcanvas = Ghostcanvas.getBoundingClientRect();
    var cavansX = 0;
    var cavansY = 0;
    var canW = canvas.width;
    var canH = canvas.height;
    var FOV = 1; // sensitive
    var gridDarkstyle = gridDark.style;
    var gridLightstyle = gridLight.style;
    var sqrt23 = Math.sqrt(3) / 2;
    var pi = Math.PI;
    var pentarotate = 0;

    // 🛡️ UI & Interface
    var state = "start";
    var statecycle = 0;
    var progress = 0.0;
    var setprogress = 0;
    var barWidth = 0.3125 * canvas.width;
    var barHeight = 0.02909796314 * canvas.height;
    var borderRadius = 10;
    var teampanelopen = false;
    var leader_board = [];
    var badge = "";
    var img = null;

    // 🎯 Buttons & Controls
    var button475 = 0.24739583333 * canvas.width;
    var button462_5 = 0.24088541666 * canvas.width;
    var button375 = 0.1953125 * canvas.width;
    var button40 = 0.03100775193 * canvas.height;
    var button10 = 0.00969932104 * canvas.height;
    var nolist = [3, 5, 7, 8, 10, 11, 13];

    // 🕰️ Timers & Intervals
    var Regenspeed = 30;
    var firingIntervals = {};
    var firingInterval = null;
    var autoIntevals = [];
    var movementTimeouts = [];

    // 👾 Enemies, Bosses, & NPCs
    var bosses = [];
    var explosions = [];
    var requests = [];

    // 🏢 Teams & Multiplayer
    var pubteams = [];
    var teamOver = false;
    var userId = getCookie("userId");
    var typedtext = "";
    var radiusConfig = {};

    // 🧠 Miscellaneous / Game Logic
    var vertices = [];
    var errors = 0;
    var cannonFireData = [true];
    var cannonWidth = [0];
    var sqrt23 = Math.sqrt(3) / 2;
    var squareColor = "grey";
    var nolist = [3, 5, 7, 8, 10, 11, 13];
    var __reload__ = 1;
    var colorUpgrades = [];
    var teamColorUpgrades = [];
    var scaleUp = 0;
    var state = "start";
    var statecycle = 0;
    var progress = 0.0;
    var pentarotate = 0;
    var requests = [];
    var imgsrcs = ["assets/dislike.webp", "assets/like.webp"];
    var minimapLevels = [];
    var levels = {
      0: 15,
    };
    var socialContainer = document.getElementById("socialContainer");
    let statsTree = {
      Health: 1,
      "Body Damage": 1,
      Regen: 1,
      "Bullet Pentration": 1,
      "Bullet Speed": 1,
      "Bullet Damage": 1,
      "Bullet Reload": 1,
      Speed: 1,
    };

    function waitpls() {
      setTimeout(() => {
        canKeyPress = true;
      }, 300);
      canKeyPress = false;
    }

    socialContainer.style.display = "none";

    function send(type, data) {
      if (socket.readyState === WebSocket.OPEN) {
        try {
          socket.send(JSON.stringify({ type: type, data: data }));
        } catch (e) {
          if (errors > 2) return;
          setTimeout(() => {
            alert(
              "There is an error or socket disconnection. Please report this if the error is not related to a closing state error."
            );
            window.location.reload();
          }, 2500);
          alert(
            "There is an error or socket disconnection. Please report this if the error is not related to a closing state error."
          );
          alert("error", e);
        }
      } else {
        setTimeout(() => {
          window.location.reload();
        }, 1);
        setTimeout(() => {
          alert(`There is a disconnection. ${socket.readyState}`);
        }, 0);
        console.log(type, data);
        errors++;
      }
    }

    const getCannonAngle = () => {
      return Math.atan2(
        MouseY_ - window.innerHeight / 2,
        MouseX_ - window.innerWidth / 2
      );
    };

    function mix(rgb, rgb2, percent, ...otherrgbs) {
      let _return = false;
      rgb.forEach((f) => {
        if (typeof f !== "number") _return = true;
      });
      rgb2.forEach((f) => {
        if (typeof f !== "number") _return = true;
      });
      if (rgb.length !== 3 || rgb2.length !== 3) _return = true;
      if (_return) throw new Error("Bad rgbs");
      var newrgb = rgb.map((c, i) => {
        return (c = rgb2[i] * percent + c * (1 - percent));
      });
      otherrgbs.forEach((rgb, i) => {
        mix(rgb, otherrgbs[i], percent);
      });
      return newrgb;
    }

    function setCookie(cname, cvalue, exdays) {
      const d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
      let expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function convertTeamInterface() {
      document
        .getElementsByClassName("outer-box")[0]
        .classList.add("outer-onwer-box");
      document
        .getElementsByClassName("inner-box")[0]
        .classList.add("inner-onwer-box");
    }

    function deconvertTeamInterface() {
      document
        .getElementsByClassName("outer-box")[0]
        .classList.remove("outer-onwer-box");
      document
        .getElementsByClassName("inner-box")[0]
        .classList.remove("inner-onwer-box");
    }

    setCookie("score", 25000000, 100);

    var upgradeColors = [
      "#CC0000",
      "#00CC00",
      "#0000CC",
      "#CCCC00",
      "#CC00CC",
      "#00CCCC",
      "#660000",
      "#666600",
      "#006600",
      "#660066",
      "#006666",
      "#000066",
      "#CC8400",
      "#7F1F1F",
      "#4C7A8A",
      "#66CC00",
      "#A0521E",
      "#4A7BC5",
      "#B01030",
      "#00A9A9",
    ];
    var upgradeColorsDark = [
      "#FF0000",
      "#00FF00",
      "#0000FF",
      "#FFFF00",
      "#FF00FF",
      "#00FFFF",
      "#800000",
      "#808000",
      "#008000",
      "#800080",
      "#008080",
      "#000080",
      "#FFA500",
      "#A52A2A",
      "#5F9EA0",
      "#7FFF00",
      "#D2691E",
      "#6495ED",
      "#DC143C",
      "#00CED1",
    ];

    function levelUpgrader(tankdata) {
      var out = false;
      if (tankdata["upgrades"] == undefined) return;
      for (let i = 0; i < Object.keys(tankdata["upgrades"]).length; i++) {
        var KEY = Object.keys(tankdata["upgrades"])[i];

        if (level >= tankdata["upgrades"][KEY]["level"] - 1) {
          if (out === false) {
            var tankstiles = document.getElementById("tanktiles");
            tankstiles.style.display = "block";
            tankstiles.style.left = 0;
            tankstiles.style.animation = "2s 1 move";
            tankstiles.innerHTML = "";
            out = true;
          }

          var upgrade = tankdata["upgrades"][KEY];

          var img__ = document.createElement("canvas");

          tankstiles.appendChild(img__);

          img__.style =
            "width: 10vw; height: 10vw; margin: 10px; z-index: 100;";

          img__.width = img__.getBoundingClientRect().height + 20;
          img__.height = img__.getBoundingClientRect().height + 20;

          const __ctx__ = img__.getContext("2d", { willReadFrequently: false });
          __ctx__.beginPath();
          __ctx__.roundRect(
            7,
            7,
            img__.getBoundingClientRect().width,
            img__.getBoundingClientRect().height,
            5
          );
          __ctx__.fillStyle = upgradeColors[i];
          __ctx__.strokeStyle = upgradeColorsDark[i];
          __ctx__.lineWidth = 7;
          __ctx__.stroke();
          __ctx__.fill();
          __ctx__.closePath();

          var players_ = {
            sdfjdsj9ew8932rs89f8: {
              id: "sdfjdsj9ew8932rs89f8",
              x: img__.getBoundingClientRect().width / 2 + 5,
              y: img__.getBoundingClientRect().width / 2 + 5,
              health: 100,
              size: 1,
              cannonW: [],
              cannonH: 0,
              __type__: Object.keys(tankdata["upgrades"])[i],
              cannon_angle: 0,
              score: 0,
              username: "",
              state: "normal",
              maxhealth: 100,
              skin: "0.webp",
              team: teamOn,
              statecycle: 0,
            },
          };
          var canndata = tankmeta[Object.keys(tankdata["upgrades"])[i]];
          console.log(
            tankmeta[Object.keys(tankdata["upgrades"])[i]]["cannons"],
            Object.keys(tankdata["upgrades"])[i]
          );
          for (let i = 0; i < canndata["cannons"].length; i++) {
            players_["sdfjdsj9ew8932rs89f8"].cannonW.push(0);
          }

          drawPlayers(__ctx__, players_, 0, 0, true);

          img__.addEventListener("click", function (evt) {
            evt.stopPropagation();
            tankstiles.style.display = "none";
            __type__ = Object.keys(tankdata["upgrades"])[i];
            players[playerId].__type__ = __type__;
            tankdata = tankmeta[__type__];
            var tankdatacannon__ = tankdata["cannons"];
            playerSize *= tankdata["size-m"];
            playerSpeed *= tankdata["speed-m"];
            bullet_damage *= tankdata["damage-m"];
            playerReheal *= tankdata["regen-m"];
            bodyDamage *= tankdata["BodyDamage-m"];
            maxhealth *= tankdata["health-m"];
            if (playerHealth > maxhealth) {
              playerHealth = maxhealth;
            }
            if (tankdata["autoRoting"]) {
              autoRotating = true;
              lockautoRotating = true;
              send("rotate", {
                autoAngle: 0,
                autoIntevals: autoIntevals,
                playerSize: playerSize,
                FOV: scaleFactor,
                canvaswidth: canvas.width,
                canvasheight: canvas.height,
              });
            }
            if (tankdata.fov !== 0) {
              scaleby(tankdata.fov);
            }

            send("typeChange", {
              health: playerHealth,
              speed: playerSpeed,
              size: playerSize,
              bodyDamage: bodyDamage,
              __type__: __type__,
              state: state,
              statecycle: statecycle,
              playerHealTime: playerHealTime,
              maxhealth: maxhealth,
              playerReheal: playerReheal,
              FOV: scaleFactor,
              Regenspeed: Regenspeed,
              statsTree: {
                Health: statsTree.Health,
                "Body Damage": statsTree["Body Damage"],
                Regen: statsTree.Regen,
                "Bullet Pentration": statsTree["Bullet Pentration"],
                "Bullet Speed": statsTree["Bullet Speed"],
                "Bullet Damage": statsTree["Bullet Damage"],
                "Bullet Reload": statsTree["Bullet Reload"],
                Speed: statsTree.Speed,
              },
            });

            setTimeout(() => {
              cannonWidth = [];
              cannonFireData = [];
              for (let i = 0; i < Object.keys(tankdatacannon__).length; i++) {
                cannonWidth.push(0);
                cannonFireData.push(true);
              }
              console.log(autocannons);
              autocannons = autocannons.filter((popcannon) => {
                if (popcannon.playerid === playerId) {
                  send("deletAuto", { CannonID: popcannon.CannonID });
                  clearInterval(popcannon);
                  return false;
                }
                return true;
              });
              let i___ = 0;
              for (let i = 0; i < Object.keys(tankdatacannon__).length; i++) {
                let cannon = tankdatacannon__[i];
                console.log(cannon);
                if (
                  cannon.type === "autoCannon" ||
                  cannon.type === "SwivelAutoCannon"
                ) {
                  console.log("cccccc");
                  let autoID = Math.random() * 1000 + Math.random() * 1000;
                  send("autoCannonADD", {
                    CannonID: autoID,
                    angle: 0,
                    _type_: cannon.type,
                    cannonWidth: 0,
                  });
                  let cannon__ = cannon;
                  let tankdata = tankmeta[__type__];
                  let _CAN = {
                    CannonID: autoID,
                    angle: 0,
                    _type_: cannon.type,
                    cannonWidth: 0,
                  };
                  var reload =
                    baseFireInterval *
                    tankdata["reaload-m"] *
                    cannon["reloadM"] *
                    __reload__;
                  function cannonINT() {
                    var __tankdata__ = tankmeta[__type__];
                    let cannon;
                    let index = 0;
                    for (const ___cannon___ in __tankdata__.cannons) {
                      let cannon___ = __tankdata__.cannons[___cannon___];
                      if (index === cannon__.autoindex) {
                        cannon = cannon___;
                      }
                      index++;
                    }
                    var offSet_x = tankdatacannon__[i]["offSet-x"];
                    if (tankdatacannon__[i]["offSet-x"] === "playerX") {
                      offSet_x = playerSize * playerBaseSize * FOV;
                    }
                    if (tankdatacannon__[i]["offSet-x-multpliyer"]) {
                      offSet_x *= -1;
                    }
                    if (tankdatacannon__[i].type === "SwivelAutoCannon") {
                      send("Autofire", {
                        playerX: playerX,
                        playerY: playerY,
                        cannon: cannon__,
                        bullet_damage: bullet_damage,
                        bullet_speed: bullet_speed,
                        bullet_size: bullet_size,
                        bullet_pentration: bullet_pentration,
                        _cannon: _CAN,
                        tankdatacannon__: tankdatacannon__,
                        autoindex: i,
                      });
                    }
                    if (tankdatacannon__[i].type === "autoCannon") {
                      send("Autofire", {
                        playerX: playerX - offSet_x,
                        playerY: playerY,
                        cannon: cannon__,
                        bullet_damage: bullet_damage,
                        bullet_speed: bullet_speed,
                        bullet_size: bullet_size,
                        bullet_pentration: bullet_pentration,
                        _cannon: _CAN,
                        tankdatacannon__: tankdatacannon__,
                        autoindex: i,
                      });
                    }
                    setTimeout(() => {
                      cannonINT();
                    }, reload);
                  }
                  setTimeout(() => {
                    cannonINT();
                  }, reload);
                  console.log(
                    baseFireInterval *
                      tankdata["reaload-m"] *
                      cannon["reloadM"] *
                      __reload__
                  );
                  autoIntevals.push({ cannonINT: cannonINT, autoID: autoID });
                }
                i___++;
              }
            }, 100);
          });
        }
      }
    }

    function levelHANDLER() {
      setprogress =
        (score - levels[level - 1]) / (levels[level] - levels[level - 1]);
      setprogress =
        setprogress === 0 || Number.isNaN(setprogress) ? 1 : setprogress;
      if (score / levels[level] >= 1) {
        upgradePoints += 1;
        // Add transition property

        let tankdata = tankmeta[__type__];
        levelUpgrader(tankdata);
        level += 1;
        progress = 0;
        setprogress =
          (score - levels[level - 1]) / (levels[level] - levels[level - 1]);
        playerSize += playerSize * 0.005;
        send("Sizeup", { plus: playerSize * 0.005 });
        scaleby(scaleUp);
        while (score / levels[level] >= 1) {
          level += 1;
          upgradePoints += 1;
          playerSize += playerSize * 0.005;
          send("Sizeup", { plus: playerSize * 0.005 });
          scaleby(scaleUp);
          progress = 0;
          setprogress =
            (score - levels[level - 1]) / (levels[level] - levels[level - 1]);
          let tankdata = tankmeta[__type__];
          levelUpgrader(tankdata);
        }
      }
    }

    function buildTeamList() {
      if (!joinedTeam) {
        pubteams.forEach((team) => {
          var teamcontainer = document.getElementById("teamcontainer");
          var item = document.createElement("div");
          var downArrow = document.createElement("img");
          downArrow.src = "assets/expand.png";
          item.classList.add("team");
          item.innerText = team.name;
          teamcontainer.appendChild(item);
          item.appendChild(downArrow);
          var infoConteiner = document.createElement("div");
          var info = document.createElement("p");
          info.innerText = `
          Team type: ${team.govType}
          Team score: ${team.teamScore}
          Taxes: 
          Flat rate ${team.simpleTax}
          Player based rate ${team.playerTax}
          ScheduledBased based rate ${team.ScheduledBasedTax} per ${
            team.ScheduledBasedTaxInterval * 60 * 1000
          } minet interval
          `;

          if (team.govType === "Constitutional") {
            info.innerText += `${team.constitution}`;
          }

          infoConteiner.classList.add("team");
          infoConteiner.style.height = "50%";
          infoConteiner.style.overflow = "auto";
          infoConteiner.style.display = "none";

          teamcontainer.appendChild(infoConteiner);
          infoConteiner.appendChild(info);

          downArrow.style.width = "1.6em";
          downArrow.style.height = "1.3em";
          downArrow.style["margin-top"] = "0px";
          downArrow.style["margin-bottom"] = "-5px";
          downArrow.style["margin-right"] = "3px";
          downArrow.style.float = "right";
          let isDown = false;
          const demotePlayer = () => {
            downArrow.style.rotate = isDown ? "180deg" : "0deg";
            infoConteiner.style.display = isDown ? "none" : "block";
            isDown = !isDown;
          };
          downArrow.addEventListener("click", demotePlayer);
          const addSelected = () => {
            Array.from(teamcontainer.children).forEach((child) => {
              child.classList.remove("glow");
            });

            item.classList.add("glow");

            selected_class = team.teamID;
          };
          item.addEventListener("click", addSelected);
        });
      } else {
        let MYteam = pubteams.find((team) => {
          return team.teamID === players[playerId].team;
        });
        if (!MYteam) return;
        if (MYteam.lowerLevelPlayers) {
          var amLower = MYteam.lowerLevelPlayers.includes({
            id: playerId,
            username: username,
          });
        } else {
          var amLower = false;
        }
        MYteam.players.forEach((player) => {
          var teamcontainer = document.getElementById("teamcontainer");
          var item = document.createElement("div");
          item.classList.add("team");
          if (player.id === MYteam.owner.id) {
            item.innerText = player.username + " -";
          } else {
            item.innerText = player.username;
          }
          if (player.id === MYteam.owner.id) {
            var crown = document.createElement("img");
            crown.src = "assets/crownIcon.png";
            item.appendChild(crown);
            crown.style.width = "1.6em";
            crown.style.height = "1.3em";
            crown.style["margin-left"] = "5px";
            crown.style["margin-top"] = "0px";
            crown.style["margin-bottom"] = "-5px";
          }

          teamcontainer.appendChild(item);
          if (
            MYteam.owner.id === playerId &&
            player.id !== MYteam.owner.id &&
            MYteam.powers.canKick
          ) {
            const addKick = () => {
              if (teamOver) return;
              teamOver = true;
              var kick = document.createElement("img");
              kick.src = "assets/kickButton.png";
              kick.style.width = "1.5em";
              kick.style.height = "1.5em";
              kick.style["text-align"] = "left";
              kick.addEventListener("click", () => {
                send("kickplayer", {
                  id: player.id,
                  team: MYteam.teamID,
                });
              });
              item.appendChild(kick);
              item.addEventListener("mouseleave", () => {
                teamOver = false;
                item.children[0].remove();
              });
            };
            item.addEventListener("mouseover", addKick);
            if (added) {
              var kick = document.createElement("img");
              kick.src = "assets/kickButton.png";
              kick.style.width = "1.5em";
              kick.style.height = "1.5em";
              kick.style["text-align"] = "left";
              kick.addEventListener("click", () => {
                send("kickplayer", {
                  id: player.id,
                  team: MYteam.teamID,
                });
              });
              item.appendChild(kick);
            }
          }
          if (MYteam.owner.id === playerId || amLower) {
            document.getElementById("upgradesBox").style.display = "block";
            var canPremote = amLower
              ? MYteam.powers.lowerlevelpowers.canDedicatePower
              : MYteam.powers.canDedicatePower;

            var canDemote = amLower
              ? MYteam.powers.lowerlevelpowers.canDededicatePower
              : MYteam.powers.canDededicatePower;

            if (canPremote && MYteam.owner.id !== player.id) {
              if (MYteam.lowerLevelPlayers) {
                if (!MYteam.lowerLevelPlayers.includes(player)) {
                  var premoteArrow = document.createElement("img");
                  premoteArrow.src = "assets/premoteArrow.png";
                  item.appendChild(premoteArrow);
                  premoteArrow.style.width = "1.6em";
                  premoteArrow.style.height = "1.3em";
                  premoteArrow.style["margin-left"] = "5px";
                  premoteArrow.style["margin-top"] = "0px";
                  premoteArrow.style["margin-bottom"] = "-5px";
                  premoteArrow.style["float"] = "right";

                  const addplayer = () => {
                    send("premotePlayer", {
                      premote: player,
                      MYteamID: MYteam.teamID,
                    });
                    premoteArrow.removeEventListener("click", addplayer);
                  };

                  premoteArrow.addEventListener("click", addplayer);
                }
              }
            }
            if (canDemote && MYteam.owner.id !== player.id) {
              if (MYteam.lowerLevelPlayers) {
                if (MYteam.lowerLevelPlayers.includes(player)) {
                  var demoteArrow = document.createElement("img");
                  demoteArrow.src = "assets/demoteArrow.png";
                  item.appendChild(premoteArrow);
                  demoteArrow.style.width = "1.6em";
                  demoteArrow.style.height = "1.3em";
                  demoteArrow.style["margin-left"] = "5px";
                  demoteArrow.style["margin-top"] = "0px";
                  demoteArrow.style["margin-bottom"] = "-5px";
                  premdemoteArrowoteArrow.style["float"] = "right";

                  const addplayer = () => {
                    send("demotePlayer", {
                      premote: player,
                      MYteamID: MYteam.teamID,
                    });
                    demoteArrow.removeEventListener("click", addplayer);
                  };

                  demoteArrow.addEventListener("click", addplayer);
                }
              }
            }
          }
        });
      }
    }

    document.getElementById("HomeBaseUpgrade").addEventListener("click", () => {
      document.getElementById("confermationScreen").style.display = "flex";
    });
    document.getElementById("placeNo").addEventListener("click", () => {
      document.getElementById("confermationScreen").style.display = "none";
    });
    document.getElementById("placeYes").addEventListener("click", () => {
      document.getElementById("confermationScreen").style.display = "none";
      send("requestUpgrade", {
        upgradeType: "buildBase",
        teamId: teamOn,
      });
    });

    document.getElementById("upgradeHealth").addEventListener("click", () => {
      send("requestUpgrade", {
        upgradeType: "statUpgrade",
        stat: "Health",
        teamId: teamOn,
      });
    });
    document
      .getElementById("upgradeBodyDamage")
      .addEventListener("click", () => {
        send("requestUpgrade", {
          upgradeType: "statUpgrade",
          stat: "Body Damage",
          teamId: teamOn,
        });
      });
    document.getElementById("upgradeRegen").addEventListener("click", () => {
      send("requestUpgrade", {
        upgradeType: "statUpgrade",
        stat: "Regen",
        teamId: teamOn,
      });
    });
    document
      .getElementById("upgradeBulletPentration")
      .addEventListener("click", () => {
        send("requestUpgrade", {
          upgradeType: "statUpgrade",
          stat: "Bullet Pentration",
          teamId: teamOn,
        });
      });
    document
      .getElementById("upgradeBulletSpeed")
      .addEventListener("click", () => {
        send("requestUpgrade", {
          upgradeType: "statUpgrade",
          stat: "Bullet Speed",
          teamId: teamOn,
        });
      });
    document
      .getElementById("upgradeBulletDamage")
      .addEventListener("click", () => {
        send("requestUpgrade", {
          upgradeType: "statUpgrade",
          stat: "Body Damage",
          teamId: teamOn,
        });
      });
    document
      .getElementById("upgradeBulletReload")
      .addEventListener("click", () => {
        send("requestUpgrade", {
          upgradeType: "statUpgrade",
          stat: "Bullet Reload",
          teamId: teamOn,
        });
      });
    document.getElementById("upgradeSpeed").addEventListener("click", () => {
      send("requestUpgrade", {
        upgradeType: "statUpgrade",
        stat: "Speed",
        teamId: teamOn,
      });
    });
    var postText = document.getElementById("posttext");
    document.getElementById("postBite").addEventListener("click", () => {
      send("postBite", { message: postText.value, teamID: teamOn });
      postText.value = "";
    });

    socket.onopen = function () {
      setTimeout(async () => {
        console.time("preconnect");
        var token = null;
        if (isCrazyGames)
          var teamKey = window.CrazyGames.SDK.game.getInviteParam("teamId");
        if (isCrazyGames) {
          window.CrazyGames.SDK.game.loadingStart();
          if (available) {
            token = await window.CrazyGames.SDK.user.getUserToken();
          }
        }
        let resolveDraw, rejectDraw;
        let resolveDraw2, rejectDraw2;
        let resolveDraw3, rejectDraw3;
        let resolveDraw4, rejectDraw4;
        let resolveDraw5, rejectDraw5;

        var configPromise = new Promise((resolve, reject) => {
          resolveDraw = resolve;
          rejectDraw = reject;
        });

        var tankmetaPromise = new Promise((resolve, reject) => {
          resolveDraw2 = resolve;
          rejectDraw2 = reject;
        });

        var levelPromise = new Promise((resolve, reject) => {
          resolveDraw3 = resolve;
          rejectDraw3 = reject;
        });

        var IDPromise = new Promise((resolve, reject) => {
          resolveDraw4 = resolve;
          rejectDraw4 = reject;
        });

        var loginPromise = new Promise((resolve, reject) => {
          resolveDraw5 = resolve;
          rejectDraw5 = reject;
        });

        var recivedData = [
          configPromise,
          tankmetaPromise,
          levelPromise,
          IDPromise,
          loginPromise,
        ];

        Promise.allSettled(recivedData).then(() => {
          console.timeEnd("preconnect");
          scaleby(0);
          document.getElementById("full-screen").style.display = "none";
          draw();
          if (isCrazyGames) window.CrazyGames.SDK.game.loadingStop();
        });
        if (!isCrazyGames) {
          const urlParams = new URLSearchParams(window.location.search);

          var teamKey = urlParams.get("team");
          console.log(teamKey)
        }

        const playerData = {
          id: null,
          x: playerX,
          y: playerY,
          health: playerHealth,
          speed: playerSpeed,
          size: playerSize,
          bodyDamage: bodyDamage,
          cannonW: cannonWidth,
          cannonH: 0,
          __type__: __type__,
          cannon_angle: getCannonAngle(),
          score: score,
          username: username,
          level: level,
          state: state,
          token: token,
          statecycle: statecycle,
          playerHealTime: playerHealTime,
          maxhealth: maxhealth,
          playerReheal: playerReheal,
          FOV: scaleFactor,
          canvasW: canvas.width,
          canvasH: canvas.height,
          MouseX: MouseX_,
          Regenspeed: Regenspeed,
          MouseY: MouseY_,
          screenWidth: canvas.width,
          screenHeight: canvas.height,
          visible: true,
          team: teamOn,
          userId: userId,
          autoFiring: autoFiring,
          skin: skin,
          isCrazy: isCrazyGames,
          teamKey: teamKey,
          token: token,
          statsTree: {
            Health: 1,
            "Body Damage": 1,
            Regen: 1,
            "Bullet Pentration": 1,
            "Bullet Speed": 1,
            "Bullet Damage": 1,
            "Bullet Reload": 1,
            Speed: 1,
          },
        };

        send("newPlayer", playerData);

        send("HANDSHAKE", {});

        img = new Image();

        img.onload = function () {
          ctx.drawImage(img, canvas.width / 2, canvas.height - 60);
        };
        img.src =
          !window.location.href.startsWith("http://127.0.0.1:5501/public/index.html")
            ? `${badge}`
            : `public/${badge}`;

        socket.onmessage = function (event) {
          var type;
          var data;
          try {
            const message = JSON.parse(event.data);

            type = message.type;
            data = message.data;
          } catch {
            function f() {
              const message = decodeMessage(event);

              type = message.type;
              data = message.data;
              food_list = message.objects;
            }
            f();
            return;
          }
          switch (type) {
            case "newId": {
              playerId = data;
              resolveDraw4();
              break;
            }

            case "playerUpdated": {
              players[data.id] = data; // Update the local player data
              console.log("Player updated:", data); // Log the update
              break;
            }
            case "new_X_Y": {
              if (data.id !== playerId) return;
              cavansX = data.x;
              playerY += data.y;
              cavansY = data.y;
              playerX += data.x;
              break;
            }
            case "explosionUpdate": {
              explosions = data;
              break;
            }
            case "CannonWidthUpdate": {
              var cannon = autocannons.find(
                (cannon_) => cannon_.CannonID === data.CannonID
              );
              cannon.cannonWidth = data.cannonWidth;
              break;
            }
            case "minimapUpdate": {
              minimapLevels = data;
              break;
            }
            case "Config": {
              baseFireInterval = data.baseFireInterval;
              scaleUp = data.scaleUp;
              radiusConfig = data.colorGradeint;
              playerBaseSize = data.playerBaseSize;
              var gridDark = document.getElementById("gridDark");
              var gridLight = document.getElementById("gridLight");
              for (let i = 0; i < data.map.size / 500; i++) {
                for (let j = 0; j < data.map.size / 500; j++) {
                  const div = document.createElement("div");
                  const img = document.createElement("img");
                  img.style.width = "100%";
                  img.style.height = "100%";
                  img.src = "backgrounds/hexlight.webp";
                  let divstyle = div.style;
                  divstyle.width = "999px";
                  divstyle.height = "999px";
                  divstyle.backgroundColor = "white";
                  divstyle.border = "1px solid black";
                  div.appendChild(img);
                  gridLight.appendChild(div);
                }
              }
              for (let t = 0; t < data.map.size / 500; t++) {
                for (let k = 0; k < data.map.size / 500; k++) {
                  const div = document.createElement("div");
                  const img = document.createElement("img");
                  img.style.width = "100%";
                  img.style.height = "100%";
                  img.src = "backgrounds/hexdark.webp";
                  let divstyle = div.style;
                  divstyle.width = "999px";
                  divstyle.height = "999px";
                  divstyle.backgroundColor = "white";
                  divstyle.border = "1px solid black";
                  div.appendChild(img);
                  gridDark.appendChild(div);
                }
              }
              resolveDraw();
              console.log("background built");
              break;
            }
            case "requests": {
              function requester() {
                var conteiner = document.getElementById("requestJoin");
                if (requests.length <= 0) {
                  conteiner.style.display = "none";
                  return;
                }
                var allowYes = document.getElementById("allowYes");
                var allowNo = document.getElementById("allowNo");
                conteiner.style.display = "block";
                if (conteiner.children[1]) conteiner.children[1].remove();
                var newname = document.createElement("p");
                newname.style = "color: #00ffff; font-size: 16px";
                newname.innerText = players[requests[0].requester].username;
                conteiner.appendChild(newname);
                var yes, no;
                yes = () => {
                  send("allowYes", requests[0]);
                  requests.shift();
                  allowNo.removeEventListener("click", no);
                  requester();
                };
                no = () => {
                  send("allowNo", requests[0]);
                  requests.shift();
                  allowYes.removeEventListener("click", yes);
                  requester();
                };
                allowYes.addEventListener("click", yes, { once: true });
                allowNo.addEventListener("click", no, { once: true });
              }
              requests = data;
              requester();
              break;
            }
            case "RETURNtankmeta": {
              tankmeta = data;
              resolveDraw2();
              console.log("tankMeta recived");
              break;
            }
            case "NewMessages": {
              playerMessages = data;
              break;
            }
            case "playerMessage": {
              playerMessages.push({
                text: data.text,
                exspiretime: data.exspiretime,
                id: data.id,
                hidetime: data.hidetime,
              });
              let index_ = playerMessages.indexOf({
                text: data.text,
                exspiretime: data.exspiretime,
                id: data.id,
                hidetime: data.hidetime,
              });
              setTimeout(() => {
                playerMessages = playerMessages.splice(0, index_);
              }, data.exspiretime);
              break;
            }
            case "Levels": {
              levels = data;
              resolveDraw3();
              console.log("levelDataRecived");
              break;
            }
            case "handshake": {
              HANDSHAKE = data;
              break;
            }
            case "updaterHeal": {
              if (!players[data.id]) return;
              players[data.id].playerHealTime = data.HEALTime;
              break;
            }
            case "playerHeal": {
              players[data.id].health = data.HEALTH;
              if (data.id === playerId) {
                playerHealth = data.HEALTH;
              }
              break;
            }
            case "statsTreeRestart": {
              players[data.id].statsTree = data.stats;
              break;
            }
            case "autoCannonUPDATE-ADD": {
              autocannons = data;
              break;
            }
            case "badgeToplayer": {
              badge = data.badge;
              img.src = `${
                window.location.href ===
                "http://127.0.0.1:5501/public/index.html"
                  ? "/public/"
                  : ""
              }${badge}`;
              break;
            }
            case "announcements": {
              announcements = data;
              break;
            }
            case "boardUpdate": {
              leader_board = data.leader_board;
              break;
            }
            case "autoCannonUPDATE-ANGLE": {
              autocannons.forEach((cannon_ooo) => {
                if (cannon_ooo.CannonID === data.cannon_ID) {
                  cannon_ooo.angle = data.angle;
                }
              });
              break;
            }
            case "playerMoved": {
              players[data.id].x = data.x;
              players[data.id].y = data.y;
              break;
            }
            case "playerCannonUpdated": {
              try {
                if (data.receiver) {
                  if (data.receiver === playerId) {
                    players[data.id].cannon_angle = data.cannon_angle;
                  }
                } else {
                  players[data.id].cannon_angle = data.cannon_angle;
                }
              } catch {}
              break;
            }
            case "playerLeft": {
              players = Object.entries(players).reduce(
                (newPlayers, [key, value]) => {
                  if (key !== data["playerID"]) {
                    newPlayers[key] = value;
                  }
                  return newPlayers;
                },
                {}
              );
              break;
            }
            case "playerDied": {
              if (data["playerID"] === playerId) {
                setTimeout(() => {
                  document.getElementById("die").style.display = "block";
                  document.getElementById("container").style.display = "none";
                  document.getElementById("tanktiles").style.display = "none";
                  if (isCrazyGames) window.CrazyGames.SDK.game.gameplayStop();
                }, 10);

                dead = true;

                clearInterval(healer);
                autoIntevals;
                autoIntevals.forEach((timeout) => {
                  clearTimeout(timeout);
                });
                autoIntevals = [];

                fireOnce = () => {};
                FireIntervale = () => {};

                canvas = document.getElementById("myCanvas");
                canvas.style["z-index"] = "5";
                let respawn = document.createElement("button");

                send = (type, data) => {};

                respawn.innerHTML = "Respawn";
                respawn.style.position = "absolute";
                respawn.style.top = "calc(50vh - 50px)";
                respawn.style.left = "calc(50vw - 100px)";
                respawn.style.width = "200px";
                respawn.style.height = "100px";
                respawn.style["z-index"] = "12";
                document.getElementsByTagName("body")[0].style.cursor = "auto";
                document.getElementById("game").appendChild(respawn);
                const reload_ = () => {
                  if (isCrazyGames) {
                    const callbacks = {
                      adFinished: () => {
                        socket.close();
                        ongame();
                      },
                      adError: (error) => {
                        socket.close();
                        ongame();
                      },
                      adStarted: () => {},
                    };
                    window.CrazyGames.SDK.ad.requestAd("midgame", callbacks);
                  } else {
                    socket.close();
                    ongame();
                  }
                };
                respawn.addEventListener("click", reload_);
              } else if (data["rewarder"] === playerId && data.reward) {
                score += data.reward;
              }

              players = Object.entries(players).reduce(
                (newPlayers, [key, value]) => {
                  if (key !== data["playerID"]) {
                    newPlayers[key] = value;
                  }
                  return newPlayers;
                },
                {}
              );
              break;
            }
            case "bossUpdate": {
              bosses = data;
              break;
            }
            case "playerDamaged": {
              players[data.player1.id].health = data.player1.health;
              if (data.player2.id === playerId) {
                playerHealth = data.player2.health;
                playerHealTime = 0;
                state = "damaged";
                statecycle = 0;
                send("statechange", {
                  state: state,
                  statecycle: statecycle,
                });
                setTimeout(() => {
                  state = "normal";
                  statecycle = 0;
                  send("statechange", {
                    state: state,
                    statecycle: statecycle,
                  });
                }, 1000);
              }
              if (data.player1.id === playerId) {
                playerHealth = data.player1.health;
                playerHealTime = 0;
                state = "damaged";
                statecycle = 0;
                send("statechange", {
                  state: state,
                  statecycle: statecycle,
                });
                setTimeout(() => {
                  state = "normal";
                  statecycle = 0;
                  send("statechange", {
                    state: state,
                    statecycle: statecycle,
                  });
                }, 1000);
              }
              players[data.player2.id].health = data.player2.health;
              break;
            }
            case "bulletUpdate": {
              bullets = data;
              break;
            }
            case "roadUpdate": {
              roads = data;
              break;
            }
            case "playerJoined": {
              console.log(data);
              players[data.id] = data; // Update the local player list
              if (playerId !== data.id) {
                send("updatePlayer", {
                  id: playerId,
                  x: playerX,
                  y: playerY,
                  health: playerHealth,
                  speed: playerSpeed,
                  size: playerSize,
                  bodyDamage: bodyDamage,
                  cannonW: cannonWidth,
                  cannonH: 0,
                  __type__: __type__,
                  cannon_angle: getCannonAngle(),
                  score: score,
                  username: username,
                  level: level,
                  state: state,
                  statecycle: statecycle,
                  playerHealTime: playerHealTime,
                  maxhealth: maxhealth,
                  playerReheal: playerReheal,
                  FOV: scaleFactor,
                  canvasW: canvas.width,
                  canvasH: canvas.height,
                  MouseX: MouseX_,
                  Regenspeed: Regenspeed,
                  MouseY: MouseY_,
                  screenWidth: canvas.width,
                  screenHeight: canvas.height,
                  autoFiring: autoFiring,
                  skin: skin,
                  statsTree: {
                    Health: 1,
                    "Body Damage": 1,
                    Regen: 1,
                    "Bullet Pentration": 1,
                    "Bullet Speed": 1,
                    "Bullet Damage": 1,
                    "Bullet Reload": 1,
                    Speed: 1,
                  },
                  team: teamOn,
                  userId: userId,
                });
              }
              setTimeout(() => {
                send("healrate", {
                  playerReheal: playerReheal,
                });
              }, 3000);
              break;
            }
            case "playerScore": {
              players[data["bulletId"]].score += data.socrepluse;
              if (data["bulletId"] === playerId) {
                score += data.socrepluse;
              }
              levelHANDLER();
              if (data.kill && isCrazyGames) {
                window.CrazyGames.SDK.game.happytime();
              }
              break;
            }
            case "dronekilled": {
              if (data.droneID === playerId) {
                drones -= 1;
              }
              break;
            }
            case "colorUpgrades": {
              colorUpgrades = data;
              break;
            }
            case "teamColorUpgrades": {
              teamColorUpgrades = data;
              break;
            }
            case "UpdateStatTree": {
              if (data.StatUpgradetype === "Health") {
                players[data.id].health =
                  (players[data.id].health / 2) * data.levelmultiplyer;
                players[data.id].maxhealth =
                  players[data.id].maxhealth * data.levelmultiplyer;
                if (data.id === playerId) {
                  playerHealth =
                    (players[data.id].health / 2) * data.levelmultiplyer;
                  maxhealth = players[data.id].maxhealth * data.levelmultiplyer;
                }
              }
              if (data.StatUpgradetype === "Body Damage") {
                players[data.id].bodyDamage *= data.levelmultiplyer;
                if (data.id === playerId) {
                  bodyDamage *= data.levelmultiplyer;
                }
              } else if (data.StatUpgradetype === "Speed") {
                players[data.id].speed *= data.levelmultiplyer;
              } else if (data.StatUpgradetype === "Bullet Reload") {
                if (data.id === playerId) {
                  __reload__ /= data.levelmultiplyer;
                }
              }
              break;
            }
            case "healerRestart": {
              players[data.id].Regenspeed = data.Regenspeed;
              if (data.id === playerId) {
                Regenspeed = data.Regenspeed;
              }
              break;
            }
            case "pubteamlist": {
              pubteams = data;
              var teamcontainer = document.getElementById("teamcontainer");
              teamcontainer.innerHTML = "";
              buildTeamList();
              break;
            }
            case "privateteamlist": {
              privateteamlist = data;
              var teamcontainer = document.getElementById("teamcontainer");
              teamcontainer.innerHTML = "";
              buildTeamList();
              break;
            }
            case "JoinTeamSuccess": {
              if (data.id === playerId) {
                joinedTeam = true;
                socialContainer.style.display = "block";
              }
              if (isCrazyGames) {
                const link = window.CrazyGames.SDK.game.inviteLink({
                  teamId: data.teamId,
                });
              }
              break;
            }
            case "playerJoinedTeam": {
              players[data.id].team = data.teamId;
              if (data.id === playerId && data.teamId !== null) {
                joinedTeam = true;
                socialContainer.style.display = "block";
                if (isCrazyGames) {
                  const link = window.CrazyGames.SDK.game.inviteLink({
                    teamId: data.teamId,
                  });
                }
                teamOn = data.teamId;
              }
              if (data.id === playerId && data.teamId === null) {
                joinedTeam = false;
                socialContainer.style.display = "none";
                if (isCrazyGames) window.CrazyGames.SDK.game.hideInviteButton();
                owner_of_team = false;
                deconvertTeamInterface();
                teamOn = null;
              }
              break;
            }
            case "newOwner": {
              if (data.teamID === teamOn) {
                owner_of_team = true;
                convertTeamInterface();
                buildTeamList();
              }
              break;
            }
            case "bulletDamage": {
              if (players[data.playerID]) {
                players[data.playerID].health = data.playerHealth;

                if (data.playerID == playerId) {
                  playerHealth = data.playerHealth;
                  send("playerHealintterupted", {});
                  playerHealTime = 0;
                  state = "damaged";
                  send("statechange", {
                    state: state,
                    statecycle: statecycle,
                  });
                  setTimeout(() => {
                    state = "normal";
                    send("statechange", {
                      state: state,
                      statecycle: statecycle,
                    });
                  }, 1000);
                }
              } else {
                console.warn(
                  "Received bulletDamage for an unknown player:",
                  data.playerID
                );
              }
              break;
            }
            case "bulletHeal": {
              if (players[data.playerID]) {
                players[data.playerID].health = data.playerHealth;
                if (data.playerID === playerId) {
                  playerHealth = data.playerHealth;
                }
              } else {
                console.warn(
                  "Received bulletDamage for an unknown player:",
                  data.playerID
                );
              }
              break;
            }
            case "shapeDamage": {
              if (players[data.PlayerId]) {
                players[data.PlayerId].health -= data.playerDamage;

                if (data.PlayerId == playerId) {
                  state = "damaged";
                  //statecycle = 0;
                  send("statechange", {
                    state: state,
                    statecycle: statecycle,
                  });
                  setTimeout(() => {
                    state = "normal";
                    //statecycle = 0;
                    send("statechange", {
                      state: state,
                      statecycle: statecycle,
                    });
                  }, 1000);
                  playerHealth -= data.playerDamage;
                  playerHealTime = 0;
                  send("playerHealintterupted", {});
                }
              } else {
                console.warn(
                  "Received shapeDamage for an unknown player:",
                  data.PlayerId
                );
              }
              break;
            }
            case "bouceBack": {
              if (data.playerID !== playerId) return;
              canmove = false;
              movementTimeouts.forEach((timeout) => {
                if (!timeout.bouceBack) {
                  clearTimeout(timeout.timeout);
                }
              });
              movementTimeouts = [];
              let playerSpeed2 = playerSpeed * 2;
              for (let i = 0; i < playerSpeed / 2; i++) {
                let timeout = setTimeout(() => {
                  movePlayer(
                    -((data.response.x * 1.1) / playerSpeed2),
                    -((data.response.y * 1.1) / playerSpeed2)
                  );
                  if (i < playerSpeed / 2) canmove = true;
                }, 85 * i);
                movementTimeouts.push({ timeout: timeout, bouceBack: true });
              }
              break;
            }
            case "type_Change": {
              for (const prop in data) {
                let tempData = data[prop];
                players[data.id][prop] = tempData;
              }
              break;
            }
            case "postBiteMessage": {
              console.log(data);
              data.forEach((message) => {
                var socialContainer =
                  document.getElementById("socialContainer");

                socialContainer.innerHTML = `
                  <div class="con-435874358">
                    <div class="social-con">
                      <div class="socialLevelDiv" id="social">
                        <div class="socialContainer">
                          <div class="flexbuild">
                            <textarea
                              cols="30"
                              class="textsocial"
                              id="posttext"
                              maxlength="256"
                            ></textarea>
                            <button class="post-button" id="postBite">Post a bite</button>
                          </div>
                          <a style="font-size: 10px" href="/posting-policy.html"
                            >By posting your are agreeing to Tankshark's Posting Policy
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                `;
                var socialBox = document.getElementById("social");
                var contentdiv = document.createElement("div");
                var pContent = document.createElement("p");
                contentdiv.classList.add("message");
                pContent.innerText = `${message.username}: ${message.message}`;
                contentdiv.appendChild(pContent);
                pContent.style.display = "block";
                for (let i = 0; i < 2; i++) {
                  var imgDiv = document.createElement("div");
                  var imglike = document.createElement("img");
                  imglike.src = imgsrcs[i];
                  contentdiv.appendChild(imgDiv);
                  imglike.classList.add("like-dislike-img");
                  imgDiv.classList.add("like-dislike-div");
                  imglike.addEventListener("click", () => {
                    send("likeDislike", {
                      id: message.id,
                      type: i,
                    });
                  });
                  imgDiv.appendChild(imglike);
                  imgDiv.style.display = "inline-block";
                  var gentratedNames = () => {
                    var namestring = "";
                    if (i === 0) {
                      message.dislikers.forEach((name) => {
                        namestring += name + "\n";
                      });
                    }
                    if (i === 1) {
                      message.likers.forEach((name) => {
                        namestring += name + "\n";
                      });
                    }
                    return namestring;
                  };
                }
                contentdiv.innerHTML += `<style>.like-dislike-div:hover::after {content: "${gentratedNames()}" !important}</style>`;
                socialBox.insertBefore(contentdiv, socialBox.children[0]);
              });
              break;
            }
            case "statechangeUpdate": {
              if (!players[data.playerID]) return;
              players[data.playerID].state = data.state;
              if (data.playerID === playerId) {
                state = data.state;
              }
              break;
            }
            case "autoAngle": {
              swivelAngle = data;
              break;
            }
            case "statecycleUpdate": {
              if (!players[data.playerID]) return;
              players[data.playerID].statecycle = data.statecycle;
              if (data.playerID === playerId) {
                statecycle = data.statecycle;
              }
              break;
            }
            case "playerCannonWidthUpdate": {
              players[data.id].cannonW = data.cannonW;
              break;
            }
            case "playerCannonUpdatedInactive": {
              MouseX_ = data.MouseX_;
              MouseY_ = data.MouseY_;
              autoAngle = data.autoAngle;
              break;
            }
            case "newid": {
              resolveDraw5();
              console.log("NewId");
              userId = data.newid;
              setCookie("userId", userId, 99999);
              break;
            }
            case "secureId": {
              resolveDraw5();
              console.log("NewId");
              userId = data.newid;
              setCookie("secureId", userId, 99999);
              break;
            }
            case "resovleID": {
              resolveDraw5();
              console.log("idResovled");
              break;
            }
            case "playerSpeedBoost": {
              if (data.id === playerId) speedBoost = data.speedMultiplyer;
              break;
            }
            default: {
              console.log("Empty action received.", type);
              break;
            }
          }
        };

        var miniMapButton = document.getElementById("miniMap");

        var buyMiniMap = () => {
          send("requestUpgrade", {
            upgradeType: "miniMap",
            teamId: teamOn,
          });
        };

        miniMapButton.addEventListener("click", buyMiniMap);

        const windowSateChange = () => {
          send("windowStateChange", {
            vis: document.visibilityState,
            id: playerId,
          });
        };
        document.addEventListener("visibilitychange", windowSateChange);

        const movePlayer = (dx, dy, last, i) => {
          dx *= speedBoost;
          dy *= speedBoost;
          movementTimeouts.shift();
          if (!canmove) return;
          cavansX += dx;
          playerY += dy;
          cavansY += dy;
          playerX += dx;

          if (i in nolist) return; // just roll with it
          send("playerMoved", {
            x: playerX,
            y: playerY,
            dx: dx,
            dy: dy,
            last: last,
          });
        };

        const healer = setInterval(() => {
          playerHealTime += 1;
          send("AddplayerHealTime", {
            playerHealTime: playerHealTime,
            maxhealth: maxhealth,
          });
        }, 1000);

        function setCookie(cname, cvalue, exdays) {
          const d = new Date();
          d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
          let expires = "expires=" + d.toUTCString();
          document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        }

        const typing = (event) => {
          keysPressed[event.key] = true;
          if (messaging) {
            if (
              !keysPressed["Backspace"] &&
              !keysPressed["Delete"] &&
              !keysPressed["Enter"] &&
              typedtext.length < 35
            ) {
              typedtext += event.key;
            } else {
              typedtext = typedtext.slice(0, -1);
            }
          }
          if (keysPressed["Enter"]) {
            if (messaging && typedtext !== "") {
              send("playerSend", { text: typedtext });
              typedtext = "";
            }
            if (!messaging) {
              function blink() {
                blinking = !blinking;
                if (messaging) {
                  setTimeout(() => {
                    blink();
                  }, 530);
                }
              }
              setTimeout(() => {
                blink();
              }, 530);
            }
            messaging = !messaging;
          }
        };
        if (window.outerHeight > window.outerWidth) {
          var mouseUpPress = false;
          document.getElementById("keyscontainer").style.display = "block";
          document.getElementById("up").addEventListener("touchstart", () => {
            mouseUpPress = true;
            if (!messaging) {
              keysPressed["ArrowUp"] = true;
            }
          });
          document.getElementById("up").addEventListener("touchend", () => {
            mouseUpPress = false;
            delete keysPressed["ArrowUp"];
          });

          var mouseDownPress = false;
          document.getElementById("down").addEventListener("touchstart", () => {
            mouseDownPress = true;
            if (!messaging) {
              keysPressed["ArrowDown"] = true;
            }
          });
          document.getElementById("down").addEventListener("touchend", () => {
            mouseDownPress = false;
            delete keysPressed["ArrowDown"];
          });

          var mouseLeftPress = false;
          document.getElementById("left").addEventListener("touchstart", () => {
            mouseLeftPress = true;
            if (!messaging) {
              keysPressed["ArrowLeft"] = true;
            }
          });
          document.getElementById("left").addEventListener("touchend", () => {
            mouseDownPress = false;
            delete keysPressed["ArrowLeft"];
          });

          var mouseRightPress = false;
          document
            .getElementById("right")
            .addEventListener("touchstart", () => {
              mouseRightPress = true;
              if (!messaging) {
                keysPressed["ArrowRight"] = true;
              }
            });
          document.getElementById("right").addEventListener("touchend", () => {
            mouseRightPress = false;
            delete keysPressed["ArrowRight"];
          });
        }

        document.addEventListener("keydown", typing);

        document.addEventListener("keyup", (event) => {
          delete keysPressed[event.key];
        });

        const mousemove = (evt) => {
          var mousepos = getMousePos(window, evt);
          if (!autoRotating && !lockautoRotating) {
            MouseX_ = mousepos.x;
            MouseY_ = mousepos.y;
            let __angle__ = getCannonAngle();
            send("playerCannonMoved", {
              cannon_angle: __angle__,
              MouseX: MouseX_,
              MouseY: MouseY_,
            });
          }
          MouseX = mousepos.x;
          MouseY = mousepos.y;
        };
        document.addEventListener("mousemove", mousemove);

        function generateRandomNumber(min, max) {
          return Math.random() * (max - min) + min;
        }

        const createTeam = () => {
          var teamname = document.getElementById("teamname").value;
          var checked, checked2, checked3;

          var checked = document.getElementById("hidden").checked;
          var checked2 = document.getElementById("private").checked;
          var checked3 = document.getElementById("teamScore").checked;
          var description = document.getElementById("teamDescription").value;

          var govType = document.querySelector(
            'input[name="teamType"]:checked'
          ).value;

          var ScheduledBasedTax =
            document.getElementById("ScheduledBased").value;

          var ScheduledBasedTaxInterval =
            document.getElementById("time-select").value;

          var description = document.getElementById("Simple").value;
          document.getElementById("teambox").style.display = "none";

          joinLeave.innerText = "Leave";

          createDelete.innerText = "Delete";
          send("newTeamCreated", {
            private: checked2,
            hidden: checked,
            name: teamname,
            description: description,
            govType: govType,
            createTeamScore: checked3,
            simpleTax: document.getElementById("Simple").value,
            playerTax: document.getElementById("scoreBased").value,
            ScheduledBasedTax,
            ScheduledBasedTaxInterval,
          });
          owner_of_team = true;
          convertTeamInterface();
        };
        document
          .getElementById("teamButton")
          .addEventListener("click", createTeam);

        function bounceBackAndRecoil(i, Bsize, Bspeed, anlge_) {
          cannonWidth[i] = cannonWidth[i] || 0;
          for (let t = 0; t < 10; t++) {
            setTimeout(() => {
              cannonWidth[i] -= 1;
              send("playerCannonWidth", {
                cannonW: cannonWidth,
              });
            }, 10 * t);
            setTimeout(() => {
              cannonWidth[i] += 1;
              send("playerCannonWidth", {
                cannonW: cannonWidth,
              });
            }, 20 * t); // Updated to prevent overlap
          }

          let recoilX = -((Bsize / 10) * Bspeed * Math.cos(anlge_));
          let recoilY = -((Bsize / 10) * Bspeed * Math.sin(anlge_));
          for (let i = 0; i < playerSpeed; i++) {
            setTimeout(() => {
              movePlayer(recoilX / 15, recoilY / 15, i == playerSpeed - 1);
            }, 15 * i);
          }
        }

        function fireOnce(evt, directer) {
          let tankdata = tankmeta[__type__];
          let tankdatacannon = tankdata.cannons;
          if (!autoFiring && !directer) {
            if (evt.button === 2) return;
          }
          if (teampanelopen) return;

          var angle = getCannonAngle();

          tankdatacannon.forEach((cannon, i) => {
            if (!cannonFireData[i]) return;
            cannonFireData[i] = false;
            setTimeout(() => {
              if (
                cannon.type === "autoCannon" ||
                cannon.type === "SwivelAutoCannon"
              )
                return;
              if (!directer && cannon.type === "directer") return;

              let bullet_size_l = bullet_size * cannon["bulletSize"];

              let randomNumber = generateRandomNumber(-0.2, 0.2);

              if (
                cannon["type"] === "basicCannon" ||
                cannon["type"] === "trap" ||
                cannon["type"] === "AutoBulletCannon"
              ) {
                var xxx = cannon["cannon-width"] - bullet_size_l / 2;
                var yyy = cannon["cannon-height"] - cannon["cannon-height"];
                var angle_ = angle + cannon["offset-angle"];
              } else if (cannon["type"] === "trapezoid") {
                var angle_ = angle + cannon["offset-angle"] + randomNumber;
                var xxx = cannon["cannon-width-top"];
                var yyy =
                  cannon["cannon-height"] -
                  bullet_size_l * 2 -
                  (cannon["cannon-width-top"] / 2) * Math.random();
              } else if (cannon["type"] === "rocketer") {
                var xxx = cannon["cannon-width-bottom"] + bullet_size_l / 2;
                var yyy =
                  cannon["cannon-height"] - cannon["cannon-width-bottom"];
                var angle_ = angle + cannon["offset-angle"];
              } else {
                var xxx = cannon["cannon-height"] + bullet_size_l / 2;
                var yyy = 0;
                var angle_ = angle + cannon["offset-angle"];
              }

              let rotated_offset_x =
                (cannon["offSet-x"] + xxx) * Math.cos(angle_) -
                (cannon["offSet-y"] + yyy) * Math.sin(angle_);
              let rotated_offset_y =
                (cannon["offSet-x"] + xxx) * Math.sin(angle_) +
                (cannon["offSet-y"] + yyy) * Math.cos(angle_);
              let bullet_start_x = playerX + rotated_offset_x;
              let bullet_start_y = playerY + rotated_offset_y;
              let identdfire = Date.now() + Math.random();
              let bullet_speed__ = bullet_speed * cannon["bulletSpeed"];

              bounceBackAndRecoil(i, bullet_size_l, bullet_speed__, angle_);

              let vertices = 0;
              if (
                cannon["type"] === "basicCannon" ||
                cannon["type"] === "trapezoid"
              ) {
                var bulletdistance = bullet_speed__ * 100 * (bullet_size / 6);
                var type = "basic";
                var health = 8;
              } else if (cannon["type"] === "trap") {
                var bulletdistance = bullet_speed__ * 70 * (bullet_size / 20);
                var type = "trap";
                var health = 10;
                const rawvertices = calculateTriangleVertices(
                  bullet_start_x,
                  bullet_start_y,
                  bullet_size_l,
                  0
                );
                vertices = rawvertices;
              } else if (cannon["type"] === "directer") {
                var bulletdistance = 100;
                var type = "directer";
                var health = 10;
                const rawvertices = calculateTriangleVertices(
                  bullet_start_x,
                  bullet_start_y,
                  bullet_size_l,
                  0
                );
                vertices = rawvertices;
              } else if (cannon["type"] === "AutoBulletCannon") {
                var bulletdistance = bullet_speed__ * 105 * (bullet_size / 6);
                var type = "AutoBullet";
                var health = 8;
              } else if (cannon["type"] === "rocketer") {
                var bulletdistance = bullet_speed__ * 100 * (bullet_size / 5);
                var type = "rocketer";
                var health = 9;
              } else if (cannon["type"] === "paver") {
                var bulletdistance = bullet_speed__ * 100 * (bullet_size / 5);
                var type = "roadMap";
                var health = 6;
              }

              let cannon_life = cannon["life-time"] || 0;

              let bullet = {
                type: type,
                bullet_distance: bulletdistance,
                speed: bullet_speed__,
                size: bullet_size_l,
                angle: angle_,
                bullet_damage: bullet_damage * cannon["bulletSize"],
                distanceTraveled: 0,
                vertices: vertices,
                bullet_pentration:
                  bullet_pentration * cannon["bullet_pentration"],
                x: bullet_start_x,
                y: bullet_start_y,
                lifespan: cannon_life,
                parentindex: i,
                health: health,
                xstart: playerX,
                ystart: playerY,
                uniqueid: identdfire,
                cannonIndex: i,
              };

              send("bulletFired", bullet);
            }, cannon.delay * 1000);
            if (
              !(cannonFireData[i] || tankmeta.dronetanks.includes(__type__))
            ) {
              setTimeout(() => {
                cannonFireData[i] = true;
              }, baseFireInterval * tankdata["reaload-m"] * cannon["reloadM"] * __reload__);
            }
          });
        }

        function FireIntervale(evt) {
          let tankdata = tankmeta[__type__];
          let tankdatacannon = tankdata["cannons"];
          if (autoFiring) return;
          if (!autoFiring && evt) {
            if (evt.button === 2) return;
          }
          tankdatacannon.forEach((cannon, i) => {
            firingInterval = setInterval(
              (event = evt, MouseY__ = MouseY_, MouseX__ = MouseX_) => {
                canFire2 = false;
                let angle = getCannonAngle();
                if (autoFiring) return;

                let tankdatacannondata = tankdatacannon[i];
                setTimeout(() => {
                  if (
                    cannon.type === "autoCannon" ||
                    cannon.type === "SwivelAutoCannon"
                  )
                    return;
                  let bullet_size_l = bullet_size * cannon["bulletSize"];

                  let randomNumber = generateRandomNumber(-0.2, 0.2);

                  if (
                    cannon["type"] === "basicCannon" ||
                    cannon["type"] === "trap" ||
                    cannon["type"] === "AutoBulletCannon"
                  ) {
                    var xxx = cannon["cannon-width"] - bullet_size_l / 2;
                    var yyy = cannon["cannon-height"] - cannon["cannon-height"];
                    var angle_ = angle + cannon["offset-angle"];
                  } else if (cannon["type"] === "trapezoid") {
                    var angle_ = angle + cannon["offset-angle"] + randomNumber;
                    var xxx = cannon["cannon-width-top"] - bullet_size_l * 1.5;
                    var yyy =
                      cannon["cannon-height"] -
                      bullet_size_l * 2 -
                      (cannon["cannon-width-top"] / 2) * Math.random();
                  } else if (cannon["type"] === "directer") {
                    var bulletdistance = 100;
                    var type = "directer";
                    var health = 10;
                    const rawvertices = calculateTriangleVertices(
                      bullet_start_x,
                      bullet_start_y,
                      bullet_size_l,
                      0
                    );
                    vertices = rawvertices;
                  } else if (cannon["type"] === "rocketer") {
                    var xxx = cannon["cannon-width-bottom"] + bullet_size_l * 2;
                    var yyy =
                      cannon["cannon-height"] - cannon["cannon-width-bottom"];
                    var angle_ = angle + cannon["offset-angle"];
                  } else {
                    var xxx = cannon["cannon-width-top"] / 2;
                    var yyy = cannon["cannon-width-top"] / 2;
                    var angle_ = angle + cannon["offset-angle"];
                  }

                  let rotated_offset_x =
                    (cannon["offSet-x"] + xxx) * Math.cos(angle_) -
                    (cannon["offSet-y"] + yyy) * Math.sin(angle_);
                  let rotated_offset_y =
                    (cannon["offSet-x"] + xxx) * Math.sin(angle_) +
                    (cannon["offSet-y"] + yyy) * Math.cos(angle_);
                  let bullet_start_x = playerX + rotated_offset_x;
                  let bullet_start_y = playerY + rotated_offset_y;
                  // lol
                  let identdfire = Date.now() + Math.random();
                  let bullet_speed__ = bullet_speed * cannon["bulletSpeed"];

                  bounceBackAndRecoil(i, bullet_size_l, bullet_speed__, angle_);

                  let vertices = 0;
                  if (
                    cannon["type"] === "basicCannon" ||
                    cannon["type"] === "trapezoid"
                  ) {
                    var bulletdistance =
                      bullet_speed__ * 100 * (bullet_size / 6);
                    var type = "basic";
                    var health = 8;
                  } else if (cannon["type"] === "trap") {
                    var bulletdistance =
                      bullet_speed__ * 70 * (bullet_size / 20);
                    var type = "trap";
                    var health = 10;
                    const rawvertices = calculateTriangleVertices(
                      bullet_start_x,
                      bullet_start_y,
                      bullet_size_l,
                      0
                    );
                    vertices = rawvertices;
                  } else if (cannon["type"] === "directer") {
                    var bulletdistance = 100;
                    var type = "directer";
                    var health = 10;
                    bullet_speed__ += 10;
                    const rawvertices = calculateTriangleVertices(
                      bullet_start_x,
                      bullet_start_y,
                      bullet_size_l,
                      0
                    );
                    vertices = rawvertices;
                  } else if (cannon["type"] === "AutoBulletCannon") {
                    var bulletdistance =
                      bullet_speed__ * 105 * (bullet_size / 6);
                    var type = "AutoBullet";
                    var health = 8;
                  } else if (cannon["type"] === "rocketer") {
                    var bulletdistance =
                      bullet_speed__ * 100 * (bullet_size / 5);
                    var type = "rocketer";
                    var health = 9;
                  } else if (cannon["type"] === "paver") {
                    var bulletdistance =
                      bullet_speed__ * 100 * (bullet_size / 5);
                    var type = "roadMap";
                    var health = 6;
                  }

                  let cannon_life = cannon["life-time"] || 0;

                  let bullet = {
                    type: type,
                    bullet_distance: bulletdistance,
                    speed: bullet_speed__,
                    size: bullet_size_l,
                    angle: angle_,
                    bullet_damage: bullet_damage * cannon["bulletSize"],
                    distanceTraveled: 0,
                    vertices: vertices,
                    bullet_pentration:
                      bullet_pentration * cannon["bullet_pentration"],
                    x: bullet_start_x,
                    y: bullet_start_y,
                    lifespan: cannon_life,
                    health: health,
                    parentindex: i,
                    xstart: playerX,
                    ystart: playerY,
                    uniqueid: identdfire,
                    cannonIndex: i,
                  };
                  send("bulletFired", bullet);
                }, tankdatacannondata["delay"] * 1000);
              },
              baseFireInterval *
                tankdata["reaload-m"] *
                cannon["reloadM"] *
                __reload__
            );
            name = JSON.stringify(firingInterval + i);
            firingIntervals[name] = firingInterval;
          });
        }

        const fireCannon = (evt) => {
          if (teampanelopen) return;
          fireOnce(evt, false);
        };
        document.addEventListener("mousedown", fireCannon);

        window.addEventListener("resize", () => {
          scaleby(0);
        });

        const perventEvent = (evt) => {
          if (!teampanelopen) {
            evt.preventDefault();
          }
        };
        document.addEventListener("click", perventEvent);

        let __tankdata__ = tankmeta[__type__];

        function autoengine() {
          __tankdata__ = tankmeta[__type__];
          if (!tankmeta.dronetanks.includes(__type__) && autoFiring) {
            __tankdata__ = tankmeta[__type__];
            if (firingInterval) {
              clearInterval(firingInterval);
              firingInterval = null;
            }
            fireOnce();
          }
          if (tankmeta.dronetanks.includes(__type__)) {
            let i = 0;
            for (var {} in tankmeta[__type__]["cannons"]) {
              if (
                drones <= tankmeta[__type__]["cannons"][i]["max-drones"] &&
                tankmeta[__type__]["cannons"][i].type === "directer"
              ) {
                fireOnce(null, true);
                cannonFireData[i] = true;
                drones += 1;
              }
              i++;
            }
          }

          setTimeout(() => {
            autoengine();
          }, baseFireInterval * __tankdata__["reaload-m"] * __reload__);
        }

        setTimeout(() => {
          autoengine();
        }, baseFireInterval * __tankdata__["reaload-m"] * __reload__);

        var Xbutton = document.getElementById("Xbutton");

        const closeTeamPanel = () => {
          teampanelopen = false;
          var teamcontainer = document.getElementById("teamcontainer");
          var teamMain = document.getElementById("teamMain");
          teamcontainer.style.display = "none";
          teamMain.style.display = "none";
          document.getElementById("confermationScreen").style.display = "none";
          document.getElementById("teambox").style.display = "none";
          document.getElementsByTagName("body")[0].style.cursor =
            "url('https://deip-io3.glitch.me/targetpointer1.cur'), auto";
        };
        Xbutton.addEventListener("click", closeTeamPanel);

        var joinLeave = document.getElementById("join/leave");
        const joinLeaveClick = () => {
          if (!joinedTeam) {
            if (selected_class !== null) {
              send("playerJoinedTeam", {
                teamId: selected_class,
              });
              joinLeave.innerText = "Leave";
              createDelete.style.display = "none";
            }
          } else {
            send("playerLeftTeam", {
              teamId: players[playerId].team,
            });
            createDelete.style.display = "block";
            createDelete.innerText = "Create";
            if (owner_of_team) {
              owner_of_team = false;
              document.getElementById("teambox").style.display = "none";
              deconvertTeamInterface();
              document.getElementById("confermationScreen").style.display =
                "none";
              document.getElementById("upgradesBox").style.display = "none";
            }
            joinLeave.innerText = "Join";
            if (isCrazyGames) window.CrazyGames.SDK.game.hideInviteButton();
            joinedTeam = false;
            socialContainer.style.display = "none";
            selected_class = null;
          }
        };
        joinLeave.addEventListener("click", joinLeaveClick);

        var createDelete = document.getElementById("create/delete");

        const deleteTeam = () => {
          if (!owner_of_team) {
            document.getElementById("teambox").style.display = "block";
          } else if (owner_of_team && joinedTeam) {
            send("deleteTeam", { teamID: teamOn });
          }
        };
        createDelete.addEventListener("click", deleteTeam);

        const canvasOpener = (evt) => {
          if (
            window.innerWidth - 475 < MouseX &&
            MouseX < window.innerWidth - 275 &&
            MouseY > 10 &&
            MouseY < 110 &&
            !teampanelopen
          ) {
            teampanelopen = true;
            var teamcontainer_ = document.getElementById("teamMain");
            teamcontainer_.style.display = "block";
            selected_class = null;
            document.getElementsByTagName("body")[0].style.cursor = "auto";
            var teamcontainer = document.getElementById("teamcontainer");
            teamcontainer.style.display = "block";
            teamcontainer.style.height = "95%";
            teamcontainer.style.margin = "5px";
            teamcontainer.innerHTML = "";
            buildTeamList();

            return;
          }
          if (teampanelopen) {
            return;
          }
          if (
            !tankmeta.dronetanks.includes(__type__) &&
            !teampanelopen &&
            !dead
          ) {
            FireIntervale(evt);
          } else {
            if (evt.button === 2 && !dead) {
              send("MouseAway", {});
            }
          }
        };
        document.addEventListener("mousedown", canvasOpener);

        const mouseStateChange = () => {
          for (const interval in firingIntervals) {
            firingInterval = firingIntervals[interval];
            clearInterval(firingInterval);
            firingInterval = null;
            canFire2 = true;
          }

          send("MousestateUpdate", {});
        };
        document.addEventListener("mouseup", mouseStateChange);
      }, 0);
    };

    function drawRoundedLevelBar(
      ctx,
      x,
      y,
      width,
      height,
      radius,
      progress,
      barcolor,
      barXP,
      barbourder,
      filllevel
    ) {
      // Full bar
      ctx.fillStyle = barcolor;
      if (barbourder !== false) {
        ctx.strokeStyle = barbourder;
      }
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
      ctx.fill();
      if (barbourder) {
        ctx.stroke();
      }
      ctx.closePath();
      // Filled bar (progress)
      var filledWidth = width * progress;
      if (filledWidth < 0) filledWidth = 0;
      ctx.fillStyle = barXP;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      if (filledWidth > radius) {
        ctx.lineTo(x + filledWidth - radius, y);
        if (filledWidth < width - radius) {
          ctx.quadraticCurveTo(x + filledWidth, y, x + filledWidth, y + radius);
          ctx.lineTo(x + filledWidth, y + height - radius);
          ctx.quadraticCurveTo(
            x + filledWidth,
            y + height,
            x + filledWidth - radius,
            y + height
          );
        } else {
          ctx.lineTo(x + width - radius, y);
          ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
          ctx.lineTo(x + width, y + height - radius);
          ctx.quadraticCurveTo(
            x + width,
            y + height,
            x + width - radius,
            y + height
          );
          ctx.lineTo(x + filledWidth - radius, y + height);
        }
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
      } else {
        ctx.beginPath();
        ctx.roundRect(x, y, filledWidth, height, radius);
      }
      ctx.closePath();

      ctx.fill();

      if (filllevel) {
        ctx.fillStyle = "#0228c2";
        ctx.strokeStyle = "black";
        ctx.textAlign = "center";
        ctx.font = `bold ${40 * (1 + (1 - scaleFactor))}px Nunito`;
        ctx.strokeText(level, canvas.width / 2, canvas.height - button10 * 6);
        ctx.fillText(level, canvas.width / 2, canvas.height - button10 * 6);

        try {
          ctx.drawImage(
            img,
            canvas.width / 2 - button40 / 2,
            canvas.height - button10 * 15,
            button40,
            button40
          );
        } catch {}
      }
    }

    const movePlayer = (dx, dy, last) => {
      movementTimeouts.shift();
      const steps = 10; // Number of interpolation steps
      const stepX = dx / steps;
      const stepY = dy / steps;

      for (let i = 0; i < steps; i++) {
        setTimeout(() => {
          cavansX += stepX;
          playerY += stepY;
          cavansY += stepY;
          playerX += stepX;

          if (i === steps - 1) {
            send("playerMoved", {
              x: playerX,
              y: playerY,
              dx: dx,
              dy: dy,
              last: last,
            });
          }
        }, i * 16); // 16ms per step for ~60fps
      }
    };

    function MathHypotenuse(x, y) {
      return Math.sqrt(x * x + y * y);
    }

    const checkCollisions = () => {
      for (let playerId_ in players) {
        let player = players[playerId_];
        let distance = MathHypotenuse(player.x - playerX, player.y - playerY);

        if (
          distance <
            player.size * playerBaseSize + playerSize * playerBaseSize &&
          playerId_ !== playerId &&
          !(
            players[playerId_]?.team === players[playerId]?.team &&
            players[playerId_]?.team !== null &&
            players[playerId]?.team !== null
          )
        ) {
          send("playerCollided", {
            id_other: playerId_,
            damagetaken: player.bodyDamage,
            damagegiven: bodyDamage,
            id_self: playerId,
          });
          playerHealTime = 0;
          send("playerHealintterupted", {});
          canmove = false;
          setTimeout(() => {
            canmove = true;
          }, 10 * playerSpeed);
          if (player.x < playerX /* left */) {
            for (let c = 0; c < playerSpeed; c++) {
              setTimeout(() => {
                movePlayer(-2, 0, c === playerSpeed - 1, c);
              }, 50 * c);
            }
          }
          if (player.x > playerX /* right */) {
            for (let c = 0; c < playerSpeed; c++) {
              setTimeout(() => {
                movePlayer(2, 0, c === playerSpeed - 1, c);
              }, 50 * c);
            }
          }
          if (player.y > playerY /* up */) {
            for (let c = 0; c < playerSpeed; c++) {
              setTimeout(() => {
                movePlayer(0, -2, c === playerSpeed - 1, c);
              }, 50 * c);
            }
          }
          if (player.y < playerY /* down */) {
            for (let c = 0; c < playerSpeed; c++) {
              setTimeout(() => {
                movePlayer(0, 2, c === playerSpeed - 1, c);
              }, 50 * c);
            }
          }
          // Reverse the last movement
        } else if (
          distance <
            player.size * playerBaseSize + playerSize * playerBaseSize &&
          playerId_ !== playerId
        ) {
          canmove = false;
          setTimeout(() => {
            canmove = true;
          }, 10 * playerSpeed);
          if (player.x < playerX /* left */) {
            for (let c = 0; c < playerSpeed; c++) {
              setTimeout(() => {
                movePlayer(-2, 0, c === playerSpeed - 1, c);
              }, 50 * c);
            }
          }
          if (player.x > playerX /* right */) {
            for (let c = 0; c < playerSpeed; c++) {
              setTimeout(() => {
                movePlayer(2, 0, c === playerSpeed - 1, c);
              }, 50 * c);
            }
          }
          if (player.y > playerY /* up */) {
            for (let c = 0; c < playerSpeed; c++) {
              setTimeout(() => {
                movePlayer(0, -2, c === playerSpeed - 1, c);
              }, 50 * c);
            }
          }
          if (player.y < playerY /* down */) {
            for (let c = 0; c < playerSpeed; c++) {
              setTimeout(() => {
                movePlayer(0, 2, c === playerSpeed - 1, c);
              }, 50 * c);
            }
          }
        }
      }
    };

    const handleMovement = (dx, dy) => {
      if (
        playerX + dx > mapLeft &&
        playerX + dx < mapRight &&
        playerY + dy > mapTop &&
        playerY + dy < mapBottom
      ) {
        for (let i = 0; i < playerSpeed / 2; i++) {
          var movement = setTimeout(() => {
            movePlayer(dx, dy, i === playerSpeed - 1 || i === 0);
          }, 80 * i);
          movementTimeouts.push({ timeout: movement, bouceBack: true });
        }
        checkCollisions(dx, dy);
      } else if (playerX + dx > mapLeft && dy === 0) {
        movementTimeouts.forEach((timeout) => {
          clearTimeout(timeout.timeout);
        });
        movementTimeouts = [];
        for (let i = 0; i < playerSpeed / 3; i++) {
          var movement = setTimeout(() => {
            movePlayer(-3, 0, i === playerSpeed - 1 || i === 0);
          }, 75 * i);
          movementTimeouts.push({ timeout: movement, bouceBack: true });
        }
      } else if (playerX + dx < mapRight && dy === 0) {
        movementTimeouts.forEach((timeout) => {
          clearTimeout(timeout.timeout);
        });
        movementTimeouts = [];
        for (let i = 0; i < playerSpeed / 3; i++) {
          var movement = setTimeout(() => {
            movePlayer(3, 0, i === playerSpeed - 1 || i === 0);
          }, 75 * i);
          movementTimeouts.push({ timeout: movement, bouceBack: true });
        }
      } else if (playerY > -mapTop) {
        movementTimeouts.forEach((timeout) => {
          clearTimeout(timeout.timeout);
        });
        movementTimeouts = [];
        for (let i = 0; i < playerSpeed / 3; i++) {
          var movement = setTimeout(() => {
            movePlayer(0, -3, i === playerSpeed - 1 || i === 0);
          }, 75 * i);
          movementTimeouts.push({ timeout: movement, bouceBack: true });
        }
      }
      if (playerY < -mapBottom) {
        movementTimeouts.forEach((timeout) => {
          clearTimeout(timeout.timeout);
        });
        movementTimeouts = [];
        for (let i = 0; i < playerSpeed / 3; i++) {
          var movement = setTimeout(() => {
            movePlayer(0, 3, i === playerSpeed - 1 || i === 0);
          }, 75 * i);
          movementTimeouts.push({ timeout: movement, bouceBack: true });
        }
      }
    };
    var oWidth = canvas.width;
    var oHieght = canvas.height;

    function rotatePointAroundPlayer(
      cannonOffsetX,
      cannonOffsetY,
      playerRotation
    ) {
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

    var scaleFactor = 1;

    function scaleby(scaleDown) {
      scaleFactor -= scaleDown;
      oWidth = window.innerWidth;
      oHieght = window.innerHeight;
      canvas.width = oWidth;
      canvas.height = oHieght;
      var upscaleX_ = oWidth / (canvas.width * scaleFactor);
      var upscaleY_ = oHieght / (canvas.height * scaleFactor);
      canvas.width *= upscaleX_;
      canvas.height *= upscaleY_;
      ctx.scale(scaleFactor, scaleFactor);
      send("FOVUpdate", {
        scaleFactor: scaleFactor,
        canvasW: canvas.width,
        canvasH: canvas.height,
        screenW: oWidth,
        screenH: oHieght,
      });
      Ghostcanvas.width = oWidth;
      Ghostcanvas.height = oHieght;
      boundrectcanvas = Ghostcanvas.getBoundingClientRect();
      var canW1 = canW;
      var canH1 = canH;
      canW = canvas.width;
      canH = canvas.height;
      playerX -= canW1 / 2;
      playerY -= canH1 / 2;
      playerX += canW / 2;
      playerY += canH / 2;
      playerX -= canW / 2 - canW1 / 2;
      playerY -= canH / 2 - canH1 / 2;
      cavansX -= canW / 2 - canW1 / 2;
      cavansY -= canH / 2 - canH1 / 2;
      teamwidth = 0.15625 * canvas.width; // 297.1875
      teamheight = 0.33333333333333333333333333 * canvas.height;
      innerteamwidth = 0.14322916666 * canvas.width;
      innerteamheight = 0.308333333333333333333 * canvas.height;
      innerteamwidthreal = 0.14322916666 * window.innerWidth;
      innerteamheightreal = 0.308333333333333333333 * window.innerHeight;
      buttton140 = 0.07291666666 * canvas.width; // tested screen height is 1031x1920
      button275 = 0.14322916666 * canvas.width;
      button375 = 137.499999994 * upscaleX_ + 237.5 * upscaleX_;
      button462_5 = 87.5 * upscaleX_ + button375;
      button475 = 100 * upscaleX_ + button375;
      button80 = 0.07759456838 * canvas.height;
      button40 = 0.0208333333 * canvas.width;
      button10 = 0.00969932104 * canvas.height;
      button110 = 0.10669253152 * canvas.height;
      barWidth = 0.3125 * canvas.width;
      barHeight = 0.02909796314 * canvas.height;
      document.getElementById("gridLight").style[
        "grid-template-columns"
      ] = `repeat(10, ${999 * scaleFactor + 1}px)`;
      document.getElementById("gridLight").style[
        "grid-template-rows"
      ] = `repeat(10, ${999 * scaleFactor + 1}px)`;
      document.getElementById("gridLight").style.width = `${
        10000 * scaleFactor
      }px`;
      document.getElementById("gridLight").style.height = `${
        10000 * scaleFactor
      }px`;
      document.getElementById("gridLight").childNodes.forEach((node) => {
        node.style.width = `${999 * scaleFactor}px`;
        node.style.height = `${999 * scaleFactor}px`;
      });
      document.getElementById("gridDark").style[
        "grid-template-columns"
      ] = `repeat(10, ${999 * scaleFactor + 1}px)`;
      document.getElementById("gridDark").style[
        "grid-template-rows"
      ] = `repeat(10, ${999 * scaleFactor + 1}px)`;
      document.getElementById("gridDark").style.width = `${
        10000 * scaleFactor
      }px`;
      document.getElementById("gridDark").style.height = `${
        10000 * scaleFactor
      }px`;
      document.getElementById("gridDark").childNodes.forEach((node) => {
        node.style.width = `${999 * scaleFactor}px`;
        node.style.height = `${999 * scaleFactor}px`;
      });
    }

    function calculateTriangleVertices(x, y, sideLength, angle) {
      const height = (Math.sqrt(3) / 2) * sideLength; // Height of an equilateral triangle
      const radius = height / Math.sqrt(3); // Circumradius of the triangle

      const vertices = [];

      for (let i = 0; i < 3; i++) {
        const theta = angle + i * ((2 * Math.PI) / 3); // 120-degree increments
        const vx = x + radius * Math.cos(theta);
        const vy = y + radius * Math.sin(theta);
        vertices.push({ x: vx, y: vy });
      }

      return vertices;
    }

    class notify {
      constructor(
        ctx,
        announcements,
        width = 500,
        height = 27,
        dropDownTime = 500,
        font = "bold 20px arial",
        textAling = "center",
        margin = 3,
        startHeight = 100,
        shovespeed = 10
      ) {
        this.announcements = announcements;
        this.ctx = ctx;
        this.anoucmentW = width;
        this.anoucmentW2 = width / 2;
        this.anoucmentH = height;
        this.dropDownTime = dropDownTime;
        this.font = font;
        this.textAling = textAling;
        this.boundrectH = height + margin;
        this.startHeight = startHeight;
        this.shovespeed = shovespeed;
        this.shovespeed5 = shovespeed * 5;
        this.boundrectH10 = this.boundrectH - 10;
      }
      run() {
        var shovedown = 50;
        var shoved_down_anoucment = {};
        var exW = 1; // scale factors
        var exH = 1; // scale factors
        var i = 0;
        this.announcements.forEach((anoucment) => {
          if (Date.now() <= anoucment.shovedowndate) {
            i++;
            var shovedownper = 0;
            this.ctx.globalAlpha = anoucment.trans;
            this.ctx.fillStyle = anoucment.color;
            this.ctx.font = "bold 20px arial";
            this.ctx.textAlign = "center";
            this.anoucmentW = anoucment.text.length * 15;
            this.anoucmentW2 = this.anoucmentW / 2;
            if (
              Date.now() >= anoucment.expiretime &&
              Date.now() <= anoucment.shovedowndate
            ) {
              shovedown =
                this.shovespeed5 /
                ((anoucment.shovedowndate - Date.now()) / this.dropDownTime);
              shovedown = shovedown <= 0 ? 0 : shovedown;
              shoved_down_anoucment = anoucment;
            }
            shovedownper = shovedown;
            if (Date.now() <= anoucment.expiretime) {
              shovedownper =
                shovedownper >= this.shovespeed5
                  ? this.shovespeed5
                  : shovedownper;
              shovedownper = shovedownper <= 0 ? 0 : shovedownper;
            }
            if (Date.now() <= shoved_down_anoucment.shovedowndate) {
              var r =
                (shoved_down_anoucment.shovedowndate - Date.now()) /
                  this.shovespeed <
                this.boundrectH
                  ? (shoved_down_anoucment.shovedowndate - Date.now()) /
                    this.shovespeed
                  : this.boundrectH;
              shovedownper -= r;
              shovedownper += this.boundrectH;
            }
            shovedownper = shovedownper <= 0 ? 0 : shovedownper;
            this.ctx.globalAlpha -=
              (canvas.height / 2 -
                (this.startHeight -
                  shovedownper -
                  this.boundrectH10 +
                  i * this.boundrectH * exH)) /
              canvas.height;
            this.ctx.beginPath();
            this.ctx.roundRect(
              canvas.width / 2 - this.anoucmentW2 * exW,
              this.startHeight -
                shovedownper -
                this.boundrectH10 +
                i * this.boundrectH * exH,
              this.anoucmentW * exW,
              this.anoucmentH * exH,
              anoucment.rounding
            );
            this.ctx.fill();
            this.ctx.closePath();
            this.ctx.fillStyle = anoucment.textcolor;
            this.ctx.fillText(
              anoucment.text,
              canvas.width / 2,
              (this.startHeight - shovedownper + i * this.boundrectH) * exH
            );
          }
        });
        this.ctx.globalAlpha = 1;
      }
    }

    var newnotify = new notify(ctx, announcements);

    function drawself(exW, exH) {
      pentarotate += 0.1;
      newnotify.announcements = announcements;
      ctx.fillStyle = squareColor;
      let angle = getCannonAngle();
      if (!messaging) {
        if (canmove) {
          if (keysPressed["]"]) {
            players[playerId].score += 50;
            score += 50;
            levelHANDLER();
          } else if (
            (keysPressed["ArrowLeft"] && keysPressed["ArrowUp"]) ||
            (keysPressed["a"] && keysPressed["w"])
          ) {
            handleMovement(-1, -1);
          } else if (
            (keysPressed["ArrowLeft"] && keysPressed["ArrowDown"]) ||
            (keysPressed["a"] && keysPressed["s"])
          ) {
            handleMovement(-1, 1);
          } else if (
            (keysPressed["ArrowRight"] && keysPressed["ArrowUp"]) ||
            (keysPressed["d"] && keysPressed["w"])
          ) {
            handleMovement(1, -1);
          } else if (
            (keysPressed["ArrowRight"] && keysPressed["ArrowDown"]) ||
            (keysPressed["d"] && keysPressed["s"])
          ) {
            handleMovement(1, 1);
          } else if (keysPressed["ArrowUp"] || keysPressed["w"]) {
            handleMovement(0, -1);
          } else if (keysPressed["ArrowDown"] || keysPressed["s"]) {
            handleMovement(0, 1);
          } else if (keysPressed["ArrowLeft"] || keysPressed["a"]) {
            handleMovement(-1, 0);
          } else if (keysPressed["ArrowRight"] || keysPressed["d"]) {
            handleMovement(1, 0);
          }
        }
        if (canKeyPress) {
          if (keysPressed["-"]) {
            scaleby(0.1);
            waitpls();
          } else if (keysPressed["1"]) {
            if (statsTree["Health"] < maxUP && upgradePoints > 0) {
              statsTree["Health"] += 1;
              upgradePoints -= 1;
              send("statUpgrade", {
                Upgradetype: "Health",
                UpgradeLevel: 1,
              });
            }
            waitpls();
          } else if (keysPressed["2"]) {
            if (statsTree["Body Damage"] < maxUP && upgradePoints > 0) {
              statsTree["Body Damage"] += 1;
              upgradePoints -= 1;
              send("statUpgrade", {
                Upgradetype: "Body Damage",
                UpgradeLevel: 1,
              });
            }
            waitpls();
          } else if (keysPressed["3"]) {
            if (statsTree["Regen"] < maxUP && upgradePoints > 0) {
              statsTree["Regen"] += 1;
              upgradePoints -= 1;
              send("statUpgrade", {
                Upgradetype: "Regen",
                UpgradeLevel: 1,
              });
            }
            waitpls();
          } else if (keysPressed["4"]) {
            if (statsTree["Bullet Pentration"] < maxUP && upgradePoints > 0) {
              statsTree["Bullet Pentration"] += 1;
              upgradePoints -= 1;
              send("statUpgrade", {
                Upgradetype: "Bullet Pentration",
                UpgradeLevel: 1,
              });
            }
            waitpls();
          } else if (keysPressed["5"]) {
            if (statsTree["Bullet Speed"] < maxUP && upgradePoints > 0) {
              statsTree["Bullet Speed"] += 1;
              upgradePoints -= 1;
              send("statUpgrade", {
                Upgradetype: "Bullet Speed",
                UpgradeLevel: 1,
              });
            }
            waitpls();
          } else if (keysPressed["6"]) {
            if (statsTree["Bullet Damage"] < maxUP && upgradePoints > 0) {
              statsTree["Bullet Damage"] += 1;
              upgradePoints -= 1;
              send("statUpgrade", {
                Upgradetype: "Bullet Damage",
                UpgradeLevel: 1,
              });
            }
            waitpls();
          } else if (keysPressed["7"]) {
            if (statsTree["Bullet Reload"] < maxUP && upgradePoints > 0) {
              statsTree["Bullet Reload"] += 1;
              upgradePoints -= 1;
              send("statUpgrade", {
                Upgradetype: "Bullet Reload",
                UpgradeLevel: 1,
              });
            }
            waitpls();
          } else if (keysPressed["8"]) {
            if (statsTree["Speed"] < maxUP && upgradePoints > 0) {
              statsTree["Speed"] += 1;
              upgradePoints -= 1;
              send("statUpgrade", {
                Upgradetype: "Speed",
                UpgradeLevel: 1,
              });
            }
            waitpls();
          } else if (keysPressed["="]) {
            FOV += 0.1;
          } else if (keysPressed["e"]) {
            send("autoFiringUpdate", { autoFiring: !autoFiring });
            if (lockautoRotating) return;
            autoFiring = !autoFiring;
            if (!autoFiring) {
              canFire = true;
            }
            waitpls();
          } else if (keysPressed["c"]) {
            if (autoRotating && !lockautoRotating) {
              send("unrotating", {});
            } else {
              send("rotate", {
                autoAngle: angle * (180 / pi),
                autoIntevals: autoIntevals,
                playerSize: playerSize,
                FOV: scaleFactor,
                canvaswidth: canvas.width,
                canvasheight: canvas.height,
              });
            }
            if (!lockautoRotating) {
              autoRotating = !autoRotating;
            }
            waitpls();
          }
        }
      }

      newnotify.run();

      let tankdata = tankmeta[__type__];

      let tankdatacannon = tankdata["cannons"];

      let FOVplayerz = playerSize;

      if (tankdata.decor) {
        tankdata.decor.forEach((decor_) => {
          if (decor_.type === "octaspinner") {
            ctx.fillStyle = "black";
            ctx.save();
            ctx.translate(canW / 2 + decor_.offsetX, canH / 2 + decor_.offsetY);
            ctx.rotate(angle + decor_.offsetAngle);

            ctx.beginPath();
            for (let i = 0; i < 8; i++) {
              // calculate the rotation
              const rotation = ((Math.PI * 2) / 8) * i;

              // for the first point move to
              if (i === 0) {
                ctx.moveTo(
                  decor_.size * Math.cos(rotation),
                  decor_.size * Math.sin(rotation)
                );
              } else {
                // for the rest draw a line
                ctx.lineTo(
                  decor_.size * Math.cos(rotation),
                  decor_.size * Math.sin(rotation)
                );
              }
            }

            ctx.closePath();
            ctx.fill();
            ctx.restore();
          }
        });
      }

      let gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        (playerSize * playerBaseSize) / 1.5,
        canvas.width / 2,
        canvas.height / 2,
        radiusConfig.radius
      );

      gradient.addColorStop(radiusConfig.build[0], "#FFFFFF00");
      gradient.addColorStop(radiusConfig.build[1], "#61f7ff");
      gradient.addColorStop(radiusConfig.build[2], "#FFFFFF00");

      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        radiusConfig.radius,
        0,
        2 * Math.PI,
        false
      );

      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.closePath();

      for (let i = 0; i < Object.keys(tankdatacannon).length; i++) {
        ctx.fillStyle = "#b3b3b3";
        let tankdatacannondata = tankdatacannon[i];
        let cannon_widthFOV = tankdatacannondata["cannon-width"] * FOVplayerz;
        let cannon_heightFOV = tankdatacannondata["cannon-height"] * FOVplayerz;
        if (tankdatacannondata["type"] === "basicCannon") {
          ctx.save();
          // Translate to the center of the square
          ctx.translate(canW / 2, canH / 2);
          let angle_offset = tankdatacannondata["offset-angle"];
          ctx.rotate(angle + angle_offset);
          // Draw the square
          let basex =
            -cannon_widthFOV / 2 +
            cannon_heightFOV +
            tankdatacannondata["offSet-x"] -
            cannonWidth[i];

          let basey = -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];
          ctx.fillRect(basex, basey, cannon_widthFOV, cannon_heightFOV);
          // Add a border to the cannon
          ctx.strokeStyle = "lightgrey"; // Set border color
          ctx.lineWidth = 3; // Set border width
          ctx.strokeRect(basex, basey, cannon_widthFOV, cannon_heightFOV); // Draw the border
          // Restore the previous transformation matrix
          ctx.restore();
        } else if (
          tankdatacannondata["type"] === "trapezoid" ||
          tankdatacannondata["type"] === "directer"
        ) {
          ctx.save();
          // Translate to the center of the square
          ctx.translate(canW / 2, canH / 2);
          let tankdatacannondata = tankdatacannon[i];
          var angle_offset = tankdatacannondata["offset-angle"];
          ctx.rotate(angle + angle_offset);
          let cannwidthtop =
            tankdatacannondata["cannon-width-top"] * FOVplayerz;
          let cannwidthbottom =
            tankdatacannondata["cannon-width-bottom"] * FOVplayerz;
          let cannonHeight = tankdatacannondata["cannon-height"] * FOVplayerz;
          // Draw the square
          let basex =
            cannwidthbottom / 2 +
            cannon_heightFOV +
            tankdatacannondata["offSet-x"] -
            cannonWidth[i];
          let basey =
            -cannon_heightFOV / 2 +
            cannon_heightFOV / 2 +
            tankdatacannondata["offSet-y"];

          const cannonWidth_top = cannwidthtop;
          const cannonWidth_bottom = cannwidthbottom;

          var canwB2 = cannonWidth_bottom / 2;
          var canwH2 = cannonWidth_top / 2;
          ctx.beginPath();
          ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
          ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
          ctx.lineTo(basex, basey + canwH2);
          ctx.lineTo(basex, basey - canwH2);
          ctx.closePath(); // Close the path
          ctx.fill();

          // Add a border to the cannon
          ctx.strokeStyle = "lightgrey"; // Set border color
          ctx.lineWidth = 3; // Set border width
          ctx.beginPath();
          ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
          ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
          ctx.lineTo(basex, basey + canwH2);
          ctx.lineTo(basex, basey - canwH2);
          ctx.closePath(); // Close the path
          ctx.stroke(); // Draw the border
          ctx.restore();
        }

        if (
          tankdatacannondata["type"] === "trap" ||
          tankdatacannondata["type"] === "paver"
        ) {
          ctx.save();
          // Translate to the center of the square
          ctx.translate(canW / 2, canH / 2);
          let angle_offset = tankdatacannondata["offset-angle"];
          let trapR = tankdatacannondata["trap-to-cannon-ratio"];
          ctx.rotate(angle + angle_offset);
          // Draw the square
          let basex =
            -cannon_widthFOV / 2 +
            cannon_heightFOV +
            tankdatacannondata["offSet-x"] -
            cannonWidth[i];
          let reH = cannon_widthFOV * (1 - trapR);
          let basey = -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];
          ctx.fillRect(basex, basey, cannon_widthFOV - reH, cannon_heightFOV);

          ctx.strokeStyle = "lightgrey";
          ctx.lineWidth = 3; // Set border width
          ctx.strokeRect(basex, basey, cannon_widthFOV - reH, cannon_heightFOV);

          var cannonHeight = reH;
          var cannonWidth_top = cannon_heightFOV * 1.4;
          var cannonWidth_bottom = cannon_heightFOV;

          basex += cannon_widthFOV - trapR;

          var canwB2 = cannonWidth_bottom / 2;
          var canwH2 = cannonWidth_top / 2;
          basey += canwB2 - trapR;
          ctx.beginPath();
          ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
          ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
          ctx.lineTo(basex, basey + canwH2);
          ctx.lineTo(basex, basey - canwH2);
          ctx.closePath(); // Close the path
          ctx.fill();

          // Add a border to the cannon
          ctx.strokeStyle = "lightgrey"; // Set border color
          ctx.lineWidth = 3; // Set border width
          ctx.beginPath();
          ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
          ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
          ctx.lineTo(basex, basey + canwH2);
          ctx.lineTo(basex, basey - canwH2);
          ctx.closePath(); // Close the path
          ctx.stroke(); // Draw the border
          ctx.restore();
          if (tankdatacannondata["type"] === "paver") {
            cannon_widthFOV /= 1.5;
            cannon_heightFOV /= 1.5;
            ctx.save();
            ctx.translate(canW / 2, canH / 2);

            let angle_offset = tankdatacannondata["offset-angle"];
            ctx.rotate(angle + angle_offset);
            // Draw the square
            let basex =
              -cannon_widthFOV / 2 +
              cannon_heightFOV +
              tankdatacannondata["offSet-x"] -
              cannonWidth[i];
            let basey = -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];

            ctx.fillRect(basex, basey, cannon_widthFOV, cannon_heightFOV);

            // Add a border to the cannon
            ctx.strokeStyle = "lightgrey"; // Set border color
            ctx.lineWidth = 3; // Set border width
            ctx.strokeRect(basex, basey, cannon_widthFOV, cannon_heightFOV); // Draw the border
            // Restore the previous transformation matrix
            ctx.restore();
          }
        }
        if (tankdatacannondata["type"] === "SwivelAutoCannon") {
          ctx.save();
          let cannonangle;
          let cannonWidth_;
          autocannons.forEach((cannonA) => {
            if (cannonA.playerid === playerId && cannonA.autoindex === i) {
              cannonangle = cannonA.angle;
              cannonWidth_ = cannonA.cannonWidth;
            }
          });
          var offSet_x = tankdatacannondata["offSet-x"];
          if (tankdatacannondata["offSet-x"] === "playerX") {
            offSet_x = playerSize * playerBaseSize;
          }
          if (tankdatacannondata["offSet-x-multpliyer"]) {
            offSet_x *= -1;
          }

          var [x, y] = rotatePointAroundPlayer(offSet_x, 0, swivelAngle);

          ctx.translate(canW / 2 + x, y + canH / 2);

          let angle = cannonangle;

          let angle_offset = tankdatacannondata["offset-angle"];
          ctx.rotate(angle + angle_offset);
          // Draw the square

          let basex = -cannon_widthFOV / 2 + cannon_heightFOV + 0;
          let basey = -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];

          ctx.beginPath();
          ctx.fillRect(
            basex - 5,
            basey - 2.5,
            cannon_widthFOV + 10 - cannonWidth_,
            cannon_heightFOV + 5
          );

          ctx.strokeStyle = "lightgrey"; // Set border color
          ctx.lineWidth = 3; // Set border width
          ctx.strokeRect(
            basex - 5,
            basey - 2.5,
            cannon_widthFOV + 10 - cannonWidth_,
            cannon_heightFOV + 5
          ); // Draw the border
          // Restore the previous transformation matrix
          ctx.rotate(-(angle + angle_offset));
          ctx.arc(0, 0, cannon_widthFOV / 2, 0, 2 * Math.PI, false);

          ctx.fill();
          ctx.stroke();
          ctx.closePath();
          ctx.restore();
        } else if (tankdatacannondata["type"] === "AutoBulletCannon") {
          ctx.save();
          // Translate to the center of the square
          ctx.translate(canW / 2, canH / 2);
          let angle_offset = tankdatacannondata["offset-angle"];
          ctx.rotate(angle + angle_offset);
          // Draw the square

          let basex =
            -cannon_widthFOV / 2 +
            cannon_heightFOV +
            tankdatacannondata["offSet-x"] -
            cannonWidth[i];
          let basey = -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];
          ctx.fillRect(basex, basey, cannon_widthFOV, cannon_heightFOV);
          // Add a border to the cannon
          ctx.strokeStyle = "lightgrey"; // Set border color
          ctx.lineWidth = 3; // Set border width
          ctx.strokeRect(basex, basey, cannon_widthFOV, cannon_heightFOV); // Draw the border
          // Restore the previous transformation matrix
          ctx.beginPath();
          ctx.arc(
            basex + 40 + cannon_widthFOV / 4,
            basey + cannon_heightFOV / 2,
            (playerSize * FOV * playerBaseSize) / 4,
            0,
            2 * Math.PI,
            false
          );
          ctx.fill();
          ctx.lineWidth = 5;
          ctx.strokeStyle = "lightgrey";
          ctx.stroke();
          ctx.closePath();
          ctx.restore();
        } else if (tankdatacannondata["type"] === "rocketer") {
          ctx.save();
          // Translate to the center of the square
          ctx.translate(canW / 2, canH / 2);
          let tankdatacannondata = tankdatacannon[i];
          var angle_offset = tankdatacannondata["offset-angle"];
          ctx.rotate(angle + angle_offset);
          let cannwidthtop =
            tankdatacannondata["cannon-width-top"] * FOVplayerz;
          let cannwidthbottom =
            tankdatacannondata["cannon-width-bottom"] * FOVplayerz;
          let cannonHeight = tankdatacannondata["cannon-height"] * FOVplayerz;
          // Draw the square
          let basex =
            cannwidthbottom / 2 +
            cannon_heightFOV +
            tankdatacannondata["offSet-x"] -
            cannonWidth[i];
          let basey =
            -cannon_heightFOV / 2 +
            cannon_heightFOV / 2 +
            tankdatacannondata["offSet-y"];

          const cannonWidth_top = cannwidthtop;
          const cannonWidth_bottom = cannwidthbottom;

          var canwB2 = cannonWidth_bottom / 2;
          var canwH2 = cannonWidth_top / 2;
          ctx.beginPath();
          ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
          ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
          ctx.lineTo(basex, basey + canwH2);
          ctx.lineTo(basex, basey - canwH2);
          ctx.closePath(); // Close the path
          ctx.fill();

          // Add a border to the cannon
          ctx.strokeStyle = "lightgrey"; // Set border color
          ctx.lineWidth = 3; // Set border width
          ctx.beginPath();
          ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
          ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
          ctx.lineTo(basex, basey + canwH2);
          ctx.lineTo(basex, basey - canwH2);
          ctx.closePath(); // Close the path
          ctx.stroke();

          ctx.fillRect(
            cannon_heightFOV + (cannon_heightFOV - 25) * (1 + (1 - playerSize)),
            basey - canwH2,
            cannon_heightFOV - 40,
            cannwidthtop
          );

          ctx.strokeStyle = "lightgrey"; // Set border color
          ctx.lineWidth = 3; // Set border width
          ctx.strokeRect(
            cannon_heightFOV + (cannon_heightFOV - 25) * (1 + (1 - playerSize)),
            basey - canwH2,
            cannon_heightFOV - 40,
            cannwidthtop
          );

          ctx.restore();
        }
        zlevelbullets.forEach((NEW_bullet__) => {
          var realx =
            NEW_bullet__.x - Math.abs(NEW_bullet__.size * 2 * (FOV - 1));
          var realy =
            NEW_bullet__.y - Math.abs(NEW_bullet__.size * 2 * (FOV - 1));
          if (NEW_bullet__.transparency) {
            ctx.globalAlpha = NEW_bullet__.transparency;
          }
          ctx.beginPath();
          if (NEW_bullet__.type === "basic") {
            if (NEW_bullet__.id === playerId) {
              ctx.fillStyle = "blue";
              ctx.strokeStyle = "darkblue";
            } else {
              ctx.fillStyle = "red";
              ctx.strokeStyle = "darkred";
            }
            let realsize = NEW_bullet__.size * FOV;

            ctx.arc(
              realx - (NEW_bullet__.xstart - (NEW_bullet__.xstart - cavansX)),
              realy - (NEW_bullet__.ystart - (NEW_bullet__.ystart - cavansY)),
              realsize,
              0,
              2 * Math.PI
            );
            ctx.fill();
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.closePath();
          }
          ctx.globalAlpha = 1;
        });

        zlevelbullets = [];
      }

      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        playerSize * playerBaseSize,
        0,
        2 * Math.PI,
        false
      );
      if (state === "start" || state === "damaged") {
        let backwardsObj = { 1: 4, 2: 3, 3: 2, 4: 1, 5: 0.1 };
        let percentage =
          statecycle % 10 <= 5
            ? statecycle % 10
            : backwardsObj[(statecycle % 10) - 5];
        percentage /= 10;
        let newrgb = mix([130, 130, 130], [255, 255, 255], percentage);
        ctx.fillStyle = `rgb(${newrgb[0]} ${newrgb[1]} ${newrgb[2]})`;
      } else {
        ctx.fillStyle = "#828282";
      }
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#aaaaaa";
      ctx.stroke();

      if (skinID !== 0) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);
        ctx.drawImage(
          images[skinID],
          0 - playerSize * playerBaseSize,
          0 - playerSize * playerBaseSize,
          playerBaseSize * 2,
          playerBaseSize * 2
        );
        ctx.restore();
      }

      // Draw background bar
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.roundRect(canvas.width / 2 - 45, canvas.height / 2 + 55, 90, 10, 5);
      ctx.fill();
      ctx.closePath();

      ctx.strokeStyle = "black";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.font = `bold ${20 * exW}px Nunito`;
      ctx.strokeText(score, canvas.width / 2, canvas.height / 2 - 55);
      ctx.fillText(score, canvas.width / 2, canvas.height / 2 - 55);

      ctx.strokeText(username, canvas.width / 2, canvas.height / 2 - 75);
      ctx.fillText(username, canvas.width / 2, canvas.height / 2 - 75);
      for (let i = 0; i < Object.keys(tankdatacannon).length; i++) {
        ctx.fillStyle = "#b3b3b3";
        let tankdatacannondata = tankdatacannon[i];
        let cannon_widthFOV = tankdatacannondata["cannon-width"] * FOVplayerz;
        let cannon_heightFOV = tankdatacannondata["cannon-height"] * FOVplayerz;
        let cannonangle;
        var cannonWidth_;
        autocannons.forEach((cannonA) => {
          if (cannonA.playerid === playerId && cannonA.autoindex === i) {
            cannonangle = cannonA.angle;
            cannonWidth_ = cannonA.cannonWidth;
          }
        });
        if (tankdatacannondata["type"] === "autoCannon") {
          ctx.save();
          var offSet_x = tankdatacannondata["offSet-x"];
          if (tankdatacannondata["offSet-x"] === "playerX") {
            offSet_x = playerSize * playerBaseSize;
          }
          if (tankdatacannondata["offSet-x-multpliyer"]) {
            offSet_x *= -1;
          }
          let angle0 = getCannonAngle();
          var [x, y] = rotatePointAroundPlayer(
            offSet_x,
            0,
            angle0 * (180 / Math.PI)
          );

          ctx.translate(canvas.width / 2 + x, y + canvas.height / 2);

          let angle = cannonangle;

          let angle_offset = tankdatacannondata["offset-angle"];
          ctx.rotate(angle + angle_offset);
          // Draw the square

          let basex = -cannon_widthFOV / 2 + cannon_heightFOV + 0;
          let basey = -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];

          ctx.beginPath();
          ctx.fillRect(
            basex - 5,
            basey - 2.5,
            cannon_widthFOV + 10 - cannonWidth_,
            cannon_heightFOV + 5
          );

          ctx.strokeStyle = "lightgrey"; // Set border color
          ctx.lineWidth = 3; // Set border width
          ctx.strokeRect(
            basex - 5,
            basey - 2.5,
            cannon_widthFOV + 10 - cannonWidth_,
            cannon_heightFOV + 5
          ); // Draw the border
          // Restore the previous transformation matrix
          ctx.rotate(-(angle + angle_offset));
          ctx.arc(0, 0, cannon_widthFOV / 2, 0, 2 * Math.PI, false);

          ctx.fill();
          ctx.stroke();
          ctx.closePath();
          ctx.restore();
        }
      }
      // Draw health bar
      const healthWidth = (playerHealth / maxhealth) * 90;
      ctx.fillStyle = "green";
      ctx.beginPath();
      ctx.roundRect(
        canvas.width / 2 - 45,
        canvas.height / 2 + 55,
        healthWidth,
        10,
        5
      );
      ctx.fill();
      ctx.closePath();

      ctx.save();

      ctx.translate(canW - 150 * exW, canH - 150 * exW);
      ctx.fillStyle = "#fcfafa";
      ctx.beginPath();
      ctx.roundRect(0, 0, 125 * exW, 125 * exW, 5);
      ctx.fill();
      ctx.moveTo(0, 0);
      ctx.lineWidth = 1 * exW;
      ctx.strokeStyle = "#e3e3e3";
      for (let i = 0; i < 13; i++) {
        ctx.moveTo(i * 10.3 * exW, 0);
        ctx.lineTo(i * 10.3 * exW, 125 * exW);
        ctx.stroke();
      }
      ctx.closePath();
      ctx.moveTo(0, 0);
      ctx.lineWidth = 1 * exW;
      ctx.strokeStyle = "#e3e3e3";
      for (let i = 0; i < 13; i++) {
        ctx.moveTo(0, i * 10.3 * exW);
        ctx.lineTo(125 * exW, i * 10.3 * exW);
        ctx.stroke();
      }
      ctx.closePath();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "grey";
      ctx.beginPath();
      ctx.roundRect(0, 0, 125 * exW, 125 * exW, 5);
      ctx.stroke();
      ctx.closePath();

      ctx.textAlign = "center";
      ctx.strokeText(
        "players: " + Object.keys(players).length,
        (125 / 2) * exW,
        -25 * exH
      );
      ctx.fillText(
        "players: " + Object.keys(players).length,
        (125 / 2) * exW,
        -25 * exH
      );

      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#579bfa";
      const centerX = 62.5 * exW;
      const centerY = 62.5 * exW;
      const radius = 30 * exW;
      const angle_o_0_ = pentarotate; // Convert angle to radians
      vertices = [];

      for (let i = 0; i < 5; i++) {
        const theta = (i * 2 * Math.PI) / 5 + angle_o_0_; // Divide circle into 5 parts and add rotation angle
        const x = centerX + radius * Math.cos(theta);
        const y = centerY + radius * Math.sin(theta);
        vertices.push({ x, y });
      }
      // Draw filled pentagon
      ctx.beginPath();
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (let i = 1; i < vertices.length; i++) {
        ctx.lineTo(vertices[i].x, vertices[i].y);
      }
      ctx.closePath();
      ctx.fill();

      // Draw pentagon outline
      ctx.strokeStyle = "#3976cc";
      ctx.beginPath();
      ctx.moveTo(vertices[0].x, vertices[0].y);
      for (let i = 1; i < vertices.length; i++) {
        ctx.lineTo(vertices[i].x, vertices[i].y);
      }
      ctx.closePath();
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.translate(
        ((playerX + 2500) / 80 + 35) * exW,
        ((playerY + 2500) / 80 + 35) * exH
      );
      ctx.rotate(angle + (90 * Math.PI) / 180);
      ctx.arc(
        ((playerX + 2500) / 80 + 35) * exW,
        ((playerY + 2500) / 80 + 35) * exH,
        playerSize * FOV * 2,
        0,
        2 * Math.PI,
        false
      );
      let realitemsize = playerSize * exW * 2;
      let h = 3;
      ctx.beginPath();
      ctx.moveTo(0, -(h / 2) * exH);
      ctx.lineTo(-(realitemsize / 2) * exW, (h / 2) * exH);
      ctx.lineTo((realitemsize / 2) * exW, (h / 2) * exH);
      ctx.closePath();
      ctx.fillStyle = "blue";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "darkblue";
      ctx.stroke();
      ctx.closePath();
      ctx.beginPath();
      ctx.rotate(-(angle + (90 * Math.PI) / 180));
      minimapLevels.forEach((playerobject) => {
        if (playerobject.id === playerId) return;
        ctx.arc(playerobject.x, playerobject.y, 4, 0, 2 * Math.PI, false);
        ctx.fillStyle = "blue";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "darkblue";
      });
      ctx.restore();
      if (messaging) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#a3a3a3";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.fillStyle = "#96ceff";
        ctx.strokeStyle = "#41a4fa";
        let boxlen = button10 * 30 + typedtext.length * (button10 * 1.2);
        ctx.roundRect(
          canvas.width / 2 - boxlen / 2,
          canvas.height / 2 - button10 * 2.5,
          boxlen,
          button10 * 5,
          5
        );
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.textAlign = "left";
        ctx.font = `bold ${30 * exW}px Nunito`;
        ctx.fillStyle = "black";
        ctx.fillText(
          typedtext,
          canvas.width / 2 - (boxlen / 2 - 5),
          canvas.height / 2 + button10 * 1.5
        );
        ctx.closePath();
        var textwidth = ctx.measureText(typedtext).width + 3;
        if (blinking) {
          ctx.beginPath();
          ctx.lineWidth = 1;
          ctx.strokeStyle = "black";
          ctx.moveTo(
            canvas.width / 2 - (boxlen / 2 - 5) + textwidth,
            canvas.height / 2 - button10 * 1.5
          );
          ctx.lineTo(
            canvas.width / 2 - (boxlen / 2 - 5) + textwidth,
            canvas.height / 2 + button10 * 1.5
          );
          ctx.stroke();
          ctx.closePath();
        }
      }
      if (
        window.innerWidth - 475 < MouseX &&
        MouseX < window.innerWidth - 275 &&
        MouseY > 10 &&
        MouseY < 110
      ) {
        ctx.strokeStyle = "#4fe5ff";
        ctx.lineWidth = 7;
      } else {
        ctx.strokeStyle = "#0e589d";
        ctx.lineWidth = 5;
      }

      ctx.fillStyle = "#45bbff";

      ctx.beginPath();
      ctx.roundRect(
        canvas.width - button475,
        button10,
        button10 * 20,
        button10 * 10,
        5
      );
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
      ctx.fillStyle = "#00a0fd";
      ctx.beginPath();
      ctx.roundRect(
        canvas.width - button462_5,
        button10 * 2.5,
        button10 * 17.5,
        button10 * 7,
        5
      );
      ctx.fill();
      ctx.closePath();
      ctx.textAlign = "center";
      ctx.font = `bold ${40 * (2 - scaleFactor)}px Nunito`;
      ctx.fillStyle = "black";
      ctx.fillText("Teams", canvas.width - button375, button10 * 7.5);

      if (setprogress > progress) {
        progress += 0.07;
        if (setprogress === 0 || setprogress > 1) {
          progress = 0;
        }
      }
    }

    function drawPlayers(ctx, players, cavansX, cavansY, isFake) {
      for (const playerId__ in players) {
        if (players.hasOwnProperty(playerId__) && playerId__ != playerId) {
          let player = players[playerId__];

          let tankdata = tankmeta[player.__type__];

          let tankdatacannon = tankdata["cannons"];

          let playerX = player.x;
          let playerY = player.y;

          var sameTeam = !isFake
            ? players[player.id]?.team === players[playerId]?.team &&
              players[player.id]?.team !== null &&
              players[playerId]?.team !== null
            : true;

          let FOVplayerz = player.size;

          if (tankdata.decor) {
            tankdata.decor.forEach((decor_) => {
              if (decor_.type === "octaspinner") {
                ctx.fillStyle = "black";
                ctx.save();
                ctx.translate(
                  playerX - cavansX + decor_.offsetX,
                  playerY - cavansY + decor_.offsetY
                );
                let angle = player.cannon_angle;
                ctx.rotate(angle + decor_.offsetAngle);

                ctx.beginPath();
                for (let i = 0; i < 8; i++) {
                  // calculate the rotation
                  const rotation = ((Math.PI * 2) / 8) * i;

                  // for the first point move to
                  if (i === 0) {
                    ctx.moveTo(
                      decor_.size * Math.cos(rotation),
                      decor_.size * Math.sin(rotation)
                    );
                  } else {
                    // for the rest draw a line
                    ctx.lineTo(
                      decor_.size * Math.cos(rotation),
                      decor_.size * Math.sin(rotation)
                    );
                  }
                }

                ctx.closePath();
                ctx.fill();
                ctx.restore();
              }
            });
          }

          let gradient = ctx.createRadialGradient(
            playerX - cavansX,
            playerY - cavansY,
            (playerSize * playerBaseSize) / 1.5,
            playerX - cavansX,
            playerY - cavansY,
            radiusConfig.radius
          );

          gradient.addColorStop(radiusConfig.build[0], "#FFFFFF00");
          if (sameTeam) {
            gradient.addColorStop(radiusConfig.build[1], "#61f7ff");
          } else {
            gradient.addColorStop(radiusConfig.build[1], "#ff2121");
          }

          gradient.addColorStop(radiusConfig.build[2], "#FFFFFF00");

          ctx.beginPath();
          ctx.arc(
            playerX - cavansX,
            playerY - cavansY,
            radiusConfig.radius,
            0,
            2 * Math.PI,
            false
          );
          ctx.fillStyle = gradient;
          ctx.fill();

          ctx.closePath();

          for (let i = 0; i < Object.keys(tankdatacannon).length; i++) {
            ctx.fillStyle = "#b3b3b3";
            let tankdatacannondata = tankdatacannon[i];

            let cannon_widthFOV =
              tankdatacannondata["cannon-width"] * FOVplayerz;
            let cannon_heightFOV =
              tankdatacannondata["cannon-height"] * FOVplayerz;
            if (tankdatacannondata["type"] === "basicCannon") {
              ctx.save();
              ctx.translate(playerX - cavansX, playerY - cavansY);
              let angle = player.cannon_angle;

              let angle_offset = tankdatacannondata["offset-angle"];
              ctx.rotate(angle + angle_offset);
              // Draw the square
              let basex =
                -cannon_widthFOV / 2 +
                cannon_heightFOV +
                tankdatacannondata["offSet-x"] -
                player.cannonW[i];
              let basey =
                -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];

              ctx.fillRect(basex, basey, cannon_widthFOV, cannon_heightFOV);

              // Add a border to the cannon
              ctx.strokeStyle = "lightgrey"; // Set border color
              ctx.lineWidth = 3; // Set border width
              ctx.strokeRect(basex, basey, cannon_widthFOV, cannon_heightFOV); // Draw the border
              // Restore the previous transformation matrix
              ctx.restore();
            } else if (
              tankdatacannondata["type"] === "trapezoid" ||
              tankdatacannondata["type"] === "directer"
            ) {
              ctx.save();
              ctx.translate(playerX - cavansX, playerY - cavansY);
              let angle = player.cannon_angle;

              let angle_offset = tankdatacannondata["offset-angle"];
              ctx.rotate(angle + angle_offset);
              // Draw the square
              const cannonWidth_bottom =
                tankdatacannondata["cannon-width-bottom"] * player.size * FOV;

              let basex =
                cannonWidth_bottom / 2 +
                cannon_heightFOV +
                tankdatacannondata["offSet-x"] -
                player.cannonW[i];
              let basey =
                -cannon_heightFOV / 2 +
                cannon_heightFOV / 2 -
                tankdatacannondata["offSet-y"];

              const cannonHeight = cannon_heightFOV;
              const cannonWidth_top =
                tankdatacannondata["cannon-width-top"] * player.size * FOV;

              var canwB2 = cannonWidth_bottom / 2;
              var canwH2 = cannonWidth_top / 2;
              ctx.beginPath();
              ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
              ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
              ctx.lineTo(basex, basey + canwH2);
              ctx.lineTo(basex, basey - canwH2);
              ctx.closePath(); // Close the path
              ctx.fill();

              // Add a border to the cannon
              ctx.strokeStyle = "lightgrey"; // Set border color
              ctx.lineWidth = 3; // Set border width
              ctx.beginPath();
              ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
              ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
              ctx.lineTo(basex, basey + canwH2);
              ctx.lineTo(basex, basey - canwH2);
              ctx.closePath(); // Close the path
              ctx.stroke(); // Draw the border
              ctx.restore();
            } else if (
              tankdatacannondata["type"] === "trap" ||
              tankdatacannondata["type"] === "paver"
            ) {
              let cannonheight = tankdatacannondata["cannon-height"];
              ctx.save();

              ctx.translate(playerX - cavansX, playerY - cavansY);
              let angle = player.cannon_angle;

              let angle_offset = tankdatacannondata["offset-angle"];
              let trapR = tankdatacannondata["trap-to-cannon-ratio"];
              ctx.rotate(angle + angle_offset);
              // Draw the square
              let basex =
                -cannon_widthFOV / 2 +
                cannonheight +
                tankdatacannondata["offSet-x"] -
                player.cannonW[i];
              let reH = cannon_widthFOV * (1 - trapR);
              let basey =
                -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];
              ctx.fillRect(
                basex,
                basey,
                cannon_widthFOV - reH,
                cannon_heightFOV
              );
              // Add a border to the cannon

              ctx.strokeStyle = "lightgrey"; // Set border color
              ctx.lineWidth = 3; // Set border width
              ctx.strokeRect(
                basex,
                basey,
                cannon_widthFOV - reH,
                cannon_heightFOV
              );
              // Restore the previous transformation matrix
              const cannonHeight = reH;
              const cannonWidth_top = cannon_heightFOV * 1.4;
              const cannonWidth_bottom = cannon_heightFOV;

              basex = basex + (cannon_widthFOV - trapR);

              var canwB2 = cannonWidth_bottom / 2;
              var canwH2 = cannonWidth_top / 2;
              basey += canwB2;
              ctx.beginPath();
              ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
              ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
              ctx.lineTo(basex, basey + canwH2);
              ctx.lineTo(basex, basey - canwH2);
              ctx.closePath(); // Close the path
              ctx.fill();

              // Add a border to the cannon
              ctx.strokeStyle = "lightgrey"; // Set border color
              ctx.lineWidth = 3; // Set border width
              ctx.beginPath();
              ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
              ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
              ctx.lineTo(basex, basey + canwH2);
              ctx.lineTo(basex, basey - canwH2);
              ctx.closePath(); // Close the path
              ctx.stroke(); // Draw the border
              ctx.restore();
              if (tankdatacannondata["type"] === "paver") {
                cannon_widthFOV /= 1.5;
                cannon_heightFOV /= 1.5;
                ctx.save();
                ctx.translate(playerX - cavansX, playerY - cavansY);
                let angle = player.cannon_angle;

                let angle_offset = tankdatacannondata["offset-angle"];
                ctx.rotate(angle + angle_offset);
                // Draw the square
                let basex =
                  -cannon_widthFOV / 2 +
                  cannon_heightFOV +
                  tankdatacannondata["offSet-x"] -
                  player.cannonW[i];
                let basey =
                  -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];

                ctx.fillRect(basex, basey, cannon_widthFOV, cannon_heightFOV);

                // Add a border to the cannon
                ctx.strokeStyle = "lightgrey"; // Set border color
                ctx.lineWidth = 3; // Set border width
                ctx.strokeRect(basex, basey, cannon_widthFOV, cannon_heightFOV); // Draw the border
                // Restore the previous transformation matrix
                ctx.restore();
              }
            } else if (tankdatacannondata["type"] === "AutoBulletCannon") {
              ctx.save();
              ctx.translate(playerX - cavansX, playerY - cavansY);
              let angle = player.cannon_angle;

              let angle_offset = tankdatacannondata["offset-angle"];
              ctx.rotate(angle + angle_offset);
              // Draw the square

              let basex =
                -cannon_widthFOV / 2 +
                cannon_heightFOV +
                tankdatacannondata["offSet-x"] -
                player.cannonW[i];
              let basey =
                -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];

              ctx.fillRect(basex, basey, cannon_widthFOV, cannon_heightFOV);

              // Add a border to the cannon
              ctx.strokeStyle = "lightgrey"; // Set border color
              ctx.lineWidth = 3; // Set border width
              ctx.strokeRect(basex, basey, cannon_widthFOV, cannon_heightFOV);

              ctx.beginPath();
              ctx.arc(
                basex + 40 + cannon_widthFOV / 4,
                basey + cannon_heightFOV / 2,
                (playerSize * FOV * playerBaseSize) / 4,
                0,
                2 * Math.PI,
                false
              );
              ctx.fill();
              ctx.lineWidth = 5;
              ctx.strokeStyle = "lightgrey";
              ctx.stroke();
              ctx.closePath();
              ctx.restore();
            } else if (tankdatacannondata["type"] === "rocketer") {
              ctx.save();
              // Translate to the center of the square
              ctx.translate(playerX - cavansX, playerY - cavansY);
              let tankdatacannondata = tankdatacannon[i];
              var angle_offset = tankdatacannondata["offset-angle"];
              let angle = player.cannon_angle;
              ctx.rotate(angle + angle_offset);
              let cannwidthtop =
                tankdatacannondata["cannon-width-top"] * FOVplayerz;
              let cannwidthbottom =
                tankdatacannondata["cannon-width-bottom"] * FOVplayerz;
              let cannonHeight =
                tankdatacannondata["cannon-height"] * FOVplayerz;
              // Draw the square
              let basex =
                cannwidthbottom / 2 +
                cannon_heightFOV +
                tankdatacannondata["offSet-x"] -
                player.cannonW[i];
              let basey =
                -cannon_heightFOV / 2 +
                cannon_heightFOV / 2 +
                tankdatacannondata["offSet-y"];

              const cannonWidth_top = cannwidthtop;
              const cannonWidth_bottom = cannwidthbottom;

              var canwB2 = cannonWidth_bottom / 2;
              var canwH2 = cannonWidth_top / 2;
              ctx.beginPath();
              ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
              ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
              ctx.lineTo(basex, basey + canwH2);
              ctx.lineTo(basex, basey - canwH2);
              ctx.closePath(); // Close the path
              ctx.fill();

              // Add a border to the cannon
              ctx.strokeStyle = "lightgrey"; // Set border color
              ctx.lineWidth = 3; // Set border width
              ctx.beginPath();
              ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
              ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
              ctx.lineTo(basex, basey + canwH2);
              ctx.lineTo(basex, basey - canwH2);
              ctx.closePath(); // Close the path
              ctx.stroke();

              ctx.fillRect(
                cannon_heightFOV +
                  (cannon_heightFOV - 25) * (1 + (1 - player.size)),
                basey - canwH2,
                cannon_heightFOV - 40,
                cannwidthtop
              );

              ctx.strokeStyle = "lightgrey"; // Set border color
              ctx.lineWidth = 3; // Set border width
              ctx.strokeRect(
                cannon_heightFOV +
                  (cannon_heightFOV - 25) * (1 + (1 - player.size)),
                basey - canwH2,
                cannon_heightFOV - 40,
                cannwidthtop
              );

              ctx.restore();
            } else if (tankdatacannondata["type"] === "SwivelAutoCannon") {
              ctx.save();
              let cannonangle;
              let cannonWidth_;
              autocannons.forEach((cannonA) => {
                if (cannonA.playerid === player.id && cannonA.autoindex === i) {
                  cannonangle = cannonA.angle;
                  cannonWidth_ = cannonA.cannonWidth;
                }
              });
              if (isFake) {
                cannonangle = i === 1 ? 0 : pi;
                cannonWidth_ = 0;
              }
              var offSet_x = tankdatacannondata["offSet-x"];
              if (tankdatacannondata["offSet-x"] === "playerX") {
                offSet_x = playerSize * playerBaseSize;
              }
              if (tankdatacannondata["offSet-x-multpliyer"]) {
                offSet_x *= -1;
              }
              var [x, y] = rotatePointAroundPlayer(
                offSet_x,
                0,
                swivelAngle * (180 / Math.PI)
              );

              ctx.translate(playerX - cavansX + x, playerY - cavansY + y);

              let angle = cannonangle;

              let angle_offset = tankdatacannondata["offset-angle"];
              ctx.rotate(angle + angle_offset);
              // Draw the square

              let basex = -cannon_widthFOV / 2 + cannon_heightFOV + 0;
              let basey =
                -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];

              ctx.beginPath();
              ctx.fillRect(
                basex - 5,
                basey - 2.5,
                cannon_widthFOV + 10 - cannonWidth_,
                cannon_heightFOV + 5
              );

              ctx.strokeStyle = "lightgrey"; // Set border color
              ctx.lineWidth = 3; // Set border width
              ctx.strokeRect(
                basex - 5,
                basey - 2.5,
                cannon_widthFOV + 10 - cannonWidth_,
                cannon_heightFOV + 5
              ); // Draw the border
              // Restore the previous transformation matrix
              ctx.rotate(-(angle + angle_offset));
              ctx.arc(0, 0, cannon_widthFOV / 2, 0, 2 * Math.PI, false);

              ctx.fill();
              ctx.stroke();
              ctx.closePath();
              ctx.restore();
            }
          }

          ctx.beginPath();

          ctx.arc(
            playerX - cavansX,
            playerY - cavansY,
            player.size * playerBaseSize,
            0,
            2 * Math.PI,
            false
          );
          if (player.state === "start" || player.state === "damaged") {
            let backwardsObj = { 1: 4, 2: 3, 3: 2, 4: 1, 5: 0.1 };
            let percentage =
              player.statecycle % 10 <= 5
                ? player.statecycle % 10
                : backwardsObj[(player.statecycle % 10) - 5];
            percentage /= 10;
            let newrgb2 = mix([130, 130, 130], [255, 255, 255], percentage);
            ctx.fillStyle = `rgb(${newrgb2[0]} ${newrgb2[1]} ${newrgb2[2]})`;
            let newrgb = mix([170, 170, 170], [255, 255, 255], percentage);
            ctx.strokeStyle = `rgb(${newrgb[0]} ${newrgb[1]} ${newrgb[2]})`;
          } else {
            ctx.fillStyle = "#828282";
            ctx.strokeStyle = "#aaaaaa";
          }
          ctx.fill();
          ctx.lineWidth = 5;

          ctx.stroke();
          ctx.closePath();

          if (player.skin !== "0.webp") {
            ctx.save();
            ctx.translate(playerX - cavansX, playerY - cavansY);
            ctx.rotate(player.cannon_angle);
            ctx.drawImage(
              inverted[player.skin],
              0 - player.size * playerBaseSize,
              0 - player.size * playerBaseSize,
              playerBaseSize * 2,
              playerBaseSize * 2
            );
            ctx.restore();
          }

          // Draw background bar
          let mymessages = [];
          playerMessages.forEach((massege) => {
            if (massege.id === player.id) {
              mymessages.push(massege);
            }
          });
          if (canSeeChat) {
            mymessages.forEach((message) => {
              ctx.save();
              if (message.hidetime < Date.now()) {
                if (1 > 1 - (Date.now() - message.hidetime) / 500) {
                  ctx.globalAlpha = 1 - (Date.now() - message.hidetime) / 500;
                }
              }
              ctx.translate(
                playerX - cavansX,
                playerY -
                  cavansY -
                  player.size * 40 -
                  30 * mymessages.length -
                  25
              );
              ctx.fillStyle = "black";
              ctx.textAlign = "center";
              ctx.font = `bold ${21 * upscaleX}px Nunito`;
              ctx.fillText(message.text, 0, 0);
              ctx.globalAlpha = 1;
              ctx.restore();
            });
          }
          if (!isFake) {
            ctx.beginPath();
            ctx.fillStyle = "black";
            ctx.roundRect(
              playerX - cavansX - 50,
              playerY - cavansY + 55,
              90,
              10 * player.size,
              5 * player.size
            );
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            const healthWidth =
              (player.health / player.maxhealth) * 90 * player.size;
            ctx.fillStyle = "green";
            ctx.roundRect(
              playerX - cavansX - 50,
              playerY - cavansY + 55,
              healthWidth,
              10 * player.size,
              5 * player.size
            );
            ctx.fill();
            ctx.closePath();
          }

          for (let i = 0; i < Object.keys(tankdatacannon).length; i++) {
            ctx.fillStyle = "#b3b3b3";

            let tankdatacannondata = tankdatacannon[i];
            let cannon_widthFOV =
              tankdatacannondata["cannon-width"] * FOVplayerz;
            let cannon_heightFOV =
              tankdatacannondata["cannon-height"] * FOVplayerz;
            var cannonangle;
            var cannonWidth_;
            autocannons.forEach((cannonA) => {
              if (cannonA.playerid === playerId__ && cannonA.autoindex === i) {
                cannonangle = cannonA.angle;
                cannonWidth_ = cannonA.cannonWidth;
              }
            });
            if (isFake) {
              cannonangle = 0;
              cannonWidth_ = 40;
            }
            if (tankdatacannondata["type"] === "autoCannon") {
              ctx.save();
              var [x, y] = rotatePointAroundPlayer();
              ctx.translate(playerX - cavansX, playerY - cavansY);
              let angle = cannonangle;

              let angle_offset = tankdatacannondata["offset-angle"];
              ctx.rotate(angle + angle_offset);
              // Draw the square

              var offSet_x = tankdatacannondata["offSet-x"];
              if (tankdatacannondata["offSet-x"] === "playerX") {
                offSet_x = player.size * 2;
              }

              let basex = -cannon_widthFOV / 2 + cannon_heightFOV + offSet_x;
              let basey =
                -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];

              ctx.beginPath();
              ctx.fillRect(
                basex - 5,
                basey - 2.5,
                cannon_widthFOV + 10 - cannonWidth_,
                cannon_heightFOV + 5
              );

              ctx.strokeStyle = "lightgrey"; // Set border color
              ctx.lineWidth = 3; // Set border width
              ctx.strokeRect(
                basex - 5,
                basey - 2.5,
                cannon_widthFOV + 10 - cannonWidth_,
                cannon_heightFOV + 5
              ); // Draw the border
              // Restore the previous transformation matrix
              ctx.rotate(-(angle + angle_offset));
              ctx.arc(0, 0, cannon_widthFOV / 2, 0, 2 * Math.PI, false);

              ctx.fill();
              ctx.stroke();
              ctx.closePath();
              ctx.restore();
            }
          }

          ctx.strokeStyle = "black";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.font = "bold 20px Nunito";
          if (!isFake) {
            ctx.strokeText(
              player.score,
              playerX - cavansX,
              playerY - cavansY - 55
            );

            ctx.fillText(
              player.score,
              playerX - cavansX,
              playerY - cavansY - 55
            );
          }

          if (canSeeNames) {
            ctx.strokeText(
              player.username,
              playerX - cavansX,
              playerY - cavansY - 75
            );
            ctx.fillText(
              player.username,
              playerX - cavansX,
              playerY - cavansY - 75
            );
          }

          for (let i = 0; i < Object.keys(tankdatacannon).length; i++) {
            ctx.fillStyle = "#b3b3b3";

            let tankdatacannondata = tankdatacannon[i];
            let cannon_widthFOV =
              tankdatacannondata["cannon-width"] * FOVplayerz;
            let cannon_heightFOV =
              tankdatacannondata["cannon-height"] * FOVplayerz;
            var cannonangle;
            var cannonWidth_;
            autocannons.forEach((cannonA) => {
              if (cannonA.playerid === playerId__ && cannonA.autoindex === i) {
                cannonangle = cannonA.angle;
                cannonWidth_ = cannonA.cannonWidth;
              }
            });
            if (isFake) {
              cannonangle = 0;
              cannonWidth_ = 0;
            }
            if (tankdatacannondata["type"] === "autoCannon") {
              ctx.save();
              ctx.translate(playerX - cavansX, playerY - cavansY);
              let angle = cannonangle;

              let angle_offset = tankdatacannondata["offset-angle"];
              ctx.rotate(angle + angle_offset);
              // Draw the square

              var offSet_x = tankdatacannondata["offSet-x"];
              if (tankdatacannondata["offSet-x"] === "playerX") {
                offSet_x = player.size * 2;
              }

              let basex = -cannon_widthFOV / 2 + cannon_heightFOV + offSet_x;
              let basey =
                -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];

              ctx.beginPath();
              ctx.fillRect(
                basex - 5,
                basey - 2.5,
                cannon_widthFOV + 10 - cannonWidth_,
                cannon_heightFOV + 5
              );

              ctx.strokeStyle = "lightgrey"; // Set border color
              ctx.lineWidth = 3; // Set border width
              ctx.strokeRect(
                basex - 5,
                basey - 2.5,
                cannon_widthFOV + 10 - cannonWidth_,
                cannon_heightFOV + 5
              ); // Draw the border
              // Restore the previous transformation matrix
              ctx.rotate(-(angle + angle_offset));
              ctx.arc(0, 0, cannon_widthFOV / 2, 0, 2 * Math.PI, false);

              ctx.fill();
              ctx.stroke();
              ctx.closePath();
              ctx.restore();
            }
          }
        }
      }
    }

    function drawbar(item) {
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.roundRect(-45, 35, 90, 10, 5);
      ctx.fill();
      ctx.closePath();
      const healthWidth = (item.health / item.maxhealth) * 90;
      ctx.fillStyle = "green";
      ctx.beginPath();
      ctx.roundRect(-45, 35, healthWidth, 10, 5);
      ctx.fill();
      ctx.closePath();
    }

    function getEquilateralTriangle(cx, cy, s) {
      const h = (Math.sqrt(3) / 2) * s;

      // Top vertex
      const A = { x: cx, y: cy - (2 / 3) * h };

      // Bottom-left
      const B = { x: cx - s / 2, y: cy + (1 / 3) * h };

      // Bottom-right
      const C = { x: cx + s / 2, y: cy + (1 / 3) * h };

      return [A, B, C];
    }

    function controlFrom(p1, p2, strength) {
      const dx = p2.y - p1.y;
      const dy = p1.x - p2.x;
      const len = Math.hypot(dx, dy);
      return {
        x: (p1.x + p2.x) / 2 + (dx / len) * strength,
        y: (p1.y + p2.y) / 2 + (dy / len) * strength,
      };
    }

    function draw(timestamp) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var upscaleX = 1 + (1 - oWidth / canvas.width);
      var upscaleY = 1 + (1 - oHieght / canvas.height);
      let deltaTime = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      let currentFPS = 1 / deltaTime;
      frameTimes.push(currentFPS);

      if (frameTimes.length > 60) {
        frameTimes.shift();
      }

      fps = Math.round(frameTimes.reduce((a, b) => a + b) / frameTimes.length);

      explosions.forEach((exsplosion) => {
        if (
          exsplosion.x + exsplosion.size > 0 + cavansX &&
          exsplosion.x < canvas.width + cavansX + exsplosion.size &&
          exsplosion.y - cavansY > 0 - exsplosion.size &&
          exsplosion.y - exsplosion.size < canvas.height + cavansY
        ) {
          exsplosion.rings.reduce((a, ring) => {
            ctx.beginPath();
            ctx.arc(
              exsplosion.x - cavansX,
              exsplosion.y - cavansY,
              exsplosion.size + a,
              0,
              Math.PI * 2
            );
            ctx.fillStyle = ring.color;
            ctx.strokeStyle = ring.color;
            ctx.globalAlpha =
              exsplosion.trans - ring.transMinus <= 0
                ? 0.001
                : exsplosion.trans - ring.transMinus;
            ctx.lineWidth = ring.size;
            ctx.stroke();
            ctx.closePath();
            a += ring.size;
            ctx.globalAlpha = 1;
            return a;
          }, 0);
        }
      });
      ctx.lineWidth = 1;

      ctx.lineJoin = "round";
      food_list.forEach((item) => {
        var realx = item.x;
        var realy = item.y;

        if (
          realx + item.size > cavansX &&
          realx < canvas.width + cavansX + item.size &&
          realy - cavansY > -item.size &&
          realy - item.size < canvas.height + cavansY &&
          item.health >= 0
        ) {
          ctx.save();
          if (item.transparency) {
            ctx.globalAlpha = item.transparency;
            if (item.transparency < 0) {
              ctx.globalAlpha = 0;
            }
          }

          ctx.translate(realx - cavansX, realy - cavansY);

          ctx.rotate(item.angle * pi180);

          if (item.type === "square") {
            ctx.fillStyle = item.color;
            ctx.fillRect(-item.size / 2, -item.size / 2, item.size, item.size);
            ctx.strokeStyle = "GoldenRod";
            ctx.lineWidth = 5;
            ctx.strokeRect(
              -item.size / 2,
              -item.size / 2,
              item.size,
              item.size
            );

            ctx.rotate(-item.angle * pi180);
            if (item.health < item.maxhealth) {
              drawbar(item);
            }
          }

          if (item.type === "triangle") {
            let realitemsize = item.size;
            const h = realitemsize * (Math.sqrt(3) / 2);

            ctx.beginPath();
            ctx.moveTo(-realitemsize / 2, h / 3);
            ctx.lineTo(realitemsize / 2, h / 3);
            ctx.lineTo(0, (-2 * h) / 3);

            ctx.closePath();

            ctx.fillStyle = item.color;
            ctx.fill();
            ctx.strokeStyle = "Darkred";
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.rotate(-item.angle * pi180);

            if (item.health < item.maxhealth) {
              drawbar(item);
            }
          }

          if (item.type === "pentagon") {
            ctx.fillStyle = item.color;
            const centerX = 0;
            const centerY = 0;
            const radius = item.size * FOV;
            const angle = item.angle * pi180; // Convert angle to radians
            vertices = [];

            for (let i = 0; i < 5; i++) {
              const theta = (i * 2 * Math.PI) / 5 + angle; // Divide circle into 5 parts and add rotation angle
              const x = centerX + radius * Math.cos(theta);
              const y = centerY + radius * Math.sin(theta);
              vertices.push({ x, y });
            }
            // Draw filled pentagon
            ctx.beginPath();
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let i = 1; i < vertices.length; i++) {
              ctx.lineTo(vertices[i].x, vertices[i].y);
            }
            ctx.closePath();
            ctx.fill();

            // Draw pentagon outline
            if (item.color === "#C2A248") {
              ctx.strokeStyle = "#A3883B";
            } else {
              ctx.strokeStyle = "#3976cc";
            }

            ctx.beginPath();
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let i = 1; i < vertices.length; i++) {
              ctx.lineTo(vertices[i].x, vertices[i].y);
            }
            ctx.closePath();
            ctx.lineWidth = 5;
            ctx.stroke();

            // Rotate context back to original position (if needed)
            ctx.rotate(-item.angle * pi180);

            // Draw health bar if health is less than 100%
            if (item.health < item.maxhealth) {
              ctx.fillStyle = "black";
              ctx.beginPath();
              ctx.roundRect(
                centerX - 60,
                centerY + (35 + (item.size - 50)),
                120 + (item.size - 50),
                10,
                5
              );
              ctx.fill();
              ctx.closePath();
              const healthWidth =
                (item.health / item.maxhealth) * (120 + (item.size - 50));
              ctx.fillStyle = "green";
              ctx.beginPath();
              ctx.roundRect(
                centerX - 60,
                centerY + (35 + (item.size - 50)),
                healthWidth,
                10,
                5
              );
              ctx.fill();
              ctx.closePath();
            }
          }

          if (/octagon/.test(item.type)) {
            var realcolor =
              item.type.replace("octagon", "") === teamOn
                ? "#b3ffff"
                : "#A0DDFA";
            ctx.fillStyle = realcolor;

            const centerX = 0;
            const centerY = 0;
            const radius = item.size * FOV;
            const angle = item.angle * pi180; // Convert angle to radians
            vertices = [];

            for (let i = 0; i < 8; i++) {
              const theta = (i * 2 * Math.PI) / 8 + angle; // Divide circle into 8 parts and add rotation angle
              const x = centerX + radius * Math.cos(theta);
              const y = centerY + radius * Math.sin(theta);
              vertices.push({ x, y });
            }
            // Draw filled pentagon
            ctx.beginPath();
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let i = 1; i < vertices.length; i++) {
              ctx.lineTo(vertices[i].x, vertices[i].y);
            }
            ctx.closePath();
            ctx.fill();

            // Draw pentagon outline
            ctx.strokeStyle =
              item.type.replace("octagon", "") === teamOn
                ? "#b1fcfc"
                : "#98D6F4";
            ctx.beginPath();
            ctx.moveTo(vertices[0].x, vertices[0].y);
            for (let i = 1; i < vertices.length; i++) {
              ctx.lineTo(vertices[i].x, vertices[i].y);
            }
            ctx.closePath();
            ctx.lineWidth = 25;
            ctx.stroke();

            // Rotate context back to original position (if needed)
            ctx.rotate(-item.angle * pi180);

            // Draw health bar if health is less than 100%
            if (item.health < item.maxhealth) {
              ctx.fillStyle = "black";
              ctx.beginPath();
              ctx.roundRect(
                centerX - 60,
                centerY + (35 + (item.size - 50)),
                120 + (item.size - 50),
                10,
                5
              );
              ctx.fill();
              ctx.closePath();
              const healthWidth =
                (item.health / item.maxhealth) * (120 + (item.size - 50));
              ctx.fillStyle = "green";
              ctx.beginPath();
              ctx.roundRect(
                centerX - 60,
                centerY + (35 + (item.size - 50)),
                healthWidth,
                10,
                5
              );
              ctx.fill();
              ctx.closePath();
            }
          }
          ctx.restore();

          if (item.type === "square:boss") {
            ctx.save();
            ctx.translate(realx - cavansX, realy - cavansY);
            var boss = bosses.find((boss_) => boss_.id === item.randomID);
            boss =
              boss === undefined
                ? {
                    id: 0,
                    cannons: [
                      { cannonW: 0 },
                      { cannonW: 0 },
                      { cannonW: 0 },
                      { cannonW: 0 },
                    ],
                  }
                : boss;

            for (let i = 0; i < 4; i++) {
              ctx.fillStyle = "#b3b3b3";
              let angle = item.angle * (pi / 180);

              let angle_offset = i * (90 * (pi / 180));

              ctx.rotate(angle + angle_offset);
              var xplus = item.size / 2 - 60;

              // Draw the square
              const cannonWidth_bottom = 30 * 1 * FOV;
              let cannon_heightFOV = 70;
              let t = i + 1 < boss.cannons.length ? i + 1 : 0;
              let basex =
                cannonWidth_bottom / 2 +
                cannon_heightFOV +
                xplus -
                boss.cannons[t].cannonW;
              let basey = -cannon_heightFOV / 2 + cannon_heightFOV / 2;

              const cannonHeight = cannon_heightFOV;
              const cannonWidth_top = 80 * 1 * FOV;

              var canwB2 = cannonWidth_bottom / 2;
              var canwH2 = cannonWidth_top / 2;
              ctx.beginPath();
              ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
              ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
              ctx.lineTo(basex, basey + canwH2);
              ctx.lineTo(basex, basey - canwH2);
              ctx.closePath(); // Close the path
              ctx.fill();

              // Add a border to the cannon
              ctx.strokeStyle = "lightgrey"; // Set border color
              ctx.lineWidth = 3; // Set border width
              ctx.beginPath();
              ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
              ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
              ctx.lineTo(basex, basey + canwH2);
              ctx.lineTo(basex, basey - canwH2);
              ctx.closePath(); // Close the path
              ctx.stroke(); // Draw the border

              ctx.rotate(-(angle + angle_offset));
            }
            ctx.restore();

            ctx.save();
            ctx.translate(realx - cavansX, realy - cavansY);
            ctx.rotate(item.angle * pi180);
            ctx.fillStyle = item.color;
            ctx.fillRect(
              -item.size / 2,
              -item.size / 2,
              item.size * FOV,
              item.size * FOV
            );
            ctx.strokeStyle = "GoldenRod";
            ctx.lineWidth = 5;
            ctx.strokeRect(
              -item.size / 2,
              -item.size / 2,
              item.size * FOV,
              item.size * FOV
            );

            ctx.rotate(-item.angle * pi180);
            if (item.health < item.maxhealth) {
              drawbar(item);
            }
            ctx.restore();
          }

          if (item.type === "triangle:boss") {
            ctx.save();
            ctx.translate(realx - cavansX, realy - cavansY);
            var boss = bosses.find((boss_) => boss_.id === item.randomID);
            boss =
              boss === undefined
                ? {
                    id: 0,
                    cannons: [{ cannonW: 0 }],
                  }
                : boss;

            ctx.fillStyle = "#b3b3b3";

            let angle = item.angle * (pi / 180);

            let angle_offset = pi;

            ctx.rotate(angle + angle_offset);
            var xplus = item.size / 2 - 120;

            // Draw the square
            const cannonWidth_bottom = 30 * 1 * FOV;
            let cannon_heightFOV = 70;
            let basex =
              cannonWidth_bottom / 2 +
              cannon_heightFOV +
              xplus -
              boss.cannons[0].cannonW;
            let basey = -cannon_heightFOV / 2 + cannon_heightFOV / 2;

            const cannonHeight = cannon_heightFOV;
            const cannonWidth_top = 80 * 1 * FOV;

            var canwB2 = cannonWidth_bottom / 2;
            var canwH2 = cannonWidth_top / 2;
            ctx.beginPath();
            ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
            ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
            ctx.lineTo(basex, basey + canwH2);
            ctx.lineTo(basex, basey - canwH2);
            ctx.closePath(); // Close the path
            ctx.fill();

            // Add a border to the cannon
            ctx.strokeStyle = "lightgrey"; // Set border color
            ctx.lineWidth = 3; // Set border width
            ctx.beginPath();
            ctx.moveTo(basex - cannonHeight, basey - canwB2); // Move to the top-left corner
            ctx.lineTo(basex - cannonHeight, basey + canwB2); // Draw to the bottom-left corner
            ctx.lineTo(basex, basey + canwH2);
            ctx.lineTo(basex, basey - canwH2);
            ctx.closePath(); // Close the path
            ctx.stroke(); // Draw the border

            ctx.rotate(-(angle + angle_offset));

            ctx.restore();

            ctx.save(); // Save the current transformation state

            ctx.translate(realx - cavansX, realy - cavansY);
            ctx.rotate(item.angle * pi180 + 90 * pi180);
            ctx.fillStyle = item.color;

            let realitemsize = item.size;
            const h = (realitemsize * Math.sqrt(3)) / 2; // Equilateral triangle height

            ctx.beginPath();

            ctx.moveTo(-realitemsize / 2, h / 3);
            ctx.lineTo(realitemsize / 2, h / 3);
            ctx.lineTo(0, (-2 * h) / 3);
            ctx.closePath();

            ctx.fill();
            ctx.strokeStyle = "#ff66f7";
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.rotate(-item.angle * pi180 - 90 * pi180);

            if (item.health < item.maxhealth) {
              drawbar(item);
            }
            ctx.restore();
          }
          ctx.globalAlpha = 1;
        }
      });
      ctx.lineJoin = "miter";

      let unZbullets = [];

      roads.forEach((road) => {
        if (true) {
          ctx.beginPath();
          ctx.moveTo(road[2].road.x - cavansX, road[2].road.y - cavansY);
          let sameTeam =
            players[road[2].road.id]?.team === players[playerId]?.team &&
            players[road[2].road.id]?.team !== null &&
            players[playerId]?.team !== null;
          if (road[2].road.id === playerId || sameTeam) {
            ctx.fillStyle = "#3999f9";
            ctx.strokeStyle = "#5f79f5";
          }
          road.forEach((mapMark) => {
            ctx.lineTo(mapMark.road.x - cavansX, mapMark.road.y - cavansY);
          });
          ctx.globalAlpha = 0.8;
          ctx.stroke();
          ctx.globalAlpha = 0.3;
          ctx.fill();
          ctx.closePath();
          ctx.globalAlpha = 1;
        }
      });

      ctx.lineWidth = 5;

      bullets.forEach((bullet) => {
        var realstartx = bullet.xstart - (bullet.xstart - cavansX);
        var realstarty = bullet.ystart - (bullet.ystart - cavansY);
        var realx = bullet.x;
        var realy = bullet.y;
        if (
          realx + bullet.size > cavansX &&
          realx - bullet.size < canvas.width + cavansX &&
          realy + bullet.size > cavansY &&
          realy - bullet.size < canvas.height + cavansY
        ) {
          if (bullet.Zlevel !== 3) {
            unZbullets.push(bullet);
            return;
          }
          if (bullet.transparency) {
            ctx.globalAlpha = bullet.transparency;
          }
          ctx.beginPath();

          if (bullet.type === "basic") {
            var sameTeam =
              players[bullet.id]?.team === players[playerId]?.team &&
              players[bullet.id]?.team !== null &&
              players[playerId]?.team !== null;

            if (bullet.id === playerId || sameTeam) {
              ctx.fillStyle = "blue";
              ctx.strokeStyle = "darkblue";
            } else {
              ctx.fillStyle = "red";
              ctx.strokeStyle = "darkred";
            }
            let realsize = bullet.size;

            ctx.arc(
              realx - realstartx,
              realy - realstarty,
              realsize,
              0,
              2 * Math.PI
            );
            ctx.fill();
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.closePath();
          }
          ctx.globalAlpha = 1;
        }
      });

      unZbullets.forEach((bullet) => {
        var realx = bullet.x;
        var realy = bullet.y;

        if (
          realx + bullet.size > cavansX &&
          realx - bullet.size < canvas.width + cavansX &&
          realy + bullet.size > cavansY &&
          realy - bullet.size < canvas.height + cavansY
        ) {
          if (bullet.Zlevel === 2 && bullet.id === playerId) {
            zlevelbullets.push(bullet);
            return;
          }
          if (bullet.transparency) {
            ctx.globalAlpha = bullet.transparency;
          }
          ctx.beginPath();

          if (bullet.type === "basic" || bullet.type === "sheild") {
            if (bullet.type !== "sheild") {
              var sameTeam =
                players[bullet.id]?.team === players[playerId]?.team &&
                players[bullet.id]?.team !== null &&
                players[playerId]?.team !== null;
            } else {
              ctx.globalCompositeOperation = "destination-over";
              var sameTeam = bullet.teamID === teamOn;
            }
            if (bullet.id === playerId || sameTeam) {
              ctx.fillStyle = "blue";
              ctx.strokeStyle = "darkblue";
            } else {
              ctx.fillStyle = "red";
              ctx.strokeStyle = "darkred";
            }
            let realsize = bullet.size;

            ctx.arc(
              realx - (bullet.xstart - (bullet.xstart - cavansX)),
              realy - (bullet.ystart - (bullet.ystart - cavansY)),
              realsize,
              0,
              2 * Math.PI
            );
            ctx.fill();
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.closePath();
            ctx.globalCompositeOperation = "source-over";
          } else if (bullet.type === "FreeNecromancer") {
            ctx.save();
            ctx.translate(realx - cavansX, realy - cavansY);
            ctx.rotate(bullet.angle);
            ctx.fillStyle = "#f2c705";
            ctx.fillRect(
              -bullet.size / 2,
              -bullet.size / 2,
              bullet.size,
              bullet.size
            );
            ctx.strokeStyle = "#e0b700";
            ctx.lineWidth = 5;
            ctx.strokeRect(
              -bullet.size / 2,
              -bullet.size / 2,
              bullet.size,
              bullet.size
            );
            ctx.restore();
          } else if (bullet.type === "trap") {
            ctx.save();
            ctx.translate(realx - cavansX, realy - cavansY);
            ctx.rotate(bullet.angle);
            var sameTeam =
              players[bullet.id]?.team === players[playerId]?.team &&
              players[bullet.id]?.team !== null &&
              players[playerId]?.team !== null;
            if (bullet.id === playerId || sameTeam) {
              ctx.fillStyle = "blue";
              ctx.strokeStyle = "darkblue";
            } else {
              ctx.fillStyle = "red";
              ctx.strokeStyle = "darkred";
            }

            var [A, B, C] = getEquilateralTriangle(0, 0, bullet.size * 3);

            var curve = -5;

            const ctrlAB = controlFrom(A, B, -curve);
            const ctrlBC = controlFrom(B, C, -curve);
            const ctrlCA = controlFrom(C, A, -curve);

            // Draw the curved edge from top to bottom-left

            ctx.quadraticCurveTo(ctrlAB.x, ctrlAB.y, B.x, B.y);

            // Draw the curved edge from bottom-left to bottom-right
            ctx.quadraticCurveTo(ctrlBC.x, ctrlBC.y, C.x, C.y);

            // Draw the curved edge from bottom-right to top
            ctx.quadraticCurveTo(ctrlCA.x, ctrlCA.y, A.x, A.y);

            ctx.quadraticCurveTo(ctrlAB.x, ctrlAB.y, B.x, B.y);

            ctx.fill();

            ctx.stroke();
            ctx.closePath();
            ctx.restore();
          } else if (bullet.type === "directer") {
            var sameTeam =
              players[bullet.id]?.team === players[playerId]?.team &&
              players[bullet.id]?.team !== null &&
              players[playerId]?.team !== null;
            if (bullet.id === playerId || sameTeam) {
              ctx.fillStyle = "blue";
              ctx.strokeStyle = "darkblue";
            } else {
              ctx.fillStyle = "red";
              ctx.strokeStyle = "darkred";
            }
            ctx.save();
            ctx.translate(realx - cavansX, realy - cavansY);
            ctx.rotate(bullet.angle + 90 * (pi / 180));
            let realitemsize = bullet.size * 3;
            const h = realitemsize * sqrt23;

            ctx.beginPath();
            ctx.moveTo(0, -h / 2);
            ctx.lineTo(-realitemsize / 2, h / 2);
            ctx.lineTo(realitemsize / 2, h / 2);
            ctx.closePath();

            ctx.fill();
            ctx.stroke();
          } else if (bullet.type === "roadMap") {
            var sameTeam =
              players[bullet.id]?.team === players[playerId]?.team &&
              players[bullet.id]?.team !== null &&
              players[playerId]?.team !== null;
            if (bullet.id === playerId || sameTeam) {
              ctx.fillStyle = "blue";
              ctx.strokeStyle = "darkblue";
            } else {
              ctx.fillStyle = "red";
              ctx.strokeStyle = "darkred";
            }
            for (let i = 0; i < 2; i++) {
              ctx.save();
              ctx.translate(realx - cavansX, realy - cavansY);
              ctx.rotate(bullet.angle + i * pi);
              //ctx.rotate(i * 90 * pi / 180)
              let realitemsize = bullet.size * 3;
              const h = realitemsize * sqrt23;

              ctx.beginPath();
              ctx.moveTo(0, -h / 2);
              ctx.lineTo(-realitemsize / 2, h / 2);
              ctx.lineTo(realitemsize / 2, h / 2);
              ctx.closePath();

              ctx.fill();

              ctx.stroke();
              ctx.restore();
            }
          } else if (bullet.type === "FreeSwarm") {
            ctx.fillStyle = "#ff7df8";
            ctx.strokeStyle = "#ff66f7";

            ctx.save();
            ctx.translate(realx - cavansX, realy - cavansY);
            ctx.rotate(bullet.angle);
            let realitemsize = bullet.size * 3 * FOV;
            const h = realitemsize * sqrt23;

            ctx.beginPath();
            ctx.moveTo(0, -h / 2);
            ctx.lineTo(-realitemsize / 2, h / 2);
            ctx.lineTo(realitemsize / 2, h / 2);
            ctx.closePath();

            ctx.fill();

            ctx.stroke();
          } else if (bullet.type === "AutoBullet") {
            var sameTeam =
              players[bullet.id]?.team === players[playerId]?.team &&
              players[bullet.id]?.team !== null &&
              players[playerId]?.team !== null;
            if (bullet.id === playerId || sameTeam) {
              ctx.fillStyle = "blue";
              ctx.strokeStyle = "darkblue";
            } else {
              ctx.fillStyle = "red";
              ctx.strokeStyle = "darkred";
            }
            let realsize = bullet.size * FOV;

            ctx.arc(
              realx - (bullet.xstart - (bullet.xstart - cavansX)),
              realy - (bullet.ystart - (bullet.ystart - cavansY)),
              realsize,
              0,
              2 * Math.PI
            );
            ctx.fill();

            ctx.stroke();
            ctx.closePath();
            let autoCAN_ = null;
            autocannons.forEach((can) => {
              if (can.playerid === bullet.uniqueid) {
                autoCAN_ = can;
              }
            });
            ctx.save();
            ctx.translate(
              realx - (bullet.xstart - (bullet.xstart - cavansX)),
              realy - (bullet.ystart - (bullet.ystart - cavansY))
            );
            var cannon_widthFOV = bullet.size / 2;
            var cannon_heightFOV = bullet.size / 2;
            ctx.rotate(autoCAN_.angle);
            let basex = -cannon_widthFOV / 2 + cannon_heightFOV - cannonWidth;
            let basey = -cannon_heightFOV / 2;

            ctx.fillStyle = "#b3b3b3";
            ctx.fillRect(
              basex,
              basey - 5,
              cannon_widthFOV + 15,
              cannon_heightFOV + 10
            );

            ctx.strokeStyle = "lightgrey";
            ctx.lineWidth = 3;
            ctx.strokeRect(
              basex,
              basey - 5,
              cannon_widthFOV + 15,
              cannon_heightFOV + 10
            );
            ctx.rotate(-autoCAN_.angle);
            ctx.closePath();
            ctx.beginPath();
            ctx.arc(0, 0, cannon_widthFOV / 2 + 7, 0, 2 * Math.PI, false);
            ctx.fill();

            ctx.stroke();
            ctx.closePath();
          } else if (bullet.type === "rocketer") {
            ctx.save();
            ctx.translate(realx - cavansX, realy - cavansY);
            ctx.rotate(bullet.angle);
            let cannwidthtop =
              tankmeta[players[bullet.id].__type__]["cannons"][
                bullet.parentindex
              ]["cannon-width-top"] / 1.7;
            let cannwidthbottom =
              tankmeta[players[bullet.id].__type__]["cannons"][
                bullet.parentindex
              ]["cannon-width-bottom"] / 1.7;
            const cannonWidth_top = cannwidthtop;
            const cannonWidth_bottom = cannwidthbottom;

            ctx.fillStyle = "#b3b3b3";
            var canwB2 = cannonWidth_bottom / 2;
            var canwH2 = cannonWidth_top / 2;
            ctx.beginPath();
            ctx.moveTo(0 - cannonWidth_top, 0 - canwB2);
            ctx.lineTo(0 - cannonWidth_top, 0 + canwB2);
            ctx.lineTo(0, 0 + canwH2);
            ctx.lineTo(0, 0 - canwH2);
            ctx.closePath();
            ctx.fill();

            ctx.strokeStyle = "lightgrey";
            ctx.lineWidth = 3;
            ctx.moveTo(0 - cannonWidth_top, 0 - canwB2);
            ctx.lineTo(0 - cannonWidth_top, 0 + canwB2);
            ctx.lineTo(0, 0 + canwH2);
            ctx.lineTo(0, 0 - canwH2);
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
            var sameTeam =
              players[bullet.id]?.team === players[playerId]?.team &&
              players[bullet.id]?.team !== null &&
              players[playerId]?.team !== null;
            if (bullet.id === playerId || sameTeam) {
              ctx.fillStyle = "blue";
              ctx.strokeStyle = "darkblue";
            } else {
              ctx.fillStyle = "red";
              ctx.strokeStyle = "darkred";
            }
            let realsize = bullet.size * FOV;

            ctx.beginPath();
            ctx.arc(
              realx - (bullet.xstart - (bullet.xstart - cavansX)),
              realy - (bullet.ystart - (bullet.ystart - cavansY)),
              realsize,
              0,
              2 * Math.PI
            );
            ctx.fill();

            ctx.stroke();
            ctx.closePath();
          }
          ctx.restore();
          ctx.globalAlpha = 1;
        }
      });

      drawPlayers(ctx, players, cavansX, cavansY, false);
      ctx.fillStyle = squareColor;

      if (!dead) {
        drawself(upscaleX, upscaleY);
      }

      ctx.strokeStyle = "black";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(mapLeft, mapTop);
      ctx.lineTo(mapRight, mapTop);
      ctx.lineTo(mapRight, mapBottom);
      ctx.lineTo(mapLeft, mapBottom);
      ctx.lineTo(mapLeft, mapTop);
      ctx.stroke();
      gridLightstyle.top = `calc(-${(10000 * scaleFactor) / 2}px - ${
        cavansY * scaleFactor
      }px)`;
      gridLightstyle.left = `calc(-${(10000 * scaleFactor) / 2}px - ${
        cavansX * scaleFactor
      }px)`;
      gridDarkstyle.top = `calc(-${(10000 * scaleFactor) / 2}px - ${
        cavansY * scaleFactor
      }px)`;
      gridDarkstyle.left = `calc(-${(10000 * scaleFactor) / 2}px - ${
        cavansX * scaleFactor
      }px)`;

      drawRoundedLevelBar(
        ctx,
        canvas.width / 2 - barWidth / 2,
        canvas.height - canvas.height * 0.03879728419,
        barWidth,
        barHeight,
        borderRadius,
        progress + 0.05,
        "black",
        "#00f7ff",
        false,
        true
      );
      let I_ = 0;
      if (upgradePoints > 0) {
        ctx.font = "26px Nunito";
        ctx.strokeStyle = "#89faa7";
        ctx.strokeText(
          `+${upgradePoints}`,
          20 + (145 * upscaleX) / 2,
          canvas.height - 34 * upscaleY * 9
        );
        ctx.textAlign = "center";
        ctx.font = "bold 25px Nunito";
        ctx.fillStyle = "#14fc52";
        ctx.fillText(
          `+${upgradePoints}`,
          20 + (145 * upscaleX) / 2,
          canvas.height - 34 * upscaleY * 9
        );
      }

      for (let CCC = Object.keys(statsTree).length - 1; CCC >= 0; CCC -= 1) {
        let stat_ = statsTree[Object.keys(statsTree)[CCC]];
        let stat = Object.keys(statsTree)[CCC];
        let color = colorUpgrades[CCC] || "red";
        drawRoundedLevelBar(
          ctx,
          20,
          canvas.height - 34 * upscaleY * I_ - 40,
          145 * upscaleX,
          25 * upscaleY,
          borderRadius,
          stat_ / 8,
          "black",
          color,
          "#242424",
          false
        );
        ctx.textAlign = "center";
        ctx.font = `bold ${15 * (1 + (1 - scaleFactor))}px Nunito`;
        ctx.fillStyle = "white";
        ctx.fillText(
          `${stat}:${stat_}`,
          20 + (145 * upscaleX) / 2,
          canvas.height - 34 * upscaleY * I_ - 40 + 17.5 * upscaleY
        );
        I_++;
      }
      if (joinedTeam) {
        let MYteam = pubteams.find((team) => {
            return team.teamID === players[playerId].team;
          });
        for (let CCC = Object.keys(statsTree).length - 1; CCC >= 0; CCC -= 1) {
          if (!MYteam) break;
          let stat_ = MYteam.stats[Object.keys(MYteam.stats)[CCC]];
          let stat = Object.keys(MYteam.stats)[CCC];
          let color = teamColorUpgrades[CCC] || "red";
          drawRoundedLevelBar(
            ctx,
            20,
            canvas.height - 300 * upscaleY * I_ - 40,
            145 * upscaleX,
            25 * upscaleY,
            borderRadius,
            stat_ / 8,
            "black",
            color,
            "#242424",
            false
          );
          ctx.textAlign = "center";
          ctx.font = `bold ${15 * (1 + (1 - scaleFactor))}px Nunito`;
          ctx.fillStyle = "white";
          ctx.fillText(
            `${stat}:${stat_}`,
            20 + (145 * upscaleX) / 2,
            canvas.height - 300 * upscaleY * I_ - 40 + 17.5 * upscaleY
          );
          I_++;
        }
      }
      ctx.font = "bold 30px Nunito";
      ctx.strokeStyle = "black";
      ctx.strokeText("leaderboard", canvas.width - 125 * upscaleX, 25);
      ctx.textAlign = "center";
      ctx.fillStyle = "#00f7ff";
      ctx.fillText("leaderboard", canvas.width - 125 * upscaleX, 25);

      if (canSeeLeaderBoard) {
        leader_board.forEach((entre, i) => {
          var totalwidth;
          if (leader_board[0].score) {
            totalwidth = entre.score / leader_board[0].score;
          }
          if (!leader_board[0].score) {
            totalwidth = 1;
          }
          drawRoundedLevelBar(
            ctx,
            canvas.width - 257.5 * upscaleX,
            50 + i * 30,
            245 * upscaleX,
            27 * upscaleY,
            borderRadius,
            entre.score / leader_board[0].score,
            "#23badb",
            "#4eddfc",
            "#242424",
            false
          );

          ctx.textAlign = "center";
          ctx.font = "bold 20px Nunito";
          ctx.fillStyle = "black";
          ctx.fillText(
            `${entre.name} ➠ ${entre.score}`,
            canvas.width - 125 * upscaleX,
            72 + i * 30 * upscaleY
          );
          try {
            ctx.drawImage(
              badgelevels[entre.badge],
              canvas.width - (40 + 205 * upscaleX),
              52 + i * 30 * upscaleY,
              button40,
              (40 * upscaleY) / 1.8
            );
          } catch (error) {}
        });
      }

      requestAnimationFrame(draw);
    }
  }

  async function getBagdeData() {
    const url =
      !window.location.href.startsWith("http://127.0.0.1:5501/public/index.html")
        ? "https://websocketpointer.duckdns.org/currentbadge"
        : "http://localhost:4500/currentbadge";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: getCookie("userId") }),
      });
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(error.message);
    }
  }

  async function getGearData() {
    const url =
      !window.location.href.startsWith("http://127.0.0.1:5501/public/index.html")
        ? "https://websocketpointer.duckdns.org/currentgears"
        : "http://localhost:4500/currentgears";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: getCookie("userId") }),
      });
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(error.message);
    }
  }

  async function loadGearData(data) {
    var gearCount = data;
    document.getElementById("gearCount").innerText = gearCount.gears;
    document.getElementById("levelProgress").value = gearCount.levelBoost
      ? gearCount.levelBoost
      : 0;
    if (gearCount.gears >= 100) {
      document.getElementById("booster").addEventListener("click", () => {
        document.getElementById("confermationScreen2").style.display = "flex";
        document.getElementById("booster").style.filter = "brightness(1)";
      });
    } else {
      document.getElementById("booster").style.filter = "brightness(0.5)";
      document.getElementById("booster").title =
        "You need at least 100 gears to buy a boost";
    }
  }
  try {
    (async function () {
      loadGearData(await getGearData());
    })();
  } catch (e) {
    console.log(e);
  }
  document.getElementById("subfeedback").addEventListener("click", subfeedback);

  if (isCrazyGames && !available) {
    document.getElementById("loginWithCrazy").style.display = "block";
    document
      .getElementById("loginWithCrazy")
      .addEventListener("click", async () => {
        try {
          const user = await window.CrazyGames.SDK.user.showAuthPrompt();
          console.log("Auth prompt result", user);
        } catch (e) {
          console.log("Error:", e);
        }
      });
  } else {
    document.getElementById("loginWithCrazy").style.display = "none";
  }
  const listener = async () => {
    available = true;
    document.getElementById("username").value =
      await window.CrazyGames.SDK.user.getUser().username;
  };

  if (isCrazyGames) window.CrazyGames.SDK.user.addAuthListener(listener);

  async function subfeedback() {
    const url =
      !window.location.href.startsWith("http://127.0.0.1:5501/public/index.html")
        ? "https://websocketpointer.duckdns.org/submit-feedback"
        : "http://localhost:4500/submit-feedback";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: document.getElementById("namesub").value,
          message: document.getElementById("feedback").value,
        }),
      });
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(error.message);
    }
  }

  let settingsopen = false;
  var settings = document.getElementById("settingsOpener");

  const settingsOpener = () => {
    settingsopen = !settingsopen;
    document.getElementById("settingsBox").style.display = settingsopen
      ? "block"
      : "none";
  };
  settings.addEventListener("click", settingsOpener);

  async function getLeaderBoardData() {
    const url =
      !window.location.href.startsWith("http://127.0.0.1:5501/public/index.html")
        ? "https://websocketpointer.duckdns.org/leaderboard"
        : "http://localhost:4500/leaderboard";
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(error.message);
    }
  }

  async function getTeamData() {
    const url =
      !window.location.href.startsWith("http://127.0.0.1:5501/public/index.html")
        ? "https://websocketpointer.duckdns.org/getteamdata"
        : "http://localhost:4500/getteamdata";
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(error.message);
    }
  }

  var leaderboardSlected = 'players';
  var playersSelect = document.getElementById("playersSelect");
  var teamsSelect = document.getElementById("teamsSelect");
  playersSelect.addEventListener("click", () => {
    playersSelect.classList.add("text-highlight");
    teamsSelect.classList.remove("text-highlight");
    if (leaderboardSlected !== "players") {
      leaderboardSlected = "players";
      document.getElementById("leaderBoard").innerHTML = ``;
      buildLeaderBoard(leaderboardSlected);
    }
  });
  teamsSelect.addEventListener("click", () => {
    playersSelect.classList.remove("text-highlight");
    teamsSelect.classList.add("text-highlight");
    if (leaderboardSlected !== "teams") {
      leaderboardSlected = "teams";
      document.getElementById("leaderBoard").innerHTML = ``;
      buildLeaderBoard(leaderboardSlected);
    }
  });
  async function buildLeaderBoard(type) {
    var leaderboard_ = type === "players" ? await getLeaderBoardData() : await getTeamData();
    var leaderBoard = document.getElementById("leaderBoard");
    leaderBoard.innerHTML = ``;
    console.log(leaderboard_);
    leaderboard_.leader_board.forEach((leader) => {
      var holderDiv = document.createElement("div");
      var holderName = document.createElement("p");
      leaderBoard.appendChild(holderDiv);
      if (type === "players") {
        var holderImg = document.createElement("img");
        holderImg.src =
          window.location.href.startsWith("http://127.0.0.1:5501/public/index.html")
            ? `/public${leader.badge.badge}`
            : `${leader.badge.badge}`;
        holderDiv.appendChild(holderImg);
        holderImg.style.width = "20px";
        holderImg.style.hieght = "20px";
        holderImg.alt = "io leaderboard badge";
      }
      holderDiv.classList.add("entrie-box");
      holderDiv.appendChild(holderName);
      
      holderName.innerHTML = type === "teams" ? 
      `${leader.name}, ${leader.teamScore}` : 
      `${leader.username}, ${leader.score}`;
      holderName.classList.add("normalized-text-color");
      if (type === "teams") {
        holderDiv.addEventListener("click", () => {
          const currentURL = new URL(window.location.href);
          currentURL.searchParams.set("team", leader.teamKey);
          window.history.pushState({}, '', currentURL);
        });
      }
    });
  }
  try {
    buildLeaderBoard(leaderboardSlected);
  } catch {}

  document.getElementById("buyNo").addEventListener("click", () => {
    document.getElementById("confermationScreen2").style.display = "none";
  });

  async function AData() {
    const url =
      !window.location.href.startsWith("http://127.0.0.1:5501/public/index.html")
        ? "https://websocketpointer.duckdns.org/buylevels"
        : "http://localhost:4500/buylevels";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: getCookie("userId") }),
      });
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(error.message);
    }
  }
  document.getElementById("buyYes").addEventListener("click", async () => {
    document.getElementById("confermationScreen2").style.display = "none";

    var gearCount = await AData();
    document.getElementById("gearCount").innerText = gearCount.gears;
    document.getElementById("levelProgress").value = gearCount.levelBoost
      ? gearCount.levelBoost
      : 0;
    if (gearCount.purchaseSuccsefull === "noAccount") {
      alert("purchase error; You need to play a least once to by a boost");
    } else if (gearCount.purchaseSuccsefull === "AccountError") {
      alert(
        "account error; Account not found; Play to refresh your token; it may have expired"
      );
    } else if (gearCount.purchaseSuccsefull === "noEnoughCoins") {
      alert(
        "currency error; You do not have enough Golden gears; Purchase or play to get more!"
      );
    }
  });

  async function ping() {
    const urls =
      window.location.href.startsWith("http://127.0.0.1:5501/public/index.html")
        ? [
            "http://localhost:4500/ping",
            "https://websocketpointer.duckdns.org/ping",
            "http://127.0.0.1:4000/ping",
            "http://192.168.9.100:4500/ping",
          ]
        : ["https://websocketpointer.duckdns.org/ping"];
    var passed = false;
    Promise.all(
      urls.map(async (url) => {
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
          }
          passed = true;
        } catch (error) {
          console.log(error.message);
        }
      })
    ).then(() => {
      if (!passed) {
        window.location.href =
          window.location.href.startsWith("http://127.0.0.1:5501/public/index.html")
            ? "/public/server-down.html"
            : "/server-down.html";
      }
    });
  }
  try {
    if (!window.location.href.startsWith("http://127.0.0.1:5501/public/index.html")) {
      document.getElementById("squareimg").src = "/how-to-imgs/square.webp";
      document.getElementById("triangleimg").src = "/how-to-imgs/triangle.webp";
      document.getElementById("pentagonimg").src = "/how-to-imgs/pentagon.webp";
    }
  } catch {}

  try {
    ping();
  } catch {}

  var levelData = null;

  async function build() {
    levelData = await getBagdeData();
    badgeLevelDiv.innerHTML = "";

    var buildOutEle = {};
    levelData.levelData.reverse().forEach((level, i) => {
      var imageDiv = document.createElement("div");
      badgeLevelDiv.appendChild(imageDiv);

      imageDiv.classList.add("levelContainer");
      var imageForDiv = document.createElement("img");

      if (level.maxScore >= levelData.playerScore || level.maxScore == null) {
        imageDiv.classList.add("disabledBadge");
        imageForDiv.style.filter = "brightness(50%)";
      }
      if (
        level.maxScore >= levelData.playerScore &&
        level.minScore <= levelData.playerScore
      ) {
        let minScore = level.minScore;
        let maxScore = level.maxScore;
        var clacPercetage =
          255 * ((maxScore - levelData.playerScore) / (maxScore - minScore));

        if (maxScore - levelData.playerScore === maxScore - minScore) {
          clacPercetage = 0;
        }

        var appendStyle = `linear-gradient(0deg, rgba(${clacPercetage}, ${clacPercetage}, ${clacPercetage}, 0.4), rgba(0, 0, 0, 0.4))`;

        imageDiv.style.backgroundImage = appendStyle;

        var strokeDashoffset =
          45 *
          2 *
          Math.PI *
          ((maxScore - levelData.playerScore) / (maxScore - minScore));

        imageDiv.innerHTML = `
          <svg width="10vh" height="10vh" viewBox="0 0 130 100">
            <defs>
              <radialGradient id="grad1" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stop-color="#00F7FF12" />
                <stop offset="50%" stop-color="#00F7FF" />
                <stop offset="100%" stop-color="#00F7FF12" />
              </radialGradient>
              <radialGradient id="grad2" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stop-color="#FFFFFF00" />
                <stop offset="100%" stop-color="#00F7FF" />
              </radialGradient>
            </defs>
            <g stroke-width="9" stroke="url(#grad1)" fill="none" stroke-width="30">
              <circle r="65" cx="65" cy="50" opacity="1" stroke="url(#grad1)" stroke-width="30"></circle>
              <circle r="45" cx="65" cy="50"></circle>
            </g>
            <circle cx="65" cy="50" r="45" stroke="black" stroke-width="8" fill="none"> </circle>
            <circle cx="65" cy="50" r="45" class="meter-1" id="fillcircle"> </circle>
            <image x="35" y="20" width="60" height="60" href='${
              window.location.href.startsWith("http://127.0.0.1:5501/public/index.html")
                ? window.location.origin + "/public/" + level.badge
                : window.location.origin + level.badge
            }'> </image>
          </svg>
        `;
        const fillCircle = document.getElementById("fillcircle");
        const circumference = 45 * 2 * Math.PI;
        fillCircle.style.setProperty("stroke-dasharray", `${circumference}`);
        fillCircle.style.setProperty("stroke-dashoffset", strokeDashoffset);
        imageForDiv.style.opacity = "0.1";
        imageForDiv.style.width = "0.1px";
        var progressBar = document.createElement("progress");
        progressBar.value =
          (maxScore - levelData.playerScore) / (maxScore - minScore);
        progressBar.style.width = "100%";
        progressBar.style.marginRight = "10px";

        //imageDiv.appendChild(progressBar);
        progressBar.classList.add("lineBreak");
        progressBar.style.display = "block";
        progressBar.style["background-color"] = "#0A0A0A";
        buildOutEle = imageDiv;
      }

      imageForDiv.src =
        window.location.href.startsWith("http://127.0.0.1:5501/public/index.html")
          ? `/public${level.badge}`
          : `${level.badge}`;
      imageForDiv.alt = `badge level: ${level}`;
      imageDiv.appendChild(imageForDiv);
      imageForDiv.style.height = "4.5vw";
      imageForDiv.style.minHeight = "70px";
      imageDiv.style.minHeight = "80px";
      if (
        level.maxScore >= levelData.playerScore &&
        level.minScore <= levelData.playerScore
      ) {
        imageForDiv.style.visibility = "hidden";
        imageDiv.style.setProperty(
          "border-color",
          "var(--border-color-400)",
          "important"
        );
      } else {
        imageForDiv["aspect-ratio"] = "1 / 1";
      }
    });
  }

  let pointerAngle = 0;
  try {
    build();
  } catch {}

  if (window.location.href !== "https://tankshark.fun/") {
    document.getElementById("founder").style.display = "none";
    document.getElementById("howToPlay").style.display = "none";
    document.getElementById("howToPlay").style.display = "none";
  }

  var canAnimateProfile = true;

  var darkmode = document.getElementById("darkModeCheck");
  var chatshown = document.getElementById("chatcheck");
  var leaderboardshown = document.getElementById("leaderBoardCheck");
  var namesshown = document.getElementById("namesCheck");

  const themeChanger = () => {
    document.getElementById("getdarkMode").classList.toggle("moveee");
    darkMode = !darkMode;
    localStorage.setItem("theme", darkMode);
    var newTheme = darkMode ? "dark" : "light";
    document.querySelector("html").setAttribute("data-theme", newTheme);
    if (darkMode) {
      document.getElementById("gridDark").style.display = "grid";
      document.getElementById("gridLight").style.display = "none";
      document.getElementById("lightcrazy").style.display = "block";
      document.getElementById("darkcrazy").style.display = "none";
    }
    if (!darkMode) {
      document.getElementById("gridDark").style.display = "none";
      document.getElementById("gridLight").style.display = "grid";
      document.getElementById("lightcrazy").style.display = "none";
      document.getElementById("darkcrazy").style.display = "block";
    }
  };
  darkmode.addEventListener("click", themeChanger);

  const chatToggle = () => {
    canSeeChat = !canSeeChat;
    localStorage.setItem("canSeeChat", canSeeChat);
    document.getElementById("getChatShown").classList.toggle("moveee");
  };
  chatshown.addEventListener("click", chatToggle);

  const leaderBoardToggle = () => {
    canSeeLeaderBoard = !canSeeLeaderBoard;
    localStorage.setItem("canSeeLeaderBoard", canSeeLeaderBoard);
    document.getElementById("getleaderBoardShown").classList.toggle("moveee");
  };
  leaderboardshown.addEventListener("click", leaderBoardToggle);

  const namesToggle = () => {
    canSeeNames = !canSeeNames;
    localStorage.setItem("canSeeNames", canSeeNames);
    document.getElementById("getnamesShown").classList.toggle("moveee");
  };
  namesshown.addEventListener("click", namesToggle);

  var playerCanvas = document.getElementById("playerCanvas");
  let profileCtx = playerCanvas.getContext("2d");

  function createProfile() {
    profileCtx.clearRect(0, 0, playerCanvas.width, playerCanvas.height);
    let gradient = profileCtx.createRadialGradient(
      playerCanvas.width / 2,
      playerCanvas.height / 2,
      40,
      playerCanvas.width / 2,
      playerCanvas.height / 2,
      50
    );

    gradient.addColorStop(0.1, "#00000000");
    gradient.addColorStop(0.5, "#61f7ff");
    gradient.addColorStop(1, "#FFFFFF00");

    profileCtx.beginPath();
    profileCtx.arc(
      playerCanvas.width / 2,
      playerCanvas.height / 2,
      50,
      0,
      2 * Math.PI,
      false
    );
    profileCtx.fillStyle = gradient;
    profileCtx.fill();

    profileCtx.closePath();

    profileCtx.fillStyle = "#b3b3b3";
    profileCtx.save();

    profileCtx.translate(playerCanvas.width / 2, playerCanvas.height / 2);

    profileCtx.rotate(pointerAngle);
    let cannon_heightFOV = 30;
    let cannon_widthFOV = 120;

    let basex = -cannon_widthFOV / 2 + cannon_heightFOV;

    let basey = -cannon_heightFOV / 2;

    profileCtx.fillRect(basex, basey, cannon_widthFOV, cannon_heightFOV);

    profileCtx.strokeStyle = "lightgrey";
    profileCtx.lineWidth = 3;
    profileCtx.strokeRect(basex, basey, cannon_widthFOV, cannon_heightFOV);
    profileCtx.restore();
    profileCtx.beginPath();
    profileCtx.arc(
      playerCanvas.width / 2,
      playerCanvas.height / 2,
      40,
      0,
      2 * Math.PI,
      false
    );
    profileCtx.fillStyle = "#828282";
    profileCtx.fill();
    profileCtx.lineWidth = 5;

    profileCtx.strokeStyle = "#aaaaaa";

    profileCtx.stroke();
    if (skinID !== 0) {
      let imageSRC = images[skinID];
      profileCtx.save();
      profileCtx.translate(playerCanvas.width / 2, playerCanvas.height / 2);
      profileCtx.rotate(pointerAngle);
      profileCtx.drawImage(imageSRC, -40, -40, 80, 80);
      profileCtx.restore();
    }
    if (canAnimateProfile) requestAnimationFrame(createProfile);
  }

  darkMode = localStorage.getItem("theme");
  canSeeNames = localStorage.getItem("canSeeNames");
  canSeeLeaderBoard = localStorage.getItem("canSeeLeaderBoard");
  canSeeChat = localStorage.getItem("canSeeChat");

  darkMode = darkMode === "true";

  if (darkMode == null) localStorage.setItem("theme", false);
  if (canSeeNames == null) localStorage.setItem("canSeeNames", true);
  if (canSeeChat == null) localStorage.setItem("canSeeChat", true);
  if (canSeeLeaderBoard == null)
    localStorage.setItem("canSeeLeaderBoard", true);
  darkMode ??= false;

  canSeeNames = canSeeNames === "true" || canSeeNames === null;
  canSeeChat = canSeeChat === "true" || canSeeChat === null;
  canSeeLeaderBoard =
    canSeeLeaderBoard === "true" || canSeeLeaderBoard === null;

  if (isCrazyGames) {
    if (window.CrazyGames.SDK.game.settings.disableChat) {
      canSeeChat = false;
    }
  }

  var newTheme = darkMode ? "dark" : "light";
  if (darkMode)
    document.getElementById("getdarkMode").classList.toggle("moveee");
  if (canSeeNames)
    document.getElementById("getnamesShown").classList.toggle("moveee");
  if (canSeeChat)
    document.getElementById("getChatShown").classList.toggle("moveee");
  if (canSeeLeaderBoard)
    document.getElementById("getleaderBoardShown").classList.toggle("moveee");
  document.querySelector("html").setAttribute("data-theme", newTheme);
  if (darkMode) {
    document.getElementById("gridDark").style.display = "grid";
    document.getElementById("gridLight").style.display = "none";
    document.getElementById("lightcrazy").style.display = "block";
    document.getElementById("darkcrazy").style.display = "none";
  }
  if (!darkMode) {
    document.getElementById("gridDark").style.display = "none";
    document.getElementById("gridLight").style.display = "grid";
    document.getElementById("lightcrazy").style.display = "none";
    document.getElementById("darkcrazy").style.display = "block";
  }

  requestAnimationFrame(createProfile);

  const getProfilePointer = (evt) => {
    var mousepos = getMousePos(playerCanvas, evt);
    pointerAngle = getMouseAngle(playerCanvas, mousepos.x, mousepos.y);
  };

  document.addEventListener("mousemove", (evt) => getProfilePointer(evt));

  var badgeLevelDiv = document.getElementById("badgeLevelDiv");

  playerCanvas.style["background-image"] =
    window.location.href.startsWith("http://127.0.0.1:5501/public/index.html")
      ? `url(${window.location.origin}/public/assets/cropped/hexbackground.webp)`
      : `url(${window.location.origin}/assets/cropped/hexbackground.webp)`;

  const skinsTabCloser = () => {
    document.getElementById("skinCon").style.visibility = "hidden";
    skinShown = false;
  };

  var skin = "0.webp";
  var skinID = 0;
  var selected_ele = {};

  document.getElementById("skinsButton").addEventListener("click", () => {
    document.getElementById("skinCon").style.visibility = "visible";
  });

  async function getSkinData() {
    const url =
      !window.location.href.startsWith("http://127.0.0.1:5501/public/index.html")
        ? "https://websocketpointer.duckdns.org/skindata"
        : "http://localhost:4500/skindata";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: getCookie("userId") }),
      });
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(error.message);
    }
  }

  var skinCounts_ = { basic: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };

  async function buySkin(skinLevel) {
    const url =
      !window.location.href.startsWith("http://127.0.0.1:5501/public/index.html")
        ? "https://websocketpointer.duckdns.org/skinpurchase"
        : "http://localhost:4500/skinpurchase";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: getCookie("userId"),
          skinLevel: skinLevel,
        }),
      });
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(error.message);
    }
  }

  (async function c(hasRestart) {
    document.getElementById("skinCon").innerHTML = `<div
            class="scroll-holder"
          >
            <div class="high-height">
              <div class="h-40-30">
                <div class="spiner-con">
                  <div class="spiner">
                    <div class="spinerRotater" id="basicSpinner"></div>
                    <img src="./spiners/2.webp" class="spinerOverlay">
                  </div>
                  <div class="leverHolder">
                    <div class="leverInnerHolder">
                      <div class="lever" id="basicSpinnerBuyLever"></div>  
                      <div class="disc"></div>
                      <div class="leverbase" id="basicSpinnerBuy">
                        Spin!
                      </div> 
                    </div>
                  </div>
                </div>
                <div class="spiner-con">
                  <div class="spiner" >
                    <div class="spinerRotater" id="uncommonSpinner"></div>
                    <img src="./spiners/4.webp" class="spinerOverlay">
                  </div>
                  <div class="leverHolder">
                    <div class="leverInnerHolder">
                      <div class="lever" id="uncommonSpinnerBuyLever"></div>  
                      <div class="disc"></div>
                      <div class="leverbase" id="uncommonSpinnerBuy">
                        Spin!
                      </div> 
                    </div>
                  </div>
                </div>
                <div class="spiner-con">
                  <div class="spiner">
                    <div class="spinerRotater" id="rareSpinner"></div>
                    <img src="./spiners/6.webp" class="spinerOverlay">
                  </div>
                  <div class="leverHolder">
                    <div class="leverInnerHolder">
                      <div class="lever" id="rareSpinnerBuyLever"></div>  
                      <div class="disc"></div>
                      <div class="leverbase" id="rareSpinnerBuy">
                        Spin!
                      </div> 
                    </div>
                  </div>
                </div>
                <div class="spiner-con">
                  <div class="spiner">
                    <div class="spinerRotater" id="epicSpinner"></div>
                    <img src="./spiners/8.webp" class="spinerOverlay">
                  </div>
                  <div class="leverHolder">
                    <div class="leverInnerHolder">
                      <div class="lever" id="epicSpinnerBuyLever"></div>  
                      <div class="disc"></div>
                      <div class="leverbase" id="epicSpinnerBuy">
                        Spin!
                      </div> 
                    </div>
                  </div>
                </div>
                <div class="spiner-con">
                  <div class="spiner">
                    <div class="spinerRotater" id="legendarySpinner"></div>
                    <img src="./spiners/10.webp" class="spinerOverlay">
                  </div>
                  <div class="leverHolder">
                    <div class="leverInnerHolder">
                      <div class="lever" id="legendarySpinnerBuyLever"></div>  
                      <div class="disc"></div>
                      <div class="leverbase" id="legendarySpinnerBuy">
                        Spin!
                      </div> 
                    </div>
                  </div>
                </div>
              </div>
              <button class="x-out" id="close" title="close button">X</button>
              <div class="skins-grid" id="skins-grid">
                
              </div>
            </div>
          </div>`;
    var skinGrid = document.getElementById("skins-grid");
    var basicSpinner_ = document.getElementById("basicSpinner");
    var uncommonSpinner_ = document.getElementById("uncommonSpinner");
    var rareSpinner_ = document.getElementById("rareSpinner");
    var epicSpinner_ = document.getElementById("epicSpinner");
    var legendarySpinner_ = document.getElementById("legendarySpinner");
    var basicSpinner = document.getElementById("basicSpinnerBuy");
    var uncommonSpinner = document.getElementById("uncommonSpinnerBuy");
    var rareSpinner = document.getElementById("rareSpinnerBuy");
    var epicSpinner = document.getElementById("epicSpinnerBuy");
    var legendarySpinner = document.getElementById("legendarySpinnerBuy");
    var skinCounts = { basic: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    basicSpinner.addEventListener("click", () => {
      setTimeout(() => {
        buyer("basic");
        c(true);
        (async function () {
          loadGearData(await getGearData());
        })();
      }, 2000);
      var basicSpinner__ = document.getElementById("basicSpinnerBuyLever");
      console.log(basicSpinner__);
      basicSpinner__.style.animation =
        "levelmover 2s cubic-bezier(0.42, 0, 0.58, 1)";
      console.log(basicSpinner__.style.animation);
    });
    uncommonSpinner.addEventListener("click", () => {
      setTimeout(() => {
        buyer("uncommon");
        c(true);
        (async function () {
          loadGearData(await getGearData());
        })();
      }, 2000);
      var uncommonSpinner__ = document.getElementById(
        "uncommonSpinnerBuyLever"
      );
      uncommonSpinner__.style.animation =
        "levelmover 2s cubic-bezier(0.42, 0, 0.58, 1)";
    });
    rareSpinner.addEventListener("click", () => {
      setTimeout(() => {
        buyer("rare");
        c(true);
        (async function () {
          loadGearData(await getGearData());
        })();
      }, 2000);
      var rareSpinner__ = document.getElementById("rareSpinnerBuyLever");
      rareSpinner__.style.animation =
        "levelmover 2s cubic-bezier(0.42, 0, 0.58, 1)";
    });
    epicSpinner.addEventListener("click", () => {
      setTimeout(() => {
        buyer("epic");
        c(true);
        (async function () {
          loadGearData(await getGearData());
        })();
      }, 2000);
      var epicSpinner__ = document.getElementById("epicSpinnerBuyLever");
      epicSpinner__.style.animation =
        "levelmover 2s cubic-bezier(0.42, 0, 0.58, 1)";
    });
    legendarySpinner.addEventListener("click", () => {
      setTimeout(() => {
        buyer("legendary");
        c(true);
        (async function () {
          loadGearData(await getGearData());
        })();
      }, 2000);
      var legendarySpinner__ = document.getElementById(
        "legendarySpinnerBuyLever"
      );
      legendarySpinner__.style.animation =
        "levelmover 2s cubic-bezier(0.42, 0, 0.58, 1)";
    });
    document.getElementById("close").addEventListener("click", skinsTabCloser);
    var reqdata = await getSkinData();
    var skinData = reqdata.skins;
    var skinDataTeirs = reqdata.skindata;
    console.log(reqdata);
    for (let i = 0; i < 28; i++) {
      var skinDiv = document.createElement("div");
      var skinImg = document.createElement("img");
      skinGrid.appendChild(skinDiv);
      skinDiv.appendChild(skinImg);
      skinImg.src =
        window.location.href.startsWith("http://127.0.0.1:5501/public/index.html")
          ? `/public/skins/${i}.webp`
          : `/skins/${i}.webp`;

      skinImg.classList.add("_100per_");
      skinDiv.classList.add("skin-div");
      var selectSkin = () => {
        skinID = i;
        skin = `${i}.webp`;
        [...document.getElementById("skins-grid").children].forEach((skin) => {
          skin.classList.remove("selected-skin");
        });
        document
          .getElementById("skins-grid")
          .children[i].classList.add("selected-skin");
        selected_ele = skinImg;
      };
      if (skinData.includes(`${i}.webp`)) {
        skinDiv.addEventListener("click", selectSkin);
      } else {
        var lockedImg = document.createElement("img");
        lockedImg.src =
          window.location.href.startsWith("http://127.0.0.1:5501/public/index.html")
            ? `/public/assets/locked.svg`
            : `/assets/locked.svg`;
        lockedImg.classList.add("lock-img");

        var spinnerImg = document.createElement("img");
        spinnerImg.classList.add("_10per_");
        spinnerImg.classList.add("spin-img");
        spinnerImg.src = `./skins/${i}.webp`;
        spinnerImg.id = `spin-img${i}`;
        switch (skinDataTeirs[`${i}.webp`]) {
          case "basic": {
            basicSpinner_.appendChild(spinnerImg);
            skinCounts.basic++;
            break;
          }
          case "uncommon": {
            uncommonSpinner_.appendChild(spinnerImg);
            skinCounts.uncommon++;
            break;
          }
          case "rare": {
            rareSpinner_.appendChild(spinnerImg);
            skinCounts.rare++;
            break;
          }
          case "epic": {
            epicSpinner_.appendChild(spinnerImg);
            skinCounts.epic++;
            break;
          }
          case "legendary": {
            legendarySpinner_.appendChild(spinnerImg);
            skinCounts.legendary++;
            break;
          }
        }
        skinCounts_ = skinCounts;
        var cTime = reqdata.skinCounts[skinDataTeirs[`${i}.webp`]] < 3 ? 2 : 4;
        var transformationR =
          reqdata.skinCounts[skinDataTeirs[`${i}.webp`]] > 1
            ? 57.1428571429 * reqdata.skinCounts[skinDataTeirs[`${i}.webp`]]
            : 0;
        var vTime =
          reqdata.skinCounts[skinDataTeirs[`${i}.webp`]] < 3 ? 1 : 0.6;
        var execTempStyle = `
        transform: translateZ(-5900px) rotate3d(1, 0, 0, var(--rotatorerangle));
        animation: rotater2 ${cTime}s linear infinite;
        animation-delay: ${-skinCounts[skinDataTeirs[`${i}.webp`]] * vTime}s;
        transform-origin: 0% 50% -${transformationR}px; 
        `;
        console.log(skinCounts);
        console.log(reqdata.skinCounts);
        console.log(reqdata.skinCounts[skinDataTeirs[`${i}.webp`]]);

        skinDiv.appendChild(lockedImg);

        spinnerImg.style = execTempStyle;
      }
      var skinImgFrame = document.createElement("img");
      skinImgFrame.src = `./skin-background/${skinDataTeirs[`${i}.webp`]}.webp`;
      skinImgFrame.classList.add("skin-frame");
      skinDiv.append(skinImgFrame);
    }
    document
      .getElementById("skinButton")
      .removeEventListener("click", skinsTabOpener);
    if (hasRestart) {
      if (skinShown) {
        for (let i = 1; i < 28; i++) {
          var skinCounts2 = {
            basic: 0,
            uncommon: 0,
            rare: 0,
            epic: 0,
            legendary: 0,
          };
          switch (skinDataTeirs[`${i}.webp`]) {
            case "basic": {
              skinCounts2.basic++;
              break;
            }
            case "uncommon": {
              skinCounts2.uncommon++;
              break;
            }
            case "rare": {
              skinCounts2.rare++;
              break;
            }
            case "epic": {
              skinCounts2.epic++;
              break;
            }
            case "legendary": {
              skinCounts2.legendary++;
              break;
            }
          }
        }
      }
      skinShown = true;
    }
    skinsTabOpener = () => {
      console.log("z");
      skinShown = !skinShown;
      console.log(skinShown);
      document.getElementById("skinCon").style.visibility = skinShown
        ? "visible"
        : "hidden";
      if (skinShown) {
        for (let i = 1; i < 28; i++) {
          var skinCounts2 = {
            basic: 0,
            uncommon: 0,
            rare: 0,
            epic: 0,
            legendary: 0,
          };
          switch (skinDataTeirs[`${i}.webp`]) {
            case "basic": {
              skinCounts2.basic++;
              break;
            }
            case "uncommon": {
              skinCounts2.uncommon++;
              break;
            }
            case "rare": {
              skinCounts2.rare++;
              break;
            }
            case "epic": {
              skinCounts2.epic++;
              break;
            }
            case "legendary": {
              skinCounts2.legendary++;
              break;
            }
          }
        }
      }
    };
    document
      .getElementById("skinButton")
      .addEventListener("click", skinsTabOpener);
  })();

  function waitForProperty(element, property, targetValue, onComplete) {
    let currentStyle = getComputedStyle(element);
    let currentValue = currentStyle.getPropertyValue(property);

    if (currentValue === targetValue) {
      onComplete();
    } else {
      requestAnimationFrame(() =>
        waitForProperty(element, property, targetValue, onComplete)
      );
    }
  }
  var buyer = async (skinLevel) => {
    var skinBuyerLevel = await buySkin(skinLevel);
    if (skinBuyerLevel.successful === "success") {
      for (let i = 1; i < 28; i++) {
        try {
          var spinnerImg = document.getElementById(
            `spin-img${skinBuyerLevel.i}`
          );
          spinnerImg.style.animationTimingFunction =
            "cubic-bezier(0.31, 0.25, 0.09, 0.74);";
        } catch (e) {
          console.log(e);
        }
      }
      const element = document.getElementById(`spin-img${skinBuyerLevel.i}`);
      const property = "--rotatorerangle";
      const targetValue = "180deg";

      waitForProperty(element, property, targetValue, () => {
        console.log("Animation property reached target value!");
      });
    } else if (gearCount.purchaseSuccsefull === "noAccount") {
      alert("purchase error; You need to play a least once to by a boost");
    } else if (gearCount.purchaseSuccsefull === "AccountError") {
      alert(
        "account error; Account not found; Play to refresh your token; it may be a server error"
      );
    } else if (gearCount.purchaseSuccsefull === "noEnoughCoins") {
      alert(
        "currency error; You do not have enough Golden gears; Purchase or play to get more!"
      );
    }
  };
  var buyer = (skinLevel) => {};

  var skinShown = false;
  var skinsTabOpener = () => {
    skinShown = !skinShown;
    document.getElementById("skinCon").style.visibility = skinShown
      ? "visible"
      : "hidden";
  };
  document
    .getElementById("skinButton")
    .addEventListener("click", skinsTabOpener);

  const startGame = () => {
    if (isCrazyGames) {
      window.CrazyGames.SDK.game.gameplayStart();
      window.CrazyGames.SDK.banner.clearAllBanners();
    }
    username = document.getElementById("username").value;
    document.removeEventListener("mousemove", (evt) => getProfilePointer(evt));
    canAnimateProfile = false;
    document.getElementById("full-screen").style.display = "flex";

    if (username) {
      setTimeout(() => {
        document.getElementById("landing-page").style.display = "none";
        document.getElementById("game").style.display = "block";
        if (username !== "A") {
          document.addEventListener("contextmenu", (event) =>
            event.preventDefault()
          );
        }
        ongame();
      }, 100);
    } else {
      setTimeout(() => {
        function generateRandomNumber(min, max) {
          return Math.random() * (max - min) + min;
        }
        username = "unknown-" + Math.round(generateRandomNumber(0, 1000));
        document.getElementById("landing-page").style.display = "none";
        document.getElementById("game").style.display = "block";
        /*document.addEventListener("contextmenu", (event) =>
          event.preventDefault()
        );*/
        ongame();
      }, 100);
    }
  };
  if (isCrazyGames) {
    if (window.CrazyGames.SDK.game.isInstantMultiplayer) {
      startGame();
    }
  }
  if (!isCrazyGames) {
    window.addEventListener("load", () => {
      document
        .getElementById("playButton")
        .addEventListener("mousedown", startGame);
      document.getElementById("full-screen").style.display = "none";
    });
  }
  if (isCrazyGames) {
    var game = {
      start: () => {
        document
          .getElementById("playButton")
          .addEventListener("mousedown", startGame);
        document.getElementById("full-screen").style.display = "none";
      },
    };
    try {
      await window.CrazyGames.SDK.banner.requestResponsiveBanner("adbox");
    } catch (e) {
      console.log("Error on request responsive banner", e);
    }
    CrazyGames.SDK.init().then(() => {
      game.start();
    });
  }
})();

console.log(
  "%c%s %c%s %c%s %c%s %c%s %c%s %c%s",
  "color:white",
  "Wellcome",
  "color:red",
  "skill issues!!!",
  "color:white",
  "Don't run scripts in here from stragers (Or anyone). Just don't",
  "color:red",
  "A good person is a person that clicks the X button of dev tools",
  "color:white",
  "\n\n\n\n",
  "color:red",
  "X",
  "color:white",
  "\n ⬆\n ⬆\n ⬆\n ⬆\n ⬆\n"
);
