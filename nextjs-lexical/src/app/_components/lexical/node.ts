import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from '@lexical/list'
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { Klass, LexicalNode } from "lexical";
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { } from '@lexical/text';

export const nodes: Klass<LexicalNode>[] = [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode, CodeHighlightNode, LinkNode, AutoLinkNode];