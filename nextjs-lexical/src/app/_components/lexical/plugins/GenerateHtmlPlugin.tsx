'use client';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $convertToMarkdownString } from '@lexical/markdown';
import { convertHtml } from "@/app/actions";
import { $generateHtmlFromNodes } from '@lexical/html';
import { TRANSFORMER_PATTERNS } from "./MarkdownPlugin";
import PrimaryButton from "../../button/PrimaryButton";
import { useState } from "react";

export default function GenerateHtmlPlugin() {
    const [editor] = useLexicalComposerContext();
    const [isLoading, setIsLoading] = useState(false)

    const generateHtml = () => {
        setIsLoading(() => true)

        editor.update(async () => {
            // Lexicalの内容をHTMLに変換
            const html = $generateHtmlFromNodes(editor)
            const markdown = $convertToMarkdownString(TRANSFORMER_PATTERNS);
            convertHtml(markdown).then(async (res) => {
                await global.navigator.clipboard.writeText(res);
                alert('クリップボードに保存しました')
            }).catch((e) => Promise.reject(e)).finally(() => { setIsLoading(() => false) })

        })
    }

    return <PrimaryButton onClick={generateHtml}>{isLoading ? '...実行中' : 'ブログ用にHTML生成'}</PrimaryButton>;
}