import { ElelementsIds } from './Constants';

const logsEl = document.getElementById(ElelementsIds.logsElId);

export const log = (msg: string): void => {
    logsEl.innerHTML = msg + '\n' + logsEl.innerHTML;
};
