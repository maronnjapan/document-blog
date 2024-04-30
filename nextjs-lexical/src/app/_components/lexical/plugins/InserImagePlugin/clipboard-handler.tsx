import { COMMAND_PRIORITY_LOW } from 'lexical';
import { FC, useEffect } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { DRAG_DROP_PASTE } from '@lexical/rich-text';
import { mediaFileReader } from '@lexical/utils';
import { INSERT_IMAGE_COMMAND } from './command';


const ACCEPTABLE_IMAGE_TYPES = [
    'image/',
    'image/heic',
    'image/heif',
    'image/gif',
    'image/webp',
];

const ClipboardImageHandler: FC = () => {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        return editor.registerCommand(
            DRAG_DROP_PASTE,
            (files) => {
                (async () => {
                    const filesResult = await mediaFileReader(
                        files,
                        [ACCEPTABLE_IMAGE_TYPES].flatMap((x) => x),
                    );
                    const reader = new FileReader();

                    if (filesResult !== null) {
                        reader.readAsDataURL(filesResult[0].file);
                        const file = filesResult[0].file

                        reader.onload = function () {
                            if (typeof reader.result === 'string') {
                                editor.update(() => {
                                    editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                                        altText: file.name,
                                        src: reader.result?.toString() ?? ''
                                    });
                                });
                            }
                        };


                    }
                })();
                return true;
            },
            COMMAND_PRIORITY_LOW,
        );
    }, [editor]);
    return null;
};

export default ClipboardImageHandler;