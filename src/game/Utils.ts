const logsElId = 'logs';

const logsEl = document.getElementById(logsElId);

export const log = (msg: string): void => {
    logsEl.innerHTML = msg + '\n' + logsEl.innerHTML;
};
