'use client';

import { ComponentProps, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { nodes } from "./node";
import AutoFocusPlugin from "./plugins/AutoFoculPlugin";
import ToolBarPlugin from "./plugins/ToolBarPlugin";
import styles from "./styles/Editor.module.css";
import { theme } from "./theme/editorTheme";
import { CodeHighlightPlugin } from "./plugins/CodeHighlightPlugin";
import { MarkdownPlugin } from "./plugins/MarkdownPlugin";
import GenerateHtmlPlugin from "./plugins/GenerateHtmlPlugin";
import AutoSavePlugin from "./plugins/AutoSavePlugin";
import ImportPlugin from "./plugins/ImportPlugin";
import FloatingTextFormatToolbarPlugin from "./plugins/FloatingTextFormatToolbarPlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import LexicalAutoLinkPlugin from "./plugins/AutoLinkPlugin";
import LinkPreviewPlugin from "./plugins/LinkPreviewPlugin";
import { ImageRegister } from "./plugins/InserImagePlugin/register";
import ClipboardImageHandler from "./plugins/InserImagePlugin/clipboard-handler";
import CollapsiblePlugin from "./plugins/CollapsiblePlugin";
import MessagePlugin from "./plugins/MessagePlugin";
import TablePlugin from "./plugins/TablePlugin";
import EmbedExternalSystemPlugin from "./plugins/EmbedExternalSystemPlugin";
import MentionPlugin from "./plugins/MentionPlugin";
import EmojiPlugin from "./plugins/EmojiPlugin";
import ClickableLinkPlugin from "./plugins/ClickableLinkPlugin";

const initialConfig: ComponentProps<typeof LexicalComposer>["initialConfig"] = {
    namespace: "MyEditor",
    onError: (error) => console.error(error),
    nodes: nodes,
    theme: theme
};

export const Lexical = ({ postId, isResize }: { postId: string, isResize?: boolean }) => {
    const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);
    const [floatingAnchorElem, setFloatingAnchorElem] =
        useState<HTMLDivElement | null>(null);

    const onRef = (_floatingAnchorElem: HTMLDivElement) => {
        if (_floatingAnchorElem !== null) {
            setFloatingAnchorElem(_floatingAnchorElem);
        }
    }

    return (
        <LexicalComposer initialConfig={initialConfig}>

            <div className={`${styles.editorContainer}`}>
                <div><AutoSavePlugin postId={postId}></AutoSavePlugin></div>
                <ToolBarPlugin></ToolBarPlugin>

                <RichTextPlugin
                    contentEditable={<div ref={onRef} className={styles["contentEditable-wrapper"]}>
                        <ContentEditable className={`${styles.contentEditable} ${isResize ? 'resize overflow-auto' : ''}`} />
                    </div>}
                    placeholder={<div className={styles.placeholder}></div>}
                    ErrorBoundary={LexicalErrorBoundary}
                />
            </div>
            <AutoFocusPlugin></AutoFocusPlugin>
            <ClickableLinkPlugin></ClickableLinkPlugin>
            <HistoryPlugin />
            <ListPlugin></ListPlugin>
            <TablePlugin anchorElm={floatingAnchorElem}></TablePlugin>
            <MentionPlugin anchorElm={floatingAnchorElem}></MentionPlugin>
            <CheckListPlugin />
            <MarkdownPlugin></MarkdownPlugin>
            <CodeHighlightPlugin></CodeHighlightPlugin>
            <GenerateHtmlPlugin></GenerateHtmlPlugin>
            <LexicalAutoLinkPlugin></LexicalAutoLinkPlugin>
            <ImportPlugin postId={postId}></ImportPlugin>
            <LinkPlugin />
            <LinkPreviewPlugin></LinkPreviewPlugin>
            <ImageRegister />
            <CollapsiblePlugin></CollapsiblePlugin>
            <ClipboardImageHandler></ClipboardImageHandler>
            <MessagePlugin></MessagePlugin>
            <EmbedExternalSystemPlugin></EmbedExternalSystemPlugin>
            {!!floatingAnchorElem && <>
                <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} isLinkEditMode={isLinkEditMode} setIsLinkEditMode={setIsLinkEditMode}></FloatingLinkEditorPlugin>
                <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem}></FloatingTextFormatToolbarPlugin>
            </>}
        </LexicalComposer>

    );
};