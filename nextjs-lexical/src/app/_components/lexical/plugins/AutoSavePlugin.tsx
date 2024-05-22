'use client';
import { storeContent } from "@/app/actions";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $getRoot, $getSelection } from "lexical";
import { useEffect, useRef } from "react";

let isFirst = true;
const AutoSavePlugin = ({ postId }: { postId: string }) => {
    const [editor] = useLexicalComposerContext();
    const timer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editor.update(() => {
                const root = $getRoot()
                if (root.getChildrenSize() === 0) {
                    root.append($createParagraphNode())
                }
            })
        })

    }, [editor])

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                if (isFirst) {
                    isFirst = false;
                    return;
                }

                if (timer.current) {
                    clearTimeout(timer.current);
                }
                timer.current = setTimeout(async () => {
                    const stringifiedEditorState = JSON.stringify(
                        editor.getEditorState().toJSON(),
                    );
                    const parsedEditorState = editor.parseEditorState(stringifiedEditorState);

                    const editorStateTextString = parsedEditorState.read(() => $getRoot().getTextContent())
                    await storeContent(editorState.toJSON(), editorStateTextString, postId)

                }, 3000);
            });
        });
    }, [editor]);

    return null
}

export default AutoSavePlugin;
