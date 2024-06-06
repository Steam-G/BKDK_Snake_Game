const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverDisplay = document.getElementById('game-over');
const restartButton = document.getElementById('restart-button');

const snakeHeadImg = new Image();
const snakeBodyImg = new Image();
const fruitImg = new Image();
const treeImg = new Image();
const explosionImgs = [new Image(), new Image(), new Image()];

snakeHeadImg.src = 'images/snake_head.png';
snakeBodyImg.src = 'images/snake_body.png';
fruitImg.src = 'images/fruit.png';
treeImg.src = 'images/tree.png';
explosionImgs[0].src = 'images/explosion1.png';
explosionImgs[1].src = 'images/explosion2.png';
explosionImgs[2].src = 'images/explosion3.png';

const backgroundMusic = document.getElementById('background-music');
backgroundMusic.volume = 0.3;  // Уменьшение громкости фоновой музыки до 30%
const moveSounds = Array.from(document.getElementsByClassName('move-sound'));
const fruitSound = document.getElementById('fruit-sound');
const collisionSound = document.getElementById('collision-sound');
const treeCollisionSound = document.getElementById('tree-collision-sound');
const restartSound = document.getElementById('restart-sound');
const explosionSound = document.getElementById('explosion-sound');

const box = 30;
let snake, oldSnake, fruit, tree, d, score, speed, gameInterval, treeTimer;
let musicOn = true;
let soundsOn = true;
let moveSoundIndex = 0;

function initializeGame() {
    snake = [{ x: 9 * box, y: 10 * box }];
    oldSnake = [];
    fruit = {
                x: Math.floor(Math.random() * 18 + 1) * box,
                y: Math.floor(Math.random() * 18 + 1) * box
    };
    tree = null;
    d = null;
    score = 0;
    speed = 200;
    scoreDisplay.innerText = "Счет: " + score;
    gameOverDisplay.style.display = "none";
    restartButton.style.display = "none";
    clearInterval(gameInterval);
    clearTimeout(treeTimer);
    gameInterval = setInterval(draw, speed);
    setTimeout(() => {
        placeTree();
        treeTimer = setInterval(() => {
            placeTree();
        }, 10000);
    }, 10000);
    if (musicOn) {
        backgroundMusic.play();
    }
}

document.addEventListener("keydown", direction);

function direction(event) {
    if (event.keyCode == 37 && d != "RIGHT") {
        d = "LEFT";
    } else if (event.keyCode == 38 && d != "DOWN") {
        d = "UP";
    } else if (event.keyCode == 39 && d != "LEFT") {
        d = "RIGHT";
    } else if (event.keyCode == 40 && d != "UP") {
        d = "DOWN";
    }
}

function setDirection(newDirection) {
    if (newDirection == "LEFT" && d != "RIGHT") {
        d = "LEFT";
    } else if (newDirection == "UP" && d != "DOWN") {
        d = "UP";
    } else if (newDirection == "RIGHT" && d != "LEFT") {
        d = "RIGHT";
    } else if (newDirection == "DOWN" && d != "UP") {
        d = "DOWN";
    }
}

function collision(head, array) {
    for (let i = 0; i < array.length; i++) {
        if (head.x == array[i].x && head.y == array[i].y) {
            return true;
        }
    }
    return false;
}

