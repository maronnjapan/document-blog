
// import { $isCodeNode, $createCodeNode } from '@lexical/code';
// import type { ElementNode, LexicalEditor, TextNode } from 'lexical';

// import { $isLinkNode } from '@lexical/link';
// import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
// import {
//     $createTextNode,
//     $getNearestNodeFromDOMNode,
//     $getSelection,
//     $isRangeSelection,
// } from 'lexical';
// import { useEffect } from 'react';

// import { getSelectedNode } from '../../utils/getSelectedNode';
// import { formatCode } from '@/app/actions';


// export default function CodeBlockDecoratePlugin(): JSX.Element | null {
//     const [editor] = useLexicalComposerContext();
//     useEffect(() => {
//         const onFormatShortCut = (event: KeyboardEvent) => {
//             console.log(event.ctrlKey && event.shiftKey && event.key === 'F')
//             if (event.ctrlKey && event.shiftKey && event.key === 'F') {
//                 editor.update(async () => {

//                     const selection = $getSelection()
//                     /**
//                      * selection.isCollapsed()がtrueの時は範囲選択で異なるNodeを選択している時
//                      * すなわち遷移したいリンク以外も選択している
//                      * その時は遷移したいLinkが分からなくなるので、何もしない
//                      */
//                     if (!$isRangeSelection(selection)) {
//                         return;
//                     }

//                     const node = getSelectedNode(selection)
//                     let codeNode = getCodeNode(node)
//                     if (!codeNode) {
//                         return
//                     }

//                     const formatCodeText = await formatCode(codeNode.getTextContent(), codeNode.getLanguage() ?? undefined)

//                     codeNode.replace($createCodeNode(codeNode.getLanguage()).append($createTextNode(formatCodeText)))

//                     event.preventDefault();
//                 });
//             }

//         }

//         return editor.registerRootListener(
//             (
//                 rootElement: null | HTMLElement,
//                 prevRootElement: null | HTMLElement,
//             ) => {
//                 /**
//                  * 以下がprevRootElementにデータが格納されるケースです。
//                  * ①エディタの内容が変更される前に、すでにルートノードにHTMLコンテンツが存在していた場合。
//                  * 例えば、エディタを初期化する際に初期値としてHTMLコンテンツを設定していた場合などです。
//                  * ②registerRootListenerが複数回呼び出された場合。
//                  * registerRootListenerが呼び出されるたびに、前回のルートノードのHTMLがprevRootHtmlに渡されます。
//                  * これにより、前回のルートノードの状態と現在のルートノードの状態を比較することができます。
//                  * ③エディタの内容が動的に変更された場合。
//                  * ユーザーの操作やプログラムによってエディタの内容が変更された場合、prevRootHtmlにはその変更前のHTMLが存在することになります。
//                  */
//                 if (prevRootElement !== null) {
//                     prevRootElement.removeEventListener('keydown', onFormatShortCut);
//                 }

//                 // イベントの登録をしている。
//                 // これをしないとエディタ内でクリックしても作成した関数が実行されない
//                 if (rootElement !== null) {
//                     rootElement.addEventListener('keydown', onFormatShortCut);
//                 }
//             },
//         );
//     }, [editor]);
//     return null;
// }

// function getCodeNode(node: ElementNode | TextNode) {
//     if ($isCodeNode(node)) {
//         return node;
//     }

//     let baseNode = node.getParent()

//     while (baseNode !== null) {
//         if ($isCodeNode(baseNode)) {
//             break
//         }
//         baseNode = baseNode.getParent()
//     }

//     return baseNode;
// }