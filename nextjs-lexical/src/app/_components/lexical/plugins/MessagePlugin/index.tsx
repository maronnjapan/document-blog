import './styles/style.module.css';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    mergeRegister,
} from '@lexical/utils';
import {
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_LOW,
    createCommand,
} from 'lexical';
import { useEffect } from 'react';

import {
    $createMessageContentNode,
    $isMessageContentNode,
    MessageContentNode,
    MessageTypes,
} from './content-node';
import { getSelectedNode } from '../../utils/getSelectedNode';


export const INSERT_MESSEAGE_COMMAND = createCommand<MessageTypes>();

export default function MessagePlugin(): null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (
            !editor.hasNodes([
                MessageContentNode,
            ])
        ) {
            throw new Error(
                'MessagePlugin: MessageContentNode not registered on editor',
            );
        }

        return mergeRegister(
            editor.registerCommand(
                INSERT_MESSEAGE_COMMAND,
                (payload) => {
                    editor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                            const node = getSelectedNode(selection).getParentOrThrow()
                            if ($isMessageContentNode(node)) {
                                return node.replace($createMessageContentNode(payload))
                            }
                            selection.insertNodes([$createMessageContentNode(payload)])
                        }
                    })
                    return true;
                },
                COMMAND_PRIORITY_LOW,
            ),
        );
    }, [editor]);

    return null;
}