import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTextNode, $getSelection, $insertNodes, $isRangeSelection, $isTextNode, $setSelection, LexicalNode, TextNode, $createPoint, KEY_ESCAPE_COMMAND, COMMAND_PRIORITY_HIGH, COMMAND_PRIORITY_EDITOR, COMMAND_PRIORITY_NORMAL, COMMAND_PRIORITY_CRITICAL } from "lexical";
import { $isLinkNode, $createLinkNode } from '@lexical/link'
import { $createHeadingNode } from '@lexical/rich-text'
import { mergeRegister, $insertNodeToNearestRoot } from '@lexical/utils';
import { CSSProperties, ReactPortal, useEffect, useRef, useState } from "react";
import { getSelectedNode } from "../../utils/getSelectedNode";
import { createPortal } from "react-dom";
import { $createDisableMentionNode, $createMentionNode, $isDisableMentionNode, $isMentionNode } from "./node";
import SelectsFloating from "./SelectsFloating";
import { select } from "../ToolBarPlugin/styles/Toolbar.module.css";

export default function MentionPlugin({ anchorElm }: { anchorElm?: HTMLElement | null }) {
    const [editor] = useLexicalComposerContext()
    const [mentionText, setMentionText] = useState('')
    const [mentionElm, setMentionElm] = useState<HTMLElement | null>(null)
    const timer = useRef<NodeJS.Timeout | null>(null);


    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editor.update(() => {
                const selection = $getSelection()

                if (!$isRangeSelection(selection)) { return null }
                const node = getSelectedNode(selection)



                const parent = node.getParent()
                const text = node.getTextContent()
                const nearestText = text.substring(selection.anchor.offset - 1, selection.anchor.offset)
                const prevText = text.substring(0, selection.anchor.offset - 1);
                const afterText = text.substring(selection.anchor.offset + 1)

                if ($isMentionNode(parent)) {
                    const escapePattern = /\s\s$/gi;
                    if (escapePattern.test(node.getTextContent())) {
                        parent.insertAfter($createTextNode(' '))
                        const replaceNode = $createTextNode(node.getTextContent().trim())
                        node.replace(replaceNode);
                        parent.selectNext()
                        return
                    }
                    const mentionElmByKey = editor.getElementByKey(parent.getKey());
                    const searchText = node.getTextContent().substring(1)
                    setMentionElm(() => mentionElmByKey)
                    setMentionText(() => searchText)
                    return
                }

                if ($isDisableMentionNode(parent)) {
                    return;
                }

                if (nearestText === '@' && $isTextNode(node) && !$isLinkNode(parent)) {
                    const prevTextNode = prevText.length > 0 ? $createTextNode(prevText) : null;
                    const afterTextNode = afterText.length > 0 ? $createTextNode(afterText) : null;
                    const mentionNode = $createMentionNode().append($createTextNode('@'))
                    const insertNodes = [prevTextNode, mentionNode, afterTextNode].filter((n): n is TextNode => n !== null)
                    node.remove()
                    $insertNodes(insertNodes)
                    mentionNode.select(1)

                    return
                }

                setMentionElm(() => null)
            })
        })
    }, [editor])
    useEffect(() => {
        return mergeRegister(editor.registerCommand(KEY_ESCAPE_COMMAND, () => {
            const selection = $getSelection()

            if (!$isRangeSelection(selection)) { return false }
            const node = getSelectedNode(selection)
            const parent = node.getParent()

            if ($isMentionNode(parent)) {

                const disableMentionNode = $createDisableMentionNode().append($createTextNode(parent.getTextContent()))
                parent.insertAfter(disableMentionNode)
                parent.remove()
                disableMentionNode.selectEnd()
                setMentionElm(() => null)
                return true;
            }
            return false;
        }, COMMAND_PRIORITY_HIGH))
    }, [editor])

    return <>{(!!anchorElm && !!mentionElm) && <SelectsFloating anchorElm={anchorElm} searchText={mentionText} mentionElm={mentionElm}></SelectsFloating>}</>
}