import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { TableNode, $createTableRowNode, $isTableRowNode, TableRowNode, $createTableCellNode, TableCellNode, $isTableCellNode, $deleteTableRow__EXPERIMENTAL, $deleteTableColumn__EXPERIMENTAL, $insertTableColumn__EXPERIMENTAL, $insertTableRow__EXPERIMENTAL, $getTableCellNodeFromLexicalNode, $isTableSelection } from '@lexical/table'
import { $createParagraphNode, $getSelection, $isRangeSelection } from 'lexical';
import { useCallback } from 'react';


type HandleTableNodeMenuProps = {
    tableNode: TableNode | null;
    nowRowIndex: number;
    nowColumnIndex: number;
}

export default function HandleTableNodeMenu({ nowColumnIndex, nowRowIndex, tableNode }: HandleTableNodeMenuProps) {
    const [editor] = useLexicalComposerContext();

    const changeCellToHeader = useCallback(() => {
        changeCell(1)
    }, [editor])

    const changeCellToBody = useCallback(() => {
        changeCell(0)
    }, [editor])

    const changeCell = (haderState: 0 | 1) => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const tableCellNodeFromSelection = $getTableCellNodeFromLexicalNode(
                    selection.anchor.getNode(),
                );
                if (!tableCellNodeFromSelection) {
                    return;
                }

                tableCellNodeFromSelection.setHeaderStyles(haderState)

            }
        })
    }

    const insertRow = (tableRowNode: TableRowNode) => {
        const newTableRowNode = $createTableRowNode();

        const cellNodes = tableRowNode.getChildren().filter((c): c is TableCellNode => $isTableCellNode(c))
        const newCellNodes = cellNodes.map((cellNode) => $createTableCellNode(cellNode.__headerState).append($createParagraphNode()))

        newCellNodes.forEach(val => {
            newTableRowNode.append(val)
        })
        newTableRowNode.getChildren().filter((c): c is TableCellNode => $isTableCellNode(c)).forEach((cell, index) => {
            cell.setBackgroundColor(cellNodes[index].getBackgroundColor())
        })
        tableRowNode.insertAfter(newTableRowNode)
    }

    const insertRowAfter = () => {
        editor.update(() => {
            if (tableNode) {
                const children = tableNode.getChildren().filter((item): item is TableRowNode => $isTableRowNode(item))
                insertRow(children[nowRowIndex])
            }
        })
    }

    const insertLastRow = () => {
        editor.update(() => {
            if (tableNode) {
                const children = tableNode.getChildren().filter((item): item is TableRowNode => $isTableRowNode(item))
                insertRow(children[children.length - 1])
            }
        })
    }

    const deleteRow = () => {
        editor.update(() => {
            if (!tableNode) {
                return
            }

            if (tableNode.__size === 1) {
                return tableNode.remove()
            }
            $deleteTableRow__EXPERIMENTAL()

            const rowNodes = tableNode.getChildren().filter((c): c is TableRowNode => $isTableRowNode(c))
            rowNodes.forEach((item, rowNodeIndex) => {

                if (rowNodeIndex !== nowRowIndex && nowRowIndex < rowNodes.length) {
                    return;
                }

                item.getChildren().filter((c): c is TableCellNode => $isTableCellNode(c)).forEach((val, index) => {
                    if (index === nowColumnIndex) {
                        val.select()
                        return;
                    }
                })
            })
        })
    }

    const deleteColumn = () => {
        editor.update(() => {
            if (!tableNode) {
                return
            }
            $deleteTableColumn__EXPERIMENTAL()
        })
    }

    const insertColumn = () => {
        editor.update(() => {
            if (tableNode) {
                const children = tableNode.getChildren().filter((item): item is TableNode => $isTableRowNode(item))
                children.forEach(rowNode => {
                    const cellNodes = rowNode.getChildren().filter((item): item is TableCellNode => $isTableCellNode(item))
                    cellNodes[nowColumnIndex].insertAfter($createTableCellNode(cellNodes[nowColumnIndex].__headerState).append($createParagraphNode()))
                })
            }
        })
    }

    const insertLastColumn = () => {
        editor.update(() => {
            if (tableNode) {
                const children = tableNode.getChildren().filter((item): item is TableNode => $isTableRowNode(item))
                children.forEach(rowNode => {
                    const cellNodes = rowNode.getChildren().filter((item): item is TableCellNode => $isTableCellNode(item))
                    cellNodes[cellNodes.length - 1].insertAfter($createTableCellNode(cellNodes[nowColumnIndex].__headerState).append($createParagraphNode()))
                })
            }
        })
    }

    const deleteTable = () => {
        editor.update(() => {
            if (tableNode) {
                tableNode.remove()
            }
        })
    }

    return (
        <div className={`border rounded top-full bg-white min-w-32`} >
            <button onClick={() => changeCellToHeader()} className="p-2 cursor-pointer hover:bg-blue-200 flex items-center justify-center w-full"><span className="text-black text-xs">ヘッダーに変換</span></button>
            <button onClick={() => changeCellToBody()} className="p-2 cursor-pointer hover:bg-blue-200 flex items-center justify-center w-full"><span className="text-black text-xs">ボディに変換</span></button>
            <button onClick={() => insertRowAfter()} className="p-2 cursor-pointer hover:bg-blue-200 flex items-center justify-center w-full"><span className="text-black text-xs">行を挿入</span></button>
            <button onClick={() => insertColumn()} className="p-2 cursor-pointer hover:bg-blue-200 flex items-center justify-center w-full"><span className="text-black text-xs">列を挿入</span></button>
            <button onClick={() => insertLastRow()} className="p-2 cursor-pointer hover:bg-blue-200 flex items-center justify-center w-full"><span className="text-black text-xs">最下部に行を挿入</span></button>
            <button onClick={() => insertLastColumn()} className="p-2 cursor-pointer hover:bg-blue-200 flex items-center justify-center w-full"><span className="text-black text-xs">最後尾に列を挿入</span></button>
            <button onClick={() => deleteRow()} className="p-2 cursor-pointer hover:bg-blue-200 flex items-center justify-center w-full"><span className="text-black text-xs">行を削除</span></button>
            <button onClick={() => deleteColumn()} className="p-2 cursor-pointer hover:bg-blue-200 flex items-center justify-center w-full"><span className="text-black text-xs">列を削除</span></button>
            <button onClick={() => deleteTable()} className="p-2 cursor-pointer hover:bg-blue-200 flex items-center justify-center w-full"><span className="text-black text-xs">表を削除</span></button>
        </div>
    )
}