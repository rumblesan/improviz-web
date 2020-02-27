export function encodeProgram(programString) {
  return encodeURI(btoa(programString));
}

export function decodeProgram(encodedString) {
  return atob(decodeURI(encodedString));
}
