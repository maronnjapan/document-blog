'use client';
import { storeToElasticSearch } from "@/app/actions";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";

export default function SaveElasticSearchPlugin() {
    // const [editor] = useLexicalComposerContext();

    // const store = () => {
    //     console.log('Elasticsearch保存')
    //     editor.update(async () => {
    //         const stringifiedEditorState = JSON.stringify(
    //             editor.getEditorState().toJSON(),
    //         );
    //         const parsedEditorState = editor.parseEditorState(stringifiedEditorState);

    //         const editorStateTextString = parsedEditorState.read(() => $getRoot().getTextContent())
    //         const res = await storeToElasticSearch(editorStateTextString)
    //     })
    // }

    return <button ></button>;
}