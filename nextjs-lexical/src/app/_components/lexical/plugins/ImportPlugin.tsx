import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";


export const ImportPlugin = ({ content }: { content: string }) => {
    const [editor] = useLexicalComposerContext();

    const editorState = editor.parseEditorState(content);
    editor.setEditorState(editorState);

    return null;
};

export default ImportPlugin;