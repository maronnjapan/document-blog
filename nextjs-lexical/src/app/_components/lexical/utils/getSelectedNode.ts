
import { $isAtNodeEnd } from '@lexical/selection';
import { ElementNode, RangeSelection, TextNode } from 'lexical';

export function getSelectedNode(
    selection: RangeSelection,
): TextNode | ElementNode {
    const anchor = selection.anchor;
    const focus = selection.focus;
    // 元々キャレットがいた位置について
    const anchorNode = selection.anchor.getNode();
    // 範囲選択の終端の位置について
    const focusNode = selection.focus.getNode();

    // キャレットの位置と範囲選択の位置が同じ=とくに文字列の範囲選択をしていない。
    if (anchorNode === focusNode) {
        // anchorにあるNodeを返す
        return anchorNode;
    }
    // 後ろから前への選択か前から後ろへの選択かを示す
    const isBackward = selection.isBackward();
    if (isBackward) {
        // $isAtNodeEndのソースコード(https://github.com/facebook/lexical/blob/2194888d29d69df74e5acae07bdec5c6f50ac6a0/packages/lexical-selection/src/lexical-node.ts#L153)
        // Q.NodeとNodeの間は前のNodeの値になるということ？
        return $isAtNodeEnd(focus) ? anchorNode : focusNode;
    } else {
        // NodeとNodeの間は選択している側の勝ちになるから、操作感と外れる。
        // なので、$isAtNodeEndがtrueの時はキャレットの後ろのNodeにする
        return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
    }
}