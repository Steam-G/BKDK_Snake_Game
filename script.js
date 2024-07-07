const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverDisplay = document.getElementById('game-over');
const restartButton = document.getElementById('restart-button');
const joystickArea = document.getElementById('joystick-area');
const stick = document.getElementById('stick');
const musicButton = document.getElementById('toggle-music');
const soundButton = document.getElementById('toggle-sounds');

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
backgroundMusic.volume = 0.1;
const moveSounds = Array.from(document.getElementsByClassName('move-sound'));
moveSounds.forEach(sound => sound.volume = 0.1);
//const fruitSound = document.getElementById('fruit-sound');
const fruitSounds = Array.from(document.getElementsByClassName('fruit-sound'));
const collisionSound = document.getElementById('collision-sound');
collisionSound.volume = 0.2;
const treeCollisionSound = document.getElementById('tree-collision-sound');
const restartSound = document.getElementById('restart-sound');
restartSound.volume = 0.2;
const explosionSound = document.getElementById('explosion-sound');

let box, snake, oldSnake, fruit, tree, d, score, speed, gameInterval, treeTimer;
let musicOn = true;
let soundsOn = true;
let moveSoundIndex = 0;
let isDragging = false;
let centerX, centerY;

async function initializeGame() {
    document.getElementById('loading').style.display = 'block';
    await loadAllAudio();
    document.getElementById('loading').style.display = 'none';
    resizeCanvas();
    updateBackgroundSize();
    snake = [{ x: 9, y: 10 }];
    oldSnake = [];
    placeFruit();
    tree = null;
    d = null;
    score = 0;
    speed = 300;
    scoreDisplay.innerText = "Score: " + score;
    hideGameOver();
    clearInterval(gameInterval);
    clearTimeout(treeTimer);
    gameInterval = setInterval(draw, speed);
    setTimeout(() => {
        placeTree();
        treeTimer = setInterval(() => {
            placeTree();
        }, 10000);
    }, 10000);
    /*if (musicOn) {
        backgroundMusic.play();
    }*/
}

async function startGame() {
    document.getElementById('loading').style.display = 'block';
    await loadAllAudio();
    document.getElementById('loading').style.display = 'none';
    initializeGame();

    if (musicOn) {
        backgroundMusic.play();
    }
    if (soundsOn) {
        restartSound.play();
    }
}

function updateBackgroundSize() {
    const boxSizePx = box + 'px';
    canvas.style.backgroundSize = boxSizePx + ' ' + boxSizePx;
}

function resizeCanvas() {
    const container = document.getElementById('game-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    const canvasSize = Math.min(containerWidth * 0.85, containerHeight * 0.55);
    
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    box = canvasSize / 15;
    
    updateBackgroundSize(); // Добавьте эту строку
}

function placeFruit() {
    fruit = {
        x: Math.floor(Math.random() * 13 + 1),
        y: Math.floor(Math.random() * 13 + 1)
    };
}

document.addEventListener("keydown", direction);

function direction(event) {
    if (event.keyCode == 37) {
        setDirection("LEFT");
    } else if (event.keyCode == 38) {
        setDirection("UP");
    } else if (event.keyCode == 39) {
        setDirection("RIGHT");
    } else if (event.keyCode == 40) {
        setDirection("DOWN");
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
        let treeX = Math.floor(Math.random() * 12 + 1);
        let treeY = Math.floor(Math.random() * 9 + 1);
        validPosition = true;

        if (Math.abs(treeX - fruit.x) < 3 && Math.abs(treeY - fruit.y) < 3) {
            validPosition = false;
        }

        for (let i = 0; i < snake.length; i++) {
            if (Math.abs(treeX - snake[i].x) < 3 && Math.abs(treeY - snake[i].y) < 3) {
                validPosition = false;
                break;
            }
        }

        if (validPosition) {
            tree = { x: treeX, y: treeY };
        }
    }
}

function showGameOver() {
    document.getElementById('game-over-container').style.display = 'flex';
}

function hideGameOver() {
    document.getElementById('game-over-container').style.display = 'none';
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < snake.length; i++) {
        if (i == 0) {
            ctx.drawImage(snakeHeadImg, snake[i].x * box, snake[i].y * box, box, box);
        } else {
            ctx.drawImage(snakeBodyImg, snake[i].x * box, snake[i].y * box, box, box);
        }
    }

    ctx.drawImage(fruitImg, fruit.x * box, fruit.y * box, box, box);

    if (tree) {
        ctx.drawImage(treeImg, tree.x * box, tree.y * box, box * 3, box * 4);
    }

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (d == "LEFT") snakeX--;
    if (d == "UP") snakeY--;
    if (d == "RIGHT") snakeX++;
    if (d == "DOWN") snakeY++;

    if (snakeX == fruit.x && snakeY == fruit.y) {
        score++;
        scoreDisplay.innerText = "Score: " + score;
        playRandomfruitSounds();
        placeFruit();
        clearInterval(gameInterval);
        speed -= 3;
        gameInterval = setInterval(draw, speed);
    } else {
        oldSnake = [...snake];
        snake.pop();
    }

    let newHead = {
        x: snakeX,
        y: snakeY
    };

    if (collision(newHead, snake) || snakeX < 0 || snakeY < 0 || snakeX >= 15 || snakeY >= 15 || 
        (tree && snakeX >= tree.x && snakeX < tree.x + 3 && snakeY >= tree.y && snakeY < tree.y + 4)) {
        if (tree && snakeX >= tree.x && snakeX < tree.x + 2 && snakeY >= tree.y && snakeY < tree.y + 2) {
            treeCollisionSound.play();
        } else {
            collisionSound.play();
        }
        showGameOver();
        clearInterval(gameInterval);
        clearTimeout(treeTimer);
        if (musicOn) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
        }
        triggerExplosion([...oldSnake]);
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
                ctx.clearRect(snake[segmentIndex].x * box, snake[segmentIndex].y * box, box, box);
                ctx.drawImage(explosionImgs[i], snake[segmentIndex].x * box, snake[segmentIndex].y * box, box, box);
            }, i * 100);
        }

        segmentIndex++;
        if (segmentIndex < snake.length) {
            setTimeout(animateExplosion, explosionImgs.length * 100);
        }
    }

    animateExplosion();
}
/*
function toggleMusic() {
    if (musicOn) {
        backgroundMusic.pause();
        document.getElementById('toggle-music').innerText = "Music: OFF";
    } else {
        backgroundMusic.play();
        document.getElementById('toggle-music').innerText = "Music: ON";
    }
    musicOn = !musicOn;
}*/

