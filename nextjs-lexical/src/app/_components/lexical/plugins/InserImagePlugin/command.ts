import { LexicalCommand, LexicalEditor, createCommand } from "lexical";
import { ImagePayload } from "./node";
import { createPresignedUrlAction } from "@/app/actions";
import axios from "axios";
import { Config } from "@/server/const";

export type InsertImagePayload = Readonly<ImagePayload>

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> = createCommand('INSERT_IMAGE_COMMAND')

const { STORAGE_ENDPOINT_FOR_CLIENT, BUCKET } = Config;

export const uploadImage = async (file: File, editor: LexicalEditor) => {
    const { url, fileId } = await createPresignedUrlAction(file.name)

    await axios.put(url, file, { headers: { "Content-Type": 'image/' } })
    const extension = file.name.split('.')[file.name.split('.').length - 1]
    const showUrl = `${STORAGE_ENDPOINT_FOR_CLIENT}/${BUCKET}/${fileId}.${extension}`
    editor.update(() => {
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            altText: file.name,
            src: showUrl
        });
    });
}