/* eslint-disable space-before-function-paren */
// classes and global functions and variables
let entitiesSet, bulletsSet, helisSet, troopersSet, debrisSet, buttons, timerSet;
let keyLoop, gameLoop, statusLoop, score, mouseOverCanvas, trooperSpawnProb;
trooperSpawnProb = 7; // 70% chance of spawning
const keys = [];
let scale = 2;
// flags
let bulletFlag;

// html elements
let currentScore, highScore, canv, ctx;

class Entity {
    constructor(src, x, y, w, h) {
        this.image = new Image();
        this.image.src = src;
        this.x = x * scale;
        this.y = y * scale;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.width = w * scale;
        this.height = h * scale;
    }

    display() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    move() {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
    }

    clear() {
        ctx.fillStyle = 'LightGrey';
        ctx.fillRect(this.x - 10, this.y - 10, this.width + 10, this.height + 10);
    }

    deleteSelf() {}
}

class Helicopter extends Entity {
    constructor() {
        super('./resources/helicopter.png', 0, 0, 75, 35);
        helisSet.add(this);
        entitiesSet.add(this);
        if (Math.round(Math.random())) {
            this.x = 475 * scale;
            this.xSpeed = -2.5 * scale;
            this.direction = 'l';
        } else {
            this.x = -75 * scale;
            this.xSpeed = 2.5 * scale;
            this.direction = 'r';
        }

        Math.round(Math.random()) ? this.y = 50 * scale : this.y = 5 * scale;

        let time = randomInt(450, 3000);
        this.trooperSpawnTimer = new Timer(() => this.spawnTrooper(), time);
        this.failedSpawnProb = randomInt(1, 10);

        this.sprite = 0;
        this.alive = true;
    }

    hit() {
        clearTimeout(this.trooperSpawnTimer);
        spawnDebris(this.x / scale, this.y / scale);
        // TODO pass xspeed and yspeed so that display of debris could also
        // display the cover block

        // TODO work out when the game should pause, maybe have a shoot to reenter?

        if (this.alive) {
            this.alive = false;
            let changeSprite;
            new Timer(changeSprite = () => {
                this.ySpeed += 0.04 * scale;
                this.sprite = this.sprite + 1;
                if (this.sprite > 6) this.sprite = 4;

                new Timer(changeSprite, 150);
            }, 0);
        }
    }

    display() {
        if (this.direction === 'r') {
            ctx.drawImage(this.image,
                this.sprite * 208, 100, 208, 100,
                this.x, this.y, this.width, this.height);
        } else {
            ctx.drawImage(this.image,
                this.sprite * 208, 0, 208, 100,
                this.x, this.y, this.width, this.height);
        }
    }

    deleteSelf() {
        clearTimeout(this.trooperSpawnTimer);
        entitiesSet.delete(this);
        helisSet.delete(this);
    }

    spawnTrooper() {
        // stop trooper spawning on canvas edge
        if (this.x < 0 ||
            this.x > 370 * scale ||
            this.failedSpawnProb > trooperSpawnProb) {
            return;
        }

        new Trooper(this.x / scale, this.y / scale);

        // set next spawn timer
        let time = randomInt(450, 1950);
        this.trooperSpawnTimer = new Timer(() => this.spawnTrooper(), time);

        this.failedSpawnProb++; // increase chance of failed spawn
        // (this means is less likely for heli to spawn 2 troopers)
    }
}

class Trooper extends Entity {
    constructor(x, y) {
        super('./resources/para.png', x, y, 30, 40);
        troopersSet.add(this);
        entitiesSet.add(this);
        this.ySpeed = 3 * scale;
        this.alpha = 1;
        this.opaque = true;
        this.alive = true;
        this.landed = false;

        this.sourceX = 0;
        this.sourceY = 0;
        this.sourceW = 160;
        this.sourceH = 210;
    }

