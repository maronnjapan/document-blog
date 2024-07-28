import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNearestNodeFromDOMNode } from "lexical";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { $isMentionNode } from "./node";

let isLoading = false;
/**
 * MentionNodeをホバーした時に出現する要素
 */
export default function HoverInfo({ anchorElm }: { anchorElm: HTMLElement }) {
    const hoverInfoRef = useRef<HTMLDivElement | null>(null)
    const [editor] = useLexicalComposerContext()
    /** ホバー要素のスタイルを保持 */
    const [menuStyles, setMenuStyles] = useState<CSSProperties | null>()

    useEffect(() => {
        /** エディターの中身が更新・操作されたときに起動させる */
        return editor.registerUpdateListener(({ editorState }) => {
            /** 現在のEditor State(≒エディタ内の情報)からNode部分を抽出 */
            [...Array.from(editorState._nodeMap.values())].forEach((val) => {

                /** MentionNodeでない場合は何もしない */
                if (!$isMentionNode(val)) {
                    return
                }
                /** Nodeの種類を一意に識別するKeyからHTML要素を取得 */
                const mentionElm = editor.getElementByKey(val.getKey())
                if (!mentionElm) {
                    return
                }

                /** 既存のイベントを解除する
                 * ここの解除がちゃんと意味あるかは未検証
                 */
                mentionElm.removeEventListener('click', (e) => {
                    showInfo(e.target)
                });
                mentionElm.removeEventListener('mouseenter', (e) => {
                    showInfo(e.target)
                });
                mentionElm.removeEventListener('mouseleave', (e) => {
                    if (e.relatedTarget === hoverInfoRef.current) {
                        return
                    }
                    setMenuStyles(() => null)
                });

                /** 
                 * MentionNodeを示すHTML要素に対して各種イベントハンドラーを登録する
                 */
                mentionElm.addEventListener('click', (e) => {
                    showInfo(e.target)
                });
                mentionElm.addEventListener('mouseenter', (e) => {
                    showInfo(e.target)
                });
                mentionElm.addEventListener('mouseleave', (e) => {
                    if (e.relatedTarget === hoverInfoRef.current) {
                        return
                    }
                    setMenuStyles(() => null)
                });
            })
        })
    }, [editor])


    const getMentionHoberElmStyles = (nowMentionElm: HTMLElement): CSSProperties | null => {
        if (!anchorElm || !nowMentionElm) {
            return null
        }

        /**
         * エディタ自体の底から対象としているMentionNodeの底を引いている
         * そして、MentionNodeと被らないようにMentionNodeの高さ文上に表示するようにしている
         */
        const bottom = anchorElm.getBoundingClientRect().bottom - nowMentionElm.getBoundingClientRect().bottom + nowMentionElm.getBoundingClientRect().height;
        const left = nowMentionElm.getBoundingClientRect().left - anchorElm.getBoundingClientRect().left
        return {
            bottom: `${bottom}px`,
            left: `${left}px`,
            position: 'absolute',
            zIndex: 1,
            borderRadius: '8px',
            backgroundColor: '#fff',
            border: '2px solid #efefef',
            maxWidth: '200px',
            height: 'fit-content',
            maxHeight: '200px',
            padding: '0.75rem 0',
            overflowY: 'auto'
        }
    }

    const showInfo = (eventElm: EventTarget | null) => {
        // クリックしたリンクの要素取得
        const mentionDom = eventElm as HTMLElement;
        if (mentionDom === null) {
            return;
        }


        editor.update(() => {
            /**
             * イベント経由で取得したDOMが属しているLexicalのNodeを取得する。
             * DOM自体がLexicalのNodeとして登録されたものから生成されていれば、そのNodeを返す
             * 上記の状況でない場合は、親のNodeを探していきLexicalのNodeを返す
             * 以下ライブラリのソースコード
             * https://github.com/facebook/lexical/blob/28b3f901445d730748361e008033d876991379d3/packages/lexical/src/LexicalUtils.ts#L440
             */
            const mentionNode = $getNearestNodeFromDOMNode(mentionDom);

            if (!$isMentionNode(mentionNode)) {
                return setMenuStyles(() => null)
            }

            setMenuStyles(() => getMentionHoberElmStyles(mentionDom))
        });


    }

    return <>

        {createPortal(
            <>
                {menuStyles ? <div ref={hoverInfoRef} style={menuStyles} onMouseLeave={(e) => {
                    setMenuStyles(() => null)
                }} >
                    {isLoading ?
                        <div className="flex justify-center h-full" aria-label="読み込み中">
                            <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
                        </div>
                        : <div >ホバー要素</div>}
                </div> : null}
            </>,
            anchorElm)}
    </>
}