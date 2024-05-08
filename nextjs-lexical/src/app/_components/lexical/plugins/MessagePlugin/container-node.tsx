/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    ElementNode,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    SerializedElementNode,
    Spread,
} from 'lexical';
import styles from './styles/style.module.css';

type SerializedMessageContainerNode = Spread<
    {},
    SerializedElementNode
>;

export function convertDetailsElement(
): DOMConversionOutput | null {
    const node = $createMessageContainerNode();
    return {
        node,
    };
}

export class MessageContainerNode extends ElementNode {

    constructor(key?: NodeKey) {
        super(key);
    }

    static getType(): string {
        return 'message-container';
    }

    static clone(node: MessageContainerNode): MessageContainerNode {
        return new MessageContainerNode(node.__key);
    }

    createDOM(): HTMLElement {
        const dom = document.createElement('div');
        dom.classList.add(styles.Message__container);
        return dom;
    }

    updateDOM(): boolean {
        return false;
    }

    static importDOM(): DOMConversionMap<HTMLDetailsElement> | null {
        return {
            details: (domNode: HTMLDetailsElement) => {
                return {
                    conversion: convertDetailsElement,
                    priority: 1,
                };
            },
        };
    }


    static importJSON(
    ): MessageContainerNode {
        const node = $createMessageContainerNode();
        return node;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('div');
        element.classList.add(styles.Message__container);
        return { element };
    }

    exportJSON(): SerializedMessageContainerNode {
        return {
            ...super.exportJSON(),
            type: 'message-container',
            version: 1,
        };
    }
}

export function $createMessageContainerNode(
): MessageContainerNode {
    return new MessageContainerNode();
}

export function $isMessageContainerNode(
    node: LexicalNode | null | undefined,
): node is MessageContainerNode {
    return node instanceof MessageContainerNode;
}