    move() {
        this.y += this.ySpeed;

        // Stacking
        // if (this.y > 250 * scale &&
        //     !this.landed &&
        //     troopersSet.size > 1) {
        //     for (let trooper of troopersSet) {
        //         if (trooper.landed &&
        //             Math.abs(this.x - trooper.x) < 10 &&
        //             Math.abs(this.y - trooper.y) < 40) {
        //             this.land();
        //         }
        //     }
        // }

        // Landing
        if (this.alive &&
            this.y > 360 * scale &&
            this.ySpeed !== 0) {
            this.land();
            // if it lands unharmed, count how many others there are, if 5 end game
            if (this.alive) {
                let count = 0;
                for (let t of troopersSet) {
                    if (t.landed && t.alive) {
                        count++;
                    }
                }
                if (count >= 5) endGame();
            }
        }

        // Landing wounded
        if (this.y > 380 * scale) this.ySpeed = 0;
    }

    land() {
        this.x += 10 * scale;
        this.y += 20 * scale;
        this.ySpeed = 0;
        this.sourceX = 320;
        this.sourceY = 102;
        this.sourceW = 40;
        this.sourceH = 100;
        this.width = 10 * scale;
        this.height = 22 * scale;

        this.landed = true;
    }

    hit(para) {
        if (para) {
            // log('parachute hit');
            this.x += 10 * scale;
            this.y += 20 * scale;
            this.ySpeed += 1 * scale;
            this.sourceX = 364;
            this.sourceY = 102;
            this.sourceW = 40;
            this.sourceH = 100;
            this.width = 10 * scale;
            this.height = 22 * scale;
            this.alive = false;
        } else {
            this.deleteSelf();
        }
    }

    display() {
        if (!this.alive && this.y > 380 && this.alpha > 0.005) {
            this.alpha -= 0.005;
        }

        if (this.alpha <= 0.01) this.deleteSelf();

        ctx.globalAlpha = this.alpha;

        ctx.drawImage(this.image,
            this.sourceX, this.sourceY, this.sourceW, this.sourceH,
            this.x, this.y, this.width, this.height);

        ctx.globalAlpha = 1;
    }

    deleteSelf() {
        entitiesSet.delete(this);
        troopersSet.delete(this);
    }
}

class Bullet extends Entity {
    constructor(x, y, xVec, yVec, rotation) {
        super('./resources/bullet.png', x, y, 10, 10);
        bulletsSet.add(this);
        entitiesSet.add(this);
        this.xSpeed = xVec * 12 * scale;
        this.ySpeed = yVec * 12 * scale;
        this.rotation = rotation;
    }

    display() {
        drawImageRot(this.image, this.x, this.y, this.width, this.height, this.rotation);
    }

    deleteSelf() {
        entitiesSet.delete(this);
        bulletsSet.delete(this);
    }
}

class Turret extends Entity {
    constructor() {
        super('./resources/turret.png', 165, 315, 50, 120);
        entitiesSet.add(this);
        this.rotation = 0;
    }

    display() {
        drawImageRot(this.image, this.x, this.y, this.width, this.height, this.rotation);
    }

    rotate(x) {
        if (((this.rotation + x) ** 2) <= 90 ** 2) {
            this.rotation += x;
        } else if (this.rotation > 0) {
            this.rotation = 90;
        } else {
            this.rotation = -90;
        }
    }
}

class Debris extends Entity {
    constructor(x, y) {
        super('./resources/debris.png', x, y, 0, 0);
        entitiesSet.add(this);
        debrisSet.add(this);
        this.xSpeed = randomReal(-2, 2) * scale;
        this.ySpeed = randomReal(-1, 2) * scale;

        this.sourceX = randomInt(10, 95);
        this.sourceY = randomInt(0, 42);
        this.sourceW = randomInt(21, 42);
        this.sourceH = randomInt(45, 95);

        this.width = this.sourceW / 2 * scale;
        this.height = this.sourceH / 2 * scale;

        new Timer(() => this.deleteSelf(), 1000);

        let gravity;
        new Timer(gravity = () => {
            this.ySpeed += 0.04 * scale;
            new Timer(gravity, 100);
        }, 0);
    }

