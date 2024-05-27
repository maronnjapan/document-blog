import { TablePlugin as LexicalTablePlugin } from '@lexical/react/LexicalTablePlugin'
import TableCellBtn from './TableCellBtn';
import TableCellResizerPlugin from './TableCellResizer';


export default function TablePlugin({ anchorElm }: { anchorElm?: HTMLElement | null }) {
  return <>
    <TableCellBtn anchorElm={anchorElm}></TableCellBtn>
    <TableCellResizerPlugin></TableCellResizerPlugin>
    <LexicalTablePlugin></LexicalTablePlugin>
  </>
}