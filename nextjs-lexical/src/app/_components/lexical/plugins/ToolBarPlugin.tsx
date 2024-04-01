'use client';
import styles from "../styles/Toolbar.module.css";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, TextNode, ElementNode } from "lexical";
import { $createCodeNode, CODE_LANGUAGE_FRIENDLY_NAME_MAP, $isCodeNode } from "@lexical/code";
import { $createHeadingNode, $createQuoteNode, HeadingTagType, $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import {
    INSERT_ORDERED_LIST_COMMAND,
    INSERT_UNORDERED_LIST_COMMAND,
    INSERT_CHECK_LIST_COMMAND,
    $isListNode,
    ListNode,
    ListType
} from '@lexical/list';
import { $setBlocksType } from "@lexical/selection";
import { useCallback, useEffect, useState } from "react";
import { TbChecklist, TbCode, TbH1, TbH2, TbH3, TbList, TbListNumbers, TbQuote, TbSelect } from "react-icons/tb";
import { CODE_LANGUAGE_COMMAND } from "./CodeHighlightPlugin";

const HeadingBlocks: { [key in HeadingTagType]: string } = {
    h1: "Heading 1",
    h2: "Heading 2",
    h3: "Heading 3",
    h4: "Heading 4",
    h5: "Heading 5",
    h6: "Heading 6",
}
const ListBlocks: { [key in ListType]: string } = {
    number: "Number List",
    bullet: 'Bullet List',
    check: 'Check List',
}
const SupportedBlocks = {
    ...HeadingBlocks,
    ...ListBlocks,
    paragraph: "Paragraph",
    quote: "Quote",
    code: "Code Block",
} as const;
type BlockType = keyof typeof SupportedBlocks;

const convertPropertiesToUnionList = <T extends { [key in string]: unknown }>(object: T): (keyof T)[] => Object.keys(object)

const CodeLanguagesOptions = Object.entries(CODE_LANGUAGE_FRIENDLY_NAME_MAP).map(
    ([value, label]) => ({ value, label })
);

export default function ToolBarPlugin() {
    const [blockType, setBlockType] = useState<BlockType>("paragraph");
    const [codeLanguage, setCodeLanguage] = useState('');
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) return;

                const anchorNode = selection.anchor.getNode()
                const targetNode =
                    anchorNode.getKey() === "root"
                        ? anchorNode
                        : anchorNode.getTopLevelElementOrThrow();


                if ($isHeadingNode(targetNode)) return setBlockType(targetNode.getTag())
                if ($isQuoteNode(targetNode)) return setBlockType('quote')
                if ($isListNode(targetNode)) return setBlockType(targetNode.getListType())
                if ($isCodeNode(targetNode)) {
                    setBlockType('code')
                    return setCodeLanguage(targetNode.getLanguage() ?? '')
                }
                const supportedBlockTypes = convertPropertiesToUnionList(SupportedBlocks);
                const targetKey = supportedBlockTypes.find(type => type === targetNode.getKey())
                setBlockType(targetKey ?? 'paragraph');
            });
        });
    }, [editor]);

    const formatQuote = useCallback(() => {
        if (blockType !== 'quote') {
            editor.update(() => {
                const selection = $getSelection()
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createQuoteNode())
                }
            })
        }
    }, [blockType, editor])

    const formatHeading = useCallback((type: HeadingTagType) => {
        if (blockType !== type) {
            editor.update(() => {
                const selection = $getSelection()
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createHeadingNode(type))
                }
            })
        }
    }, [blockType, editor])

    const formatCodeHightlight = useCallback(() => {
        if (blockType !== 'code') {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    $setBlocksType(selection, () => $createCodeNode());
                }
            });
        }
    }, [blockType, editor])

    const formatBulletList = useCallback(() => {
        if (blockType !== "bullet") {
            editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        }
    }, [blockType, editor]);

    const formatNumberedList = useCallback(() => {
        if (blockType !== "number") {
            editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        }
    }, [blockType, editor]);

    const formatCheckList = useCallback(() => {
        if (blockType !== "check") {
            editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
        }
    }, [blockType, editor]);


    return (
        <div className={styles.toolbar}>
            <button
                type="button"
                role="checkbox"
                title={SupportedBlocks['h1']}
                aria-label={SupportedBlocks['h1']}
                aria-checked={blockType === 'h1'}
                onClick={() => formatHeading("h1")}
            >
                <TbH1></TbH1>
            </button>
            <button
                type="button"
                role="checkbox"
                title={SupportedBlocks['h2']}
                aria-label={SupportedBlocks['h2']}
                aria-checked={blockType === 'h2'}
                onClick={() => formatHeading("h2")}
            >
                <TbH2></TbH2>
            </button>
            <button
                type="button"
                role="checkbox"
                title={SupportedBlocks['h3']}
                aria-label={SupportedBlocks['h3']}
                aria-checked={blockType === 'h3'}
                onClick={() => formatHeading("h3")}
            >
                <TbH3></TbH3>
            </button>
            <button
                type="button"
                role="checkbox"
                title={SupportedBlocks['quote']}
                aria-label={SupportedBlocks['quote']}
                aria-checked={blockType === 'quote'}
                onClick={() => formatQuote()}
            >
                <TbQuote />
            </button>
            <button
                type="button"
                role="checkbox"
                title={SupportedBlocks['number']}
                aria-label={SupportedBlocks['number']}
                aria-checked={blockType === 'number'}
                onClick={() => formatNumberedList()}
            >
                <TbListNumbers />
            </button>
            <button
                type="button"
                role="checkbox"
                title={SupportedBlocks['bullet']}
                aria-label={SupportedBlocks['bullet']}
                aria-checked={blockType === 'bullet'}
                onClick={() => formatBulletList()}
            >
                <TbList />
            </button>
            <button
                type="button"
                role="checkbox"
                title={SupportedBlocks['check']}
                aria-label={SupportedBlocks['check']}
                aria-checked={blockType === 'check'}
                onClick={() => formatCheckList()}
            >
                <TbChecklist />
            </button>
            <button
                type="button"
                role="checkbox"
                title={SupportedBlocks['code']}
                aria-label={SupportedBlocks['code']}
                aria-checked={blockType === 'code'}
                onClick={() => formatCodeHightlight()}
            >
                <TbCode />
            </button>
            {blockType === "code" && (
                <div className={styles.select}>
                    <select
                        aria-label="code languages"
                        value={codeLanguage}
                        onChange={event =>
                            editor.dispatchCommand(CODE_LANGUAGE_COMMAND, event.target.value)
                        }>
                        <option value="">言語を選択</option>
                        {CodeLanguagesOptions.map(item => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                    <TbSelect />
                </div>
            )}
        </div>
    )
}