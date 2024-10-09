'use client';
import { storeContentAction } from "@/app/actions";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, EditorState } from "lexical";
import { useEffect, useRef } from "react";

let isFirst = true;
const AutoSavePlugin = ({ postId }: { postId: string }) => {
    const [editor] = useLexicalComposerContext();
    // settimeout関数を格納する
    const timer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Editor Statesが更新されたタイミングで処理が走るように登録しておく
        return editor.registerUpdateListener(({ editorState }) => {
            /**
             * 最新のEditor Stateで処理を行う
             * Editor Statesは更新する予定はないが、Lexicalのユーティリティ関数を使用した
             * よって、readメソッドを使っている
             */
            editorState.read(() => {
                // 最初に画面を開いた時は自動で保存することをさけるため
                if (isFirst) {
                    isFirst = false;
                    return;
                }

                // 登録しているsettimeout関数の処理があれば削除する
                if (timer.current) {
                    clearTimeout(timer.current);
                }
                // refにsettimeout関数を代入する
                timer.current = setTimeout(async () => {
                    const editorStateTextString = createTextForSearch(editorState)
                    // サーバー側での処理。今回はディレクトリにJSONファイルとtxtファイルを書き込んでいる
                    await storeContentAction(editorState.toJSON(), editorStateTextString, postId)

                }, 3000);
            });
        });
    }, [editor]);

    const createTextForSearch = (state: EditorState) => {
        // 現在のEditor StatesをJSON文字列にする
        const stringifiedEditorState = JSON.stringify(
            state.toJSON(),
        );
        // 文字列からEditor Statesを作成
        const parsedEditorState = editor.parseEditorState(stringifiedEditorState);

        // テキスト検索用のファイルを作成
        return parsedEditorState.read(() => $getRoot().getTextContent())
    }

    return null
}

export default AutoSavePlugin;
