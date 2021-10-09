import { encodeProgram } from '../../../util/encoder';
import sharingPopupTemplate from './sharing-popup.handlebars';

export function sharingMarkup (editor) {
  return () => {
    const encodedProgram = encodeProgram(editor.getValue());
    const programSharingURL = URL.fromLocation();
    programSharingURL.searchParams.set('program', encodedProgram);
    programSharingURL.hash = '';
    return sharingPopupTemplate({
      programSharingURL: programSharingURL.toString(),
    });
  };
}

