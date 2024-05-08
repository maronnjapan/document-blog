/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
    $applyNodeReplacement,
    $createLineBreakNode,
    $createParagraphNode,
    $createTextNode,
    $isTextNode,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    ElementNode,
    LexicalNode,
    ParagraphNode,
    RangeSelection,
    SerializedElementNode,
    Spread,
    TextNode,
} from 'lexical';
import styles from './styles/style.module.css';

export type MessageTypes = '' | 'alert' | 'warning'
type SerializedMessageContentNode = Spread<{ messageType: MessageTypes }, SerializedElementNode>;

export class MessageContentNode extends ElementNode {
    _messageType: MessageTypes;

    static getType(): string {
        return 'message-content';
    }

    static clone(node: MessageContentNode): MessageContentNode {
        return new MessageContentNode(node._messageType);
    }

    constructor(messageType?: MessageTypes, key?: string) {
        super(key)
        this._messageType = messageType ?? '';
    }

    createDOM(config: EditorConfig): HTMLElement {
        const dom = document.createElement('aside');
        dom.classList.add(styles.Message__content);


        if (this.getMessageType() === 'alert') {
            dom.classList.add(styles.Message__content_alert)
        }
        if (this.getMessageType() === 'warning') {
            dom.classList.add(styles.Message__content_warning)
        }
        return dom;
    }

    updateDOM(): boolean {
        return false;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('div');
        element.classList.add(styles.Message__content);
        element.setAttribute('data-lexical-message-content', 'true');
        return { element };
    }

    static importJSON(
        serializedNode: SerializedMessageContentNode,
    ): MessageContentNode {
        return $createMessageContentNode(serializedNode.messageType);
    }

    isShadowRoot(): boolean {
        return false;
    }

    exportJSON(): SerializedMessageContentNode {
        return {
            ...super.exportJSON(),
            messageType: this.getMessageType(),
            type: 'message-content',
            version: 1,
        };
    }

    getMessageType() {
        return this._messageType;
    }

    // 改行する時の挙動を制御
    insertNewAfter(
        selection: RangeSelection,
        restoreSelection = true,
    ): null | ParagraphNode | MessageContentNode {
        const children = this.getChildren();
        const childrenLength = children.length;

        // 後ろ行二つが空に続いている状態で改行をした時の挙動を制御
        // Messageノードを解除して、新規のParagraphノードを挿入している
        if (
            childrenLength >= 2 &&
            children[childrenLength - 1].getTextContent() === '\n' &&
            children[childrenLength - 2].getTextContent() === '\n' &&
            selection.isCollapsed() &&
            selection.anchor.key === this.__key &&
            selection.anchor.offset === childrenLength
        ) {
            children[childrenLength - 1].remove();
            children[childrenLength - 2].remove();
            const newElement = $createParagraphNode();
            this.insertAfter(newElement, restoreSelection);
            return newElement;
        }

        // If the selection is within the codeblock, find all leading tabs and
        // spaces of the current line. Create a new line that has all those
        // tabs and spaces, such that leading indentation is preserved.
        const { anchor, focus } = selection;
        const firstPoint = anchor.isBefore(focus) ? anchor : focus;
        const firstSelectionNode = firstPoint.getNode();

        // 文字列が存在する時のEnterの挙動
        if ($isTextNode(firstSelectionNode)) {
            let node = firstSelectionNode

            const insertNodes = [];
            while (true) {
                if ($isTextNode(node)) {
                    insertNodes.push($createTextNode());
                    const nextNode = node.getNextSibling<TextNode>();
                    if (!nextNode) { break }
                    node = nextNode
                } else {
                    break;
                }
            }
            const split = firstSelectionNode.splitText(anchor.offset)[0];
            const x = anchor.offset === 0 ? 0 : 1;
            const index = split.getIndexWithinParent() + x;
            const codeNode = firstSelectionNode.getParentOrThrow();
            const nodesToInsert = [$createLineBreakNode(), ...insertNodes];
            codeNode.splice(index, 0, nodesToInsert);
            // キャメルを改行後の行に移行する
            const last = insertNodes[insertNodes.length - 1];
            if (last) {
                last.select();
            } else if (anchor.offset === 0) {
                split.selectPrevious();
            } else {
                split.getNextSibling()!.selectNext(0, 0);
            }
        }

        // 文字列がない行での改行した時の挙動を制御
        if ($isMessageContentNode(firstSelectionNode)) {
            const { offset } = selection.anchor;
            firstSelectionNode.splice(offset, 0, [$createLineBreakNode()]);
            firstSelectionNode.select(offset + 1, offset + 1);
        }

        return null;
    }

}

export function $createMessageContentNode(messageType?: MessageTypes): MessageContentNode {
    return $applyNodeReplacement(new MessageContentNode(messageType));
}

export function $isMessageContentNode(
    node: LexicalNode | null | undefined,
): node is MessageContentNode {
    return node instanceof MessageContentNode;
}