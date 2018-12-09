//classes and global functions and variables
var bulletsSet, helisSet, troopersSet, keys, entitiesSet;
bulletsSet = new Set();
helisSet = new Set();
troopersSet = new Set();
var score = 0;

// parent class, every object must implement this to be drawn
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
        // changed it around so that helicoptors spawn themselves randomly
        if (Math.round(Math.random())) {
            if (Math.round(Math.random())) {
                super('./resources/helicopter.png', 475, 30, 75, 70);
            } else {
                super('./resources/helicopter.png', 475, -5, 75, 70);
            }
            this.xSpeed = -0.5;
            this.direction = 'l';
        } else {
            if (Math.round(Math.random())) {
                super('./resources/helicopter_r.png', -75, 30, 75, 70);
            } else {
                super('./resources/helicopter_r.png', -75, -5, 75, 70);
            }
            // this.xSpeed = -0.5; // maybe a bug IDK but the way I'm flipping 
            // it means the speed is negative
            this.xSpeed = 0.5;
            this.direction = 'r';
        }

        this.alive = true;
    }

    hit() {
        if (this.alive) {
            if (this.direction == 'l') {
                this.image.src = './resources/helicopter_red.png';
            } else {
                this.image.src = './resources/helicopter_red_r.png';
            }
            this.alive = false;
        }
    }

    display() {
        if (this.direction == 'l') {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // ctx.scale(-1, 1);
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            // ctx.scale(-1, 1);
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
        super('./resources/para.png', x, y, 40, 40);
        this.ySpeed = 1.5;
        this.alpha = 1;
        this.opaque = true;
        //this.init();
        this.wounded = false;
    }

    move() {
        this.y += this.ySpeed;
        if (this.y > 360) {
            this.ySpeed = 0;
        }
    }

    hit() {
        this.image.src = './resources/para_red.png';
        this.wounded = true;
    }

    display() {
        if (this.wounded && this.y > 360 && this.alpha > 0) {
            this.alpha -= 0.01;
        }
        if (this.alpha < 0) {
            this.deleteSelf()
        }
        ctx.globalAlpha = this.alpha;
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
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
        this.xSpeed = xVec * 2.5;
        this.ySpeed = yVec * 2.5;
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
        super('./resources/turret.png', 165, 350, 50, 120);
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
    for (e of entitiesSet) {
        if (e.y < (0 - e.height) || e.x < (0 - e.width) || e.x > (400 + e.width)) {
            e.deleteSelf(this);
        }
    }
}

function checkCollisions() {

    for (b of bulletsSet) {
        for (t of new Set([...troopersSet, ...helisSet])) {
            if (b.x > 0 && b.x < 400 &&
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

function spawn_heli() {
    // can improve by having helis spawn on 2 levels and have going left and right
    let h = new Helicopter();
    helisSet.add(h);
    entitiesSet.add(h);
    // can play around with time out values and use variables to make them spawn 
    // faster as game progresses
    setTimeout(spawn_heli, Math.floor(2000 + (Math.random() * 9000)));
}

function spawn_troopers() {

    for (h of helisSet) {
        if (h.x > 0 && h.x < (400 - h.width)) {
            let s = Math.floor(Math.random() * 10);
            if (s > 2) { //70% chance a heli will spawn trooper
                h.spawnTrooper();
            }
        }
    }

    setTimeout(spawn_troopers, Math.floor(2000 + (Math.random() * 1000)));
}

function drawGame() {
    for (e of entitiesSet) {
        e.display();
    }
}

function moveEntities() {
    for (e of entitiesSet) {
        e.move();
    }
}

function updateScore(x) {
    //when score =0 then it adds 2 to score upon collision :(
    score += x;
    scoreboard.innerHTML = score;
}

// initialise game
window.onload = function () {
    canv = document.getElementById("gc");
    ctx = canv.getContext("2d");
    var scoreboard = document.getElementById('scoreboard');
    scoreboard.innerHTML = score;

    entitiesSet = new Set();
    entitiesSet.add(new Turret());
    entitiesSet.add(new Helicopter());

    keys = [];
    bulletFlag = true; // todo: find a place or way to set this privately

    spawn_heli();
    spawn_troopers();
    setInterval(game, 1000 / 200);
    setInterval(keyPress, 1000 / 50);
}

// game loop
function game() {
    // clear screen
    ctx.fillStyle = "LightGrey";
    ctx.fillRect(0, 0, canv.width, canv.height);

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
    if (keys[39] && turr.rotation < 80) { // turn right with right arrow
        turr.rotate(3);
    }

    if (keys[37] && turr.rotation > -80) { // turn left with left arrow
        turr.rotate(-3);
    }

    if (keys[32] && bulletFlag) { // fire a bullet when space is pressed
        // calculate radians as thats what the Math lib uses
        var rad = -turr.rotation * Math.PI / 180 + Math.PI / 2;

        // the vectors that the bullets will fire on
        var xVec = Math.cos(rad);
        var yVec = -Math.sin(rad);

        // finding the point in the arc that the bullet will spawn
        // X:= originX + cos(angle) * radius;
        // Y:= originY + sin(angle) * radius;
        var x = 186 + xVec * 44;
        var y = 404 + yVec * 44;

        // create bullet
        let b = new Bullet(x, y, xVec, yVec, turr.rotation);
        bulletsSet.add(b);
        entitiesSet.add(b);
        if (score != 0) {
            updateScore(-1)
        };
        bulletFlag = false; // set d elay so that a stream of bullets isn't fired
        setTimeout(function () {
            bulletFlag = true
        }, 150);
    }
}

onkeydown = onkeyup = function (e) {
    //run on every interaction of a key, sets the keys state to an array value
    keys[e.keyCode] = e.type === 'keydown';
};

// Credit: https://stackoverflow.com/a/11985464
function drawImageRot(img, x, y, width, height, deg) {
    //Convert degrees to radian 
    var rad = deg * Math.PI / 180;

    //Set the origin to the center of the image
    ctx.translate(x + width / 2, y + height / 2);

    //Rotate the canvas around the origin
    ctx.rotate(rad);

    //draw the image    
    ctx.drawImage(img, width / 2 * (-1), height / 2 * (-1), width, height);

    //reset the canvas  
    ctx.rotate(rad * (-1));
    ctx.translate((x + width / 2) * (-1), (y + height / 2) * (-1));
}
