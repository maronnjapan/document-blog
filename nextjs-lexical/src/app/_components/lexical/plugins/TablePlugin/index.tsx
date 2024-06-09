import { TablePlugin as LexicalTablePlugin } from '@lexical/react/LexicalTablePlugin'
import TableCellBtn from './TableCellBtn';
import TableCellResizerPlugin from './TableCellResizer';
import dynamic from 'next/dynamic';

const TableResizePlugin = dynamic(() => import('./TableCellResizer'), { ssr: false });


export default function TablePlugin({ anchorElm }: { anchorElm?: HTMLElement | null }) {
  return <>
    <TableCellBtn anchorElm={anchorElm}></TableCellBtn>
    <TableResizePlugin></TableResizePlugin>
    <LexicalTablePlugin></LexicalTablePlugin>
  </>
}