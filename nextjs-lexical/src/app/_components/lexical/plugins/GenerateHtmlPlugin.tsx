'use client';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $convertToMarkdownString, TRANSFORMERS } from '@lexical/markdown';
import { convertHtml } from "@/app/actions";
import { $generateHtmlFromNodes } from '@lexical/html';

export default function GenerateHtmlPlugin() {
    const [editor] = useLexicalComposerContext();

    const generateHtml = () => {
        editor.update(async () => {
            // Lexicalの内容をHTMLに変換
            const html = $generateHtmlFromNodes(editor)
            const markdown = $convertToMarkdownString(TRANSFORMERS);
            const res = await convertHtml(markdown)
            await global.navigator.clipboard.writeText(res);
            alert('クリップボードに保存しました')
        })
    }

    return <button onClick={generateHtml}>ブログ用にHTML生成</button>;
}

// lexicalのCSS
// const css = `@import url(https://fonts.googleapis.com/css?family=Noto+Sans+JP);

// .lexical {
//     font-family: "Noto Sans JP", sans-serif;
// }

// .EditorTheme_h1 {
//     font-size: 32px;
//     margin-bottom: 24px;
// }

// .EditorTheme_h2 {
//     font-size: 24px;
//     margin-bottom: 20px;
// }

// .EditorTheme_h3 {
//     font-size: 18px;
//     margin-bottom: 16px;
// }

// .EditorTheme_h4 {
//     font-size: 16px;
//     margin-bottom: 16px;
// }

// .EditorTheme_h5 {
//     font-size: 14px;
//     margin-bottom: 16px;
// }

// .EditorTheme_h6 {
//     font-size: 12px;
//     margin-bottom: 16px;
// }

// .EditorTheme_quote {
//     margin: 16px 0;
//     padding: 4px 16px;
//     border-left: 4px solid #dddddd;
// }

// .EditorTheme_ul {
//     margin-left: 16px;
//     list-style-position: inside;
// }

// .EditorTheme_ol {
//     margin-left: 16px;
//     list-style-position: inside;
// }

// .EditorTheme_listitem {
//     margin: 4px 32px;
// }

// .EditorTheme_nestedListItem {
//     list-style: none;
// }

// .EditorTheme_listitemChecked,
// .EditorTheme_listitemUnchecked {
//     list-style: none;
//     position: relative;
//     margin-left: 8px;
//     padding-left: 24px;

//     &:focus-visible {
//         box-shadow: none;
//     }

//     &::before {
//         content: "";
//         position: absolute;
//         top: 4px;
//         left: 4px;
//         display: inline-block;
//         width: 16px;
//         height: 16px;
//         border: 1px solid #c5c5c5;
//         border-radius: 2px;
//     }
// }

// .EditorTheme_listitemChecked {
//     &::before {
//         background-color: #3b72e9;
//     }

//     &::after {
//         content: "";
//         position: absolute;
//         top: 8px;
//         left: 7px;
//         display: inline-block;
//         width: 10px;
//         height: 5px;
//         border-bottom: 2px solid white;
//         border-left: 2px solid white;
//         transform: rotate(-40deg);
//     }
// }

// pre {
//     background-color: #f7fafb;
//     font-family: Menlo, Consolas, Monaco, monospace;
//     display: block;
//     padding: 8px 8px 8px 52px;
//     line-height: 1.6;
//     font-size: 14px;
//     margin: 8px 0;
//     tab-size: 2;
//     /* white-space: pre; */
//     overflow-x: auto;
//     position: relative;

//     &::before {
//         content: attr(data-gutter);
//         color: #999;
//         position: absolute;
//         top: 0;
//         left: 0;
//         background-color: #d9dddf;
//         padding: 8px;
//         min-width: 32px;
//         height: 100%;
//         text-align: right;
//     }
// }

// .EditorTheme_tokenComment {
//     color: slategray;
// }

// .EditorTheme_tokenPunctuation {
//     color: #999;
// }

// .EditorTheme_tokenProperty {
//     color: #905;
// }

// .EditorTheme_tokenSelector {
//     color: #690;
// }

// .EditorTheme_tokenOperator {
//     color: #9a6e3a;
// }

// .EditorTheme_tokenAttr {
//     color: #07a;
// }

// .EditorTheme_tokenVariable {
//     color: #e90;
// }

// .EditorTheme_tokenFunction {
//     color: #dd4a68;
// }

// .EditorTheme_textBold {
//     font-weight: bold;
// }

// .EditorTheme_textCode {
//     background-color: #e8eced;
//     padding: 1px 0.25rem;
//     font-family: Menlo, Consolas, Monaco, monospace;
//     font-size: 94%;
// }

// .EditorTheme_textItalic {
//     font-style: italic;
// }

// .EditorTheme_textStrikethrough {
//     text-decoration: line-through;
// }

// .EditorTheme_textSubscript {
//     font-size: 0.8em;
//     vertical-align: sub;
// }

// .EditorTheme_textSuperscript {
//     font-size: 0.8em;
//     vertical-align: super;
// }

// .EditorTheme_textUnderline {
//     text-decoration: underline;
// }

// .EditorTheme_textUnderlineStrikethrough {
//     text-decoration: underline line-through;
// }`