function toggleMusic() {
    musicOn = !musicOn;
    musicButton.classList.toggle('active', musicOn);
    if (musicOn) {
        backgroundMusic.play();
    } else {
        backgroundMusic.pause();
    }
}

function toggleSounds() {
    soundsOn = !soundsOn;
    soundButton.classList.toggle('active', soundsOn);
    moveSounds.forEach(sound => sound.muted = !soundsOn);
    fruitSounds.forEach(sound => sound.muted = !soundsOn);
    collisionSound.muted = !soundsOn;
    treeCollisionSound.muted = !soundsOn;
    restartSound.muted = !soundsOn;
}

function playRandomfruitSounds() {
    // Выберите случайный индекс из массива fruitSounds
    const randomIndex = Math.floor(Math.random() * fruitSounds.length);
    const randomSound = fruitSounds[randomIndex];

    // Воспроизведите выбранный звук
    randomSound.play();
}

function updateStickPosition(clientX, clientY) {
    const rect = joystickArea.getBoundingClientRect();
    const x = clientX - rect.left - rect.width / 2;
    const y = clientY - rect.top - rect.height / 2;

    const angle = Math.atan2(y, x);
    const maxDistance = rect.width / 2 - stick.offsetWidth / 2 - 5;
    const distance = Math.min(Math.hypot(x, y), maxDistance);

    centerX = distance * Math.cos(angle);
    centerY = distance * Math.sin(angle);

    stick.style.transform = `translate(calc(-50% + ${centerX}px), calc(-50% + ${centerY}px))`;

    updateSnakeDirection(centerX, centerY);
}

function updateSnakeDirection(x, y) {
    if (Math.abs(x) > Math.abs(y)) {
        setDirection(x > 0 ? "RIGHT" : "LEFT");
    } else {
        setDirection(y > 0 ? "DOWN" : "UP");
    }
}

async function restartGame() {
    document.getElementById('loading').style.display = 'block';
    
    document.getElementById('loading').style.display = 'none';
    initializeGame();
    restartSound.play();
}



function preloadAudio(audioElement) {
    return new Promise((resolve, reject) => {
        audioElement.addEventListener('canplaythrough', resolve, { once: true });
        audioElement.addEventListener('error', reject);
        audioElement.load();
    });
}


joystickArea.addEventListener('pointerdown', (e) => {
    isDragging = true;
    updateStickPosition(e.clientX, e.clientY);
});

document.addEventListener('pointermove', (e) => {
    if (isDragging) {
        updateStickPosition(e.clientX, e.clientY);
    }
});

document.addEventListener('pointerup', () => {
    isDragging = false;
    stick.style.transform = 'translate(-50%, -50%)';
});

window.addEventListener('resize', () => {
    resizeCanvas();
    //initializeGame();
});

musicButton.addEventListener('click', toggleMusic);
soundButton.addEventListener('click', toggleSounds);

// Инициализация кнопок при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    musicButton.classList.toggle('active', musicOn);
    soundButton.classList.toggle('active', soundsOn);
    document.getElementById('start-button').addEventListener('click', () => {
        document.getElementById('start-game-container').style.display = 'none';
        startGame();
    });
});

async function loadAllAudio() {
    const audioElements = [
        backgroundMusic,
        ...moveSounds,
        ...fruitSounds,
        collisionSound,
        treeCollisionSound,
        restartSound,
        explosionSound
    ];

    try {
        await Promise.all(audioElements.map(preloadAudio));
        console.log('All audio files loaded successfully');
        /*backgroundMusic.play();*/
        if (musicOn) {
            backgroundMusic.play();
        }
    } catch (error) {
        console.error('Error loading audio files:', error);
    }
}
/*initializeGame();*/
resizeCanvas();