    deleteSelf() {
        entitiesSet.delete(this);
        debrisSet.delete(this);
    }

    display() {
        ctx.drawImage(this.image,
            this.sourceX, this.sourceY, this.sourceW, this.sourceH,
            this.x, this.y, this.width, this.height);
    }
}

/* class Button {
    constructor(text, x, y) {
        this.width = 300 * scale;
        this.height = 60 * scale;

        this.x = x;
        this.minX = x - this.width / 2;
        this.maxX = this.minX + this.width;

        this.y = y;
        this.minY = y - this.height / 2;
        this.maxY = this.minY + this.height;

        this.text = text;
    }

    isPressed(X, Y) {
        if (X >= this.minX && X <= this.maxX &&
            Y >= this.minY && Y <= this.maxY) {
            this.action();
        }
    };

    display() {
        ctx.font = 2.25 * scale + 'rem Iosevka ';
        ctx.fillStyle = 'Black';
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);

        // Draw Border
        const path = new Path2D();
        path.rect(this.minX, this.minY, this.width, this.height);
        path.closePath();
        ctx.lineWidth = 2 * scale;
        ctx.strokeStyle = '#000000';
        ctx.stroke(path);
    };

    action() {}
} */

function Timer(callback, delay) {
    var timerId, start, remaining = delay;

    this.paused = false;

    this.pause = function () {
        this.paused = true;

        window.clearTimeout(timerId);
        remaining -= performance.now() - start;
    };

    this.resume = function () {
        this.paused = false;

        start = performance.now();
        window.clearTimeout(timerId);
        timerId = window.setTimeout(() => {
            callback();
            timerSet.delete(this);
        }, remaining);
    };

    timerSet.add(this);

    this.resume();
}

function clearCanvas() {
    ctx.fillStyle = 'LightGrey';
    ctx.fillRect(0, 0, canv.width, canv.height);
}

function moveEntities() {
    for (let e of entitiesSet) {
        e.move();
    }
}

function trooperCollision(b, t) {
    // log("trooper");

    if (t.alive && b.x > 0 && b.x < 400 * scale &&
        b.x + b.width * scale > t.x + 2 * scale && b.x < t.x + 27 * scale && b.y < t.y + 19 * scale && b.y > t.y + 2 * scale) {
        t.hit(true);
        b.deleteSelf();
        updateScore(2);
    } else {
        if (t.alive &&
            b.x > 0 && b.x < 400 * scale &&
            b.x + b.width * scale > t.x + 11 * scale && b.x < t.x + 18 * scale && b.y < t.y + 25 * scale && b.y > t.y + 18 * scale) {
            t.hit(false);
            b.deleteSelf();
            updateScore(2);
        }
    }
}

function checkCollisions() {
    for (let b of new Set([...bulletsSet, ...debrisSet])) {
        for (let t of new Set([...troopersSet, ...helisSet])) {
            if (t instanceof Trooper) {
                trooperCollision(b, t);
            } else { // heli collision detection
                if (t.alive &&
                    b.x > 0 && b.x < 400 * scale &&
                    b.x < t.x + t.width && // credit: https://developer.mozilla.org/kab/docs/Games/Techniques/2D_collision_detection
                    b.x + b.width > t.x &&
                    b.y < t.y + t.height &&
                    b.height + b.y > t.y) {
                    t.hit();
                    b.deleteSelf();
                    updateScore(2);
                }
            }
        }
    }
}

function drawGame() {
    for (let e of entitiesSet) {
        e.display();
    }
}

