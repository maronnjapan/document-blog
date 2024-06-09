import { getBlogJsonByPublicDir } from "@/app/actions";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect } from "react";

export const ImportPlugin = ({ postId }: { postId: string }) => {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        getBlogJsonByPublicDir(postId).then((res) => {
            const editorState = editor.parseEditorState(res ?? '');
            editor.setEditorState(editorState);
        }).catch(() => { alert('エラーによってインポートができませんでした') })
    }, []);

    return null;
};

export default ImportPlugin;