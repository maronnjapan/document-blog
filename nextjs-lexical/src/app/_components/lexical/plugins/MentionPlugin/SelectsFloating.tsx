import { getUsers } from "@/app/actions";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTextNode, $getSelection, $isRangeSelection } from "lexical";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getSelectedNode } from "../../utils/getSelectedNode";
import { $isMentionNode } from "./node";

/**
 * 文字列検索結果を表示する要素
 */
export default function SelectsFloating({ anchorElm, mentionElm, searchText }: { anchorElm: HTMLElement, mentionElm: HTMLElement, searchText: string }) {
    /** 検索結果要素を設定するREf */
    const mentionMenuRef = useRef<HTMLUListElement | null>(null)
    const [selectTexts, setSelectTexts] = useState<string[]>([])
    const [editor] = useLexicalComposerContext()
    const [isLoading, setIsLoading] = useState(false)

    /** 検索結果要素のスタイルを定義する関数 */
    const getMentionMenuStyles = (): CSSProperties | null => {
        if (!anchorElm) {
            return null
        }

        /** メンション要素のブラウザからの高さにエディターのブラウザからの高さを引く。
         * これによって、対象のメンション要素の近くに検索結果要素を出現させることができる
         */
        const top = mentionElm.getBoundingClientRect().top - anchorElm.getBoundingClientRect().top;
        /**
         * 高さとにているが、メンション要素の幅文ずらすことでメンション要素にかぶらず表示ができる
         */
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
        setIsLoading(() => true)
        /** 検索関数実行 */
        getUsers(searchText).then((res) => {
            /** 戻り値を検索結果要素に表示するStateに追加する */
            setSelectTexts(() => res)
            setMenuStyles(() => getMentionMenuStyles())
        }).finally(() => {
            setIsLoading(() => false)
        })
    }, [searchText])

    /** 検索結果をクリックした時の挙動 */
    const handleClick = (text: string) => {
        /** エディター内の状態を書き換える
         * Lexicalの操作に使用できる、ユーティリティ関数は先頭に$が付与されている
         * そして、上記ユーティリティ関数はeditor.update か editor.read内のコールバック関数内でしが使用できない。
         */
        editor.update(() => {
            /** 現在選択しているテキストの情報やNodeの情報を持つSelectionオブジェクトを取得 */
            const selection = $getSelection()

            /** selectionオブジェクトが存在しない = 特にエディタで入力などの操作をしていない　場合は何もしない */
            if (!$isRangeSelection(selection)) { return null }
            /** 操作対象となっているNodeを取得する */
            const node = getSelectedNode(selection)

            /** MentionNodeはElementNodeを継承しているため、テキスト部分はTextNodeである
             * そのため、MentionNode部分を取得するために、対象Nodeの親Nodeを取得するようにしている
             */
            const parent = node.getParent()

            /** メンション要素内でクリックしている場合のみ、内部のテキストを入れ替える */
            if ($isMentionNode(parent)) {
                node.replace($createTextNode(`@${text}`))
                parent.setDesidedText(`@${text}`)
                parent.insertAfter($createTextNode(' '))
                parent.selectNext()
                setMenuStyles(() => null)
            }

            /** 登録したので、検索結果要素をクリアする */
            if (mentionMenuRef?.current) {
                mentionMenuRef.current = null
            }

        })
    }

    return <>
        {!!menuStyles ?
            createPortal(
                <div style={menuStyles}>
                    {isLoading ? <div className="flex justify-center h-full" aria-label="読み込み中">
                        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                    </div>
                        : <ul ref={mentionMenuRef}>
                            {selectTexts.map(text =>
                                <li key={text}
                                    className="hover:bg-blue-300  cursor-pointer"
                                    onClick={() => { handleClick(text) }}>{text}</li>
                            )}
                        </ul>}
                </div>, anchorElm)
            : null}
    </>
}