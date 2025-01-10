// LOL, you little kids can't mess with my game
(function () {
  function generateRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
  }
  var username = "Unamed tank";
  for (let i = 0; i < 125; i++) {
    for (let j = 0; j < 125; j++) {
      const div = document.createElement("div");
      let divstyle = div.style;
      divstyle.width = "79px";
      divstyle.height = "79px";
      divstyle.backgroundColor = "white";
      divstyle.border = "1px solid black";
      document.getElementById("grid").appendChild(div);
    }
  }
  function ongame() {
    const socket =
      new /*skill issus are comming to my server mohaa ha ha*/ WebSocket(
        "https://deip-io3.glitch.me/"
      );

    let playerId = null; // Connect to the server
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
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
    // 0.() values decrease
    // delay which cannon fires first
    var pi180 = Math.PI / 180;
    // reload 0.() values increase
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
        upgrades: {
          twin: 1,
          flank: 2,
          sniper: 3,
          "mechiane gun": 4,
          spreader: 5,
          rammer: 6,
          traper: 7,
          directer: 8,
          autobasic: 9,
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

    var players = {};
    var boardbullets = [];
    var bullets = [];
    var food_list = [];
    var autocannons = [];
    var pubteams = [];
    var level = 0;
    var xp = 0;
    var FOV = 1; // senstive
    var autoFiring = false;
    var autoRotating = false;
    var lockautoRotating = false;
    var autoAngle = 0;
    var playerX = canvas.width / 2;
    var playerY = canvas.height / 2;
    var cavansX = 0;
    var cavansY = 0;
    var dronetanks = ["directer"];
    var playerHealTime = 0;
    var playerHealth = 100;
    var playerSpeed = 10;
    var playerSize = 1;
    var bodyDamage = 3;
    var __type__ = "basic";
    var bullet_damage = 10;
    var bullet_speed = 4;
    var bullet_size = 15;
    var sqrt23 = Math.sqrt(3) / 2;
    var vertices = [];
    var cannonFireData = [true];
    var __reload__ = 1;
    var bullet_pentration = 2;
    var cannonWidth = [0];
    var drones = 0;
    var current_angle = 0;
    var MouseX_ = 0;
    var MouseY_ = 0;
    var typedtext = "";
    var mapLeft = -5000;
    var mapRight = 5000;
    var mapTop = -5000;
    var mapBottom = 5000;
    var playerMovementX = 0;
    var playerMovementY = 0;
    var score = 0;
    var leader_board = [];
    var firingIntervals = {};
    var barWidth = 0.3125 * canvas.width;
    var barHeight = 0.02909796314 * canvas.height;
    var borderRadius = 10;
    var playerReheal = 1;
    var maxhealth = 100;
    var state = "start";
    var statecycle = 0;
    var progress = 0.0;
    var gridstyle = grid.style;
    var boundrectcanvas = canvas.getBoundingClientRect();
    var canmove = true;
    var nolist = [3, 5, 7, 8, 10, 11, 13];
    var keysPressed = {};
    var vertices = [];
    var typeindex = 0;
    var canFire = true;
    var canFire2 = true;
    var firingInterval = null;
    var movementTimeouts = [];
    var canW = canvas.width;
    var canH = canvas.height;
    var squareColor = "grey";
    var autoIntevals = [];
    var zlevelbullets = [];
    var colorUpgrades = [];
    var upgradePoints = 0;
    var playerMessages = [];
    var maxUP = 8;
    var container = document.getElementById("container");
    var errors = 0;
    var Regenspeed = 30;
    var messaging = false;
    var hidden = false;
    var blinking = false;
    var pi = Math.PI;
    var pentarotate = 0;
    var keyevents = [];
    var teampanelopen = false;
    var teamwidth = 0.15625 * canvas.width;
    var teamheight = 0.33333333333333333333333333 * canvas.height;
    var innerteamwidth = 0.14322916666 * canvas.width;
    var innerteamheight = 0.308333333333333333333 * canvas.height;
    var teamlist = [];
    var teamOn = null;
    var joinedTeam = false;
    var selected_class = null;
    var owner_of_team = false;
    var score__$ = getCookie("score");
    var badge = "";
    var img = null;
    var levels = {
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

    function getMousePos(canvas, evt) {
      const rect = boundrectcanvas;
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
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
            "There is an error or disconnection. Please report this if the error is not related to a closing state error."
          );
          alert("error", e);
        }
      } else {
        setTimeout(() => {
          window.location.reload();
        }, 1);
        setTimeout(() => {
          alert("There is a disconnection.");
        }, 0);
        errors++;
      }
    }
    const getCannonAngle = () => {
      return Math.atan2(
        Math.abs(MouseY_) - (canvas.height / 2 - playerSize * FOV),
        Math.abs(MouseX_) - (canvas.width / 2 - playerSize * FOV)
      );
    };

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
              FOV: FOV,
              MouseX: MouseX_,
              Regenspeed: Regenspeed,
              MouseY: MouseY_,
              screenWidth: canvas.width,
              screenHeight: canvas.height,
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
                  });
                  let cannon__ = cannon;
                  let tankdata = tankmeta[__type__];
                  let _CAN = {
                    CannonID: autoID,
                    playerid: playerId,
                    angle: 0,
                    _type_: cannon.type,
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
                        offSet_x = playerSize * 40 * FOV;
                      }
                      if (tankdatacannon__[cannon_]["offSet-x-multpliyer"]) {
                        offSet_x *= -1;
                      }
                      let angle0 = Math.atan2(
                        Math.abs(MouseY_) -
                          (canvas.height / 2 - playerSize * FOV),
                        Math.abs(MouseX_) -
                          (canvas.width / 2 - playerSize * FOV)
                      );
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
                    }, 750 * tankdata["reaload-m"] * cannon["reloadM"] * __reload__);
                  }
                  setTimeout(() => {
                    cannonINT();
                  }, 750 * tankdata["reaload-m"] * cannon["reloadM"] * __reload__);
                  autoIntevals.push({ cannonINT: cannonINT, autoID: autoID });
                }
              }
            }, 100);
          });
        }
      }
    }

    const generateUniquePlayerId = () => {
      return "player-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    };

    function levelHANDLER() {
      let tonextlevel = levels[level] - levels[level - 1];
      progress =
        (score - levels[level - 1]) / (levels[level] - levels[level - 1]);
      if (score / levels[level] >= 1) {
        upgradePoints += 1;
        // Add transition property

        let tankdata = tankmeta[__type__];
        levelUpgrader(tankdata);
        level += 1;
        let tonextlevel = levels[level] - levels[level - 1];
        progress =
          (score - levels[level - 1]) / (levels[level] - levels[level - 1]);
        playerSize += playerSize * 0.005;
        while (score / levels[level] >= 1) {
          level += 1;
          upgradePoints += 1;
          playerSize += playerSize * 0.005;
          progress =
            (score - levels[level - 1]) / (levels[level] - levels[level - 1]);
          let tankdata = tankmeta[__type__];
          levelUpgrader(tankdata);
        }
      }
    }

    socket.onopen = function () {
      setTimeout(() => {
        (function () {
          (function a() {
            playerId = generateUniquePlayerId();
          })();
        })();

        const playerData = {
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
          FOV: FOV,
          MouseX: MouseX_,
          Regenspeed: Regenspeed,
          MouseY: MouseY_,
          screenWidth: canvas.width,
          screenHeight: canvas.height,
          visible: true,
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
        };

        send("newPlayer", playerData);

        send("getFood", {});

        send("getTankMeta", {});

        send("HANDSHAKE", {});

        var masseg = document.getElementById("mesage");

        img = new Image();

        img.onload = function () {
          ctx.drawImage(img, canvas.width / 2, canvas.height - 60);
        };
        console.log(badge);
        img.src = `https://deip-io3.glitch.me${badge}?nocache=${Date.now()}`;

        socket.onmessage = function (event) {
          const message = JSON.parse(event.data);

          const { type, data } = message;

          if (type === "playerUpdated") {
            players[data.id] = data; // Update the local player data
            console.log("Player updated:", data); // Log the update
          } else if (type === "new_X_Y") {
            if (data.id !== playerId) return;
            cavansX = data.x;
            playerY += data.y;
            cavansY = data.y;
            playerX += data.x;
          } else if (type === "RETURNtankmeta") {
            tankmeta = data;
            draw();
          } else if (type === "NewMessages") {
            playerMessages = data;
          } else if (type === "playerMessage") {
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
          } else if (type === "Levels") {
            levels = data;
          } else if (type === "handshake") {
            HANDSHAKE = data;
          } else if (type === "updaterHeal") {
            if (!players[data.ID]) return;
            players[data.ID].playerHealTime = data.HEALTime;
          } else if (type === "playerHeal") {
            players[data.ID].health = data.HEALTH;
            if (data.ID === playerId) {
              playerHealth = data.HEALTH;
            } // Log the update
          } else if (type === "statsTreeRestart") {
            players[data.id].statsTree = data.stats;
          } else if (type === "playerHealthCheck") {
            if (!(players[data.ID].health === data.HEALTH)) {
              players[data.ID].health = data.HEALTH;
              // yes hackty hackers you getting a waring
              setCookie("player", socket.id, 1000000);
              socket.emit("unSynched Health", {
                playerId: playerId,
                "expected Health": data.HEALTH,
                "actual Health": players[data.ID].health,
              });
            }
          } else if (type === "autoCannonUPDATE-ADD") {
            autocannons = data;
          } else if (type === "boardUpdate") {
            leader_board = data.leader_board;
          } else if (type === "autoCannonUPDATE-ANGLE") {
            autocannons.forEach((cannon_ooo) => {
              if (cannon_ooo.CannonID === data.cannon_ID) {
                cannon_ooo.angle = data.angle;
              }
            });
          } else if (type === "playerMoved") {
            players[data.id].x = data.x;
            players[data.id].y = data.y;
          } else if (type === "playerCannonUpdated") {
            try {
              if (data.receiver) {
                if (data.receiver === playerId) {
                  players[data.id].cannon_angle = data.cannon_angle;
                }
              } else {
                players[data.id].cannon_angle = data.cannon_angle;
              }
            } catch {}
          } else if (type === "playerLeft") {
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
          } else if (type === "playerDied") {
            if (data["playerID"] === playerId) {
              setTimeout(() => {
                document.getElementById("die").style.display = "block";
                document.getElementById("container").style.display = "none";
                document.getElementById("myCanvas").style.display = "none";
                document.getElementById("tanktiles").style.display = "none";
              }, 1000);

              clearInterval(healer);
              send("playerDied", { id: playerId });
              socket.onmessage = {};
              autoIntevals;
              autoIntevals.forEach((timeout) => {
                clearTimeout(timeout);
              });
              autoIntevals = [];

              var old_element = document.body;
              var new_element = old_element.cloneNode(true);
              old_element.parentNode.replaceChild(new_element, old_element);
              let respawn = document.createElement("button");

              respawn.innerHTML = "Respawn";
              respawn.style.position = "absolute";
              respawn.style.top = "calc(50vh - 50px)";
              respawn.style.left = "calc(50vw - 100px)";
              respawn.style.width = "200px";
              respawn.style.height = "100px";
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
          } else if (type === "playerDamaged") {
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
          } else if (type === "bulletUpdate") {
            bullets = data;
          } else if (type === "playerJoined") {
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
                FOV: FOV,
                MouseX: MouseX_,
                Regenspeed: Regenspeed,
                MouseY: MouseY_,
                screenWidth: canvas.width,
                screenHeight: canvas.height,
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
              });
            }
            setTimeout(() => {
              send("healrate", {
                playerId: playerId,
                playerReheal: playerReheal,
              });
            }, 3000);
          } else if (type === "playerScore") {
            players[data["bulletId"]].score += data["socrepluse"];
            if (data["bulletId"] === playerId) {
              score = players[data["bulletId"]].score;
            }
            levelHANDLER();
          } else if (type === "dronekilled") {
            if (data.droneID === playerId) {
              drones -= 1;
            }
          } else if (type === "FoodUpdate") {
            food_list = data;
          } else if (type === "colorUpgrades") {
            colorUpgrades = data;
          } else if (type === "UpdateStatTree") {
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
          } else if (type === "healerRestart") {
            players[data.id].Regenspeed = data.Regenspeed;
            if (data.id === playerId) {
              Regenspeed = data.Regenspeed;
            }
          } else if (type === "pubteamlist") {
            pubteams = data;
            var teamcontainer = document.getElementById("teamcontainer");
            teamcontainer.innerHTML = "";
            if (!joinedTeam) {
              pubteams.forEach((team) => {
                var teamcontainer = document.getElementById("teamcontainer");
                var item = document.createElement("div");
                item.classList.add("team");
                item.innerText = team.name;
                teamcontainer.appendChild(item);
                item.addEventListener("click", () => {
                  // Remove the "glow" class from all children
                  Array.from(teamcontainer.children).forEach((child) => {
                    child.classList.remove("glow");
                  });

                  // Add the "glow" class to the clicked item
                  item.classList.add("glow");

                  // Set the selected class
                  selected_class = team.teamID;
                });
              });
            } else {
              let MYteam = pubteams.find((team) => {
                console.log(players[playerId].team, team.teamID);
                return team.teamID === players[playerId].team;
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
                console.log(MYteam.owner.id, player.id);
                if (player.id === MYteam.owner.id) {
                  var crown = document.createElement("img");
                  crown.src = "assets/crownIcon.png";
                  item.appendChild(crown);
                  crown.style.width = "1.6em";
                  crown.style.height = "1.3em";
                  crown.style["margin-left"] = "5px";
                  crown.style["margin-top"] = "0px";
                  crown.style["margin-bottom"] = "-5px";
                  //
                }
                teamcontainer.appendChild(item);
              });
            }
          } else if (type === "playerJoinedTeam") {
            players[data.id].team = data.teamId;
            console.log("team", players[data.id]);
            if (data.id === playerId && data.teamId !== null) {
              joinedTeam = true;
              teamOn = data.teamId;
            }
            if (data.id === playerId && data.teamId === null) {
              joinedTeam = false;
              owner_of_team = true;
              teamOn = null;
            }
          } else if (type === "newOwner") {
            if (data.teamID === teamOn) {
              owner_of_team = true;
            }
          } else if (type === "bulletDamage") {
            if (players[data.playerID]) {
              bullets = data.BULLETS; // Check if the player exists
              players[data.playerID].health = data.playerHealth;

              if (data.playerID == playerId) {
                playerHealth = data.playerHealth;
                send("playerHealintterupted", { ID: playerId });
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
            } else {
              console.warn(
                "Received bulletDamage for an unknown player:",
                data.playerID
              );
            }
          } else if (type === "shapeDamage") {
            if (players[data.PlayerId]) {
              food_list = data.shapes;
              players[data.PlayerId].health -= data.playerDamage;

              if (data.PlayerId == playerId) {
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
          } else if (type === "shapeDamage2") {
            if (players[data.PlayerId]) {
              players[data.PlayerId].health -= data.playerDamage;

              if (data.PlayerId == playerId) {
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
          } else if (type === "bouceBack") {
            if (data.playerID !== playerId) return;
            canmove = false;
            movementTimeouts.forEach((timeout) => {
              if (!timeout.bouceBack) {
                clearTimeout(timeout.timeout);
              }
            });
            movementTimeouts = [];
            let playerSpeed2 = playerSpeed / 2;
            for (let i = 0; i < playerSpeed2; i++) {
              let timeout = setTimeout(() => {
                movePlayer(
                  -((data.response[1].overlapV.x * 1.1) / playerSpeed2),
                  -((data.response[1].overlapV.y * 1.1) / playerSpeed2)
                );
              }, 50 * i);
              movementTimeouts.push({ timeout: timeout, bouceBack: true });
            }
            setTimeout(() => {
              canmove = true;
            }, 20 * playerSpeed);
          } else if (type === "type_Change") {
            players[data.id] = data;
          } else if (type === "statechangeUpdate") {
            if (!players[data.playerID]) return;
            players[data.playerID].state = data.state;
            players[data.playerID].statecycle = data.statecycle;
            if (data.playerID === playerId) {
              statecycle = data.statecycle;
              state = data.state;
            }
          } else if (type === "playerCannonWidthUpdate") {
            players[data.id].cannonW = data.cannonW;
          } else if (type === "playerCannonUpdatedInactive") {
            MouseX_ = data.MouseX_;
            MouseY_ = data.MouseY_;
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

        function calculateTriangleVertices(cx, cy, size, angle) {
          const height = sqrt23 * size;
          const halfSize = size / 2;
          const angleRad = angle * pi180;
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
          if (autoRotating) return;
          if (lockautoRotating) return;
          var mousepos = getMousePos(container, evt);
          MouseX_ = mousepos.x;
          MouseY_ = mousepos.y;
          let __angle__ = Math.atan2(
            Math.abs(MouseY_) - (canvas.height / 2 - playerSize * FOV),
            Math.abs(MouseX_) - (canvas.width / 2 - playerSize * FOV)
          );
          send("playerCannonMoved", {
            id: playerId,
            cannon_angle: __angle__,
            MouseX: MouseX_,
            MouseY: MouseY_,
          });
        });

        setInterval(() => {
          pentarotate += 1;
          if (359.8 <= pentarotate) {
            pentarotate = 0;
          }
          if (!autoRotating && !lockautoRotating) return;
          if (!document.hidden) {
            // do what you need

            autoAngle += 1;
            if (359.8 <= autoAngle) {
              // yes point 8 I can do math kids
              autoAngle = 0;
            }
            let radians = (Math.PI / 180) * autoAngle;
            MouseX_ =
              50 * Math.cos(radians) + (canvas.width / 2 - playerSize * FOV);
            MouseY_ =
              50 * Math.sin(radians) + (canvas.height / 2 - playerSize * FOV);
            let angle = Math.atan2(
              MouseY_ - (canvas.height / 2 - playerSize * FOV),
              MouseX_ - (canvas.width / 2 - playerSize * FOV)
            );
            send("playerCannonMoved", {
              id: playerId,
              cannon_angle: autoAngle,
              MouseX: MouseX_,
              MouseY: MouseY_,
            });
            autoIntevals.forEach((Inteval) => {
              send("auto-x-update", {
                autoID: Inteval.autoID,
                angle: autoAngle,
              });
            });
            if (hidden) {
              send("browserunHidden", { id: playerId });
              hidden = false;
            }
          } else if (document.hidden && !hidden) {
            send("browserHidden", {
              autoAngle: autoAngle,
              id: playerId,
              autoIntevals: autoIntevals,
              playerSize: playerSize,
              FOV: FOV,
              canvaswidth: canvas.width,
              canvasheight: canvas.height,
            });
            hidden = true;
          }
        }, 75);

        function generateRandomNumber(min, max) {
          return Math.random() * (max - min) + min;
        }

        document.getElementById("teamButton").addEventListener("click", () => {
          var teamname = document.getElementById("teamname").value;
          var checked;
          try {
            var checkedValue = document.querySelector(".null:checked").value;
            checked = true;
          } catch {
            checked = false;
          }

          document.getElementById("teambox").style.display = "none";
          send("newTeamCreated", {
            owner: { id: playerId, username: username },
            private: checked,
            name: teamname,
          });
          owner_of_team = true;
        });

        function fireOnce(evt, directer) {
          let tankdata = tankmeta[__type__];
          let tankdatacannon = tankdata.cannons;
          if (!autoFiring && !directer) {
            if (evt.button === 2) return;
          }
          var angle = Math.atan2(
            Math.abs(MouseY_) - (canvas.height / 2 - playerSize * FOV),
            Math.abs(MouseX_) - (canvas.width / 2 - playerSize * FOV)
          );

          // Fire all cannons
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

              //if (cannon.type === "directer" && !directer) return;
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
                var xxx = cannon["cannon-width-top"] - bullet_size_l * 1.5;
                var yyy =
                  cannon["cannon-height"] -
                  bullet_size_l * 2 -
                  cannon["cannon-width-top"] / 2;
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

              // Recoil effect
              cannonWidth[i] = cannonWidth[i] || 0;
              for (let l = 0; l < 10; l++) {
                setTimeout(() => {
                  cannonWidth[i] -= 1;
                  send("playerCannonWidth", {
                    id: playerId,
                    cannonW: cannonWidth,
                  });
                }, 10 * l);
                setTimeout(() => {
                  cannonWidth[i] += 1;
                  send("playerCannonWidth", {
                    id: playerId,
                    cannonW: cannonWidth,
                  });
                }, 20 * l); // Updated to prevent overlap
              }

              let recoilX = -(
                (bullet_size_l / 10) *
                bullet_speed__ *
                Math.cos(angle_)
              );
              let recoilY = -(
                (bullet_size_l / 10) *
                bullet_speed__ *
                Math.sin(angle_)
              );
              for (let i = 0; i < playerSpeed; i++) {
                setTimeout(() => {
                  movePlayer(recoilX / 15, recoilY / 15, i == playerSpeed - 1);
                }, 15 * i);
              }
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
              };

              send("bulletFired", bullet);
            }, cannon.delay * 1000);
            if (!(cannonFireData[i] || dronetanks.includes(__type__))) {
              setTimeout(() => {
                cannonFireData[i] = true;
              }, 750 * tankdata["reaload-m"] * cannon["reloadM"] * __reload__);
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
                let angle = Math.atan2(
                  Math.abs(MouseY__) - (canvas.height / 2 - playerSize * FOV),
                  Math.abs(MouseX__) - (canvas.width / 2 - playerSize * FOV)
                );
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
                    var xxx = cannon["cannon-width-top"] - bullet_size_l * 1.5;
                    var yyy =
                      cannon["cannon-height"] -
                      bullet_size_l * 2 -
                      cannon["cannon-width-top"] / 2;
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

                  // Recoil effect
                  cannonWidth[i] = cannonWidth[i] || 0;
                  for (let l = 0; l < 10; l++) {
                    setTimeout(() => {
                      cannonWidth[i] -= 1;
                      send("playerCannonWidth", {
                        id: playerId,
                        cannonW: cannonWidth,
                      });
                    }, 10 * l);
                    setTimeout(() => {
                      cannonWidth[i] += 1;
                      send("playerCannonWidth", {
                        id: playerId,
                        cannonW: cannonWidth,
                      });
                    }, 20 * l); // Updated to prevent overlap
                  }

                  let recoilX = -(
                    (bullet_size_l / 10) *
                    bullet_speed__ *
                    Math.cos(angle_)
                  );
                  let recoilY = -(
                    (bullet_size_l / 10) *
                    bullet_speed__ *
                    Math.sin(angle_)
                  );
                  for (let i = 0; i < playerSpeed; i++) {
                    setTimeout(() => {
                      movePlayer(
                        recoilX / 15,
                        recoilY / 15,
                        i == playerSpeed - 1
                      );
                    }, 15 * i);
                  }
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
                  };
                  send("bulletFired", bullet);
                }, tankdatacannondata["delay"] * 1000);
              },
              750 * tankdata["reaload-m"] * cannon["reloadM"] * __reload__
            );
            name = JSON.stringify(firingInterval + i);
            firingIntervals[name] = firingInterval;
          });
        }

        document.addEventListener("mousedown", (evt) => {
          fireOnce(evt, false);
        });

        window.addEventListener("resize", (evt) => {
          var canW1 = canW;
          var canH1 = canH;
          canW = window.innerWidth;
          canH = window.innerHeight;
          canvas.width = canW;
          canvas.height = canH;
          playerX -= canW1 / 2;
          playerY -= canH1 / 2;
          playerX += canW / 2;
          playerY += canH / 2;
          playerX -= canW / 2 - canW1 / 2;
          playerY -= canH / 2 - canH1 / 2;
          cavansX -= canW / 2 - canW1 / 2;
          cavansY -= canH / 2 - canH1 / 2;
          teamwidth = 0.15625 * canvas.width;
          teamheight = 0.33333333333333333333333333 * canvas.height;
          innerteamwidth = 0.14322916666 * canvas.width;
          innerteamheight = 0.308333333333333333333 * canvas.height;
          barWidth = 0.3125 * canvas.width;
          barHeight = 0.02909796314 * canvas.height;
          send("resize", {
            id: playerId,
            screenWidth: canvas.width,
            screenHeight: canvas.height,
          });
        });

        document.addEventListener("click", (evt) => {
          if (!teampanelopen) {
            evt.preventDefault();
          }
        });

        let __tankdata__ = tankmeta[__type__];

        function autoengine() {
          __tankdata__ = tankmeta[__type__];
          if (!dronetanks.includes(__type__) && autoFiring) {
            __tankdata__ = tankmeta[__type__];
            if (firingInterval) {
              clearInterval(firingInterval);
              firingInterval = null;
            }
            fireOnce();
          }
          if (dronetanks.includes(__type__)) {
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
          }, 750 * __tankdata__["reaload-m"] * __reload__);
        }

        setTimeout(() => {
          autoengine();
        }, 750 * __tankdata__["reaload-m"] * __reload__);

        document.addEventListener("mousedown", (evt) => {
          if (
            canvas.width - 475 < MouseX_ &&
            MouseX_ < canvas.width - 275 &&
            MouseY_ > 10 &&
            MouseY_ < 110 &&
            !teampanelopen
          ) {
            teampanelopen = true;
            selected_class = null;
            document.getElementsByTagName("body")[0].style.cursor = "auto";
            var teamcontainer = document.getElementById("teamcontainer");
            teamcontainer.style.display = "block";
            teamcontainer.style.left =
              canvas.width / 2 - innerteamwidth / 2 + "px";
            teamcontainer.style.top =
              canvas.height / 2 - innerteamheight / 2 + "px";
            teamcontainer.style.height = innerteamheight - 100 + "px";
            teamcontainer.innerHTML = "";
            if (!joinedTeam) {
              pubteams.forEach((team) => {
                var teamcontainer = document.getElementById("teamcontainer");
                var item = document.createElement("div");
                item.classList.add("team");
                item.innerText = team.name;
                teamcontainer.appendChild(item);
                item.addEventListener("click", () => {
                  // Remove the "glow" class from all children
                  Array.from(teamcontainer.children).forEach((child) => {
                    child.classList.remove("glow");
                  });

                  // Add the "glow" class to the clicked item
                  item.classList.add("glow");

                  // Set the selected class
                  selected_class = team.teamID;
                });
              });
            } else {
              let MYteam = pubteams.find((team) => {
                console.log(players[playerId].team, team.teamID);
                return team.teamID === players[playerId].team;
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
                console.log(MYteam.owner.id, player.id);
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
                  player.id !== MYteam.owner.id
                ) {
                  item.addEventListener("mouseover", () => {
                    var kick = document.createElement("img");
                    kick.src = "assets/kickButton.png";
                    kick.style.width = "1em";
                    kick.style.height = "1em";
                    kick.style["text-align"] = "left";
                    kick.addEventListener("click", () => {
                      send("kickplayer", {
                        id: player.id,
                        team: MYteam.teamID,
                      });
                    });
                    item.appendChild(kick);
                    item.addEventListener("mouseout", () => {
                      item.children[0].remove();
                    });
                  });
                }
              });
            }

            return;
          }
          if (teampanelopen) {
            const textWidth = ctx.measureText("X").width;
            const textHeight = 16; // Approximate the height of the text (varies by font)

            // Check if mouse is within the text bounding box
            const withinX =
              MouseX_ >= canvas.width / 2 + innerteamwidth / 2 - 15 &&
              MouseX_ <= canvas.width / 2 + innerteamwidth / 2 - 15 + textWidth;
            const withinY =
              MouseY_ >=
                canvas.height / 2 - innerteamheight / 2 + 26 - textHeight &&
              MouseY_ <= canvas.height / 2 - innerteamheight / 2 + 26;
            if (withinX && withinY) {
              teampanelopen = false;
              var teamcontainer = document.getElementById("teamcontainer");
              teamcontainer.style.display = "none";
              document.getElementById("teambox").style.display = "none";
              document.getElementsByTagName("body")[0].style.cursor =
                "url('https://deip-io3.glitch.me/targetpointer1.cur'), auto";
            }

            const withinX3 =
              MouseX_ >= canvas.width / 2 - innerteamwidth / 2 + 10 &&
              MouseX_ <= canvas.width / 2 - innerteamwidth / 2 + 10 + 80;
            const withinY3 =
              MouseY_ >= canvas.height / 2 + innerteamheight / 2 - 50 &&
              MouseY_ <= canvas.height / 2 + innerteamheight / 2 - 50 + 40;
            if (withinX3 && withinY3) {
              if (!joinedTeam) {
                if (selected_class !== null) {
                  send("playerJoinedTeam", {
                    id: playerId,
                    teamId: selected_class,
                  });
                  joinedTeam = true;
                }
              } else {
                send("playerLeftTeam", {
                  id: playerId,
                  teamId: players[playerId].team,
                });
                if (owner_of_team) {
                  owner_of_team = false;
                }
                joinedTeam = false;
                selected_class = null;
              }
            }

            const withinX2 =
              MouseX_ >= canvas.width / 2 + innerteamwidth / 2 - 150 &&
              MouseX_ <= canvas.width / 2 + innerteamwidth / 2 - 150 + 140;
            const withinY2 =
              MouseY_ >= canvas.height / 2 + innerteamheight / 2 - 50 &&
              MouseY_ <= canvas.height / 2 + innerteamheight / 2 - 50 + 40;
            if (withinX2 && withinY2) {
              if (!owner_of_team) {
                document.getElementById("teambox").style.display = "block";
              } else if (owner_of_team && joinedTeam) {
                send("deleteTeam", { teamID: teamOn, playerId: playerId });
              }
            }
            return;
          }
          if (!dronetanks.includes(__type__) && !teampanelopen) {
            FireIntervale(evt);
          } else {
            if (evt.button === 2) {
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
      }, 100);
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
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(
        x + width,
        y + height,
        x + width - radius,
        y + height
      );
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
      if (barbourder) {
        ctx.stroke();
      }

      // Filled bar (progress)
      const filledWidth = width * progress;
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
        ctx.quadraticCurveTo(x + filledWidth, y, x + filledWidth, y + radius);
        ctx.lineTo(x + filledWidth, y + height - radius);
        ctx.quadraticCurveTo(
          x + filledWidth,
          y + height,
          x + filledWidth - radius,
          y + height
        );
        ctx.lineTo(x, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
      }
      ctx.closePath();

      ctx.fill();

      if (filllevel) {
        ctx.fillStyle = "#0228c2";
        ctx.strokeStyle = "black";
        ctx.textAlign = "center";
        ctx.font = "bold 40px Nunito";
        ctx.strokeText(level, canvas.width / 2, canvas.height - 60);
        ctx.fillText(level, canvas.width / 2, canvas.height - 60);
        //let img = { complete: false };
        // If the image is not yet loaded, wait for it to load
        //console.log(img);
        ctx.drawImage(img, canvas.width / 2 - 20, canvas.height - 150, 40, 40);
      }
    }
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

    function MathHypotenuse(x, y) {
      return Math.sqrt(x * x + y * y);
    }

    const checkCollisions = (dx, dy) => {
      for (let playerId_ in players) {
        let player = players[playerId_];
        let distance = MathHypotenuse(player.x - playerX, player.y - playerY);

        if (
          distance < player.size * 40 + playerSize * 40 &&
          playerId_ !== playerId &&
          !(
            players[playerId_].team === players[playerId].team &&
            players[playerId_].team !== null &&
            players[playerId].team !== null
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
          distance < player.size * 40 + playerSize * 40 &&
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
        for (let i = 0; i < playerSpeed / 5; i++) {
          var movement = setTimeout(() => {
            movePlayer(dx * 2, dy * 2, i === playerSpeed - 1 || i === 0);
          }, 75 * i);
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

    function drawself() {
      ctx.fillStyle = squareColor;
      if (!messaging) {
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
        } else if (keysPressed["-"]) {
          FOV -= 0.1;
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
        } else if (keysPressed["="]) {
          FOV += 0.1;
        } else if (keysPressed["e"]) {
          if (lockautoRotating) return;
          autoFiring = !autoFiring;
          if (!autoFiring) {
            canFire = true;
          }
        } else if (keysPressed["c"]) {
          send("browserunHidden", { id: playerId });
          autoRotating = !autoRotating;
        } else if (keysPressed["h"]) {
          __type__ = types[typeindex];
          typeindex += 1;
          if (typeindex >= types.length) {
            typeindex = 0;
          }
          players[playerId].type = __type__;
          let tankdata = tankmeta[__type__];
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
            FOV: FOV,
            MouseX: MouseX_,
            MouseY: MouseY_,
            screenWidth: canvas.width,
            screenHeight: canvas.height,
          });
          setTimeout(() => {
            cannonWidth = [];
            for (let i = 0; i < Object.keys(tankdatacannon__).length; i++) {
              cannonWidth.push(0);
            }
          }, 100);
        }
      }

      let angle = Math.atan2(
        Math.abs(MouseY_) - (canvas.height / 2 - playerSize * FOV),
        Math.abs(MouseX_) - (canvas.width / 2 - playerSize * FOV)
      );
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
          autocannons.forEach((cannonA) => {
            if (cannonA.playerid === playerId && cannonA.autoindex === i) {
              cannonangle = cannonA.angle;
            }
          });
          var offSet_x = tankdatacannondata["offSet-x"];
          if (tankdatacannondata["offSet-x"] === "playerX") {
            offSet_x = playerSize * 40 * FOV;
          }
          if (tankdatacannondata["offSet-x-multpliyer"]) {
            offSet_x *= -1;
          }
          let angle0 = Math.atan2(
            Math.abs(MouseY_) - (canvas.height / 2 - playerSize * FOV),
            Math.abs(MouseX_) - (canvas.width / 2 - playerSize * FOV)
          );
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

          let basex =
            -cannon_widthFOV / 2 + cannon_heightFOV + 0 - cannonWidth[i];
          let basey = -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];

          ctx.beginPath();
          ctx.fillRect(
            basex - 5,
            basey - 2.5,
            cannon_widthFOV + 10,
            cannon_heightFOV + 5
          );

          ctx.strokeStyle = "lightgrey"; // Set border color
          ctx.lineWidth = 3; // Set border width
          ctx.strokeRect(
            basex - 5,
            basey - 2.5,
            cannon_widthFOV + 10,
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
            (playerSize * FOV * 40) / 4,
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

        for (let i = 0; i < Object.keys(tankdatacannon).length; i++) {
          ctx.fillStyle = "#b3b3b3";
          let tankdatacannondata = tankdatacannon[i];
          let cannon_widthFOV = tankdatacannondata["cannon-width"] * FOVplayerz;
          let cannon_heightFOV =
            tankdatacannondata["cannon-height"] * FOVplayerz;
          let cannonangle;
          autocannons.forEach((cannonA) => {
            if (cannonA.playerid === playerId && cannonA.autoindex === i) {
              cannonangle = cannonA.angle;
            }
          });
          if (tankdatacannondata["type"] === "autoCannon") {
            ctx.save();
            var offSet_x = tankdatacannondata["offSet-x"];
            if (tankdatacannondata["offSet-x"] === "playerX") {
              offSet_x = playerSize * 40 * FOV;
            }
            if (tankdatacannondata["offSet-x-multpliyer"]) {
              offSet_x *= -1;
            }
            let angle0 = Math.atan2(
              Math.abs(MouseY_) - (canvas.height / 2 - playerSize * FOV),
              Math.abs(MouseX_) - (canvas.width / 2 - playerSize * FOV)
            );
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

            let basex =
              -cannon_widthFOV / 2 + cannon_heightFOV + 0 - cannonWidth[i];
            let basey = -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];

            ctx.beginPath();
            ctx.fillRect(
              basex - 5,
              basey - 2.5,
              cannon_widthFOV + 10,
              cannon_heightFOV + 5
            );

            ctx.strokeStyle = "lightgrey"; // Set border color
            ctx.lineWidth = 3; // Set border width
            ctx.strokeRect(
              basex - 5,
              basey - 2.5,
              cannon_widthFOV + 10,
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

        zlevelbullets = [];

        // Draw border
        ctx.lineWidth = 1;
        ctx.strokeStyle = "grey";
        ctx.strokeRect(
          canvas.width / 2 - 50 * FOV,
          canvas.height / 2 + 55 * FOV,
          90 * FOV,
          10 * FOV
        );
      }

      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        playerSize * FOV * 40,
        0,
        2 * Math.PI,
        false
      );
      let num = statecycle % 10;
      if (num === 0 && (state === "start" || state === "damaged")) {
        ctx.fillStyle = "white";
      } else {
        ctx.fillStyle = "blue";
      }
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "darkblue";
      ctx.stroke();

      // Draw background bar
      ctx.fillStyle = "black";
      ctx.fillRect(
        canvas.width / 2 - 50 * FOV,
        canvas.height / 2 + 55 * FOV,
        90 * FOV,
        10 * FOV
      );

      ctx.strokeStyle = "black";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.font = "bold 20px Nunito";
      ctx.strokeText(score, canvas.width / 2, canvas.height / 2 - 55);
      ctx.fillText(score, canvas.width / 2, canvas.height / 2 - 55);

      ctx.strokeText(username, canvas.width / 2, canvas.height / 2 - 75);
      ctx.fillText(username, canvas.width / 2, canvas.height / 2 - 75);

      // Draw health bar
      const healthWidth = (playerHealth / maxhealth) * 90 * FOV;
      ctx.fillStyle = "green";
      ctx.fillRect(
        canvas.width / 2 - 50 * FOV,
        canvas.height / 2 + 55 * FOV,
        healthWidth,
        10 * FOV
      );
      ctx.save();

      ctx.translate(canW - 150, canH - 150);
      ctx.fillStyle = "#fcfafa";
      ctx.beginPath();
      ctx.roundRect(0, 0, 125, 125, 5);
      ctx.fill();
      ctx.moveTo(0, 0);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#e3e3e3";
      for (let i = 0; i < 13; i++) {
        ctx.moveTo(i * 10.3, 0);
        ctx.lineTo(i * 10.3, 125);
        ctx.stroke();
      }
      ctx.closePath();
      ctx.moveTo(0, 0);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#e3e3e3";
      for (let i = 0; i < 13; i++) {
        ctx.moveTo(0, i * 10.3);
        ctx.lineTo(125, i * 10.3);
        ctx.stroke();
      }
      ctx.closePath();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "grey";
      ctx.beginPath();
      ctx.roundRect(0, 0, 125, 125, 5);
      ctx.stroke();
      ctx.closePath();

      ctx.textAlign = "center";
      ctx.strokeText("players: " + Object.keys(players).length, 125 / 2, -25);
      ctx.fillText("players: " + Object.keys(players).length, 125 / 2, -25);

      ctx.globalAlpha = 0.5;
      ctx.fillStyle = "#579bfa";
      const centerX = 62.5;
      const centerY = 62.5;
      const radius = 30 * FOV;
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
      ctx.translate((playerX + 2500) / 80 + 35, (playerY + 2500) / 80 + 35);
      ctx.rotate(angle + (90 * Math.PI) / 180);
      ctx.arc(
        (playerX + 2500) / 80 + 35,
        (playerY + 2500) / 80 + 35,
        playerSize * FOV * 2,
        0,
        2 * Math.PI,
        false
      );
      let realitemsize = playerSize * FOV * 2;
      let h = 3;
      ctx.beginPath();
      ctx.moveTo(0, -h / 2);
      ctx.lineTo(-realitemsize / 2, h / 2);
      ctx.lineTo(realitemsize / 2, h / 2);
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
        let boxlen = 300 + typedtext.length * 12;
        ctx.roundRect(
          canvas.width / 2 - boxlen / 2,
          canvas.height / 2 - 25,
          boxlen,
          50,
          5
        );
        ctx.fill();
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.textAlign = "left";
        ctx.font = "bold 30px Nunito";
        ctx.fillStyle = "black";
        ctx.fillText(
          typedtext,
          canvas.width / 2 - (boxlen / 2 - 5),
          canvas.height / 2 + 15
        );
        ctx.closePath();
        var textwidth = ctx.measureText(typedtext).width + 3;
        if (blinking) {
          ctx.beginPath();
          ctx.lineWidth = 1;
          ctx.strokeStyle = "black";
          ctx.moveTo(
            canvas.width / 2 - (boxlen / 2 - 5) + textwidth,
            canvas.height / 2 + 15 - 30
          );
          ctx.lineTo(
            canvas.width / 2 - (boxlen / 2 - 5) + textwidth,
            canvas.height / 2 + 15 + 0
          );
          ctx.stroke();
          ctx.closePath();
        }
      }
      if (
        canvas.width - 475 < MouseX_ &&
        MouseX_ < canvas.width - 275 &&
        MouseY_ > 10 &&
        MouseY_ < 110
      ) {
        ctx.strokeStyle = "#4fe5ff";
        ctx.lineWidth = 7;
      } else {
        ctx.strokeStyle = "#0e589d";
        ctx.lineWidth = 5;
      }

      ctx.fillStyle = "#45bbff";

      ctx.beginPath();
      ctx.roundRect(canvas.width - 475, 10, 200, 100, 5);
      ctx.fill();
      ctx.stroke();
      ctx.closePath();
      ctx.fillStyle = "#00a0fd";
      ctx.beginPath();
      ctx.roundRect(canvas.width - 462.5, 25, 175, 70, 5);
      ctx.fill();
      ctx.closePath();
      ctx.textAlign = "center";
      ctx.font = "bold 40px Nunito";
      ctx.fillStyle = "black";
      ctx.fillText("Teams", canvas.width - 375, 75);
      if (teampanelopen) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#a3a3a3";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.roundRect(
          canvas.width / 2 - teamwidth / 2,
          canvas.height / 2 - teamheight / 2,
          teamwidth,
          teamheight,
          7.5
        );
        ctx.fillStyle = "#45bbff";
        ctx.strokeStyle = "#4fe5ff";
        ctx.lineWidth = 5;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.stroke();
        ctx.closePath();
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.roundRect(
          canvas.width / 2 - innerteamwidth / 2,
          canvas.height / 2 - innerteamheight / 2,
          innerteamwidth,
          innerteamheight,
          5
        );
        ctx.fillStyle = "#00a0fd";
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#4f84ff";
        if (joinedTeam) {
          if (owner_of_team) {
            ctx.roundRect(
              canvas.width / 2 + innerteamwidth / 2 - 150,
              canvas.height / 2 + innerteamheight / 2 - 50,
              140,
              40,
              5
            );
          }
        } else {
          ctx.roundRect(
            canvas.width / 2 + innerteamwidth / 2 - 150,
            canvas.height / 2 + innerteamheight / 2 - 50,
            140,
            40,
            5
          );
        }
        ctx.fill();
        ctx.closePath();
        ctx.beginPath();
        ctx.fillStyle = "#4f84ff";
        ctx.roundRect(
          canvas.width / 2 - innerteamwidth / 2 + 10,
          canvas.height / 2 + innerteamheight / 2 - 50,
          80,
          40,
          5
        );
        ctx.closePath();
        ctx.fill();
        ctx.textAlign = "center";
        ctx.font = "bold 35px Nunito";
        ctx.fillStyle = "black";
        var text_;
        if (joinedTeam) {
          ctx.font = "bold 30px Nunito";
          text_ = "Leave";
        } else {
          ctx.font = "bold 35px Nunito";
          text_ = "Join";
        }
        ctx.fillText(
          text_,
          canvas.width / 2 - innerteamwidth / 2 + 50,
          canvas.height / 2 + innerteamheight / 2 - 17.5
        );
        ctx.font = "bold 21px Nunito";
        var text2;
        if (joinedTeam) {
          if (owner_of_team) {
            text2 = "Delete team";
          } else {
            text2 = null;
          }
        } else {
          text2 = "Create team";
        }
        if (text2 !== null) {
          ctx.fillText(
            text2,
            canvas.width / 2 - innerteamwidth / 2 + 195,
            canvas.height / 2 + innerteamheight / 2 - 22.5
          );
        }
        ctx.textAlign = "left";
        ctx.fillText(
          "X",
          canvas.width / 2 + innerteamwidth / 2 - 15,
          canvas.height / 2 - innerteamheight / 2 + 26
        );
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      food_list.forEach((item) => {
        var realx = item.x - item.size * (FOV - 1);
        var realy = item.y - item.size * (FOV - 1);
        if (
          realx + item.size > 0 + cavansX &&
          realx < canvas.width + cavansX + item.size &&
          realy - cavansY > 0 - item.size &&
          realy - item.size < canvas.height + cavansY &&
          item.health > 0
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
          }

          if (item.type === "triangle") {
            let realitemsize = item.size * FOV;
            const h = realitemsize * sqrt23;

            ctx.beginPath();
            ctx.moveTo(0, -h / 2);
            ctx.lineTo(-realitemsize / 2, h / 2);
            ctx.lineTo(realitemsize / 2, h / 2);
            ctx.closePath();

            ctx.fillStyle = item.color;
            ctx.fill();
            ctx.strokeStyle = "Darkred";
            ctx.lineWidth = 5;
            ctx.stroke();

            ctx.rotate(-item.angle * pi180);
            if (item.health < item.maxhealth) {
              ctx.fillStyle = "black";
              ctx.fillRect(-45, 35, 90 * FOV, 10 * FOV);
              const healthWidth = (item.health / item.maxhealth) * 90 * FOV;
              ctx.fillStyle = "green";
              ctx.fillRect(-45, 35, healthWidth, 10 * FOV);
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
            ctx.stroke();

            // Rotate context back to original position (if needed)
            ctx.rotate(-item.angle * pi180);

            // Draw health bar if health is less than 100%
            if (item.health < item.maxhealth) {
              ctx.fillStyle = "black";
              ctx.fillRect(
                centerX - 60 * FOV,
                centerY + (35 + (item.size - 50)) * FOV,
                (120 + (item.size - 50)) * FOV,
                10
              );
              const healthWidth =
                (item.health / item.maxhealth) * (120 + (item.size - 50)) * FOV;
              ctx.fillStyle = "green";
              ctx.fillRect(
                centerX - 60 * FOV,
                centerY + (35 + (item.size - 50)) * FOV,
                healthWidth,
                10
              );
            }
          }

          ctx.restore();
          ctx.globalAlpha = 1;
        }
      });

      let unZbullets = [];

      bullets.forEach((bullet) => {
        var realx = bullet.x - Math.abs(bullet.size * 2 * (FOV - 1));
        var realy = bullet.y - Math.abs(bullet.size * 2 * (FOV - 1));
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
          }
          ctx.globalAlpha = 1;
        }
      });

      unZbullets.forEach((bullet) => {
        var realx = bullet.x - Math.abs(bullet.size * 2 * (FOV - 1));
        var realy = bullet.y - Math.abs(bullet.size * 2 * (FOV - 1));
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
            let basex = -cannon_widthFOV / 2 + cannon_heightFOV;
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

      for (let playerId__ in players) {
        if (players.hasOwnProperty(playerId__) && playerId__ != playerId) {
          let player = players[playerId__];

          let tankdata = tankmeta[player.__type__];

          let tankdatacannon = tankdata["cannons"];

          let playerX = player.x - Math.abs(player.size * 80 * (FOV - 1));
          let playerY = player.y - Math.abs(player.size * 80 * (FOV - 1));

          let FOVplayerz = player.size * FOV;

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
                (playerSize * FOV * 40) / 4,
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
            ctx.fillStyle = "white";
            ctx.strokeStyle = "#fafafa";
          } else if (!sameTeam) {
            ctx.fillStyle = "red";
            ctx.strokeStyle = "darkred";
          } else if (sameTeam) {
            ctx.fillStyle = "blue";
            ctx.strokeStyle = "darkblue";
          }

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
            console.log(
              (Date.now() - message.hidetime) / 500,
              Date.now() < message.hidetime
            );
            if (message.hidetime < Date.now()) {
              console.log(1 - (Date.now() - message.hidetime) / 500);
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
            ctx.font = "bold 20px Nunito";
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
            autocannons.forEach((cannonA) => {
              if (cannonA.playerid === playerId__ && cannonA.autoindex === i) {
                cannonangle = cannonA.angle;
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
                offSet_x = player.size * FOV * 2;
              }

              let basex =
                -cannon_widthFOV / 2 +
                cannon_heightFOV +
                offSet_x -
                player.cannonW[i];
              let basey =
                -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];

              ctx.beginPath();
              ctx.fillRect(
                basex - 5,
                basey - 2.5,
                cannon_widthFOV + 10,
                cannon_heightFOV + 5
              );

              ctx.strokeStyle = "lightgrey"; // Set border color
              ctx.lineWidth = 3; // Set border width
              ctx.strokeRect(
                basex - 5,
                basey - 2.5,
                cannon_widthFOV + 10,
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
              autocannons.forEach((cannonA) => {
                if (cannonA.playerid === player.id && cannonA.autoindex === i) {
                  cannonangle = cannonA.angle;
                }
              });
              var offSet_x = tankdatacannondata["offSet-x"];
              if (tankdatacannondata["offSet-x"] === "playerX") {
                offSet_x = playerSize * 40 * FOV;
              }
              if (tankdatacannondata["offSet-x-multpliyer"]) {
                offSet_x *= -1;
              }
              let angle0 = Math.atan2(
                Math.abs(MouseY_) - (canvas.height / 2 - playerSize * FOV),
                Math.abs(MouseX_) - (canvas.width / 2 - playerSize * FOV)
              );
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

              let basex =
                -cannon_widthFOV / 2 + cannon_heightFOV + 0 - cannonWidth[i];
              let basey =
                -cannon_heightFOV / 2 + tankdatacannondata["offSet-y"];

              ctx.beginPath();
              ctx.fillRect(
                basex - 5,
                basey - 2.5,
                cannon_widthFOV + 10,
                cannon_heightFOV + 5
              );

              ctx.strokeStyle = "lightgrey"; // Set border color
              ctx.lineWidth = 3; // Set border width
              ctx.strokeRect(
                basex - 5,
                basey - 2.5,
                cannon_widthFOV + 10,
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

      let angle = Math.atan2(
        Math.abs(MouseY_) - (canvas.height / 2 - playerSize * FOV),
        Math.abs(MouseX_) - (canvas.width / 2 - playerSize * FOV)
      );
      drawself();

      ctx.strokeStyle = "black";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(mapLeft, mapTop);
      ctx.lineTo(mapRight, mapTop);
      ctx.lineTo(mapRight, mapBottom);
      ctx.lineTo(mapLeft, mapBottom);
      ctx.lineTo(mapLeft, mapTop);
      ctx.stroke();

      gridstyle.top = `calc(-5000px - ${cavansY}px)`;
      gridstyle.left = `calc(-5000px - ${cavansX}px)`;

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
          20 + 145 / 2,
          canvas.height - 34 * 9
        );
        ctx.textAlign = "center";
        ctx.font = "bold 25px Nunito";
        ctx.fillStyle = "#14fc52";
        ctx.fillText(`+${upgradePoints}`, 20 + 145 / 2, canvas.height - 34 * 9);
      }

      for (let CCC = Object.keys(statsTree).length - 1; CCC >= 0; CCC -= 1) {
        let stat_ = statsTree[Object.keys(statsTree)[CCC]];
        let stat = Object.keys(statsTree)[CCC];
        let color = colorUpgrades[CCC] || "red";
        drawRoundedLevelBar(
          ctx,
          20,
          canvas.height - 34 * I_ - 40,
          145,
          25,
          borderRadius,
          stat_ / 8,
          "black",
          color,
          "#242424",
          false
        );
        ctx.textAlign = "center";
        ctx.font = "bold 15px Nunito";
        ctx.fillStyle = "white";
        ctx.fillText(
          `${stat}:${stat_}`,
          20 + 145 / 2,
          canvas.height - 34 * I_ - 40 + 17.5
        );
        I_++;
      }
      ctx.font = "bold 30px Nunito";
      ctx.strokeStyle = "black";
      ctx.strokeText("leaderboard", canvas.width - 125, 25);
      ctx.textAlign = "center";
      ctx.font = "bold 30px Nunito";
      ctx.fillStyle = "#00f7ff";
      ctx.fillText("leaderboard", canvas.width - 125, 25);

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
          canvas.width - 237.5,
          50 + i * 30,
          225,
          27,
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
          canvas.width - 125,
          72 + i * 30
        );
      });

      requestAnimationFrame(draw);
    }
  }

  document.getElementById("playButton").addEventListener("mousedown", () => {
    username = document.getElementById("username").value;
    if (username) {
      // Proceed to the game with the entered username
      setTimeout(() => {
        document.getElementById("start").style.display = "none";
        document.getElementById("game").style.display = "block";
        if (username === "A") {
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
