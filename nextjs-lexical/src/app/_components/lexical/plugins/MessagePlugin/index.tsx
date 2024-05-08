/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import './styles/style.module.css';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $findMatchingParent,
    $insertNodeToNearestRoot,
    mergeRegister,
} from '@lexical/utils';
import {
    $createParagraphNode,
    $createTextNode,
    $getSelection,
    $insertNodes,
    $isRangeSelection,
    COMMAND_PRIORITY_LOW,
    createCommand,
    DELETE_CHARACTER_COMMAND,
    ElementNode,
    INSERT_PARAGRAPH_COMMAND,
    KEY_ARROW_DOWN_COMMAND,
    KEY_ARROW_LEFT_COMMAND,
    KEY_ARROW_RIGHT_COMMAND,
    KEY_ARROW_UP_COMMAND,
    LexicalNode,
    NodeKey,
} from 'lexical';
import { useEffect } from 'react';

import {
    $createMessageContainerNode,
    $isMessageContainerNode,
    MessageContainerNode,
} from './container-node';
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
        // 使用可能なノードとして登録されていなければエラーを発生させる
        if (
            !editor.hasNodes([
                MessageContainerNode,
                MessageContentNode,
            ])
        ) {
            throw new Error(
                'MessagePlugin: MessageContainerNode, or MessageContentNode not registered on editor',
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