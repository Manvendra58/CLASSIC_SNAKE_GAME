// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    { x: 10, y: 10 }
];
let velocity = { x: 0, y: 0 };
let food = {};
let score = 0;
let level = 1;
let foodsEaten = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameLoop;
const baseSpeed = 120; // Base interval in milliseconds (lower = faster)

// Initialize game
function init() {
    document.getElementById('high-score').textContent = highScore;
    document.getElementById('current-level').textContent = level;
    generateFood();
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', startGame);
    document.getElementById('pause-btn').addEventListener('click', togglePause);
    document.getElementById('resume-btn').addEventListener('click', togglePause);
    document.getElementById('reset-btn').addEventListener('click', resetGame);
    
    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
}

// Calculate game speed based on level
function getGameSpeed() {
    // Speed increases as level increases
    // Formula: baseSpeed - (level - 1) * speedIncrement
    // Minimum speed of 50ms (maximum difficulty)
    const speedIncrement = 5;
    const calculatedSpeed = Math.max(50, baseSpeed - (level - 1) * speedIncrement);
    return calculatedSpeed;
}

// Update game speed based on current level
function updateGameSpeed() {
    if (gameRunning && !gamePaused) {
        clearInterval(gameLoop);
        gameLoop = setInterval(update, getGameSpeed());
    }
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    
    // Make sure food doesn't spawn on snake
    for (let segment of snake) {
        if (segment.x === food.x && segment.y === food.y) {
            generateFood();
            return;
        }
    }
}

function startGame() {
    snake = [{ x: 10, y: 10 }];
    velocity = { x: 0, y: 0 };
    score = 0;
    level = 1;
    foodsEaten = 0;
    gameRunning = true;
    gamePaused = false;
    
    document.getElementById('current-score').textContent = score;
    document.getElementById('current-level').textContent = level;
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('pause-screen').classList.add('hidden');
    
    generateFood();
    
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    
    updateGameSpeed();
}

function resetGame() {
    clearInterval(gameLoop);
    snake = [{ x: 10, y: 10 }];
    velocity = { x: 0, y: 0 };
    score = 0;
    level = 1;
    foodsEaten = 0;
    gameRunning = false;
    gamePaused = false;
    
    document.getElementById('current-score').textContent = score;
    document.getElementById('current-level').textContent = level;
    document.getElementById('start-screen').classList.remove('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('pause-screen').classList.add('hidden');
    
    generateFood();
    draw();
}

function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    
    if (gamePaused) {
        document.getElementById('pause-screen').classList.remove('hidden');
        clearInterval(gameLoop);
    } else {
        document.getElementById('pause-screen').classList.add('hidden');
        updateGameSpeed();
    }
}

function handleKeyPress(e) {
    if (!gameRunning && e.key === 'Enter') {
        startGame();
        return;
    }
    
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        togglePause();
        return;
    }
    
    if (gamePaused) return;
    
    // Arrow keys
    if (e.key === 'ArrowUp' && velocity.y === 0) {
        velocity = { x: 0, y: -1 };
    } else if (e.key === 'ArrowDown' && velocity.y === 0) {
        velocity = { x: 0, y: 1 };
    } else if (e.key === 'ArrowLeft' && velocity.x === 0) {
        velocity = { x: -1, y: 0 };
    } else if (e.key === 'ArrowRight' && velocity.x === 0) {
        velocity = { x: 1, y: 0 };
    }
    
    // WASD keys
    if (e.key === 'w' && velocity.y === 0) {
        velocity = { x: 0, y: -1 };
    } else if (e.key === 's' && velocity.y === 0) {
        velocity = { x: 0, y: 1 };
    } else if (e.key === 'a' && velocity.x === 0) {
        velocity = { x: -1, y: 0 };
    } else if (e.key === 'd' && velocity.x === 0) {
        velocity = { x: 1, y: 0 };
    }
}

function update() {
    if (gamePaused || !gameRunning) return;
    
    // Don't update if snake hasn't started moving
    if (velocity.x === 0 && velocity.y === 0) {
        draw();
        return;
    }
    
    // Move snake head
    const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };
    
    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }
    
    // Check self collision (check against all segments except head since we're comparing before unshifting)
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }
    
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        foodsEaten++;
        document.getElementById('current-score').textContent = score;
        
        // Level up every 5 foods eaten
        const newLevel = Math.floor(foodsEaten / 5) + 1;
        if (newLevel > level) {
            level = newLevel;
            document.getElementById('current-level').textContent = level;
            updateGameSpeed();
        }
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('snakeHighScore', highScore);
            document.getElementById('high-score').textContent = highScore;
        }
        
        generateFood();
    } else {
        snake.pop();
    }
    
    draw();
}

function gameOver() {
    gameRunning = false;
    clearInterval(gameLoop);
    
    document.getElementById('final-score').textContent = `Your Score: ${score}`;
    document.getElementById('final-level').textContent = `Level Reached: ${level}`;
    document.getElementById('game-over').classList.remove('hidden');
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#16213e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = '#0f3460';
    ctx.lineWidth = 1;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // Draw snake
    ctx.fillStyle = '#00ff88';
    ctx.strokeStyle = '#00cc6a';
    ctx.lineWidth = 2;
    
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head
            ctx.fillStyle = '#00ffaa';
        } else {
            ctx.fillStyle = '#00ff88';
        }
        
        ctx.fillRect(segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 4, gridSize - 4);
        ctx.strokeRect(segment.x * gridSize + 2, segment.y * gridSize + 2, gridSize - 4, gridSize - 4);
    });
    
    // Draw food
    ctx.fillStyle = '#ff4757';
    ctx.strokeStyle = '#ff3838';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const centerX = food.x * gridSize + gridSize / 2;
    const centerY = food.y * gridSize + gridSize / 2;
    const radius = gridSize / 2 - 3;
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
}

// Initialize game when page loads
init();
draw();

