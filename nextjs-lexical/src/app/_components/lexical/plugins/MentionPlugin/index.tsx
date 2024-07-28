import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTextNode, $getSelection, $insertNodes, $isRangeSelection, $isTextNode, TextNode, KEY_ESCAPE_COMMAND, COMMAND_PRIORITY_HIGH } from "lexical";
import { $isLinkNode } from '@lexical/link'
import { mergeRegister } from '@lexical/utils';
import { useEffect, useState } from "react";
import { getSelectedNode } from "../../utils/getSelectedNode";
import { $createDisableMentionNode, $createMentionNode, $isDisableMentionNode, $isMentionNode } from "./node";
import SelectsFloating from "./SelectsFloating";
import HoverInfo from "./HoverInfo";

export default function MentionPlugin({ anchorElm }: { anchorElm?: HTMLElement | null }) {
    const [editor] = useLexicalComposerContext()
    const [mentionText, setMentionText] = useState('')
    const [mentionElm, setMentionElm] = useState<HTMLElement | null>(null)

    useEffect(() => {

        /** 複数のイベントをまとめて登録する */
        return mergeRegister(
            /** エディタが更新されたタイミングで発火させる */
            editor.registerUpdateListener(() => {
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
                    /** Node内のテキストを取得する */
                    const text = node.getTextContent()
                    /** キャレットの左隣にある単語を取得 */
                    const nearestText = text.substring(selection.anchor.offset - 1, selection.anchor.offset)
                    /** 同一行にあり、キャレットより二つ以上左にある単語を取得 */
                    const prevText = text.substring(0, selection.anchor.offset - 1);
                    /** 同一行にあり、キャレットより右にある単語を取得 */
                    const afterText = text.substring(selection.anchor.offset + 1)

                    if ($isMentionNode(parent)) {

                        /** MentionNode内で末尾に二個空白をあけたら新しくTextNodeを後ろに作成し、そこに移動するようにした */
                        const escapePattern = /\s\s$/gi;
                        if (escapePattern.test(node.getTextContent())) {
                            parent.insertAfter($createTextNode(' '))
                            const replaceNode = $createTextNode(node.getTextContent().trim())
                            node.replace(replaceNode);
                            parent.selectNext()
                            return
                        }

                        /** 対象のMentionNodeのHTML要素を取得し、
                         * @を除いたテキストとHTML要素をStateにセットした 
                         * */
                        const mentionElmByKey = editor.getElementByKey(parent.getKey());
                        const searchText = node.getTextContent().substring(1)
                        setMentionElm(() => mentionElmByKey)
                        setMentionText(() => searchText)
                        return
                    }

                    /** ESCを押して、メンション機能を取り消した要素の場合何もしない */
                    if ($isDisableMentionNode(parent)) {
                        return;
                    }

                    /** 単純なテキストで@を入力した時、メンション機能を有効化させる */
                    if (nearestText === '@' && $isTextNode(node) && !$isLinkNode(parent)) {
                        /** @の前後をそれぞれ通常のテキストに変更する */
                        /** LinkNodeなど特殊なテキストについては対象にならないので、影響はない認識 */
                        const prevTextNode = prevText.length > 0 ? $createTextNode(prevText) : null;
                        const afterTextNode = afterText.length > 0 ? $createTextNode(afterText) : null;
                        /** @部分をMentionNodeとする */
                        const mentionNode = $createMentionNode().append($createTextNode('@'))
                        const insertNodes = [prevTextNode, mentionNode, afterTextNode].filter((n): n is TextNode => n !== null)
                        /** 既存Nodeを削除し、上記で構築したNode群を挿入する */
                        node.remove()
                        $insertNodes(insertNodes)
                        /** @の後ろにキャレットを持っていく */
                        mentionNode.select(1)

                        return
                    }

                    setMentionElm(() => null)
                })
            })),
            /** ESCキーが押されたタイミングでイベントを実行する */
            editor.registerCommand(KEY_ESCAPE_COMMAND, () => {
                const selection = $getSelection()

                if (!$isRangeSelection(selection)) { return false }
                const node = getSelectedNode(selection)
                const parent = node.getParent()

                if ($isMentionNode(parent)) {
                    /** MentionNodeでESCキーが押されたら、メンション機能を無効化したNodeに置き換える */
                    const disableMentionNode = $createDisableMentionNode().append($createTextNode(parent.getTextContent()))
                    parent.insertAfter(disableMentionNode)
                    parent.remove()
                    disableMentionNode.selectEnd()
                    setMentionElm(() => null)
                    return true;
                }
                return false;
            }, COMMAND_PRIORITY_HIGH)
    }, [editor])

    return <>
        {
            (!!anchorElm && !!mentionElm) &&
            <SelectsFloating anchorElm={anchorElm} searchText={mentionText} mentionElm={mentionElm}></SelectsFloating>
        }
        {!!anchorElm && <HoverInfo anchorElm={anchorElm} ></HoverInfo>}
    </>
}