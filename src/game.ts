import Engine from './engine'

export default class Game {
  engine: Engine
  constructor() {
    this.engine = new Engine()
  }
}