const checkFocus = (function () {
    let hasFocus = document.hasFocus();
    let hidden = document.hidden;
    return function () {
        let hasFocusNow = document.hasFocus();
        let hiddenNow = document.hidden;

        if (document.hidden || !document.hasFocus()) {
            // lost focus
            for (const timer of timerSet) {
                timer.pause();
            }
        } else if (hasFocus !== hasFocusNow || hidden !== hiddenNow) {
            // if statement checks if the state has changed since last check
            // gained focus
            for (const timer of timerSet) {
                if (timer.paused) timer.resume();
            }
        }
        hasFocus = hasFocusNow;
        hidden = hiddenNow;
    };
})();

function deleteEntities() {
    for (let e of entitiesSet) {
        if (e.y < (0 - e.height) || e.x < (0 - e.width) || e.x > (400 * scale + e.width)) {
            e.deleteSelf(this);
        }
    }
}

function spawnHeli() {
    // for reference helis take 4600ms to cross screen
    // they should spawn a max of two if they aren't hit at first
    if (gameLoop !== 0) {
        new Helicopter();
        // can play around with time out values and use constiables to make them spawn
        // faster as game progresses
        const time = randomInt(1000, 5500);
        new Timer(spawnHeli, time);
    }
}

function updateScore(x) {
    score += x;
    currentScore.innerHTML = score;
}

function countdown() {
    gameLoop = 1; // stopping menu buttons from being pressed
    ctx.font = 3 * scale + 'rem Iosevka';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    let num = 3;
    new Timer(function running() {
        clearCanvas();

        ctx.fillStyle = 'Black';
        new Timer(() => {
            ctx.fillText(num, canv.width / 2, canv.height / 2);
            num--;
        }, 200);

        if (num > 0) {
            new Timer(running, 1000);
        } else {
            startLoops();
        }
    }, 100);
}

/* function displayMenu() {
    clearCanvas();

    ctx.font = 2.5 * scale + 'rem Iosevka ';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'White';
    ctx.fillText('Paper Parachutes', canv.width / 2, canv.height / 4);

    const play = new Button('Play', canv.width / 2, canv.height / 2);
    play.action = startGame;

    const instructions = new Button('Instructions', canv.width / 2, 3 * canv.height / 4);
    instructions.action = displayInstructions;

    buttons = [play, instructions];

    play.display();
    instructions.display();
}

function displayInstructions() {
    clearCanvas();
    let instructions = `Everything you hit awards you two points
Every bullet you fire takes one point away
Falling parachuters can hit other parachutes
The game ends when either your turret is hit by a parachuter or 5 land on the ground unharmed`;

    let formattedInstructions = getLinesForParagraphs(ctx, instructions, 700 * scale);

    ctx.font = 1 * scale + 'rem Iosevka ';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'Black';

    let y = canv.height / 8;
    formattedInstructions.forEach(instruction => {
        instruction.forEach(line => {
            ctx.fillText(line, canv.width / 8, y);
            y += 25 * scale;
        });
        y += canv.height / 20;
    });

    const back = new Button('Back', canv.width / 2, 9 * canv.height / 10);
    back.action = displayMenu;

    buttons = [back];

    back.display();
} */

function startLoops() {
    gameLoop = window.requestAnimationFrame(game);
    keyLoop = setInterval(keyPress, 1000 / 50);
    statusLoop = setInterval(status, 1000 / 2);
    spawnHeli();
}

function noScroll() {
    if (mouseOverCanvas) { // only prevent scrolling if cursor over canvas
        window.scrollTo(0, 0);
    }
}

function rotateTurret(event) {
    if (gameLoop !== 0) {
        let turr = entitiesSet.values().next().value;

        if (event.deltaY > 0) {
            turr.rotate(3);
        } else if (event.deltaY < 0) {
            turr.rotate(-3);
        }
    }
}

function spawnDebris(x, y) {
    let n = randomInt(1, 3);

    for (let i = 0; i < n; i++) {
        new Debris(x, y);
    }
}

