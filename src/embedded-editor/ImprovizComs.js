export default class ImprovizComs {

  function(fetch) {
    this.fetch = fetch;
  }

  sendCode(code) {
    return fetch(
      '/read',
      {
        method: 'POST',
        body: code,
      }
    );
  }

}
