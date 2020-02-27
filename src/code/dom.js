export function clickHandler(selector, callback) {
  document.querySelector(selector).addEventListener('click', e => {
    e.preventDefault();
    callback();
    return false;
  });
}
