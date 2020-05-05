import './styles/index.scss';
import { TowerDefenseGame } from './game/Game';

const canvasId = 'gameCanvas';

const gameCanvas: HTMLCanvasElement = document.getElementById(
    canvasId
) as HTMLCanvasElement;

const tdGame = new TowerDefenseGame(gameCanvas);
tdGame.initialize();
// tdGame.testMode();