function startGame() {
    document.getElementById('menu').classList.add('hidden');
    document.getElementById('gc').classList.remove('hidden');
    if (window.innerWidth < 600) {
        document.getElementById('left').classList.remove('hidden');
        document.getElementById('right').classList.remove('hidden');
    }
    entitiesSet = new Set();
    bulletsSet = new Set();
    helisSet = new Set();
    troopersSet = new Set();
    debrisSet = new Set();
    timerSet = new Set();
    log(timerSet);
    keys.length = 0;

    new Turret();
    // turret base
    entitiesSet.add(new Entity('./resources/base.png', 150, 375, 80, 25));
    bulletFlag = true; // todo: find a place or way to set this privately
    score = 0;

    currentScore.innerHTML = 0;
    highScore.innerHTML = localStorage.getItem('highscore') || 0;

    document.getElementById('restart').classList.add('hidden');

    countdown();
}

// initialise game
window.onload = function () {
    canv = document.getElementById('gc');

    canv.addEventListener('click', function (event) { // fire bullet when canvas is clicked
        if (gameLoop) {
            fireBullet();
        } else {
            let clickX;
            let clickY;
            let rect = canv.getBoundingClientRect();

            if (window.innerWidth > 600) {
                clickX = (event.clientX - rect.left - 10) * scale;
                clickY = (event.clientY - rect.top - 10) * scale;
            } else {
                clickX = (event.clientX - rect.left - 10) * 4 / 3 * scale;
                clickY = (event.clientY - rect.top - 10) * 4 / 3 * scale;
            }
            // ctx.fillStyle = 'black';
            // ctx.beginPath();
            // ctx.arc(clickX, clickY, 5, 0, 2 * Math.PI);
            // ctx.fill();
            for (const but of buttons) {
                but.isPressed(clickX, clickY);
            }
        }
    });
    canv.addEventListener('touchstart', function (event) { // fire bullet when canvas is clicked
        if (gameLoop) keys[32] = true;
    });
    canv.addEventListener('touchend', function (event) { // fire bullet when canvas is clicked
        if (gameLoop) keys[32] = false;
    });
    canv.addEventListener('wheel', rotateTurret);
    canv.addEventListener('mouseover', () => {
        mouseOverCanvas = true;
    });
    canv.addEventListener('mouseleave', () => {
        mouseOverCanvas = false;
    });

    canv.width = 400 * scale;
    canv.height = 400 * scale;

    window.addEventListener('scroll', noScroll); // prevents window scrolling, think this is the only way cause it's buggy on canvas
    ctx = canv.getContext('2d');

    highScore = document.getElementById('highscore');
    currentScore = document.getElementById('score');
    currentScore.innerHTML = 0;
    highScore.innerHTML = localStorage.getItem('highscore') || 0;

    document.getElementById('restart').addEventListener('click', () => {
        keys[82] = true;
    });

    document.getElementById('right').addEventListener('touchstart', () => {
        document.getElementById('right').style.background = '#8fa9ff';
        if (gameLoop) keys[39] = true;
    });
    document.getElementById('right').addEventListener('touchend', () => {
        document.getElementById('right').style.background = '#c2d0ff';
        if (gameLoop) keys[39] = false;
    });
    document.getElementById('left').addEventListener('touchstart', () => {
        document.getElementById('left').style.background = '#8fa9ff';
        if (gameLoop) keys[37] = true;
    });
    document.getElementById('left').addEventListener('touchend', () => {
        document.getElementById('left').style.background = '#c2d0ff';
        if (gameLoop) keys[37] = false;
    });

    // displayMenu();
};

// end game
function endGame() {
    window.cancelAnimationFrame(gameLoop);
    gameLoop = 0;
    document.getElementById('restart').classList.remove('hidden');

    // set highscore
    if (localStorage.getItem('highscore') < score) {
        localStorage.setItem('highscore', score);
    }
}

