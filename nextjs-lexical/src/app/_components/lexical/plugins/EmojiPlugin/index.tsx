import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";
import { $createTextNode, $getSelection, $insertNodes, $isRangeSelection, $isTextNode, TextNode, KEY_ESCAPE_COMMAND, COMMAND_PRIORITY_HIGH } from "lexical";
import { $isLinkNode } from '@lexical/link'
import { mergeRegister } from '@lexical/utils';
import { getSelectedNode } from "../../utils/getSelectedNode";
import { createPortal } from "react-dom";

import dynamic from "next/dynamic";
const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

export default function EmojiPlugin({ anchorElm }: { anchorElm: HTMLElement | null }) {
    const [editor] = useLexicalComposerContext()

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editor.update(() => {
                const selection = $getSelection()

                if (!$isRangeSelection(selection)) { return null }
                const node = getSelectedNode(selection)



                const parent = node.getParent()
                const text = node.getTextContent()
                const nearestText = text.substring(selection.anchor.offset - 1, selection.anchor.offset)

            })
        })
    }, [editor])
    useEffect(() => {
        return mergeRegister(editor.registerCommand(KEY_ESCAPE_COMMAND, () => {
            const selection = $getSelection()

            if (!$isRangeSelection(selection)) { return false }
            const node = getSelectedNode(selection)
            const parent = node.getParent()

            return false;
        }, COMMAND_PRIORITY_HIGH))
    }, [editor])

    return <EmojiPicker
        customEmojis={[
            {
                names: ['Alice', 'alice in wonderland', 'アリス'],
                imgUrl:
                    'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/alice.png',
                id: 'alice'
            },
            {
                names: ['Dog'],
                imgUrl:
                    'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/dog.png',
                id: 'dog'
            },
            {
                names: ['Hat'],
                imgUrl:
                    'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/hat.png',
                id: 'hat'
            },
            {
                names: ['Vest'],
                imgUrl:
                    'https://cdn.jsdelivr.net/gh/ealush/emoji-picker-react@custom_emojis_assets/vest.png',
                id: 'vest'
            }
        ]}
        onEmojiClick={(emoji, event) => {
            console.log(emoji)
        }}></EmojiPicker>;
}