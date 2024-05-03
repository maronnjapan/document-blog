import { $applyNodeReplacement, DOMConversionMap, DOMExportOutput, DecoratorNode, EditorConfig, ElementFormatType, ElementNode, LexicalEditor, LexicalNode, NodeKey, SerializedEditor, SerializedLexicalNode, Spread, createEditor } from 'lexical';
import { DecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode';
import type { SerializedDecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode';
import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents';
import styles from './style/index.module.css';
import { Suspense } from 'react';

const LinkPreview = ({ url, nodeKey }: { url: string, nodeKey: NodeKey }) => {
    return (
        <BlockWithAlignableContents
            format={''}
            nodeKey={nodeKey}
            className={{
                base: 'relative',
                focus: 'relative outline outline-indigo-300'
            }}
        >
            <iframe className={`hatenablogcard ${styles['link-preview-card']}`} src={`https://hatenablog-parts.com/embed?url=${url}`}
                width={'300'} height={'150'}>

            </iframe>
        </BlockWithAlignableContents>

    )
}

export interface LinkPreviewPayload {
    url: string;
    key?: NodeKey
    caption?: LexicalEditor;
}
const linkType = 'link-preview'
type LinkPreviewAttributes = {
    url: string,
    caption: SerializedEditor
}

type SerializedLinkPreviewNode = Spread<LinkPreviewAttributes, SerializedDecoratorBlockNode>

export class LinkPreviewNode extends DecoratorBlockNode {
    _url: string;
    _caption: LexicalEditor;

    exportJSON(): SerializedLinkPreviewNode {
        return {
            ...super.exportJSON(),
            caption: this._caption.toJSON(),
            url: this._url,
            type: 'link-preview',
            version: 1
        }
    }

    static getType(): string {
        return 'link-preview'
    }

    constructor(url: string, caption?: LexicalEditor, format?: ElementFormatType, key?: NodeKey) {
        super(format, key)
        this._url = url;
        this._caption = caption || createEditor();
    }

    static clone(node: LinkPreviewNode): LinkPreviewNode {
        return new LinkPreviewNode(node._url)
    }

    getUrl(): string {
        return this._url;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('iframe');
        element.setAttribute('src', this._url);
        return { element };
    }

    decorate(): JSX.Element {
        return <Suspense><LinkPreview url={this._url} nodeKey={this.__key}></LinkPreview></Suspense>
    }


    static importJSON(_serializedNode: SerializedLinkPreviewNode): LinkPreviewNode {
        const { url, caption } = _serializedNode
        const node = $createLinkPreviewNode({ url });
        return node;
    }
}

export function $createLinkPreviewNode(payload: LinkPreviewPayload): LinkPreviewNode {
    return $applyNodeReplacement(new LinkPreviewNode(payload.url, payload.caption))
}

export function $isLinkPreviewNode(node?: LexicalNode): node is LinkPreviewNode {
    return node instanceof LinkPreviewNode;
}