// game loop
function game() {
    gameLoop = window.requestAnimationFrame(game);
    clearCanvas();
    moveEntities();
    checkCollisions();
    drawGame();
}

// keypress loop
function keyPress() {
    // better way to access elements in set? Unsure how set indexing works,
    // if it works thats good enough for now
    let turr = entitiesSet.values().next().value;
    if (keys[39]) { // turn right with right arrow
        turr.rotate(4);
    }

    if (keys[37]) { // turn left with left arrow
        turr.rotate(-4);
    }

    if (keys[32] && bulletFlag) { // fire a bullet when space is pressed
        fireBullet();
    }

    if (keys[82] && gameLoop === 0) {
        for (let k of entitiesSet) {
            k.deleteSelf();
        }
        clearInterval(keyLoop);
        clearInterval(statusLoop);
        startGame();
    }

    if (keys[90]) {
        localStorage.setItem('highscore', 0);
        highScore.innerHTML = localStorage.getItem('highscore');
    }
}

// status loop
function status() {
    deleteEntities();
    checkFocus();
    log(timerSet);
}

function fireBullet() {
    if (gameLoop === 0) return;

    let turr = entitiesSet.values().next().value;
    // calculate radians as thats what the Math lib uses
    var rad = -turr.rotation * Math.PI / 180 + Math.PI / 2;

    // the vectors that the bullets will fire on
    var xVec = Math.cos(rad);
    var yVec = -Math.sin(rad);

    // finding the point in the arc that the bullet will spawn
    // X:= originX + cos(angle) * radius;
    // Y:= originY + sin(angle) * radius;
    var x = 186 + xVec * 60;
    var y = 370 + yVec * 60;

    // create bullet
    new Bullet(x, y, xVec, yVec, turr.rotation);
    if (score !== 0) {
        updateScore(-1);
    }
    bulletFlag = false; // set delay so that a stream of bullets isn't fired
    new Timer(function () {
        bulletFlag = true;
    }, 150);
}

window.onkeydown = window.onkeyup = function (e) {
    // run on every interaction of a key, sets the keys state to an array value
    keys[e.keyCode] = e.type === 'keydown';
};

/* ------- HELPER FUNCTIONS ------- */
// you can now use log instead of console.log
const log = console.log.bind(console);
const localStorage = window.localStorage;
const performance = window.performance;

function randomInt(min, max) {
    // https://stackoverflow.com/a/1527820
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomReal(min, max) {
    return Math.random() * (max - min) + min;
}

/* https://stackoverflow.com/questions/2936112/text-wrap-in-a-canvas-element#comment79378090_16599668
function getLinesForParagraphs(ctx, text, maxWidth) {
    return text.split('\n').map(para => getLines(ctx, para, maxWidth));
}

// https://stackoverflow.com/a/16599668
function getLines(ctx, text, maxWidth) {
    var words = text.split(' ');
    var lines = [];
    var currentLine = words[0];

    for (var i = 1; i < words.length; i++) {
        var word = words[i];
        var width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
            currentLine += ' ' + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
} */

// Credit: https://stackoverflow.com/a/11985464
function drawImageRot(img, x, y, width, height, deg) {
    // Convert degrees to radian
    const rad = deg * Math.PI / 180;

    ctx.save();

    // Set the origin to the center of the image
    ctx.translate(x + width / 2, y + height / 2);

    // Rotate the canvas around the origin
    ctx.rotate(rad);

    // draw the image
    ctx.drawImage(img, width / 2 * (-1), height / 2 * (-1), width, height);

    // reset the canvas
    ctx.restore();
}

function clicked(Button) {
    let x = document.querySelectorAll('.screen');
    // hides them
    for (let i = 0; i < x.length; i++) {
        x[i].classList.add('hidden');
    }
    // except the chosen screen
    document.getElementById(Button).classList.remove('hidden');
}