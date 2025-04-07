// LOL, you little kids can't mess with my game
(function () {
  function generateRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }
  var username;

  const schema = `
    syntax = "proto3";

    message GameObject {
      float angle = 1;
      string cvolor = 2;
      int32 health = 3;
      int32 maxhealth = 4;
      float size = 5;
      string type = 6;
      float weight = 7;
      float x = 8;
      float y = 9;
      float transparency = 10;
      float randomID = 11;
    }

    message GameObjectList {
      repeated GameObject objects = 1;
    }
    `;

  function loadProto() {
    // Define the schema directly as a JSON object
    const schema = {
      nested: {
        GameObject: {
          fields: {
            angle: { type: "float", id: 1 },
            color: { type: "string", id: 2 },
            health: { type: "int32", id: 3 },
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

  function ongame() {
    const socket =
      new /*skill issus are comming to my server mohaa ha ha*/ WebSocket(
        "wss://127.0.0.1:4000"
      );
    socket.binaryType = "arraybuffer";
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
            float randomID = 11;
          }

          message GameObjectList {
            repeated GameObject objects = 1;
          }
          `;

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

    document.getElementsByTagName("body")[0].style.cursor =
      "url('https://deip-io3.glitch.me/targetpointer1.cur'), auto";
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

    var grid = document.getElementById("grid");

    var types = [
      "basic",
      "twin",
      "flank",
      "sniper",
      "mechiane gun",
      "spreader",
      "rammer",
      "traper",
      "directer",
      "autobasic",
    ];

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
    var playerMovementX = 0;
    var playerMovementY = 0;
    var playerHealth = 100;
    var maxhealth = 100;
    var playerHealTime = 0;
    var playerReheal = 1;
    var playerSpeed = 10;
    var playerSize = 1;
    var playerBaseSize = 40;
    var bodyDamage = 3;
    var __type__ = "basic";
    var typeindex = 0;
    var selected_class = null;
    var xp = 0;
    var level = 0;
    var upgradePoints = 0;
    var maxUP = 8;
    var dead = false;
    var joinedTeam = false;
    var teamOn = null;
    var owner_of_team = false;
    var score = 0;
    var prescore = -1;
    var announcements = [];
    var playerMessages = [];
    var messaging = false;
    var hidden = false;
    var blinking = false;

    // 🕹️ Movement & Controls
    var canmove = true;
    var canKeyPress = true;
    var canFire = true;
    var canFire2 = true;
    var keysPressed = {};
    var keyevents = [];
    var movementTimeouts = [];
    var autoRotating = false;
    var lockautoRotating = false;
    var autoAngle = 0;
    var current_angle = 0;
    var MouseX_ = 0;
    var MouseY_ = 0;
    var MouseX = 0;
    var MouseY = 0;
    var firingIntervals = {};
    var firingInterval = null;

    // 💥 Combat & Weapons
    var bullets = [];
    var boardbullets = [];
    var zlevelbullets = [];
    var autoFiring = false;
    var autoIntevals = [];
    var baseFireInterval = 750;
    var cannonFireData = [true];
    var bullet_damage = 10;
    var bullet_speed = 4;
    var bullet_size = 15;
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
    var gridstyle = grid.style;
    var sqrt23 = Math.sqrt(3) / 2;
    var pi = Math.PI;
    var pentarotate = 0;

    // 🛡️ UI & Interface
    var container = document.getElementById("container");
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
    var button40 = 0.03879728419 * canvas.height;
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
    var teamlist = [];
    var pubteams = [];
    var teamOver = false;
    var userId = getCookie("userId");
    var typedtext = "";

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
    var scaleUp = 0;
    var state = "start";
    var statecycle = 0;
    var progress = 0.0;
    var keyevents = [];
    var pentarotate = 0;
    var boundrectcanvas = Ghostcanvas.getBoundingClientRect();
    var requests = [];
    var levels = {
      0: 15,
    };
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

    function getMousePos(canvas, evt) {
      const rect = boundrectcanvas;
      return {
        x: evt.clientX,
        y: evt.clientY,
      };
    }

    function send(type, data) {
      if (socket.readyState === WebSocket.OPEN) {
        try {
          socket.send(JSON.stringify({ type: type, data: data }));
        } catch (e) {
          if (errors > 2) return;
          setTimeout(() => {
            window.location.reload();
          }, 2500);
          alert(
            "There is an error or socket disconnection. Please report this if the error is not related to a closing state error."
          );
          alert("error", e);
        }
      } else {
        setTimeout(() => {
          //window.location.reload();
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

    setCookie("score", 25000000, 100);

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

          var img__ = document.createElement("img");
          var tileImg = upgrade.img;
          tankstiles.appendChild(img__);

          img__.src = "tanktiles/" + tileImg + ".png";
          img__.style = "width: 6vw; height: 6vw; margin: 10px; z-index: 100;";

          img__.addEventListener("click", function () {
            event.stopPropagation();
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
            if (tankdata["AutoRoting"]) {
              autoRotating = true;
              lockautoRotating = true;
            }
            if (tankdata.fov !== 0) {
              scaleby(tankdata.fov);
            }

            send("typeChange", {
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
              MouseX: MouseX_,
              Regenspeed: Regenspeed,
              MouseY: MouseY_,
              visible: true,
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
              team: teamOn,
              userId: userId,
            });

            setTimeout(() => {
              cannonWidth = [];
              cannonFireData = [];
              for (let i = 0; i < Object.keys(tankdatacannon__).length; i++) {
                cannonWidth.push(0);
                cannonFireData.push(true);
              }
              autocannons.forEach((popcannon) => {
                if (popcannon.playerid === playerId) {
                  send("deletAuto", { CannonID: popcannon.CannonID });
                  clearInterval(popcannon);
                  popcannon = null;
                }
              });
              for (const cannon_ in tankdatacannon__) {
                let cannon = tankdatacannon__[cannon_];
                if (
                  cannon.type === "autoCannon" ||
                  cannon.type === "SwivelAutoCannon"
                ) {
                  let autoID = Math.random() * 1000 + Math.random() * 1000;
                  send("autoCannonADD", {
                    CannonID: autoID,
                    playerid: playerId,
                    angle: 0,
                    _type_: cannon.type,
                    cannonWidth: 0,
                  });
                  let cannon__ = cannon;
                  let tankdata = tankmeta[__type__];
                  let _CAN = {
                    CannonID: autoID,
                    playerid: playerId,
                    angle: 0,
                    _type_: cannon.type,
                    cannonWidth: 0,
                  };
                  function cannonINT() {
                    var __tankdata__ = tankmeta[__type__];
                    if (_CAN.playerid === playerId) {
                      let cannon;
                      let index = 0;
                      for (const ___cannon___ in __tankdata__.cannons) {
                        let cannon___ = __tankdata__.cannons[___cannon___];
                        if (index === cannon__.autoindex) {
                          cannon = cannon___;
                        }
                        index++;
                      }
                      var offSet_x = tankdatacannon__[cannon_]["offSet-x"];
                      if (tankdatacannon__[cannon_]["offSet-x"] === "playerX") {
                        offSet_x = playerSize * playerBaseSize * FOV;
                      }
                      if (tankdatacannon__[cannon_]["offSet-x-multpliyer"]) {
                        offSet_x *= -1;
                      }
                      let angle0 = getCannonAngle();
                      if (
                        tankdatacannon__[cannon_].type === "SwivelAutoCannon"
                      ) {
                        var [x, y] = rotatePointAroundPlayer(
                          offSet_x,
                          0,
                          angle0 * (180 / Math.PI)
                        );
                      }

                      //ctx.translate((canW / 2)+x,y+canH / 2);
                      if (
                        tankdatacannon__[cannon_].type === "SwivelAutoCannon"
                      ) {
                        send("Autofire", {
                          playerId: playerId,
                          playerX: playerX + x,
                          playerY: playerY + y,
                          cannon: cannon__,
                          bullet_damage: bullet_damage,
                          bullet_speed: bullet_speed,
                          bullet_size: bullet_size,
                          bullet_pentration: bullet_pentration,
                          extracannon_: cannon_,
                          _cannon: _CAN,
                        });
                      }
                      if (tankdatacannon__[cannon_].type === "autoCannon") {
                        send("Autofire", {
                          playerId: playerId,
                          playerX: playerX - offSet_x,
                          playerY: playerY,
                          cannon: cannon__,
                          bullet_damage: bullet_damage,
                          bullet_speed: bullet_speed,
                          bullet_size: bullet_size,
                          bullet_pentration: bullet_pentration,
                          extracannon_: cannon_,
                          _cannon: _CAN,
                        });
                      }
                    }
                    setTimeout(() => {
                      cannonINT();
                    }, baseFireInterval * tankdata["reaload-m"] * cannon["reloadM"] * __reload__);
                  }
                  setTimeout(() => {
                    cannonINT();
                  }, baseFireInterval * tankdata["reaload-m"] * cannon["reloadM"] * __reload__);
                  autoIntevals.push({ cannonINT: cannonINT, autoID: autoID });
                }
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
        send("Sizeup", { id: playerId, plus: playerSize * 0.005 });
        scaleby(scaleUp);
        while (score / levels[level] >= 1) {
          level += 1;
          upgradePoints += 1;
          playerSize += playerSize * 0.005;
          send("Sizeup", { id: playerId, plus: playerSize * 0.005 });
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
          downArrow.addEventListener("click", () => {
            downArrow.style.rotate = isDown ? "180deg" : "0deg";
            infoConteiner.style.display = isDown ? "none" : "block";
            isDown = !isDown;
          });
          item.addEventListener("click", () => {
            Array.from(teamcontainer.children).forEach((child) => {
              child.classList.remove("glow");
            });

            item.classList.add("glow");

            selected_class = team.teamID;
          });
        });
      } else {
        let MYteam = pubteams.find((team) => {
          return team.teamID === players[playerId].team;
        });
        var amLower = MYteam.lowerLevelPlayers.includes({
          id: playerId,
          username: username,
        });
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
            item.addEventListener("mouseover", () => {
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
            });
          }
          if (MYteam.owner.id === playerId || amLower) {
            var canPremote = amLower
              ? MYteam.powers.lowerlevelpowers.canDedicatePower
              : MYteam.powers.canDedicatePower;

            var canDemote = amLower
              ? MYteam.powers.lowerlevelpowers.canDededicatePower
              : MYteam.powers.canDededicatePower;

            if (canPremote && MYteam.owner.id !== player.id) {
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
                    premotor: MYteam.owner,
                    MYteamID: MYteam.teamID,
                  });
                  premoteArrow.removeEventListener("click", addplayer);
                };

                premoteArrow.addEventListener("click", addplayer);
              }
            }
            if (canDemote && MYteam.owner.id !== player.id) {
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
                    premotor: MYteam.owner,
                    MYteamID: MYteam.teamID,
                  });
                  demoteArrow.removeEventListener("click", addplayer);
                };

                demoteArrow.addEventListener("click", addplayer);
              }
            }
          }
        });
      }
    }

    socket.onopen = function () {
      setTimeout(() => {
        console.time("preconnect");
        let resolveDraw, rejectDraw;
        let resolveDraw2, rejectDraw2;
        let resolveDraw3, rejectDraw3;
        let resolveDraw4, rejectDraw4;

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

        var recivedData = [
          configPromise,
          tankmetaPromise,
          levelPromise,
          IDPromise,
        ];

        Promise.allSettled(recivedData).then(() => {
          console.timeEnd("preconnect");
          scaleby(0);
          draw();
        });

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
        img.src = `https://deip-io3.glitch.me${badge}?nocache=${Date.now()}`;

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
            case "Config": {
              baseFireInterval = data.baseFireInterval;
              scaleUp = data.scaleUp;
              playerBaseSize = data.playerBaseSize;
              for (let i = 0; i < data.map.size / 500; i++) {
                for (let j = 0; j < data.map.size / 500; j++) {
                  const div = document.createElement("div");
                  const img = document.createElement("img");
                  img.style.width = "100%";
                  img.style.height = "100%";
                  img.src = "assets/hexbackground.png";
                  let divstyle = div.style;
                  divstyle.width = "999px";
                  divstyle.height = "999px";
                  divstyle.backgroundColor = "white";
                  divstyle.border = "1px solid black";
                  div.appendChild(img);
                  document.getElementById("grid").appendChild(div);
                }
              }
              resolveDraw();
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
              break;
            }
            case "handshake": {
              HANDSHAKE = data;
              break;
            }
            case "updaterHeal": {
              if (!players[data.ID]) return;
              players[data.ID].playerHealTime = data.HEALTime;
              break;
            }
            case "playerHeal": {
              players[data.ID].health = data.HEALTH;
              if (data.ID === playerId) {
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
              img.src = `https://deip-io3.glitch.me${badge}?nocache=${Date.now()}`;
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
              let id = data.playerId;
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
                  //document.getElementById("myCanvas").style.display = "none";
                  document.getElementById("tanktiles").style.display = "none";
                }, 10);
                dead = true;

                clearInterval(healer);
                send("playerDied", { id: playerId });
                //socket.onmessage = {};
                autoIntevals;
                autoIntevals.forEach((timeout) => {
                  clearTimeout(timeout);
                });
                autoIntevals = [];

                canvas = document.getElementById("myCanvas");
                canvas.style["z-index"] = "5";
                let respawn = document.createElement("button");

                respawn.innerHTML = "Respawn";
                respawn.style.position = "absolute";
                respawn.style.top = "calc(50vh - 50px)";
                respawn.style.left = "calc(50vw - 100px)";
                respawn.style.width = "200px";
                respawn.style.height = "100px";
                respawn.style["z-index"] = "12";
                document.getElementsByTagName("body")[0].style.cursor = "auto";
                document.getElementById("game").appendChild(respawn);
                respawn.addEventListener("click", () => {
                  window.location.reload();
                });
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
                  playerID: playerId,
                });
                setTimeout(() => {
                  state = "normal";
                  statecycle = 0;
                  send("statechange", {
                    state: state,
                    statecycle: statecycle,
                    playerID: playerId,
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
                  playerID: playerId,
                });
                setTimeout(() => {
                  state = "normal";
                  statecycle = 0;
                  send("statechange", {
                    state: state,
                    statecycle: statecycle,
                    playerID: playerId,
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
            case "playerJoined": {
              console.log(data); // Log the player data
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
                  playerId: playerId,
                  playerReheal: playerReheal,
                });
              }, 3000);
              break;
            }
            case "playerScore": {
              players[data["bulletId"]].score += data["socrepluse"];
              if (data["bulletId"] === playerId) {
                score = players[data["bulletId"]].score;
              }
              levelHANDLER();
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
            case "JoinTeamSuccess": {
              if (data.id === playerId) {
                joinedTeam = true;
              }
              break;
            }
            case "playerJoinedTeam": {
              players[data.id].team = data.teamId;
              if (data.id === playerId && data.teamId !== null) {
                joinedTeam = true;
                teamOn = data.teamId;
              }
              if (data.id === playerId && data.teamId === null) {
                joinedTeam = false;
                owner_of_team = false;
                teamOn = null;
              }
              break;
            }
            case "newOwner": {
              if (data.teamID === teamOn) {
                owner_of_team = true;
              }
              break;
            }
            case "bulletDamage": {
              if (players[data.playerID]) {
                bullets = data.BULLETS; // Check if the player exists
                players[data.playerID].health = data.playerHealth;

                if (data.playerID == playerId) {
                  playerHealth = data.playerHealth;
                  send("playerHealintterupted", { ID: playerId });
                  playerHealTime = 0;
                  state = "damaged";
                  send("statechange", {
                    state: state,
                    statecycle: statecycle,
                    playerID: playerId,
                  });
                  setTimeout(() => {
                    state = "normal";
                    send("statechange", {
                      state: state,
                      statecycle: statecycle,
                      playerID: playerId,
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
            case "shapeDamage": {
              if (players[data.PlayerId]) {
                players[data.PlayerId].health -= data.playerDamage;

                if (data.PlayerId == playerId) {
                  state = "damaged";
                  //statecycle = 0;
                  send("statechange", {
                    state: state,
                    statecycle: statecycle,
                    playerID: playerId,
                  });
                  setTimeout(() => {
                    state = "normal";
                    //statecycle = 0;
                    send("statechange", {
                      state: state,
                      statecycle: statecycle,
                      playerID: playerId,
                    });
                  }, 1000);
                  playerHealth -= data.playerDamage;
                  playerHealTime = 0;
                  send("playerHealintterupted", { ID: playerId });
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
              players[data.id] = data;
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
              userId = data.newid;
              setCookie("userId", userId, 365);
              break;
            }
            default: {
              console.log("Empty action received.", type);
              break;
            }
          }
        };

        document.addEventListener("visibilitychange", (event) => {
          send("windowStateChange", {
            vis: document.visibilityState,
            id: playerId,
          });
        });

        const movePlayer = (dx, dy, last, i) => {
          movementTimeouts.shift();
          if (!canmove) return;
          cavansX += dx;
          playerY += dy;
          cavansY += dy;
          playerX += dx;

          if (i in nolist) return; // just roll with it
          send("playerMoved", {
            id: playerId,
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
            ID: playerId,
            maxhealth: maxhealth,
          });
        }, 1000);

        function MathHypotenuse(x, y) {
          return Math.sqrt(x * x + y * y);
        }

        function setCookie(cname, cvalue, exdays) {
          const d = new Date();
          d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
          let expires = "expires=" + d.toUTCString();
          document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        }

        document.addEventListener("keydown", (event) => {
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
              send("playerSend", { id: playerId, text: typedtext });
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
        });

        document.addEventListener("keyup", (event) => {
          delete keysPressed[event.key];
        });

        document.addEventListener("mousemove", (evt) => {
          var mousepos = getMousePos(window, evt);
          if (!autoRotating && !lockautoRotating) {
            MouseX_ = mousepos.x;
            MouseY_ = mousepos.y;
            let __angle__ = getCannonAngle();
            send("playerCannonMoved", {
              id: playerId,
              cannon_angle: __angle__,
              MouseX: MouseX_,
              MouseY: MouseY_,
            });
          }
          MouseX = mousepos.x;
          MouseY = mousepos.y;
        });

        function generateRandomNumber(min, max) {
          return Math.random() * (max - min) + min;
        }

        document.getElementById("teamButton").addEventListener("click", () => {
          var teamname = document.getElementById("teamname").value;
          var checked, checked2, checked3;

          try {
            var checkedValue = document.querySelector(".null:checked").value;
            checked = true;
          } catch {
            checked = false;
          }
          var description = document.getElementById("teamDescription").value;

          try {
            var checkedValue = document.querySelector(".null2:checked").value;
            checked2 = true;
          } catch {
            checked2 = false;
          }

          var govType = document.querySelector(
            'input[name="teamType"]:checked'
          ).value;

          try {
            var checkedValue = document.querySelector(".null3:checked").value;
            checked3 = true;
          } catch {
            checked3 = false;
          }

          var ScheduledBasedTax =
            document.getElementById("ScheduledBased").value;

          var ScheduledBasedTaxInterval =
            document.getElementById("time-select").value;

          var description = document.getElementById("Simple").value;
          document.getElementById("teambox").style.display = "none";

          joinLeave.innerText = "Leave";

          createDelete.innerText = "Delete";
          send("newTeamCreated", {
            owner: { id: playerId, username: username },
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
        });

        function bounceBackAndRecoil(i, Bsize, Bspeed, anlge_) {
          cannonWidth[i] = cannonWidth[i] || 0;
          for (let t = 0; t < 10; t++) {
            setTimeout(() => {
              cannonWidth[i] -= 1;
              send("playerCannonWidth", {
                id: playerId,
                cannonW: cannonWidth,
              });
            }, 10 * t);
            setTimeout(() => {
              cannonWidth[i] += 1;
              send("playerCannonWidth", {
                id: playerId,
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
                cannon["type"] === "trap"
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
              } else if (cannon["type"] === "AutoBulletCannon") {
                var xxx = cannon["cannon-width"] - bullet_size_l * 1.5;
                var yyy = cannon["cannon-height"] - bullet_size_l * 2;
                var angle_ = angle + cannon["offset-angle"];
              } else if (cannon["type"] === "rocketer") {
                var xxx = cannon["cannon-width-bottom"] + bullet_size_l * 2;
                var yyy =
                  cannon["cannon-height"] - cannon["cannon-width-bottom"];
                var angle_ = angle + cannon["offset-angle"];
              } else {
                var xxx = cannon["cannon-height"] + bullet_size_l;
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
                id: playerId,
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
                    cannon["type"] === "trap"
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
                  } else if (cannon["type"] === "AutoBulletCannon") {
                    var xxx = cannon["cannon-width"] - bullet_size_l * 1.5;
                    var yyy = cannon["cannon-height"] - bullet_size_l * 2;
                    var angle_ = angle + cannon["offset-angle"];
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
                    id: playerId,
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

        document.addEventListener("mousedown", (evt) => {
          if (teampanelopen) return;
          fireOnce(evt, false);
        });

        window.addEventListener("resize", (evt) => {
          scaleby(0);
        });

        document.addEventListener("click", (evt) => {
          if (!teampanelopen) {
            evt.preventDefault();
          }
        });

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
            for (var cannon in tankmeta[__type__]["cannons"]) {
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

        Xbutton.addEventListener("click", () => {
          teampanelopen = false;
          var teamcontainer = document.getElementById("teamcontainer");
          var teamMain = document.getElementById("teamMain");
          teamcontainer.style.display = "none";
          teamMain.style.display = "none";
          document.getElementById("teambox").style.display = "none";
          document.getElementsByTagName("body")[0].style.cursor =
            "url('https://deip-io3.glitch.me/targetpointer1.cur'), auto";
        });

        var joinLeave = document.getElementById("join/leave");
        joinLeave.addEventListener("click", () => {
          if (!joinedTeam) {
            if (selected_class !== null) {
              send("playerJoinedTeam", {
                id: playerId,
                teamId: selected_class,
              });
              joinLeave.innerText = "Leave";
              createDelete.style.display = "none";
            }
          } else {
            send("playerLeftTeam", {
              id: playerId,
              teamId: players[playerId].team,
            });
            createDelete.style.display = "block";
            createDelete.innerText = "Create";
            if (owner_of_team) {
              owner_of_team = false;
            }
            joinLeave.innerText = "Join";
            joinedTeam = false;
            selected_class = null;
          }
        });

        var createDelete = document.getElementById("create/delete");

        createDelete.addEventListener("click", () => {
          if (!owner_of_team) {
            document.getElementById("teambox").style.display = "block";
          } else if (owner_of_team && joinedTeam) {
            send("deleteTeam", { teamID: teamOn, playerId: playerId });
          }
        });

        document.addEventListener("mousedown", (evt) => {
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
              send("MouseAway", { id: playerId });
            }
          }
        });

        document.addEventListener("mouseup", function () {
          for (const interval in firingIntervals) {
            firingInterval = firingIntervals[interval];
            clearInterval(firingInterval);
            firingInterval = null;
            canFire2 = true;
          }

          send("MousestateUpdate", { id: playerId });
        });
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
            canvas.width / 2 - 20,
            canvas.height - button10 * 15,
            button40,
            button40
          );
        } catch {}
      }
    }

    const movePlayer = (dx, dy, last, i) => {
      movementTimeouts.shift();
      cavansX += dx;
      playerY += dy;
      cavansY += dy;
      playerX += dx;

      send("playerMoved", {
        id: playerId,
        x: playerX,
        y: playerY,
        dx: dx,
        dy: dy,
        last: last,
      });
    };

    function MathHypotenuse(x, y) {
      return Math.sqrt(x * x + y * y);
    }

    const checkCollisions = (dx, dy) => {
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
          send("playerHealintterupted", { ID: playerId });
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
        id: playerId,
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
      var upscaleX2 = 1 + (1 - oWidth / canvas.width);
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
      button40 = 0.03879728419 * canvas.height;
      button10 = 0.00969932104 * canvas.height;
      button110 = 0.10669253152 * canvas.height;
      barWidth = 0.3125 * canvas.width;
      barHeight = 0.02909796314 * canvas.height;
      document.getElementById("grid").style[
        "grid-template-columns"
      ] = `repeat(10, ${999 * scaleFactor + 1}px)`;
      document.getElementById("grid").style[
        "grid-template-rows"
      ] = `repeat(10, ${999 * scaleFactor + 1}px)`;
      document.getElementById("grid").style.width = `${10000 * scaleFactor}px`;
      document.getElementById("grid").style.height = `${10000 * scaleFactor}px`;
      document.getElementById("grid").childNodes.forEach((node) => {
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
        var shoved_down = false;
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
            score = players[playerId].score;
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
                id: playerId,
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
                id: playerId,
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
                id: playerId,
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
                id: playerId,
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
                id: playerId,
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
                id: playerId,
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
                id: playerId,
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
                id: playerId,
              });
            }
            waitpls();
          } else if (keysPressed["="]) {
            FOV += 0.1;
          } else if (keysPressed["e"]) {
            send("autoFiringUpdate", { autoFiring: !autoFiring, id: playerId });
            if (lockautoRotating) return;
            autoFiring = !autoFiring;
            if (!autoFiring) {
              canFire = true;
            }
            waitpls();
          } else if (keysPressed["c"]) {
            if (autoRotating && !lockautoRotating) {
              send("unrotating", { id: playerId });
            } else {
              send("rotate", {
                autoAngle: angle * (180 / pi),
                id: playerId,
                autoIntevals: autoIntevals,
                playerSize: playerSize,
                FOV: scaleFactor,
                canvaswidth: canvas.width,
                canvasheight: canvas.height,
              });
            }
            autoRotating = !autoRotating;
            waitpls();
          }
        }
      }

      newnotify.run();

      let tankdata = tankmeta[__type__];

      let tankdatacannon = tankdata["cannons"];

      let FOVplayerz = playerSize * FOV;

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

        if (tankdatacannondata["type"] === "trap") {
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
          ctx.fillRect(
            basex * playerSize * FOV,
            basey * playerSize * FOV,
            cannon_widthFOV - reH,
            cannon_heightFOV
          );

          ctx.strokeStyle = "lightgrey";
          ctx.lineWidth = 3; // Set border width
          ctx.strokeRect(
            basex * playerSize * FOV,
            basey * playerSize * FOV,
            cannon_widthFOV - reH,
            cannon_heightFOV
          );

          var cannonHeight = reH;
          var cannonWidth_top = cannon_heightFOV * 1.4;
          var cannonWidth_bottom = cannon_heightFOV;

          basex = basex + (cannon_widthFOV - trapR);

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
          let angle0 = getCannonAngle();
          var [x, y] = rotatePointAroundPlayer(
            offSet_x,
            0,
            angle0 * (180 / Math.PI)
          );

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
      let num = statecycle % 10;
      if (state === "start" || state === "damaged") {
        let backwardsObj = { 1: 4, 2: 3, 3: 2, 4: 1, 5: 0.1 };
        let percentage =
          statecycle % 10 <= 5
            ? statecycle % 10
            : backwardsObj[(statecycle % 10) - 5];
        percentage /= 10;
        let newrgb = mix([0, 0, 255], [255, 255, 255], percentage);
        ctx.fillStyle = `rgb(${newrgb[0]} ${newrgb[1]} ${newrgb[2]})`;
      } else {
        ctx.fillStyle = "blue";
      }
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "darkblue";
      ctx.stroke();

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
      var _vertices = [];
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
          realx + item.size > 0 + cavansX &&
          realx < canvas.width + cavansX + item.size &&
          realy - cavansY > 0 - item.size &&
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
            var _vertices = [];
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
              ctx.fillStyle = "black";
              ctx.fillRect(-45, 35, 90 * FOV, 10);
              const healthWidth = (item.health / item.maxhealth) * 90 * FOV;
              ctx.fillStyle = "green";
              ctx.fillRect(-45, 35, healthWidth, 10);
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
              ctx.fillStyle = "black";
              ctx.fillRect(-45, 35, 90 * FOV, 10);
              const healthWidth = (item.health / item.maxhealth) * 90 * FOV;
              ctx.fillStyle = "green";
              ctx.fillRect(-45, 35, healthWidth, 10);
            }
            ctx.restore();
          }
          ctx.globalAlpha = 1;
        }
      });
      ctx.lineJoin = "miter";

      let unZbullets = [];

      bullets.forEach((bullet) => {
        var realstartx = bullet.xstart - (bullet.xstart - cavansX);
        var realstarty = bullet.ystart - (bullet.ystart - cavansY);
        var realx = bullet.x;
        var realy = bullet.y;
        if (
          realx > 0 + cavansX &&
          realx < canvas.width + cavansX &&
          realy - cavansY > 0 &&
          realy < canvas.height + cavansY
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

        var realstartx = bullet.xstart - (bullet.xstart - cavansX);
        var realstarty = bullet.ystart - (bullet.ystart - cavansY);
        if (
          realx > 0 + cavansX &&
          realx < canvas.width + cavansX &&
          realy - cavansY > 0 &&
          realy < canvas.height + cavansY
        ) {
          if (bullet.Zlevel === 2 && bullet.id === playerId) {
            zlevelbullets.push(bullet);
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
            var sameTeam =
              players[bullet.id].team === players[playerId].team &&
              players[bullet.id].team !== null &&
              players[playerId].team !== null;
            if (bullet.id === playerId || sameTeam) {
              ctx.fillStyle = "blue";
              ctx.strokeStyle = "darkblue";
            } else {
              ctx.fillStyle = "red";
              ctx.strokeStyle = "darkred";
            }
            let vertices = bullet.vertices;

            let x1 =
              vertices[2].x - (bullet.xstart - (bullet.xstart - cavansX));
            let y1 =
              vertices[2].y - (bullet.ystart - (bullet.ystart - cavansY)); // Top point
            let x2 =
              vertices[1].x - (bullet.xstart - (bullet.xstart - cavansX));
            let y2 =
              vertices[1].y - (bullet.ystart - (bullet.ystart - cavansY)); // Bottom-left point
            let x3 =
              vertices[0].x - (bullet.xstart - (bullet.xstart - cavansX));
            let y3 =
              vertices[0].y - (bullet.ystart - (bullet.ystart - cavansY)); // Bottom-right point

            const controlOffset = 5;

            ctx.beginPath();
            ctx.moveTo(x1, y1);

            const controlPoint1 = { x: (x1 + x3) / 2, y: (y1 + y3) / 2 };

            // Control point for curve from bottom-left to bottom-right
            const controlPoint2 = {
              x: (x2 + x1) / 2,
              y: (y2 + y3) / 2 + controlOffset,
            };

            // Control point for curve from bottom-right to top
            const controlPoint3 = {
              x: (x1 + x3) / 2 + controlOffset,
              y: (y1 + y3) / 2,
            };

            // Draw the curved edge from top to bottom-left

            ctx.quadraticCurveTo(controlPoint1.x, controlPoint1.y, x2, y2);

            // Draw the curved edge from bottom-left to bottom-right
            ctx.quadraticCurveTo(controlPoint2.x, controlPoint2.y, x3, y3);

            // Draw the curved edge from bottom-right to top
            ctx.quadraticCurveTo(controlPoint3.x, controlPoint3.y, x1, y1);

            ctx.fill();
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.closePath();
          } else if (bullet.type === "directer") {
            var sameTeam =
              players[bullet.id].team === players[playerId].team &&
              players[bullet.id].team !== null &&
              players[playerId].team !== null;
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
            let realitemsize = bullet.size * 3 * FOV;
            const h = realitemsize * sqrt23;

            ctx.beginPath();
            ctx.moveTo(0, -h / 2);
            ctx.lineTo(-realitemsize / 2, h / 2);
            ctx.lineTo(realitemsize / 2, h / 2);
            ctx.closePath();

            ctx.fill();
            ctx.stroke();
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
            ctx.lineWidth = 5;
            ctx.stroke();
          } else if (bullet.type === "AutoBullet") {
            var sameTeam =
              players[bullet.id].team === players[playerId].team &&
              players[bullet.id].team !== null &&
              players[playerId].team !== null;
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
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.closePath();
            let autoCAN_ = null;
            autocannons.forEach((can) => {
              if (can.playerid === bullet.uniqueid) {
                autoCAN_ = can;
                var cannonWidth = can.cannonWidth;
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

            ctx.strokeStyle = "lightgrey"; // Set border color
            ctx.lineWidth = 3; // Set border width
            ctx.strokeRect(
              basex,
              basey - 5,
              cannon_widthFOV + 15,
              cannon_heightFOV + 10
            ); // Draw the border
            // Restore the previous transformation matrix
            ctx.rotate(-autoCAN_.angle);
            ctx.closePath();
            ctx.beginPath();
            ctx.arc(0, 0, cannon_widthFOV / 2 + 7, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.lineWidth = 5;
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
            ctx.moveTo(0 - cannonWidth_top, 0 - canwB2); // Move to the top-left corner
            ctx.lineTo(0 - cannonWidth_top, 0 + canwB2); // Draw to the bottom-left corner
            ctx.lineTo(0, 0 + canwH2);
            ctx.lineTo(0, 0 - canwH2);
            ctx.closePath(); // Close the path
            ctx.fill();

            // Add a border to the cannon
            ctx.strokeStyle = "lightgrey"; // Set border color
            ctx.lineWidth = 3; // Set border width
            ctx.beginPath();
            ctx.moveTo(0 - cannonWidth_top, 0 - canwB2); // Move to the top-left corner
            ctx.lineTo(0 - cannonWidth_top, 0 + canwB2); // Draw to the bottom-left corner
            ctx.lineTo(0, 0 + canwH2);
            ctx.lineTo(0, 0 - canwH2);
            ctx.closePath(); // Close the path
            ctx.stroke();
            ctx.restore();
            var sameTeam =
              players[bullet.id].team === players[playerId].team &&
              players[bullet.id].team !== null &&
              players[playerId].team !== null;
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
            ctx.lineWidth = 5;
            ctx.stroke();
            ctx.closePath();
          }
          ctx.restore();
          ctx.globalAlpha = 1;
        }
      });

      for (const playerId__ in players) {
        if (players.hasOwnProperty(playerId__) && playerId__ != playerId) {
          let player = players[playerId__];

          let tankdata = tankmeta[player.__type__];

          let tankdatacannon = tankdata["cannons"];

          let playerX = player.x;
          let playerY = player.y;

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
            } else if (tankdatacannondata["type"] === "trap") {
              let cannonwidth = tankdatacannondata["cannon-width"];
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
            }
          }

          ctx.beginPath();
          ctx.fillStyle = squareColor;
          ctx.arc(
            playerX - cavansX,
            playerY - cavansY,
            player.size * FOV * 40,
            0,
            2 * Math.PI,
            false
          );
          let num = player.statecycle % 10;
          var sameTeam =
            players[player.id].team === players[playerId].team &&
            players[player.id].team !== null &&
            players[playerId].team !== null;
          if (
            num === 0 &&
            (player.state === "start" || player.state === "damaged")
          ) {
            if (!sameTeam) {
              let backwardsObj = { 1: 4, 2: 3, 3: 2, 4: 1, 5: 0.1 };
              let percentage =
                player.statecycle % 10 <= 5
                  ? player.statecycle % 10
                  : backwardsObj[(player.statecycle % 10) - 5];
              percentage /= 10;
              let newrgb = mix([255, 0, 0], [255, 255, 255], percentage);
              ctx.fillStyle = `rgb(${newrgb[0]} ${newrgb[1]} ${newrgb[2]})`;
            } else {
              let backwardsObj = { 1: 4, 2: 3, 3: 2, 4: 1, 5: 0.1 };
              let percentage =
                player.statecycle % 10 <= 5
                  ? player.statecycle % 10
                  : backwardsObj[(player.statecycle % 10) - 5];
              percentage /= 10;
              let newrgb = mix([0, 0, 255], [255, 255, 255], percentage);
              ctx.fillStyle = `rgb(${newrgb[0]} ${newrgb[1]} ${newrgb[2]})`;
            }
          } else if (!sameTeam) {
            ctx.fillStyle = "red";
            ctx.strokeStyle = "darkred";
          } else if (sameTeam) {
            ctx.fillStyle = "blue";
            ctx.strokeStyle = "darkblue";
          }
          ctx.fill();
          ctx.lineWidth = 5;
          //ctx.strokeStyle = "darkblue";
          ctx.stroke();

          ctx.fill();
          ctx.lineWidth = 5;
          ctx.stroke();
          ctx.closePath();

          // Draw background bar
          let mymessages = [];
          playerMessages.forEach((massege) => {
            if (massege.id === player.id) {
              mymessages.push(massege);
            }
          });
          mymessages.forEach((message) => {
            ctx.save();
            if (message.hidetime < Date.now()) {
              if (1 > 1 - (Date.now() - message.hidetime) / 500) {
                ctx.globalAlpha = 1 - (Date.now() - message.hidetime) / 500;
              }
            }
            ctx.translate(
              playerX - cavansX,
              playerY - cavansY - player.size * 40 - 30 * mymessages.length - 25
            );
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.font = `bold ${21 * upscaleX}px Nunito`;
            ctx.fillText(message.text, 0, 0);
            ctx.globalAlpha = 1;
            ctx.restore();
          });
          ctx.fillStyle = "black";
          ctx.fillRect(
            playerX - cavansX - 50 * FOV,
            playerY - cavansY + 55 * FOV,
            90 * FOV,
            10 * player.size * FOV
          );

          // Draw health bar
          const healthWidth =
            (player.health / player.maxhealth) * 90 * player.size * FOV;
          ctx.fillStyle = "green";
          ctx.fillRect(
            playerX - cavansX - 50 * FOV,
            playerY - cavansY + 55 * FOV,
            healthWidth,
            10 * player.size * FOV
          );
          ctx.closePath();
          // cannons on top of player
          for (let i = 0; i < Object.keys(tankdatacannon).length; i++) {
            ctx.fillStyle = "#b3b3b3";

            let tankdatacannondata = tankdatacannon[i];
            let cannon_widthFOV =
              tankdatacannondata["cannon-width"] * FOVplayerz;
            let cannon_heightFOV =
              tankdatacannondata["cannon-height"] * FOVplayerz;
            let cannonangle;
            var cannonWidth_;
            autocannons.forEach((cannonA) => {
              if (cannonA.playerid === playerId__ && cannonA.autoindex === i) {
                cannonangle = cannonA.angle;
                cannonWidth_ = cannonA.cannonWidth;
              }
            });
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

              ctx.translate(playerX - cavansX, playerY - cavansY);

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

          ctx.strokeStyle = "black";
          ctx.fillStyle = "white";
          ctx.textAlign = "center";
          ctx.font = "bold 20px Nunito";
          ctx.strokeText(
            player.score,
            playerX - cavansX,
            playerY - cavansY - 55
          );
          ctx.fillText(player.score, playerX - cavansX, playerY - cavansY - 55);

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

          // Draw border
          ctx.lineWidth = 1;
          ctx.strokeStyle = "grey";
          ctx.strokeRect(
            playerX - cavansX - 50,
            playerY - cavansY + 55,
            90 * player.size * FOV,
            10 * player.size * FOV
          );
        }
      }

      ctx.fillStyle = squareColor;

      let angle = getCannonAngle();
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
      gridstyle.top = `calc(-${(10000 * scaleFactor) / 2}px - ${
        cavansY * scaleFactor
      }px)`;
      gridstyle.left = `calc(-${(10000 * scaleFactor) / 2}px - ${
        cavansX * scaleFactor
      }px)`;

      // Call the function to draw the level bar
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
      ctx.font = "bold 30px Nunito";
      ctx.strokeStyle = "black";
      ctx.strokeText("leaderboard", canvas.width - 125 * upscaleX, 25);
      ctx.textAlign = "center";
      ctx.fillStyle = "#00f7ff";
      ctx.fillText("leaderboard", canvas.width - 125 * upscaleX, 25);

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
          canvas.width - 237.5 * upscaleX,
          50 + i * 30,
          225 * upscaleX,
          27 * upscaleY,
          borderRadius,
          entre.score / leader_board[0].score,
          "#23badb",
          "#4eddfc",
          "#242424",
          false
        );

        ctx.textAlign = "center";
        ctx.font = "bold 23px Nunito";
        ctx.fillStyle = "black";
        ctx.fillText(
          `${entre.name} ➠ ${entre.score}`,
          canvas.width - 125 * upscaleX,
          72 + i * 30 * upscaleY
        );
      });

      requestAnimationFrame(draw);
    }
  }

  document.getElementById("playButton").addEventListener("mousedown", () => {
    username = document.getElementById("username").value;
    if (username) {
      setTimeout(() => {
        document.getElementById("start").style.display = "none";
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
        document.getElementById("start").style.display = "none";
        document.getElementById("game").style.display = "block";
        /*document.addEventListener("contextmenu", (event) =>
          event.preventDefault()
        );*/
        ongame();
      }, 100);
    }
  });
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
