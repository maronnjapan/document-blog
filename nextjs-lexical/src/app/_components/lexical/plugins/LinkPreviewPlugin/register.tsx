'use client';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { useEffect } from "react";
import { $createLinkPreviewNode, LinkPreviewNode, LinkPreviewPayload } from "./node";
import { INSERT_LINK_PREVIEW_COMMAND } from "./command";
import { $insertNodeToNearestRoot, } from '@lexical/utils';
import { $getSelection, $insertNodes, $isRangeSelection, COMMAND_PRIORITY_EDITOR } from "lexical";
import { getSelectedNode } from "../../utils/getSelectedNode";
import {
    $isAutoLinkNode,
} from '@lexical/link';

const LinkPreviewRegister = () => {
    const [editor] = useLexicalComposerContext()

    useEffect(() => {
        if (!editor.hasNodes([LinkPreviewNode])) {
            throw new Error('LinkPreviewNode is not registered on editor')
        }

        return editor.registerCommand<LinkPreviewPayload>(
            INSERT_LINK_PREVIEW_COMMAND,
            (payload) => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    const parent = getSelectedNode(selection).getParent();
                    if ($isAutoLinkNode(parent)) {
                        parent.remove();
                        const node = $createLinkPreviewNode(payload);
                        $insertNodes([node]);
                    }
                }
                return true;
            },
            COMMAND_PRIORITY_EDITOR
        )
    })

    return null;
}

export default LinkPreviewRegister;
