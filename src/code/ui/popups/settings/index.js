import settingsPopupTemplate from './settings-menu.handlebars';

export function settingsMarkup (settings) {
  const keyMap = settings.get('keyMap');
  return () => settingsPopupTemplate(
    {
      keymaps: [
        { name: 'default', selected: keyMap === 'default'},
        { name: 'vim', selected: keyMap === 'vim'},
      ],
      lineNumbers: settings.get('lineNumbers'),
      performanceMode: settings.get('performanceMode'),
    }
  );
}

export function settingsEventHandlers (settings) {
  return (el) => {
    el.querySelector('select[name=keymap]')
      .addEventListener('change', e => {
        settings.set('keyMap', e.target.value);
      });

    el.querySelector('input[name=performanceMode]')
      .addEventListener('change', e => {
        settings.set('performanceMode', e.target.checked);
      });

    el.querySelector('input[name=lineNumbers]')
      .addEventListener('change', e => {
        settings.set('lineNumbers', e.target.checked);
      });
  };
}
