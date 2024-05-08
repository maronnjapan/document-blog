import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from '@lexical/list'
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { Klass, LexicalNode } from "lexical";
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { LinkPreviewNode } from "./plugins/LinkPreviewPlugin/node";
import { ImageNode } from "./plugins/InserImagePlugin/node";
import { CollapsibleContainerNode } from "./plugins/CollapsiblePlugin/container-node";
import { CollapsibleContentNode } from "./plugins/CollapsiblePlugin/content-node";
import { CollapsibleTitleNode } from "./plugins/CollapsiblePlugin/title-node";
import { MessageContainerNode } from "./plugins/MessagePlugin/container-node";
import { MessageContentNode } from "./plugins/MessagePlugin/content-node";

export const nodes: Klass<LexicalNode>[] = [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode, CodeHighlightNode, LinkNode, AutoLinkNode, ImageNode, LinkPreviewNode, CollapsibleContainerNode, CollapsibleContentNode, CollapsibleTitleNode, MessageContainerNode, MessageContentNode]