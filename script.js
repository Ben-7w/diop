const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const fruits = [
    { imgSrc: 'images/orange.png', width: 100, height: 100, gravity: 0.2 },
    { imgSrc: 'images/banane.png', width: 100, height: 100, gravity: 0.2 },
    { imgSrc: 'images/carotte.png', width: 100, height: 100, gravity: 0.2 },
    { imgSrc: 'images/mais.png', width: 100, height: 100, gravity: 0.2 },
    { imgSrc: 'images/mangue.png', width: 100, height: 100, gravity: 0.2 },
    { imgSrc: 'images/oignon.png', width: 100, height: 100, gravity: 0.2 },
    { imgSrc: 'images/pastèque.png', width: 100, height: 100, gravity: 0.2 },
    { imgSrc: 'images/patate.png', width: 100, height: 100, gravity: 0.2 },
    { imgSrc: 'images/tomate.png', width: 100, height: 100, gravity: 0.2 },
    { imgSrc: 'images/pomme.png', width: 100, height: 100, gravity: 0.2 }
];

let currentFruitIndex = 0;
let activeFruits = [];
let score = 0;
let comboCounter = 0;
let lastCutTime = 0;
let missedFruits = 0;
let splashes = [];
let fruitSpawnInterval = 1000; //(1 seconde)
let gameTime = 0;

const background = new Image();
background.src = 'images/background.jpeg';

function spawnFruit() {
    const fruitData = fruits[currentFruitIndex];
    let newFruit = {
        img: new Image(),
        x: Math.random() * (canvas.width - 100), // éviter les bords
        y: canvas.height,
        vx: Math.random() * 4 - 2, 
        vy: -Math.random() * 7 - 10, // réduction de la vitesse initiale
        gravity: fruitData.gravity,
        width: fruitData.width,
        height: fruitData.height,
        isCut: false
    };
    newFruit.img.src = fruitData.imgSrc;
    activeFruits.push(newFruit);

    currentFruitIndex = (currentFruitIndex + 1) % fruits.length;
}

function updateFruits() {
    activeFruits.forEach((fruit, index) => {
        fruit.x += fruit.vx;
        fruit.y += fruit.vy;
        fruit.vy += fruit.gravity;

        if (fruit.y > canvas.height && !fruit.isCut) {
            activeFruits.splice(index, 1); 
            missedFruits++;

            if (missedFruits >= 3) {
                endGame(); 
            }
        }
    });
}

function drawFruits() {
    activeFruits.forEach(fruit => {
        if (!fruit.isCut) {
            ctx.drawImage(fruit.img, fruit.x, fruit.y, fruit.width, fruit.height);
        }
    });
}

function cutFruit(fruit) {
    if (!fruit.isCut) {
        fruit.isCut = true;

        const halfWidth = fruit.width / 2;

        let leftHalf = {
            img: fruit.img,
            x: fruit.x,
            y: fruit.y,
            vx: fruit.vx - 2,
            vy: fruit.vy - 5,
            gravity: fruit.gravity,
            width: halfWidth,
            height: fruit.height,
            isCut: true
        };

        let rightHalf = {
            img: fruit.img,
            x: fruit.x + halfWidth,
            y: fruit.y,
            vx: fruit.vx + 2,
            vy: fruit.vy - 5,
            gravity: fruit.gravity,
            width: halfWidth,
            height: fruit.height,
            isCut: true
        };

        activeFruits.push(leftHalf);
        activeFruits.push(rightHalf);

        activeFruits.splice(activeFruits.indexOf(fruit), 1);

        createSplashEffect(fruit.x, fruit.y);
        updateScore();
        createRainbowTrail(fruit);
    }
}

function createSplashEffect(x, y, color) {
    for (let i = 0; i < 20; i++) {
        splashes.push({
            x: x,
            y: y,
            radius: Math.random() * 5 + 2,
            vx: Math.random() * 4 - 2,
            vy: Math.random() * 4 - 2,
            color: color//'rgba(255, 0, 0, 0.5)'
        });
    }
}

function updateSplashes() {
    splashes.forEach(splash => {
        splash.x += splash.vx;
        splash.y += splash.vy;
        splash.vy += 0.1;
    });
}

function drawSplashes() {
    splashes.forEach(splash => {
        ctx.beginPath();
        ctx.arc(splash.x, splash.y, splash.radius, 0, Math.PI * 2);
        ctx.fillStyle = splash.color;
        ctx.fill();
    });
}

function createRainbowTrail(fruit) {
    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
    rainbowTrail.push({
        x: fruit.x,
        y: fruit.y,
        radius: 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 20 // Durée de vie de chaque particule
    });
}

function updateScore() {
    let now = Date.now();
    if (now - lastCutTime < 1000) {
        comboCounter++;
        score += comboCounter;
        displayCombo(comboCounter);
    } else {
        comboCounter = 3;
        score += comboCounter;
    }
    lastCutTime = now;
}

function displayCombo(combo) {
    ctx.font = "30px Arial";
    ctx.fillStyle = "yellow";
    ctx.fillText("Combo " + combo, canvas.width / 2, canvas.height / 2);
}

function drawScore() {
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 10, 30);
}

function endGame() {
    alert("Game Over! Vous avez manqué 3 fruits.");
    document.location.reload(); 
}

function adjustFruitSpawnRate() {
    gameTime += 1;
    if (gameTime % 10 === 0) {
        fruitSpawnInterval = Math.max(200, fruitSpawnInterval - 50); 
        clearInterval(fruitSpawnTimer);
        fruitSpawnTimer = setInterval(spawnFruit, fruitSpawnInterval);
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    updateFruits();
    drawFruits();
    updateSplashes();
    drawSplashes();

    drawScore();

    requestAnimationFrame(gameLoop);
}

background.onload = function () {
    fruitSpawnTimer = setInterval(spawnFruit, fruitSpawnInterval); 
    gameLoop();
    setInterval(adjustFruitSpawnRate, 1000); 
};

canvas.addEventListener('mousemove', function (event) {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;

    activeFruits.forEach(fruit => {
        if (
            !fruit.isCut &&
            mouseX > fruit.x &&
            mouseX < fruit.x + fruit.width &&
            mouseY > fruit.y &&
            mouseY < fruit.y + fruit.height
        ) {
            cutFruit(fruit);
        }
    });
});





