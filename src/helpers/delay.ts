export class Delay {
  static async delay(time: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, time))
  }
}
