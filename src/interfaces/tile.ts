import { SceneTransition, Interaction } from "./";

export interface Tile {
  x: number,
  y: number,
  isWalkable: boolean,
  sceneTransition?: SceneTransition,
  interaction?: Interaction
}
