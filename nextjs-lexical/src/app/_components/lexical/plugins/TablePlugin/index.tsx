import { TablePlugin as LexicalTablePlugin } from '@lexical/react/LexicalTablePlugin'
import TableCellBtn from './TableCellBtn';


export default function TablePlugin({ anchorElm }: { anchorElm?: HTMLElement | null }) {
  return <>
    <TableCellBtn anchorElm={anchorElm}></TableCellBtn>
    <LexicalTablePlugin></LexicalTablePlugin>
  </>
}