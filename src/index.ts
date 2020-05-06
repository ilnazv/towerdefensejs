import './styles/index.scss';
import { TowerDefenseGame } from './game/Game';
import { ElelementsIds } from './game/Constants';

const gameCanvas: HTMLCanvasElement = document.getElementById(
    ElelementsIds.canvasId
) as HTMLCanvasElement;

const tdGame = new TowerDefenseGame(gameCanvas);
tdGame.initialize();
// tdGame.testMode();

const toggleLogsButton = document.getElementById(
    ElelementsIds.toggleLogsButtonId
);

toggleLogsButton?.addEventListener('click', () => {
    const logsEl = document.getElementById(ElelementsIds.logsElId);
    logsEl.toggleAttribute('hidden');
});
