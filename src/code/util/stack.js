export class Stack {
  constructor(initial) {
    this.stack = [initial];
    this.position = 0;
    this.snapshotPositions = [];
  }
  push(v) {
    this.position += 1;
    this.stack[this.position] = v;
  }
  pushMod(v, mod) {
    const top = this.top();
    this.push(mod(top, v));
  }
  top() {
    return this.stack[this.position];
  }
  pop() {
    const v = this.top();
    this.position -= 1;
    return v;
  }
  pushSnapshot() {
    this.snapshotPositions.push(this.position);
  }
  popSnapshot() {
    const p = this.snapshotPositions.pop();
    this.position = p;
  }
  reset() {
    this.position = 0;
  }
}
