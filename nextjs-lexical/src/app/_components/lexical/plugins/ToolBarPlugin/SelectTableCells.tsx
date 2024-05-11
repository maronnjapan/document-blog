import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import React, { KeyboardEvent, useCallback, useState } from 'react';
import { INSERT_TABLE_COMMAND } from '@lexical/table'
import { BlockType } from '.';

type SelectTableCellsProps = {
    blockType: BlockType;
}

const SelectTableCells = ({ blockType }: SelectTableCellsProps) => {
    const [selectedRow, setSelectedRow] = useState<number>(0);
    const [selectedColumn, setSelectedColumn] = useState<number>(0);
    const rows = 5;
    const columns = 5;

    const [editor] = useLexicalComposerContext();

    const handleMouseDown = (rowIndex: number, colIndex: number) => {
        setSelectedRow(() => rowIndex)
        setSelectedColumn(() => colIndex)
    };

    const handleMouseEnter = (rowIndex: number, colIndex: number) => {
        setSelectedRow(() => rowIndex)
        setSelectedColumn(() => colIndex)
    };

    const isSelected = (rowIndex: number, colIndex: number) => {
        return selectedRow >= rowIndex && selectedColumn >= colIndex;
    };

    const insertTable = useCallback((row: number, column: number) => {
        editor.update(() => {
            if (blockType !== 'table') {
                editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns: `${column}`, rows: `${row}` })
            }
        });
    }, [editor]);

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            insertTable(selectedRow, selectedColumn)
        }
    }


    const rowsIndex = [...Array(rows)].map((_, rowIndex) => rowIndex + 1);
    const columsIndex = [...Array(columns)].map((_, colIndex) => colIndex + 1)

    return (
        <div className='grid rounded p-2 gap-2 border-2 bg-white' style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }} onClick={() => insertTable(selectedRow, selectedColumn)}>
            {rowsIndex.map((rowIndex) => (
                columsIndex.map((colIndex) => (
                    <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`w-[20px] h-[20px] border border-black cursor-pointer ${isSelected(rowIndex, colIndex) ? 'bg-blue-300' : 'bg-white'}`}
                        onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                        onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                        onKeyDown={handleKeyDown}
                    />
                ))
            ))}
        </div>
    );
};

export default SelectTableCells;