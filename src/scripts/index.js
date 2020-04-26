import '../styles/index.scss';
import { TowerDefenseGame } from './game/game';
const canvasId = 'gameCanvas';
const gameCanvas = document.getElementById(canvasId);
const tdGame = new TowerDefenseGame(gameCanvas);
tdGame.start();
//# sourceMappingURL=index.js.map