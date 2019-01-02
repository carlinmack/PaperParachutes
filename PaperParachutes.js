// classes and global functions and variables
let bulletsSet, helisSet, troopersSet, keys, entitiesSet, gameLoop, score, mouseOverCanvas;

// flags
let bulletFlag;

// html elements
let currentScore, highScore, canv, ctx;

// you can now use log instead of console.log
const log = console.log.bind(console);

class Entity {
    constructor(src, x, y, w, h) {
        this.image = new Image();
        this.image.src = src;
        this.x = x;
        this.y = y;
        this.xSpeed = 0;
        this.ySpeed = 0;
        this.width = w;
        this.height = h;
    }

    display() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }

    move() {
        this.x += this.xSpeed;
        this.y += this.ySpeed;
    }
}

class Helicopter extends Entity {
    constructor() {
        super('./resources/helicopter.png', 0, 0, 75, 35)
        if (Math.round(Math.random())) {
            this.x = 475;
            this.xSpeed = -0.75;
            this.direction = 'l';
        } else {
            this.x = -75;
            this.xSpeed = 0.75;
            this.direction = 'r';
        }

        Math.round(Math.random()) ? this.y = 50 : this.y = 5;

        this.sprite = 0;
        this.alive = true;
    }

    hit() {
        if (this.alive) {
            this.alive = false;
            let changeSprite;
            setTimeout(changeSprite = () => {
                this.ySpeed += 0.02;
                this.sprite = this.sprite + 1;
                if (this.sprite > 6) this.sprite = 4;

                setTimeout(changeSprite, 150);
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
        entitiesSet.delete(this);
        helisSet.delete(this);
    }

    spawnTrooper() {
        let t = new Trooper(this.x, this.y);
        troopersSet.add(t);
        entitiesSet.add(t);
    }
}

class Trooper extends Entity {
    constructor(x, y) {
        super('./resources/para.png', x, y, 30, 40);
        this.ySpeed = 1.5;
        this.alpha = 1;
        this.opaque = true;
        this.alive = true;
        this.wounded = false;
        this.landed = false;

        this.sourceX = 0;
        this.sourceY = 0;
        this.sourceW = 160;
        this.sourceH = 210;
    }

    move() {
        this.y += this.ySpeed;

        // Stacking
        if (this.y > 250 &&
            !this.landed &&
            troopersSet.size > 1) {
            for (let trooper of troopersSet) {
                if (trooper.landed &&
                    Math.abs(this.x - trooper.x) < 10 &&
                    Math.abs(this.y - trooper.y) < 40) {
                    this.land();
                }
            }
        }

        // Landing
        if (!this.wounded &&
            this.y > 360 &&
            this.ySpeed !== 0) {

            this.land();
            // if it lands unharmed, count how many others there are, if 5 end game
            if (this.wounded === false) {
                let count = 0;
                for (let t of troopersSet) {
                    if (t.landed && t.wounded === false) {
                        count++;
                    }
                }
                if (count >= 5) endGame();
            }
        }

        // Landing wounded
        if (this.y > 380) this.ySpeed = 0;
    }

    land() {
        this.x += 10;
        this.y += 20;
        this.sourceY = 102;
        this.sourceX = 320;
        this.sourceH = 100;
        this.sourceW = 40;
        this.width = 10;
        this.height = 22;
        this.ySpeed = 0;

        this.landed = true;
    }

    hit() {
        this.x += 10;
        this.y += 20;
        this.ySpeed += 1;
        this.sourceY = 102;
        this.sourceX = 364;
        this.sourceH = 100;
        this.sourceW = 40;
        this.width = 10;
        this.height = 22;

        this.alive = false;
        this.wounded = true;
    }

    display() {
        if (this.wounded && this.y > 360 && this.alpha > 0) {
            this.alpha -= 0.01;
        }
        if (this.alpha <= 0) {
            this.deleteSelf();
        }
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
        this.xSpeed = xVec * 4.5;
        this.ySpeed = yVec * 4.5;
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
    constructor(src, x, y, w, h) {
        super('./resources/turret.png', 165, 315, 50, 120);
        this.rotation = 0;
    }

    display() {
        drawImageRot(this.image, this.x, this.y, this.width, this.height, this.rotation);
    }

    rotate(x) {
        this.rotation += x;
    }
}

function deleteEntities() {
    for (let e of entitiesSet) {
        if (e.y < (0 - e.height) || e.x < (0 - e.width) || e.x > (400 + e.width)) {
            e.deleteSelf(this);
        }
    }
}

function checkCollisions() {
    for (let b of bulletsSet) {
        for (let t of new Set([...troopersSet, ...helisSet])) {
            if (t.alive &&
                b.x > 0 && b.x < 400 &&
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

function spawnHeli() {
    // for reference helis take 6100ms to cross screen
    // they should spawn a max of two if they aren't hit at first
    if (gameLoop !== 0) {
        let h = new Helicopter();
        helisSet.add(h);
        entitiesSet.add(h);
        // can play around with time out values and use constiables to make them spawn
        // faster as game progresses
        const time = Math.floor(1000 + (Math.random() * 8000)); // 1000 - 9000
        setTimeout(spawnHeli, time);
        // issue here is we set multiple timeouts so hard to cancel them
        // store timeouts in an array which is cleared?
    }
}

function spawnTroopers() {
    if (gameLoop !== 0) {
        for (let h of helisSet) {
            if (h.alive && h.x > 0 && h.x < (400 - h.width)) {
                let s = Math.floor(Math.random() * 10); // random between 0,9
                if (s > 2) { // 70% chance a heli will spawn trooper
                    h.spawnTrooper();
                }
            }
        }

        setTimeout(spawnTroopers, Math.floor(2000 + (Math.random() * 1000)));
    }
}

function clearCanvas() {
    ctx.fillStyle = 'LightGrey';
    ctx.fillRect(0, 0, canv.width, canv.height);
    // for (let e of entitiesSet) {
    //     e.clear();
    // }
}

function drawGame() {
    for (let e of entitiesSet) {
        e.display();
    }
}

function moveEntities() {
    for (let e of entitiesSet) {
        e.move();
    }
}

function updateScore(x) {
    // when score =0 then it adds 2 to score upon collision :(
    // if (score > 0) {
    score += x;
    // log('x ', x);
    // log('score ', x);
    // } else {
    //     score++;
    // }

    currentScore.innerHTML = score;
}

function countdown() {
    ctx.font = '3rem Arial';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    let num = 3;
    setTimeout(function running() {
        clearCanvas();

        ctx.fillStyle = 'Black';
        setTimeout(() => {
            ctx.fillText(num, canv.width / 2, canv.height / 2);
            num--;
        }, 200);

        if (num > 0) {
            setTimeout(running, 1000);
        } else {
            startLoops();
        }
    }, 100);
}

function startLoops() {
    gameLoop = setInterval(game, 1000 / 200); // I think this should be 60fps max
    // to save unecessary frame redraws but we'd need to change all the speeds and timeOuts
    setInterval(keyPress, 1000 / 50);
}

function noScroll() {
    if (mouseOverCanvas) { // only prevent scrolling if cursor over canvas
        window.scrollTo(0, 0);
    }
}

function rotateTurret(e) {
    let turr = entitiesSet.values().next().value;

    if (e.deltaY > 0 && turr.rotation < 80) {
        turr.rotate(3);
    } else if (e.deltaY < 0 && turr.rotation > -80) {
        turr.rotate(-3);
    }
}

// initialise game
window.onload = startGame = function () {
    canv = document.getElementById('gc');
    canv.onclick = function () { // fire bullet when canvas is clicked
        fireBullet();
    };
    canv.addEventListener('wheel', rotateTurret);
    canv.addEventListener('mouseover', () => {
        mouseOverCanvas = true;
    });
    canv.addEventListener('mouseleave', () => {
        mouseOverCanvas = false;
    });

    window.addEventListener('scroll', noScroll); // prevents window scrolling, think this is the only way cause it's buggy on canvas

    ctx = canv.getContext('2d');
    currentScore = document.getElementById('score');
    currentScore.innerHTML = 0;

    entitiesSet = new Set();
    bulletsSet = new Set();
    helisSet = new Set();
    troopersSet = new Set();
    keys = [];

    entitiesSet.add(new Turret());
    // turret base
    entitiesSet.add(new Entity('./resources/base.png', 150, 375, 80, 25));

    helisSet.add(new Helicopter());
    score = 0;
    bulletFlag = true; // todo: find a place or way to set this privately

    document.getElementById('restart').classList.add('hidden');

    countdown();
    spawnHeli();
    spawnTroopers();
};

// end game
function endGame() {
    clearInterval(gameLoop);
    gameLoop = 0;
    document.getElementById('restart').classList.remove('hidden');
}

// game loop
function game() {
    clearCanvas();
    moveEntities();
    checkCollisions();
    drawGame();
    deleteEntities(); // maybe put this in keyPress as it doesn't need to run 200 times a second
}

// keypress loop
function keyPress() {
    // better way to access elements in set? Unsure how set indexing works,
    // if it works thats good enough for now
    let turr = entitiesSet.values().next().value;
    if (keys[39] && turr.rotation < 90) { // turn right with right arrow
        turr.rotate(3);
    }

    if (keys[37] && turr.rotation > -90) { // turn left with left arrow
        turr.rotate(-3);
    }

    if (keys[32] && bulletFlag) { // fire a bullet when space is pressed
        fireBullet();
    }

    if (keys[82] && gameLoop === 0) {
        highScore = document.getElementById('highscore');

        if (highScore.innerHTML < score) {
            highScore.innerHTML = score;
        }

        startGame();
    }
}

function fireBullet() {
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
    let b = new Bullet(x, y, xVec, yVec, turr.rotation);
    bulletsSet.add(b);
    entitiesSet.add(b);
    if (score !== 0) {
        updateScore(-1);
    }
    bulletFlag = false; // set delay so that a stream of bullets isn't fired
    setTimeout(function () {
        bulletFlag = true;
    }, 150);
}

onkeydown = onkeyup = function (e) {
    // run on every interaction of a key, sets the keys state to an array value
    keys[e.keyCode] = e.type === 'keydown';
};

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