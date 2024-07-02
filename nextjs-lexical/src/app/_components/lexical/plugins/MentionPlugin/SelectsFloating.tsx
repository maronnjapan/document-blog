import { getUsers } from "@/app/actions";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTextNode, $getSelection, $isRangeSelection } from "lexical";
import { CSSProperties, ReactPortal, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getSelectedNode } from "../../utils/getSelectedNode";
import { $isMentionNode } from "./node";
import { mergeRegister } from '@lexical/utils'

export default function SelectsFloating({ anchorElm, mentionElm, searchText }: { anchorElm: HTMLElement, mentionElm: HTMLElement, searchText: string }) {
    const mentionMenuRef = useRef<HTMLUListElement | null>(null)
    const [selectTexts, setSelectTexts] = useState<string[]>([])
    const [editor] = useLexicalComposerContext()
    const [isLoading, setIsLoading] = useState(false)
    const [isExistEditor, setIsExistEditor] = useState(true)

    const getMentionMenuStyles = (): CSSProperties | null => {
        if (!anchorElm) {
            return null
        }

        const top = mentionElm.getBoundingClientRect().top - anchorElm.getBoundingClientRect().top;
        const left = mentionElm.getBoundingClientRect().left + mentionElm.getBoundingClientRect().width + 20 - anchorElm.getBoundingClientRect().left
        return {
            top: `${top}px`,
            left: `${left}px`,
            position: 'absolute',
            zIndex: 1,
            borderRadius: '8px',
            backgroundColor: '#fff',
            border: '2px solid #efefef',
            width: '200px',
            height: 'fit-content',
            maxHeight: '200px',
            padding: '0.75rem 0',
            overflowY: 'auto'
        }
    }

    const [menuStyles, setMenuStyles] = useState<CSSProperties | null>(null)


    useEffect(() => {
        console.log(searchText)
        setIsLoading(() => true)
        getUsers(searchText).then((res) => {
            setSelectTexts(() => res)
            setMenuStyles(() => getMentionMenuStyles())
        }).finally(() => {
            setIsLoading(() => false)
        })
    }, [searchText])

    const handleClick = (text: string) => {
        editor.update(() => {
            const selection = $getSelection()

            if (!$isRangeSelection(selection)) { return null }
            const node = getSelectedNode(selection)

            const parent = node.getParent()
            if ($isMentionNode(parent)) {
                node.replace($createTextNode(`@${text}`))
                parent.setDesidedText(`@${text}`)
                parent.insertAfter($createTextNode(' '))
                parent.selectNext()
                setMenuStyles(() => null)
            }
            if (mentionMenuRef?.current) {
                mentionMenuRef.current = null
            }

        })
    }

    console.log(menuStyles)

    return <>
        {!!menuStyles && isExistEditor ?
            createPortal(
                <div style={menuStyles}>
                    {isLoading ? <div className="flex justify-center h-full" aria-label="読み込み中">
                        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                        : <ul ref={mentionMenuRef}>{selectTexts.map(text => <li key={text} className="hover:bg-blue-300  cursor-pointer" onClick={() => { handleClick(text) }}>{text}</li>)}</ul>}
                </div>, anchorElm)
            : null}
    </>
}