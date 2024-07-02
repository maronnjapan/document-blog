/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
    $applyNodeReplacement,
    type DOMConversionMap,
    type DOMConversionOutput,
    type DOMExportOutput,
    type EditorConfig,
    type LexicalNode,
    type NodeKey,
    type SerializedTextNode,
    type Spread,
    TextNode,
    ElementNode,
    SerializedElementNode,
} from 'lexical';

export type SerializedMentionNode = Spread<{ desidedText?: string }, SerializedElementNode>


function $convertMentionElement(
    domNode: HTMLElement,
): DOMConversionOutput | null {
    const textContent = domNode.textContent;

    if (textContent !== null) {
        const node = $createMentionNode();
        return {
            node,
        };
    }

    return null;
}

function $convertDisableMentionElement(
    domNode: HTMLElement,
): DOMConversionOutput {
    const node = $createDisableMentionNode()
    return {
        node,
    };
}

export class MentionNode extends ElementNode {
    __desidedText?: string
    static getType(): string {
        return 'mention';
    }

    static clone(node: MentionNode): MentionNode {
        return new MentionNode(
            node.__desidedText,
            node.__key,
        );
    }

    constructor(desidedText?: string, key?: NodeKey) {
        super(key);
        this.__desidedText = desidedText ?? undefined;
    }

    createDOM(config: EditorConfig): HTMLSpanElement {
        const element = document.createElement('span');
        element.setAttribute('data-lexical-mention', 'true');
        element.style.color = 'blue'
        return element;
    }

    updateDOM() {
        return false
    }


    static importDOM(): DOMConversionMap | null {
        return {
            span: (node: Node) => ({
                conversion: $convertMentionElement,
                priority: 0,
            }),
        };
    }

    static importJSON(
        serializedNode: SerializedMentionNode,
    ): MentionNode {
        const node = $createMentionNode(serializedNode.desidedText);
        return node;
    }

    exportJSON(): SerializedMentionNode {
        return {
            ...super.exportJSON(),
            desidedText: this.getDesidedText(),
            type: 'mention',
            version: 1,
        }
    }

    isInline(): boolean {
        return true;
    }

    setDesidedText(arg: string | undefined) {
        const writable = this.getWritable()
        writable.__desidedText = arg
    }

    getDesidedText() {
        return this.__desidedText;
    }
}

export function $createMentionNode(desidedText?: string): MentionNode {
    const mentionNode = new MentionNode(desidedText);
    return $applyNodeReplacement(mentionNode);
}

export function $isMentionNode(
    node: LexicalNode | null | undefined,
): node is MentionNode {
    return node instanceof MentionNode;
}


export type SerializedDisableMentionNode = SerializedElementNode;
export class DisableMentionNode extends ElementNode {
    static getType(): string {
        return 'disable-mention';
    }
    static clone(node: MentionNode): DisableMentionNode {
        return new DisableMentionNode(
            node.__key,
        );
    }

    updateDOM() {
        return false
    }


    static importDOM(): DOMConversionMap | null {
        return {
            span: (node: Node) => ({
                conversion: $convertDisableMentionElement,
                priority: 0,
            }),
        };
    }

    static importJSON(
        serializedNode: SerializedDisableMentionNode,
    ): DisableMentionNode {
        const node = $createDisableMentionNode();
        return node;
    }


    constructor(key?: NodeKey) {
        super(key);
    }

    createDOM(config: EditorConfig): HTMLSpanElement {
        const element = document.createElement('span');
        element.setAttribute('data-lexical-disable-mention', 'true');
        return element;
    }

    exportJSON(): SerializedDisableMentionNode {
        return {
            ...super.exportJSON(),
            type: 'disable-mention',
            version: 1,
        }
    }
    isInline(): true {
        return true;
    }

}

export function $createDisableMentionNode(): DisableMentionNode {
    const disableMentionNode = new DisableMentionNode();
    return $applyNodeReplacement(disableMentionNode);
}

export function $isDisableMentionNode(
    node: LexicalNode | null | undefined,
): node is DisableMentionNode {
    return node instanceof DisableMentionNode;
}