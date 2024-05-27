'use client'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import { $getTableCellNodeFromLexicalNode, $getTableRowIndexFromTableCellNode, $getTableColumnIndexFromTableCellNode, TableNode, $isTableNode } from '@lexical/table'
import { $getSelection, $isRangeSelection } from 'lexical';
import { createPortal } from 'react-dom';
import { TbChevronDown } from 'react-icons/tb';
import HandleTableNodeMenu from './HandleTableNodeMenu';


export default function TableCellBtn({ anchorElm }: { anchorElm?: HTMLElement | null }) {
    const [editor] = useLexicalComposerContext();
    const [cellDom, setCellDom] = useState<HTMLElement | null>(null);
    const [tableNode, setTableNode] = useState<TableNode | null>(null)
    const [nowColumnIndex, setNowColumnIndex] = useState(0);
    const [nowRowIndex, setNowRowIndex] = useState(0)
    const [isShowMenu, setIsShowMenu] = useState(false)
    const buttonElm = useRef<HTMLButtonElement | null>(null)

    const setCellElm = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const tableCellNodeFromSelection = $getTableCellNodeFromLexicalNode(
                selection.anchor.getNode(),
            );
            if (!tableCellNodeFromSelection) {
                setCellDom(() => null);
                return;
            }

            const columnIndex = $getTableColumnIndexFromTableCellNode(tableCellNodeFromSelection);
            const rowIndex = $getTableRowIndexFromTableCellNode(tableCellNodeFromSelection)
            setNowColumnIndex(() => columnIndex);
            setNowRowIndex(() => rowIndex)

            const parentTableNode = tableCellNodeFromSelection.getParent()?.getParent();
            if ($isTableNode(parentTableNode)) {
                setTableNode(() => parentTableNode);
            }

            const tableCellDom = editor.getElementByKey(tableCellNodeFromSelection.getKey());
            if (!tableCellDom) { return }

            setCellDom(() => tableCellDom);
        }
    }, [editor])

    useEffect(() => {
        return editor.registerUpdateListener(() => {
            editor.getEditorState().read(() => {
                setCellElm()
            });
        });
    }, []);


    const createElm = (cellElm: HTMLElement | null) => {
        if (!anchorElm || !cellElm) {
            removeCellToggleElm()
            return null
        }
        const top = cellElm.getBoundingClientRect().top - anchorElm.getBoundingClientRect().top;
        const left = cellElm.getBoundingClientRect().left - anchorElm.getBoundingClientRect().left
        const styles: CSSProperties = {
            top: `${top}px`,
            left: `${left}px`,
            transform: `translate(${cellElm.getBoundingClientRect().width - 22.5}px,0px)`,
            position: 'absolute',
            zIndex: 1,
            borderRadius: '8px',
            backgroundColor: '#efefef',
            display: 'flex',
            width: '15px',
            height: '15px',
            alignItems: 'center',
            justifyContent: 'center'
        }


        return createPortal(
            <>
                <button onClick={() => setIsShowMenu(prev => !prev)} style={styles} ref={buttonElm}><TbChevronDown size={10}></TbChevronDown></button>
                <div className={`absolute z-30`} style={{
                    top: `${top}px`,
                    left: `${left + cellElm.clientWidth}px`,
                }}>
                    <div className={`${isShowMenu ? '' : 'hidden'}`} onClick={() => setIsShowMenu(() => false)}>
                        <HandleTableNodeMenu nowColumnIndex={nowColumnIndex} nowRowIndex={nowRowIndex} tableNode={tableNode}></HandleTableNodeMenu>
                    </div>
                </div>
            </>,
            anchorElm)
    }

    const removeCellToggleElm = () => {
        const cellElm = buttonElm.current
        if (!cellElm) { return; }
        cellElm.style.display = 'none'
    }

    return <>
        {createElm(cellDom)}
    </>
}