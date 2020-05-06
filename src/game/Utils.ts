import { ElelementsIds } from './Constants';

const logsEl = document.getElementById(ElelementsIds.logsElId);

export const log = (msg: string): void => {
    if (logsEl) {
        logsEl.innerHTML = msg + '\n' + logsEl.innerHTML;
    }
};