function placeTree() {
    let validPosition = false;
    while (!validPosition) {
                let treeX = Math.floor(Math.random() * 15 + 1) * box;
                let treeY = Math.floor(Math.random() * 14 + 1) * box;
        validPosition = true;

        if (Math.abs(treeX - fruit.x) < 3 * box && Math.abs(treeY - fruit.y) < 3 * box) {
            validPosition = false;
        }

        for (let i = 0; i < snake.length; i++) {
            if (Math.abs(treeX - snake[i].x) < 3 * box && Math.abs(treeY - snake[i].y) < 3 * box) {
                validPosition = false;
                break;
            }
        }

        if (validPosition) {
            tree = { x: treeX, y: treeY };
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        if (i == 0) {
            ctx.drawImage(snakeHeadImg, snake[i].x, snake[i].y, box, box);
        } else {
            ctx.drawImage(snakeBodyImg, snake[i].x, snake[i].y, box, box);
        }
    }

    ctx.drawImage(fruitImg, fruit.x, fruit.y, box, box);

    if (tree) {
                ctx.drawImage(treeImg, tree.x, tree.y, box * 3, box * 4);
    }

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (d == "LEFT") snakeX -= box;
    if (d == "UP") snakeY -= box;
    if (d == "RIGHT") snakeX += box;
    if (d == "DOWN") snakeY += box;

    if (snakeX == fruit.x && snakeY == fruit.y) {
        score++;
        scoreDisplay.innerText = "Счет: " + score;
        fruitSound.play();
        fruit = {
            x: Math.floor(Math.random() * 18 + 1) * box,
            y: Math.floor(Math.random() * 18 + 1) * box
        };
        clearInterval(gameInterval);
        speed -= 3;
        gameInterval = setInterval(draw, speed);
    } else {
                oldSnake = [...snake]; // Сохраняем предыдущее состояние змейки
        snake.pop();
    }

    //oldSnake = JSON.parse(JSON.stringify(snake));

    let newHead = {
        x: snakeX,
        y: snakeY
    };

    if (collision(newHead, snake) || snakeX < 0 || snakeY < 0 || snakeX >= canvas.width || snakeY >= canvas.height || (tree && snakeX >= tree.x && snakeX < tree.x + 3 * box && snakeY >= tree.y && snakeY < tree.y + 4 * box)) {
        if (tree && snakeX >= tree.x && snakeX < tree.x + 2 * box && snakeY >= tree.y && snakeY < tree.y + 2 * box) {
            treeCollisionSound.play();
        } else {
            collisionSound.play();
        }
        gameOverDisplay.style.display = "block";
        restartButton.style.display = "block";
        clearInterval(gameInterval);
        clearTimeout(treeTimer);
        if (musicOn) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        }
        triggerExplosion([...oldSnake]); // Используем oldSnake для анимации взрывов
        return;
    }

    snake.unshift(newHead);

    if (d) {
        playMoveSound();
    }
}

function playMoveSound() {
    moveSounds[moveSoundIndex].play();
    moveSoundIndex = (moveSoundIndex + 1) % moveSounds.length;
}

function triggerExplosion(snake) {
    let segmentIndex = 0;

    function animateExplosion() {
        if (segmentIndex >= snake.length) {
            return;
        }

        for (let i = 0; i < explosionImgs.length; i++) {
            if (soundsOn) {
                explosionSound.play();
            }
            setTimeout(() => {
                ctx.clearRect(snake[segmentIndex].x, snake[segmentIndex].y, box, box);
                ctx.drawImage(explosionImgs[i], snake[segmentIndex].x, snake[segmentIndex].y, box, box);
            }, i * 100);
        }

        segmentIndex++;
        if (segmentIndex < snake.length) {
            setTimeout(animateExplosion, explosionImgs.length * 100);
        }
    }

    animateExplosion();
}

function toggleMusic() {
    if (musicOn) {
        backgroundMusic.pause();
        document.getElementById('toggle-music').innerText = "Музыка: Выкл";
    } else {
        backgroundMusic.play();
        document.getElementById('toggle-music').innerText = "Музыка: Вкл";
    }
    musicOn = !musicOn;
}

function toggleSounds() {
    soundsOn = !soundsOn;
    document.getElementById('toggle-sounds').innerText = soundsOn ? "Звуки: Вкл" : "Звуки: Выкл";
    moveSound.muted = !soundsOn;
    fruitSound.muted = !soundsOn;
    collisionSound.muted = !soundsOn;
    treeCollisionSound.muted = !soundsOn;
    restartSound.muted = !soundsOn;
}

function restartGame() {
    restartSound.play();
    initializeGame();
}

initializeGame();
