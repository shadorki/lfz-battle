import Game from "./game";
// TODO:
// Design input system
// Get character moving first
// Design the command stack where the observers get updates depending on what command is on the command stack
// pop off the stack when observers are finished updating
// Animator class to add sprite movement with speed
// make data model for allowable areas on map depending on map
// make camera system for level to pan when user is within two indecies of coverage
const game = new Game()

game.start()
