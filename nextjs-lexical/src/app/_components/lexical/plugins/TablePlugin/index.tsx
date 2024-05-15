import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { TablePlugin as LexicalTablePlugin } from '@lexical/react/LexicalTablePlugin'
import { CSSProperties, HTMLAttributes, useCallback, useEffect, useState } from 'react';
import { $getTableCellNodeFromLexicalNode } from '@lexical/table'
import { $getSelection, $isRangeSelection } from 'lexical';
import { createPortal } from 'react-dom';
import { TbChevronDown } from 'react-icons/tb';
import TableCellBtn from './TableCellBtn';


export default function TablePlugin({ anchorElm }: { anchorElm?: HTMLElement | null }) {


  return <>
    <TableCellBtn anchorElm={anchorElm}></TableCellBtn>
    <LexicalTablePlugin></LexicalTablePlugin>
  </>
}