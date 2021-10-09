import errorPopupTemplate from './error-popup.handlebars';

export function errorMarkup () {
  return (el, message, error) => errorPopupTemplate(
    {message, error}
  );
}

