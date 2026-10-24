import {createOpeningFixture} from './opening.mjs';
export const SCENE_CONTEXT='本聊天是独立非Canon判定测试。当前现场与参数仅按本聊天开场；不引入旧开场同伴、敌人或既往伤势。';
export function createHealthySceneFixture(){const f=createOpeningFixture();return {...f,actors:{player:f.actors.player},encounters:{},encounterOptions:[]};}
