import './styles/index.scss';
import { TowerDefenseGame } from './game/Game';
import { ElelementsIds } from './game/Constants';

function App(container: HTMLElement) {
    const canvas = document.createElement('canvas');
    canvas.id= ElelementsIds.canvasId;
    canvas.width = 600;
    canvas.height = 400;

    const tdGame = new TowerDefenseGame(canvas);
    tdGame.initialize();
    // tdGame.testMode();
    container.appendChild(canvas);
}

function initLogs() {
    const toggleLogsButton = document.getElementById(
        ElelementsIds.toggleLogsButtonId
    );

    toggleLogsButton?.addEventListener('click', () => {
        const logsEl = document.getElementById(ElelementsIds.logsElId);
        logsEl.toggleAttribute('hidden');
    });
}

export default App;