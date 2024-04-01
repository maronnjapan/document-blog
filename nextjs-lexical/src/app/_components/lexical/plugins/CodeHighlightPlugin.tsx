'use client';
import { useEffect } from "react";
import { registerCodeHighlighting, $isCodeNode, CodeNode } from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_CRITICAL, LexicalEditor, createCommand } from "lexical";
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils'

export const CodeHighlightPlugin = () => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return mergeRegister(
            registerCodeHighlighting(editor),
            registerCodeLanguageSelecting(editor)
        )
    }, [editor]);

    return null;
};

export const CODE_LANGUAGE_COMMAND = createCommand<string>()

function registerCodeLanguageSelecting(editor: LexicalEditor) {
    return editor.registerCommand(
        CODE_LANGUAGE_COMMAND,
        (language, editor) => {
            const selection = $getSelection()
            if (!$isRangeSelection(selection)) return false;

            const anchorNode = selection.anchor.getNode();
            const targetNode = $isCodeNode(anchorNode) ? anchorNode : $getNearestNodeOfType(anchorNode, CodeNode)
            if (!targetNode) return false;

            editor.update(() => {
                targetNode.setLanguage(language)
            })

            return true;
        },
        COMMAND_PRIORITY_CRITICAL
    )
}