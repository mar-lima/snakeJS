// Selecionando o elemento canvas e obtendo seu contexto 2D
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// Inicializando o elemento de áudio
const audio = new Audio("../assets/audio.mp3");

// Selecionando elementos DOM relevantes
const score = document.querySelector(".score--value");
const finalScore = document.querySelector(".final-score > span");
const menu = document.querySelector(".menu-screen");
const buttinPlay = document.querySelector(".btn-play");
const record = document.querySelector(".record > span");

// Tamanho de cada célula da grade (serpente e comida)
const size = 30;

// Velocidade inicial e nível inicial
let speed = 300;
let level = 1;

// Posições iniciais da serpente
const initialPosition = [
	{ x: 300, y: 300 },
	// { x: 330, y: 300 },
	// ...
];
let snake = [...initialPosition]; // Inicializa a serpente com as posições iniciais
let direction = ""; // Direção inicial da serpente
let loopId; // Identificador do loop do jogo

// Evento DOMContentLoaded garante que o código seja executado após o carregamento da página
document.addEventListener("DOMContentLoaded", function () {
	// Recupera o recorde anterior do armazenamento local e exibe
	record.innerText = localStorage.getItem("newRecord");

	// Função para incrementar a pontuação e atualizar a velocidade com base no nível
	const incrementScore = () => {
		score.innerText = parseInt(score.innerText) + 10;
		levelSpeed();
	};

	// Função para gerar um número aleatório dentro de um intervalo
	const randomNumber = (min, max) => {
		return Math.round(Math.random() * (max - min) + min);
	};

	// Função para gerar uma posição aleatória para a comida dentro da grade
	const randomPosition = (min, max) => {
		const number = randomNumber(0, canvas.width - size);
		return Math.round(number / 30) * 30;
	};

	// Função para gerar uma cor aleatória em formato RGB
	const randomColor = () => {
		const red = randomNumber(0, 255);
		const green = randomNumber(0, 255);
		const blue = randomNumber(0, 255);

		return `rgb(${red}, ${green}, ${blue})`;
	};

	// Objeto que representa a comida
	const food = {
		x: randomPosition(0, 570),
		y: randomPosition(0, 570),
		color: randomColor(),
	};

	// Função para desenhar a comida na tela
	const drawFood = () => {
		const { x, y, color } = food;
		ctx.shadowColor = color;
		ctx.fillStyle = color;
		ctx.shadowBlur = 6;
		ctx.fillRect(x, y, size, size);
		ctx.shadowBlur = 0;
	};

	// Função para desenhar a serpente na tela
	const drawSnake = () => {
		ctx.fillStyle = "#ddd";
		ctx.fillRect(snake[0].x, snake[0].y, size, size);

		snake.forEach((position, index) => {
			if (index == snake.length - 1) {
				ctx.fillStyle = "#eade";
			}
			ctx.fillRect(position.x, position.y, size, size);
		});
	};

	// Função para movimentar a serpente com base na direção atual
	const moveSnake = () => {
		if (!direction) return;
		const head = snake[snake.length - 1];

		if (direction === "right") {
			snake.push({ x: head.x + size, y: head.y });
		}
		if (direction === "left") {
			snake.push({ x: head.x - size, y: head.y });
		}
		if (direction === "down") {
			snake.push({ x: head.x, y: head.y + size });
		}
		if (direction === "up") {
			snake.push({ x: head.x, y: head.y - size });
		}

		snake.shift();
	};

	// Função para lidar com eventos de teclado e definir a direção da serpente
	const keyMove = () => {
		document.addEventListener("keydown", ({ key }) => {
			if (key == "w" && direction !== "down") {
				direction = "up";
			}
			if (key == "s" && direction !== "up") {
				direction = "down";
			}
			if (key == "d" && direction !== "left") {
				direction = "right";
			}
			if (key == "a" && direction !== "right") {
				direction = "left";
			}
		});
	};

	// Função para desenhar a grade na tela e chamar funções relacionadas à serpente
	const drawGrid = () => {
		ctx.lineWidth = 1;
		ctx.strokeStyle = "#191919";

		for (let i = 30; i < canvas.width; i += 30) {
			ctx.beginPath();
			ctx.lineTo(i, 0);
			ctx.lineTo(i, 600);
			ctx.stroke();

			ctx.beginPath();
			ctx.lineTo(0, i);
			ctx.lineTo(600, i);
			ctx.stroke();
		}
		moveSnake();
		drawSnake();
	};

	// Função para verificar se a serpente comeu a comida
	const checkEat = () => {
		const head = snake[snake.length - 1];
		if (head.x == food.x && head.y == food.y) {
			snake.push(head);
			audio.play();
			let x = randomPosition();
			let y = randomPosition();

			incrementScore();

			while (
				snake.find((position) => position.x == x && position.y == y)
			) {
				x = randomPosition();
				y = randomPosition();
			}
			food.x = x;
			food.y = y;
			food.color = randomColor();
		}
	};

	// Função para verificar colisões com a borda e com o próprio corpo da serpente
	const checkColision = () => {
		const head = snake[snake.length - 1];
		const canvasLimit = canvas.width - size;
		const neckIndex = snake.length - 2;

		const selfColision = snake.find((position, index) => {
			return (
				index < neckIndex &&
				position.x == head.x &&
				position.y == head.y
			);
		});

		if (selfColision) {
			finalScore.innerText = finalScore.innerText;
			gameOver();
		}

		if (head.x > canvasLimit) {
			head.x = 0;
		} else if (head.x < 0) {
			head.x = canvasLimit;
		}
		if (head.y > canvasLimit) {
			head.y = 0;
		} else if (head.y < 0) {
			head.y = canvasLimit;
		}
	};

	// Função para lidar com o fim do jogo
	const gameOver = () => {
		direction = undefined;
		menu.style.display = "flex";
		finalScore.innerText = score.innerText;
		canvas.style.filter = "blur(2px)";
	};

	// Função principal do jogo, que realiza o loop do jogo
	const gameLoop = () => {
		clearInterval(loopId);

		ctx.clearRect(0, 0, 600, 600);
		drawGrid();
		keyMove();
		drawFood();
		checkEat();
		checkColision();

		loopId = setTimeout(() => {
			gameLoop();
		}, speed);
	};

	// Evento de clique no botão de jogar
	buttinPlay.addEventListener("click", () => {
		speed = 300;
		record.innerText = "00";
		score.innerText = "00";
		menu.style.display = "none";
		canvas.style.filter = "none";
		snake = [...initialPosition]; // Reinicia a serpente com posições iniciais
		let newRecord = 0;
		if (parseInt(finalScore.innerText) >= parseInt(record.innerText)) {
			record.innerText = finalScore.innerText;
		}

		if (parseInt(record.innerText) > newRecord) {
			newRecord = parseInt(record.innerText);
			localStorage.setItem("newRecord", newRecord);
		}

		gameLoop(); // Inicia o loop do jogo
	});

	// Função para ajustar a velocidade e nível com base na pontuação
	const levelSpeed = () => {
		const newLevel = document.querySelector(".level > span");
		if (parseInt(score.innerText) % 100 === 0) {
			if (speed <= 300 && speed >= 170) {
				speed -= 40;
				level++;
			}
		}
		if (speed <= 170 && parseInt(score.innerText) % 250 === 0) {
			speed -= 10;
		}
		if (speed <= 150 && speed > 120) {
			speed = 120;
			level++;
		}
		if (speed <= 120 && parseInt(score.innerText) % 250 === 0) {
			speed = 120;
			level++;
		}

		newLevel.innerText = level >= 10 ? `${level}` : `0${level}`;
	};

	// Inicia o loop do jogo quando a página é carregada
	gameLoop();
});
