const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const output = document.getElementById('output');
const startListeningButton = document.getElementById('startListening');
const stopListeningButton = document.getElementById('stopListening');
const scoreDisplay = document.getElementById('score');

let recognition;

let character = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    width: 40,
    height: 40,
};

let obstacles = [];
let score = 0;
let gameOver = false;

// Sound effects
const jumpSound = new Audio('jump.mp3'); // Add your jump sound file
const crashSound = new Audio('crash.mp3'); // Add your crash sound file

if (!('webkitSpeechRecognition' in window)) {
    alert("Sorry, your browser does not support speech recognition.");
} else {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false; 
    recognition.interimResults = false; 

   // Start listening every 2 seconds
   setInterval(() => {
       if (!gameOver) {
           recognition.start();
       }
   }, 2000);

   recognition.onresult = function(event) {
       const command = event.results[0][0].transcript.toLowerCase();
       output.innerText = `You said: ${command}`;
       handleCommand(command);
   };

   recognition.onerror = function(event) {
       console.error("Speech recognition error detected:", event.error);
       output.innerText = "Error recognizing command.";
   };
}

function handleCommand(command) {
   switch (command) {
       case 'up.':
           character.y -= 20; // Move up
           jumpSound.play(); // Play jump sound
           break;
       case 'down.':
           character.y += 20; // Move down
           break;
       case 'left.':
           character.x -= 20; // Move left
           break;
       case 'right.':
           character.x += 20; // Move right
           break;
       default:
           output.innerText += ' | Command not recognized.';
           break;
   }
    
   // Keep the character within bounds
   if (character.x < 0) character.x = 0;
   if (character.x + character.width > canvas.width) character.x = canvas.width - character.width;

   if (character.y < 0) character.y = 0; // Prevent going above the canvas
   if (character.y + character.height > canvas.height) character.y = canvas.height - character.height;

   drawCharacter();
}

function drawCharacter() {
   ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

   // Draw a more vibrant character (you can replace this with an image)
   ctx.fillStyle = 'blue'; // Character color
   ctx.fillRect(character.x, character.y, character.width, character.height); // Draw the character

   // Draw obstacles
   drawObstacles();
}

function drawObstacles() {
   ctx.fillStyle = 'red'; // Obstacle color
   obstacles.forEach(obstacle => {
       ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
   });
}

function generateObstacle() {
   const obstacleWidth = Math.random() * (100 - 30) + 30; // Random width between 30 and 100
   const obstacleHeight = Math.random() * (50 - 20) + 20; // Random height between 20 and 50
   const xPosition = Math.random() * (canvas.width - obstacleWidth); // Random x position
   obstacles.push({ x: xPosition, y: -obstacleHeight, width: obstacleWidth, height: obstacleHeight });
}

function updateObstacles() {
   for (let i = obstacles.length - 1; i >= 0; i--) {
       obstacles[i].y += 5; // Move obstacle downwards

       // Check for collision with the player
       if (
           character.x < obstacles[i].x + obstacles[i].width &&
           character.x + character.width > obstacles[i].x &&
           character.y < obstacles[i].y + obstacles[i].height &&
           character.y + character.height > obstacles[i].y
       ) {
           crashSound.play(); // Play crash sound on collision
           output.innerText += " | Game Over!";
           gameOver = true; // Set game over flag
           stopListening();
           return; // Stop further processing on collision
       }

       // Remove off-screen obstacles and increase score
       if (obstacles[i].y > canvas.height) {
           obstacles.splice(i, 1);
           score++;
           scoreDisplay.innerText = `Score: ${score}`; // Update score display
       }
   }
}

function gameLoop() {
   if (!gameOver) { // Only run loop if not game over
       drawCharacter();
       updateObstacles();
       requestAnimationFrame(gameLoop); // Loop the game
   }
}

// Start listening for voice commands
function startListening() {
   output.innerText = "Listening...";
   generateObstacle(); // Generate an initial obstacle
   setInterval(generateObstacle, 2000); // Generate new obstacles every 2 seconds

   gameLoop(); // Start the game loop
}

// Stop listening for voice commands
function stopListening() {
   recognition.stop();
   output.innerText += " | Stopped listening.";
   
   if (gameOver) {
       alert(`Game Over! Your final score is ${score}.`);
       resetGame(); // Reset the game state after game over
   }
}

// Reset game state for a new game session
function resetGame() {
   character.y = canvas.height - 60; 
   character.x = canvas.width / 2; 
   obstacles = [];
   score = 0;
   scoreDisplay.innerText = `Score: ${score}`;
   gameOver = false; 
}

// Event listeners for buttons
startListeningButton.addEventListener('click', startListening);
stopListeningButton.addEventListener('click', stopListening);

// Initial draw
drawCharacter();