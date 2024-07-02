
import type { LinkNode } from '@lexical/link';
import type { LexicalEditor } from 'lexical';

import { $isLinkNode } from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $getNearestNodeFromDOMNode,
    $getSelection,
    $isRangeSelection,
} from 'lexical';
import { useEffect } from 'react';

type LinkFilter = (event: MouseEvent, linkNode: LinkNode) => boolean;

export default function ClickableLinkPlugin({
    filter,
    newTab = true,
}: {
    filter?: LinkFilter;
    newTab?: boolean;
}): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        const onClick = (event: MouseEvent | PointerEvent) => {
            // クリックしたリンクの要素取得
            const linkDomNode = getLinkDomNode(event, editor);

            if (linkDomNode === null) {
                return;
            }

            // 遷移したいURLを取得
            const href = linkDomNode.getAttribute('href');

            if (!href) {
                return;
            }

            editor.update(() => {

                const selection = $getSelection()
                /**
                 * selection.isCollapsed()がtrueの時は範囲選択で異なるNodeを選択している時
                 * すなわち遷移したいリンク以外も選択している
                 * その時は遷移したいLinkが分からなくなるので、何もしない
                 */
                if ($isRangeSelection(selection) && !selection.isCollapsed()) {
                    return;
                }
                // イベント経由で取得したDOMが属しているLexicalのNodeを取得する。
                // DOM自体がLexicalのNodeとして登録されたものから生成されていれば、そのNodeを返す
                // 上記の状況でない場合は、親のNodeを探していきLexicalのNodeを返す
                // 以下ライブラリのソースコード
                // https://github.com/facebook/lexical/blob/28b3f901445d730748361e008033d876991379d3/packages/lexical/src/LexicalUtils.ts#L440
                const linkNode = $getNearestNodeFromDOMNode(linkDomNode);

                if (!$isLinkNode(linkNode)) {
                    return
                }

                const isClickable = filter !== undefined ? filter(event, linkNode) : true
                if (!isClickable) {
                    return;
                }

                try {
                    /**
                     * auxclickはマウスの中央ボタンやサイドボタンをクリックした時のType
                     * event.button === 1はマウスの中央ボタンをクリックしかを見ている
                     */
                    const isMiddle = event.type === 'auxclick' && event.button === 1;
                    window.open(
                        href,
                        newTab || event.metaKey || event.ctrlKey || isMiddle
                            ? '_blank'
                            : '_self',
                        'noreferrer'
                    );
                    event.preventDefault();
                } catch { }
            });


        }

        return editor.registerRootListener(
            (
                rootElement: null | HTMLElement,
                prevRootElement: null | HTMLElement,
            ) => {
                /**
                 * 以下がprevRootElementにデータが格納されるケースです。
                 * ①エディタの内容が変更される前に、すでにルートノードにHTMLコンテンツが存在していた場合。
                 * 例えば、エディタを初期化する際に初期値としてHTMLコンテンツを設定していた場合などです。
                 * ②registerRootListenerが複数回呼び出された場合。
                 * registerRootListenerが呼び出されるたびに、前回のルートノードのHTMLがprevRootHtmlに渡されます。
                 * これにより、前回のルートノードの状態と現在のルートノードの状態を比較することができます。
                 * ③エディタの内容が動的に変更された場合。
                 * ユーザーの操作やプログラムによってエディタの内容が変更された場合、prevRootHtmlにはその変更前のHTMLが存在することになります。
                 */
                if (prevRootElement !== null) {
                    prevRootElement.removeEventListener('click', onClick);
                    prevRootElement.removeEventListener('auxclick', onClick);
                }

                // イベントの登録をしている。
                // これをしないとエディタ内でクリックしても作成した関数が実行されない
                if (rootElement !== null) {
                    rootElement.addEventListener('click', onClick);
                    rootElement.addEventListener('auxclick', onClick);
                }
            },
        );
    }, [editor, filter, newTab]);
    return null;
}

// イベントの対象になっている要素がaタグかを判定する
function isLinkDomNode(domNode: Node): boolean {
    return domNode.nodeName.toLowerCase() === 'a';
}

// FIXME: アサーション祭りなのはどうにかしたい
function getLinkDomNode(
    event: MouseEvent | PointerEvent,
    editor: LexicalEditor,
): HTMLAnchorElement | null {
    // 最新のEditor Statesを取得し、その内容をもとにNodeを取得する
    // readメソッドは型定義がread<V>(callbackFn: () => V): V;なので、任意の方を戻り値に設定できる
    // 今回はHTMLAnchorElementを戻り値に設定している
    // コールバック関数内で、対象リンクのHTML要素を取得して、それを返している
    return editor.getEditorState().read(() => {
        const domNode = event.target as Node;

        // リンクに対して遷移しようとした時はイベント内のtarget要素をそのまま返す
        if (isLinkDomNode(domNode)) {
            return domNode as HTMLAnchorElement;
        }

        // リンクNode内で文字色付与など加工されていた場合でもリンク遷移ができるように
        if (domNode.parentNode && isLinkDomNode(domNode.parentNode)) {
            return domNode.parentNode as HTMLAnchorElement;
        }

        return null;
    });
}