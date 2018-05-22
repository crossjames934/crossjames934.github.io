let p1 = new Player();
let count = new CountRegister();
let shop = new Shop();
let enemies = [];
let bullets = [];
let booms = [];
let stars = [];
let items = [];
let mouse = {
    x: 0,
    y: 0,
    w: 1,
    h: 1,
    down: false
};
let get = id => document.getElementById(id);
let c = get("gameCanvas");
let gc = $('#gameCanvas');
let body = $('body');
let ctx;
let img = {
    dc: get("cross"),
    dj: get("jackson"),
    pistol: get("pistol"),
    uzi: get("uzi"),
    bowler: get("bowler"),
    violin: get("violin"),
    sax: get("sax"),
    enemy: get("enemy"),
    greenAlien: get("greenAlien"),
    skullAlien: get("skullAlien"),
    toothAlien: get("toothAlien"),
    boss: get("boss"),
    bossSpawn: get("bossSpawn"),
    meteorite: get("meteorite"),
    firstAid: get("firstAid"),
    beer: get("beer"),
    shop: get("shop")
};
let aud = new Sound("audioSpriteTest.mp3");
let hammertime = new Hammer(c);
let isMobile = checkIfMobile();

function init() {
    count.createLevelLengthsArray();
    shop.x = width / 2;
    ctx = c.getContext("2d");
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    ctx.imageSmoothingEnabled = false;
    for (let i = 0; i < 20; i++) {
        stars[i] = new Star(Math.random() * width, Math.random() * height, Math.random() * 5 + 1);
    }
    enemies[0] = new Enemy(width / 2, 0);
    shop.stock.push(new ShopItem("potion"));
    shop.stock.push(new ShopItem("firstAid"));
}

function render() {
    cursor("default"); // gets overriden, placed to avoid - carry-over glitches
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,width,height);
    count.currentLevel === 0 ? menu() : gameScript();
    requestAnimationFrame(render);
}

function menu() {
    let dcBlock = {
        x: width * 0.5,
        y: height * 0.45,
        w: width * 0.4,
        h: width * 0.4,
        selected: false
    };
    let djBlock = {
        x: width * 0.5,
        y: height * 0.75,
        w: width * 0.4,
        h: width * 0.4,
        selected: false
    };
    dcBlock.selected = collision(mouse, dcBlock);
    djBlock.selected = collision(mouse, djBlock);
    dcBlock.selected || djBlock.selected ? cursor("pointer") : cursor("default");
    ctx.fillStyle = dcBlock.selected ? "#58ff3e" : "#818084";
    ctx.fillRect(dcBlock.x - dcBlock.w / 2, dcBlock.y - dcBlock.w / 2, dcBlock.w, dcBlock.h);
    ctx.fillStyle = djBlock.selected ? "#58ff3e" : "#818084";
    ctx.fillRect(djBlock.x - djBlock.w / 2, djBlock.y  - djBlock.w / 2, djBlock.w, djBlock.h);
    ctx.fillStyle = "#ffe827";
    ctx.font = "30px manaspace";
    ctx.textAlign = "center";
    ctx.fillText("CHOOSE YOUR DAVID", width * 0.5, height * 0.2);
    ctx.fillStyle = dcBlock.selected ? "#FFFFFF" : "#b29739";
    ctx.fillText("CROSS", width * 0.5, height * 0.38);
    ctx.fillStyle = djBlock.selected ? "#FFFFFF" : "#b29739";
    ctx.fillText("JACKSON", width * 0.5, height * 0.68);
    ctx.drawImage(img.dc, width / 2 - p1.w, height * 0.4, p1.w * 2, p1.h * 2);
    ctx.drawImage(img.dj, width / 2 - p1.w, height * 0.7, p1.w * 2, p1.h * 2);
    if ((dcBlock.selected || djBlock.selected) && mouse.down) count.currentLevel = 1;
    p1.isCross = dcBlock.selected;
}

