import { LexicalCommand, LexicalEditor, createCommand } from "lexical";
import { ImagePayload } from "./node";
import { createPresignedUrl } from "@/app/actions";
import axios from "axios";

export type InsertImagePayload = Readonly<ImagePayload>

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> = createCommand('INSERT_IMAGE_COMMAND')

export const uploadImage = async (file: File, editor: LexicalEditor) => {
    const { url, fileId } = await createPresignedUrl(file.name)

    await axios.put(url, file, { headers: { "Content-Type": 'image/' } })
    const extension = file.name.split('.')[file.name.split('.').length - 1]
    const showUrl = `http://localhost:9000/blogs/${fileId}.${extension}`
    editor.update(() => {
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            altText: file.name,
            src: showUrl
        });
    });
}