import texturesTemplate from './textures.handlebars';

export function texturesMarkup (gfx) {
  return () => {
    console.log(gfx.textures);
    const tlist = Object.keys(gfx.textures).map(k => ({
      name: k,
      url: gfx.textures[k].image.src,
    }));
    console.log(tlist);
    return texturesTemplate({textures: tlist});
  };
}

export function texturesEventHandlers (eventBus) {
  return (el) => {
    const form = el.querySelector('#addTexture');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(form);
      const name = data.get('name');
      const url = data.get('url');
      eventBus.emit('load-texture', name, url);
      const li = document.createElement("li");
      li.innerText = `${name} - ${url}`;
      el.querySelector("#textureList").appendChild(li);
      return false;
    });
  };
}
