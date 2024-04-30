import { LexicalCommand, createCommand } from "lexical";
import { LinkPreviewPayload } from "./node";

export type InsertLinkPreviewPayload = Readonly<LinkPreviewPayload>

export const INSERT_LINK_PREVIEW_COMMAND: LexicalCommand<InsertLinkPreviewPayload> = createCommand('INSERT_LINK_PREVIEW_COMMAND')