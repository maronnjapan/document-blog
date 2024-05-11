'use client';
import styles from "./styles/Toolbar.module.css";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $insertNodes, $isRangeSelection } from "lexical";
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
import { useCallback, useEffect, useRef, useState } from "react";
import { TbAlertCircle, TbChecklist, TbChevronDown, TbCode, TbFile, TbH1, TbH2, TbH3, TbList, TbListNumbers, TbQuote, TbSelect, TbSquareToggle, TbTable } from "react-icons/tb";
import { CODE_LANGUAGE_COMMAND } from "../CodeHighlightPlugin";
import { INSERT_IMAGE_COMMAND } from "../InserImagePlugin/command";
import { INSERT_COLLAPSIBLE_COMMAND } from "../CollapsiblePlugin";
import { $createMessageContentNode, $isMessageContentNode, MessageTypes } from "../MessagePlugin/content-node";
import { $isCollapsibleContainerNode } from "../CollapsiblePlugin/container-node";
import { $isCollapsibleContentNode } from "../CollapsiblePlugin/content-node";
import { INSERT_TABLE_COMMAND, $isTableRowNode, $isTableCellNode } from '@lexical/table'
import SelectTableCells from "./SelectTableCells";

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
    collapse: "Toggle",
    message: "Message",
    file: "Upload File",
    table: "table"
} as const;
export type BlockType = keyof typeof SupportedBlocks;

const convertPropertiesToUnionList = <T extends { [key in string]: unknown }>(object: T): (keyof T)[] => Object.keys(object)

const CodeLanguagesOptions = Object.entries(CODE_LANGUAGE_FRIENDLY_NAME_MAP).map(
    ([value, label]) => ({ value, label })
);

export default function ToolBarPlugin() {
    const [blockType, setBlockType] = useState<BlockType>("paragraph");
    const [codeLanguage, setCodeLanguage] = useState('');
    const [editor] = useLexicalComposerContext();
    const fileInput = useRef<HTMLInputElement>(null)
    const [isShowTableInsertElm, setIsShowTableInsertElm] = useState(false);
    const [isShowMessageInsertElm, setIsShowMessageInsertElm] = useState(false);

    // classNameに書くとTailwindの補完が効いてしまうので、外だし。
    const isShowTableInsertButton = blockType !== 'table'

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
                if ($isCollapsibleContainerNode(targetNode) || $isCollapsibleContentNode(targetNode.getParent())) return setBlockType('collapse')
                if ($isMessageContentNode(targetNode)) return setBlockType('message')
                if ($isTableCellNode(targetNode.getParent()) || $isTableRowNode(targetNode.getParent())) return setBlockType('table');
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

    const formatToggle = useCallback(() => {
        if (blockType !== "collapse") {
            editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined)
        }
    }, [blockType, editor]);

    const formatMessage = useCallback((messageType: MessageTypes) => {
        if (blockType !== "message") {
            editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    console.log(messageType)
                    $setBlocksType(selection, () => $createMessageContentNode(messageType));
                }
            });
        }
    }, [blockType, editor]);
    const clickInsertMessageSelect = (messageType: MessageTypes) => {
        formatMessage(messageType)
        setIsShowMessageInsertElm(() => false)
    }

    const formatTable = useCallback(() => {
        if (blockType !== "table") {
            editor.update(() => {
                editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: '3', rows: '3' })
            });
        }
    }, [blockType, editor]);

    const clickFileInput = () => {
        const fileInputRef = fileInput.current;
        if (fileInputRef) { fileInputRef.click() }
    }

    const loadImage = (files: FileList | null) => {
        const reader = new FileReader();

        if (files !== null) {
            reader.readAsDataURL(files[0]);
            const file = files[0]

            reader.onload = function () {
                if (typeof reader.result === 'string') {
                    editor.update(() => {
                        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                            altText: file.name,
                            src: reader.result?.toString() ?? ''
                        });
                    });
                }
            };


        }
    };


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
            <button
                type="button"
                role="checkbox"
                title={SupportedBlocks['collapse']}
                aria-label={SupportedBlocks['collapse']}
                aria-checked={blockType === 'collapse'}
                onClick={() => formatToggle()}
            >
                <TbSquareToggle />
            </button>
            <div className="flex">
                <button
                    type="button"
                    role="checkbox"
                    title={SupportedBlocks['message']}
                    aria-label={SupportedBlocks['message']}
                    aria-checked={blockType === 'message'}
                    onClick={() => formatMessage('')}
                >
                    <TbAlertCircle />
                </button>
                <div className="relative">
                    <button
                        type="button"
                        role="checkbox"
                        title={SupportedBlocks['message']}
                        aria-label={SupportedBlocks['message']}
                        aria-checked={blockType === 'message'}
                        onClick={() => setIsShowMessageInsertElm(prev => !prev)}
                        className={`w-4 ${blockType !== 'message' ? '' : 'hidden'}`}
                    >
                        <TbChevronDown />
                    </button>
                    <div className={`absolute border rounded top-full z-20 bg-white w-28 ${isShowMessageInsertElm ? '' : 'hidden'}`} onMouseLeave={() => setIsShowMessageInsertElm(() => false)}>
                        <button onClick={() => clickInsertMessageSelect('')} className="p-2 cursor-pointer hover:bg-blue-200 flex items-center justify-center w-full"><span className="text-black text-xs">Normal</span></button>
                        <button onClick={() => clickInsertMessageSelect('warning')} className="p-2 cursor-pointer hover:bg-blue-200 flex items-center justify-center w-full"><span className="text-black text-xs">Warning</span></button>
                        <button onClick={() => clickInsertMessageSelect('alert')} className="p-2 cursor-pointer hover:bg-blue-200 flex items-center justify-center w-full"><span className="text-black text-xs">Alert</span></button>
                    </div>
                </div>
            </div>
            <div className="flex">
                <button
                    type="button"
                    role="checkbox"
                    title={SupportedBlocks['table']}
                    aria-label={SupportedBlocks['table']}
                    aria-checked={blockType === 'table'}
                    onClick={() => formatTable()}
                >
                    <TbTable />
                </button>
                <div className="relative">
                    <button
                        type="button"
                        role="checkbox"
                        title={SupportedBlocks['table']}
                        aria-label={SupportedBlocks['table']}
                        aria-checked={blockType === 'table'}
                        onClick={() => setIsShowTableInsertElm((prev) => !prev)}
                        className={`w-4 ${isShowTableInsertButton ? '' : 'hidden'}`}
                    >
                        <TbChevronDown />
                    </button>
                    <div className={`absolute top-full z-20 ${isShowTableInsertElm ? '' : 'hidden'}`}
                        onClick={() => setIsShowTableInsertElm(() => false)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                setIsShowTableInsertElm(() => false)
                            }
                        }}
                        onMouseLeave={() => setIsShowTableInsertElm(() => false)}
                    >
                        <SelectTableCells key={`${isShowTableInsertElm}`} blockType={blockType}></SelectTableCells>

                    </div>
                </div>
            </div>
            <button
                type="button"
                role="checkbox"
                title={SupportedBlocks['file']}
                aria-label={SupportedBlocks['file']}
                aria-checked={blockType === 'file'}
                onClick={clickFileInput}
            >
                <TbFile></TbFile>
            </button>
            <input id="file-upload" type='file' ref={fileInput} className={styles["file-input"]}
                onChange={(e) => loadImage(e.target.files)} />
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