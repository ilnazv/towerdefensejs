import { IDrawable, IClickable } from '../../Models';
import { Enemy } from '../Enemies/Enemy';

export interface ITower extends IDrawable, IClickable {
    attack(enemies: Enemy[]): void;
}

export interface ITowerParams {
    damageStart: number;
    damageEnd: number;
    attackRange: number;
    attackSpeed: number;
}

export enum TowerType {
    SpearTower = 'SpearTower',
    SplashTower = 'SplashTower',
}
