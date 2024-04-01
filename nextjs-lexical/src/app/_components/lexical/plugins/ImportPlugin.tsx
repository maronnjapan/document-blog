'use client';
import { getBlogJson, getBlogJsonByPublicDir } from "@/app/actions";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

export const ImportPlugin = ({ postId }: { postId: string }) => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        editor.update(async () => {
            const json = await getBlogJsonByPublicDir(postId)
            if (!json) return;
            const editorState = editor.parseEditorState(json);
            editor.setEditorState(editorState);
        });
    }, [editor]);

    return null;
};

export default ImportPlugin;