function gameScript() {
    let objects = [stars, bullets, booms, items, enemies, [shop, p1]];
    for (let i = 0; i < objects.length; i++) {
        for (let j = objects[i].length - 1; j >= 0; j--) {
            objects[i][j].show();
            objects[i][j].update();
            if ("expended" in objects[i][j] && objects[i][j].expended) {
                objects[i].splice(j, 1)
            }
        }
    }
    count.go();
    display();
}

function display() {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, height - p1.h, width, p1.h);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#000000";
    ctx.font = "18px manaspace";
    ctx.textAlign="left";
    ctx.fillText("Davcoin: " + p1.score, 30, height * 0.95);
    ctx.fillText("HP", 30, height * 0.98);
    ctx.fillStyle = "#000000";
    let lifebarWidth = width / 3;
    ctx.fillRect(60, height * 0.96, lifebarWidth, height * 0.02);
    if (p1.hp > 0) {
        ctx.fillStyle = "#FF0000";
        ctx.fillRect(60, height * 0.96, (p1.hp / p1.maxHp) * lifebarWidth, height * 0.02);
    }
    arsenal();
    // ctx.font = "30px manaspace";
    // ctx.fillText("Mouse Down: " + mouse.down, 30, height * 0.1);
}

function arsenal() {
    let pistolCoords = {
        x: width * 0.59,
        y: height * 0.96,
        w: 50,
        h: 45
    };
    let uziCoords = {
        x: width * 0.72,
        y: height * 0.96,
        w: 50,
        h: 45
    };
    p1.equip === 0 ? ctx.fillStyle = "#FFFF00" : ctx.fillStyle = "#999999";
    ctx.fillRect(pistolCoords.x - pistolCoords.w / 2, pistolCoords.y - pistolCoords.h / 2, pistolCoords.w, pistolCoords.h);
    p1.equip === 1 ? ctx.fillStyle = "#FFFF00" : ctx.fillStyle = "#999999";
    ctx.fillRect(uziCoords.x - uziCoords.w / 2, uziCoords.y - uziCoords.h / 2, uziCoords.w, uziCoords.h);
    ctx.drawImage(img.pistol, pistolCoords.x - pistolCoords.w / 2, pistolCoords.y - pistolCoords.h / 2, pistolCoords.w, pistolCoords.h);
    ctx.drawImage(img.uzi, uziCoords.x - uziCoords.w / 2, uziCoords.y - uziCoords.h / 2, uziCoords.w, uziCoords.h);
    if (collision(pistolCoords, mouse) && mouse.down) {
        p1.equip = 0;
    }
    if (collision(uziCoords, mouse) && mouse.down) {
        p1.equip = 1;
    }
    ctx.fillStyle = "#FF4444";
    ctx.fillText(p1.uziAmmo, uziCoords.x - uziCoords.w / 2, uziCoords.y - uziCoords.h / 2);
}

hammertime.on('pan', function(ev) {
    mouse.x = ev.srcEvent.pageX - gc.offset().left;
    if (p1.x < 0) p1.x = 0;
    if (p1.x > width) p1.x = width;
});

let pressOptions = {
    // event: 'press',
    // pointer: 1,
    threshold: 1,
    time: 1
};

hammertime.get('press').set(pressOptions);

hammertime.on('press', function(ev) {
    mouse.down = true;
});

hammertime.on('pressup', function(ev) {
    mouse.down = false;
});
//
// body.touchstart(function(e) {
//     handleMouse(e);
//     mouse.down = true;
// });
//
// body.touchend(function(e) {
//     handleMouse(e)
//     mouse.down = false;
// });

body.mousemove(function(e) {
    handleMouse(e)
});

body.mousedown(function(e) {
    handleMouse(e);
    mouse.down = true;
    click();
});

body.mouseup(function() {
    mouse.down = false;
});

init();
render();