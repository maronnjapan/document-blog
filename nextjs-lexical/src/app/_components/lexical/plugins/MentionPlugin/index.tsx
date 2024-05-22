import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTextNode, $getSelection, $isRangeSelection, $isTextNode } from "lexical";
import { $createHeadingNode } from '@lexical/rich-text'
import { ReactPortal, useEffect, useRef, useState } from "react";
import { getSelectedNode } from "../../utils/getSelectedNode";
import { createPortal } from "react-dom";

let isFirst = true;
export default function MentionPlugin() {
    const [editor] = useLexicalComposerContext()
    const [elm, setElm] = useState<ReactPortal | null>(null)
    const ref = useRef<HTMLButtonElement | null>(null)

    const handleClick = () => {
        if (ref && ref.current) {
            ref.current.remove()
            setElm(() => null)
        }
    }

    useEffect(() => {
        return editor.registerUpdateListener(() => {
            editor.update(() => {
                const selection = $getSelection()

                if (!$isRangeSelection(selection)) { return null }
                const node = getSelectedNode(selection)
                if ($isTextNode(node)) {
                    node.getFormat()
                }
                const text = node.getTextContent()
                const nearestText = text.substring(selection.anchor.offset - 1, selection.anchor.offset)
                if (nearestText === '@') {
                    setElm(() => createPortal(<div><button ref={ref} onClick={handleClick}>ボタン</button></div>, document.body))
                }
                return;
            })
        })
    }, [editor])

    return <>{elm}</>
}