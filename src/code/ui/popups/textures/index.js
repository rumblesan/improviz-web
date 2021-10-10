import texturesTemplate from './textures.handlebars';

export function texturesMarkup (gfx) {
  return () => {
    const tlist = Object.keys(gfx.textures).map(k => ({
      name: k,
      url: gfx.textures[k].image.src,
    }));
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
      return false;
    });

    const imageUploadForm = el.querySelector('#imageUpload');
    imageUploadForm.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(imageUploadForm);
      const reader = new FileReader();
      reader.onload = function () {
        eventBus.emit('load-texture', data.get('name'), reader.result);
      };
      reader.onerror = function () {
        console.log(reader.error);
      };
      reader.readAsDataURL(data.get('image'));

      return false;
    });

    el.querySelectorAll('#textureList button').forEach(b => {
      b.addEventListener('click', e => {
        eventBus.emit('unload-texture', e.target.name);
      });
    });
  };
}
