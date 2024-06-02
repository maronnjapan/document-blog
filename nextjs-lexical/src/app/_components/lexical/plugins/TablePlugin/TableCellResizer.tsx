'use client'
import type { TableDOMCell } from '@lexical/table';
import type { LexicalEditor } from 'lexical';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import useLexicalEditable from '@lexical/react/useLexicalEditable';
import {
    $getTableColumnIndexFromTableCellNode,
    $getTableNodeFromLexicalNodeOrThrow,
    $getTableRowIndexFromTableCellNode,
    $isTableCellNode,
    $isTableRowNode,
    getDOMCellFromTarget,
    TableCellNode,
} from '@lexical/table';
import { calculateZoomLevel } from '@lexical/utils';
import { $getNearestNodeFromDOMNode } from 'lexical';
import * as React from 'react';
import {
    MouseEventHandler,
    ReactPortal,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { createPortal } from 'react-dom';
import { position } from '@chakra-ui/react';

// マウスの位置
type MousePosition = {
    x: number;
    y: number;
};

// テーブルのサイズ変更方向
type MouseDraggingDirection = 'right' | 'bottom';

// セルの最小の高さと羽場
const MIN_ROW_HEIGHT = 33;
const MIN_COLUMN_WIDTH = 50;

function TableCellResizer({ editor }: { editor: LexicalEditor }): JSX.Element {
    // Q.テーブル全体の要素？
    const targetRef = useRef<HTMLElement | null>(null);
    // Q.リサイズを可能にする要素？
    const resizerRef = useRef<HTMLDivElement | null>(null);
    // テーブル要素のgetBoundingClientRectの値を保持
    const tableRectRef = useRef<DOMRect | null>(null);

    // MouseDraggingDirectionイベントのclientXとclientYの値を保持
    // 画面に対してのマウスカーソルの位置を設定
    const mouseStartPosRef = useRef<MousePosition | null>(null);
    // 上記値をstateで管理？
    // Q.上のRefはいるのか？即時反映させたいから定義しているのかな？
    const [mouseCurrentPos, updateMouseCurrentPos] =
        useState<MousePosition | null>(null);


    const [activeCell, updateActiveCell] = useState<TableDOMCell | null>(null);
    // ボタンをクリックしているかどうかの値を保持
    // →これがtrueの時のみリサイズの処理を行う
    const [isMouseDown, updateIsMouseDown] = useState<boolean>(false);
    // 現在リサイズしているのが縦か横かを保持する
    const [draggingDirection, updateDraggingDirection] =
        useState<MouseDraggingDirection | null>(null);

    // 全部の値を初期値にする
    const resetState = useCallback(() => {
        updateActiveCell(null);
        targetRef.current = null;
        updateDraggingDirection(null);
        mouseStartPosRef.current = null;
        tableRectRef.current = null;
    }, []);

    // MouseDownしているかどうかを取得する処理
    const isMouseDownOnEvent = (event: MouseEvent) => {
        /** 
        *event.buttonsは現在推しているボタンの種類を示す
        * 以下の対応関係がある
        * ビット0（値1）：左ボタン
        * ビット1（値2）：右ボタン
        * ビット2（値4）：中央ボタン（ホイールボタン）
        * ビット3（値8）：サイドボタン（戻るボタン）
        * ビット4（値16）：サイドボタン（進むボタン）
        * event.buttons & 1はAND演算子
        * 以下はClaudeの回答
        * 左ボタン以外のボタンが押されたときの `event.buttons & 1` の値は、常に0になります。

        これは、`event.buttons & 1` がビット単位のAND演算を行っているためです。`1`のバイナリ表現は`0001`です。したがって、この演算は `event.buttons` の最下位ビット（左ボタンに対応）のみを取り出します。

        以下に、いくつかの例を示します：

        1. 右ボタンのみが押されている場合：
           - `event.buttons` のバイナリ表現は `0010` になります。
           - `0010 & 0001 = 0000` となり、結果は0になります。

        2. 中央ボタンのみが押されている場合：
           - `event.buttons` のバイナリ表現は `0100` になります。
           - `0100 & 0001 = 0000` となり、結果は0になります。

        3. 左ボタンと右ボタンが同時に押されている場合：
           - `event.buttons` のバイナリ表現は `0011` になります。
           - `0011 & 0001 = 0001` となり、結果は1になります。

        このように、`event.buttons & 1` は、左ボタンが押されているかどうかを判断するために使用されます。左ボタンが押されている場合は1、押されていない場合は0になります。他のボタンの状態は、この演算では考慮されません。
        */
        return (event.buttons & 1) === 1;
    };

    useEffect(() => {
        const onMouseMove = (event: MouseEvent) => {
            setTimeout(() => {
                const target = event.target;

                // Q.ドラックでテーブルを動かしている場合?
                if (draggingDirection) {
                    updateMouseCurrentPos({
                        x: event.clientX,
                        y: event.clientY,
                    });
                    return;
                }
                // MouseDown中かをセットする
                updateIsMouseDown(isMouseDownOnEvent(event));
                // テーブルをリサイズする要素を動かしている時は処理をしない
                if (resizerRef.current && resizerRef.current.contains(target as Node)) {
                    return;
                }

                // 同一要素上でカーソルを動かしていないとき
                if (targetRef.current !== target) {
                    // 現在のカーソル上にいる要素を設定し、セルのDOMを取得する
                    targetRef.current = target as HTMLElement;
                    const cell = getDOMCellFromTarget(target as HTMLElement);

                    // 取得したDOMがセルで、現在アクティブなセルとは異なる場合
                    // Q.カーソルが当たっていないテーブルについての処理かな？
                    if (cell && activeCell !== cell) {
                        editor.update(() => {
                            // カーソル上にいるセルのNodeを取得
                            const tableCellNode = $getNearestNodeFromDOMNode(cell.elem);
                            if (!tableCellNode) {
                                throw new Error('TableCellResizer: Table cell node not found.');
                            }


                            // セルが属するTableNode取得
                            const tableNode =
                                $getTableNodeFromLexicalNodeOrThrow(tableCellNode);
                            // テーブルNodeからHTML要素取得
                            const tableElement = editor.getElementByKey(tableNode.getKey());

                            if (!tableElement) {
                                throw new Error('TableCellResizer: Table element not found.');
                            }

                            // Q.これいる？
                            targetRef.current = target as HTMLElement;
                            // テーブルのgetBoundingClientRectの値を格納
                            tableRectRef.current = tableElement.getBoundingClientRect();
                            // アクティブなセルを現在カーソル上にセルに設定
                            updateActiveCell(cell);
                        });
                    } else if (cell === null) {
                        // テーブルのセル上でカーソルを動かしていないときは値をリセットする
                        resetState();
                    }
                }
            }, 0);
        };

        const onMouseDown = (event: MouseEvent) => {
            setTimeout(() => {
                updateIsMouseDown(true);
            }, 0);
        };

        const onMouseUp = (event: MouseEvent) => {
            setTimeout(() => {
                updateIsMouseDown(false);
            }, 0);
        };

        // イベントを登録する
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mouseup', onMouseUp);

        // コンポーネントのアンマウント時にイベントを破棄する
        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }, [activeCell, draggingDirection, editor, resetState]);

    // 幅か高さどちらを変更しているか判定する関数
    const isHeightChanging = (direction: MouseDraggingDirection) => {
        if (direction === 'bottom') {
            return true;
        }
        return false;
    };

    const updateRowHeight = useCallback(
        (newHeight: number) => {
            // テーブルの上で作業をしていないときは処理をしない
            if (!activeCell) {
                throw new Error('TableCellResizer: Expected active cell.');
            }

            editor.update(
                /**
                 * アクティブなセルが属するTableRowNodeを取得し、引数で受け取った高さを設定している
                 */
                () => {
                    const tableCellNode = $getNearestNodeFromDOMNode(activeCell.elem);
                    if (!$isTableCellNode(tableCellNode)) {
                        throw new Error('TableCellResizer: Table cell node not found.');
                    }

                    const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);

                    const tableRowIndex =
                        $getTableRowIndexFromTableCellNode(tableCellNode);

                    const tableRows = tableNode.getChildren();

                    if (tableRowIndex >= tableRows.length || tableRowIndex < 0) {
                        throw new Error('Expected table cell to be inside of table row.');
                    }

                    const tableRow = tableRows[tableRowIndex];

                    if (!$isTableRowNode(tableRow)) {
                        throw new Error('Expected table row');
                    }

                    tableRow.setHeight(newHeight);
                },
                /**
                 * Claudeの回答
                 * `editor.update`の第2引数である`{ tag: 'skip-scroll-into-view' }`は、エディタの更新動作に関するオプションを指定するためのオブジェクトです。
                 * このオプションは、Lexicalエディタの組み込み機能である「スクロール into view」を制御します。通常、エディタの更新が行われると、更新された要素が自動的にスクロールされ、ビューポート内に表示されるようになります。これは、ユーザーが編集中のコンテンツに注目できるようにするための便利な機能です。
                 * ただし、このプラグインでは、セルのリサイズ操作中に`updateRowHeight`関数が呼び出されます。この関数は、行の高さを更新するために`editor.update`を使用しています。
                 * `{ tag: 'skip-scroll-into-view' }`オプションを指定することで、この更新操作に対して「スクロール into view」機能をスキップするように指示しています。つまり、行の高さが更新されても、エディタのスクロール位置は変更されません。
                 * これは、リサイズ操作中に意図しないスクロールが発生することを防ぐために重要です。ユーザーがセルをリサイズしている最中に、エディタがスクロールしてしまうと、ユーザーの操作が中断されたり、混乱を招いたりする可能性があります。
                 * `{ tag: 'skip-scroll-into-view' }`オプションを指定することで、リサイズ操作中のスクロールを抑制し、ユーザーにスムーズなリサイズ体験を提供しています。
                 * 同様に、`updateColumnWidth`関数内でも`{ tag: 'skip-scroll-into-view' }`オプションが使用されており、列の幅を更新する際にもスクロールが抑制されます。
                 */
                { tag: 'skip-scroll-into-view' },
            );
        },
        [activeCell, editor],
    );

    const updateColumnWidth = useCallback(
        (newWidth: number) => {
            if (!activeCell) {
                throw new Error('TableCellResizer: Expected active cell.');
            }
            editor.update(
                () => {
                    const tableCellNode = $getNearestNodeFromDOMNode(activeCell.elem);
                    if (!$isTableCellNode(tableCellNode)) {
                        throw new Error('TableCellResizer: Table cell node not found.');
                    }

                    const tableNode = $getTableNodeFromLexicalNodeOrThrow(tableCellNode);

                    const tableColumnIndex =
                        $getTableColumnIndexFromTableCellNode(tableCellNode);

                    const tableRows = tableNode.getChildren();

                    // column番号が一致する各列にあるセルの幅を設定する
                    for (let r = 0; r < tableRows.length; r++) {
                        const tableRow = tableRows[r];

                        if (!$isTableRowNode(tableRow)) {
                            throw new Error('Expected table row');
                        }

                        const rowCells = tableRow.getChildren<TableCellNode>();
                        const rowCellsSpan = rowCells.map((cell) => cell.getColSpan());

                        const aggregatedRowSpans = rowCellsSpan.reduce(
                            (rowSpans: number[], cellSpan) => {
                                const previousCell = rowSpans[rowSpans.length - 1] ?? 0;
                                rowSpans.push(previousCell + cellSpan);
                                return rowSpans;
                            },
                            [],
                        );
                        const rowColumnIndexWithSpan = aggregatedRowSpans.findIndex(
                            (cellSpan: number) => cellSpan > tableColumnIndex,
                        );

                        if (
                            rowColumnIndexWithSpan >= rowCells.length ||
                            rowColumnIndexWithSpan < 0
                        ) {
                            throw new Error('Expected table cell to be inside of table row.');
                        }

                        const tableCell = rowCells[rowColumnIndexWithSpan];

                        if (!$isTableCellNode(tableCell)) {
                            throw new Error('Expected table cell');
                        }

                        tableCell.setWidth(newWidth);
                    }
                },
                { tag: 'skip-scroll-into-view' },
            );
        },
        [activeCell, editor],
    );

    const mouseUpHandler = useCallback(
        (direction: MouseDraggingDirection) => {
            const handler = (event: MouseEvent) => {
                event.preventDefault();
                event.stopPropagation();

                if (!activeCell) {
                    throw new Error('TableCellResizer: Expected active cell.');
                }

                // 画面に対してのマウスカーソルの位置が保持されている場合
                if (mouseStartPosRef.current) {
                    const { x, y } = mouseStartPosRef.current;

                    if (activeCell === null) {
                        return;
                    }
                    // 対象要素のズームレベルを取得
                    const zoom = calculateZoomLevel(event.target as Element);

                    if (isHeightChanging(direction)) {
                        const height = activeCell.elem.getBoundingClientRect().height;
                        // MouseUp(≒ボタンクリックを辞めた)の時のY座標からMouseDownした時のY座標を引き、絶対値をとる。
                        // その後ズームレベル分割る
                        const heightChange = Math.abs(event.clientY - y) / zoom;

                        // セルを縮めたか広げたかを判定
                        const isShrinking = direction === 'bottom' && y > event.clientY;

                        // 縮めた時はセルの高さから引き、広げた時はセルの高さに加えて高さをセットする
                        updateRowHeight(
                            Math.max(
                                isShrinking ? height - heightChange : heightChange + height,
                                MIN_ROW_HEIGHT,
                            ),
                        );
                    } else {
                        const computedStyle = getComputedStyle(activeCell.elem);
                        let width = activeCell.elem.clientWidth; // width with padding
                        width -=
                            parseFloat(computedStyle.paddingLeft) +
                            parseFloat(computedStyle.paddingRight);
                        const widthChange = Math.abs(event.clientX - x) / zoom;

                        const isShrinking = direction === 'right' && x > event.clientX;

                        updateColumnWidth(
                            Math.max(
                                isShrinking ? width - widthChange : widthChange + width,
                                MIN_COLUMN_WIDTH,
                            ),
                        );
                    }

                    // 値とイベントをリセットする
                    resetState();
                    document.removeEventListener('mouseup', handler);
                }
            };
            return handler;
        },
        [activeCell, resetState, updateColumnWidth, updateRowHeight],
    );

    const toggleResize = useCallback(
        (direction: MouseDraggingDirection): MouseEventHandler<HTMLDivElement> =>
            (event) => {
                event.preventDefault();
                event.stopPropagation();

                if (!activeCell) {
                    throw new Error('TableCellResizer: Expected active cell.');
                }

                // リサイズ要素をMouseDown(≒クリック)したタイミングでの座標を格納
                mouseStartPosRef.current = {
                    x: event.clientX,
                    y: event.clientY,
                };
                updateMouseCurrentPos(mouseStartPosRef.current);
                updateDraggingDirection(direction);

                document.addEventListener('mouseup', mouseUpHandler(direction));
            },
        [activeCell, mouseUpHandler],
    );

    const getResizers = useCallback(() => {
        if (activeCell) {
            const { height, width, top, left } =
                activeCell.elem.getBoundingClientRect();
            const zoom = calculateZoomLevel(activeCell.elem);
            const zoneWidth = 10; // Pixel width of the zone where you can drag the edge
            const styles: {
                bottom: React.CSSProperties,
                right: React.CSSProperties,
            } = {
                bottom: {
                    backgroundColor: 'none',
                    cursor: 'row-resize',
                    height: `${zoneWidth}px`,
                    left: `${window.scrollX + left}px`,
                    top: `${window.scrollY + top + height - zoneWidth / 2}px`,
                    width: `${width}px`,
                    position: 'absolute',
                    zIndex: 20
                },
                right: {
                    backgroundColor: 'none',
                    cursor: 'col-resize',
                    height: `${height}px`,
                    left: `${window.scrollX + left + width - zoneWidth / 2}px`,
                    top: `${window.screenY + top}px`,
                    width: `${zoneWidth}px`,
                    position: 'absolute',
                    zIndex: 20
                },
            };

            const tableRect = tableRectRef.current;

            console.log(styles)
            console.log(draggingDirection, mouseCurrentPos)
            console.log(tableRect)
            if (draggingDirection && mouseCurrentPos && tableRect) {
                if (isHeightChanging(draggingDirection)) {
                    styles[draggingDirection].left = `${window.pageXOffset + tableRect.left
                        }px`;
                    styles[draggingDirection].top = `${window.pageYOffset + mouseCurrentPos.y / zoom
                        }px`;
                    styles[draggingDirection].height = '3px';
                    styles[draggingDirection].width = `${tableRect.width}px`;
                } else {
                    styles[draggingDirection].top = `${window.pageYOffset + tableRect.top
                        }px`;
                    styles[draggingDirection].left = `${window.pageXOffset + mouseCurrentPos.x / zoom
                        }px`;
                    styles[draggingDirection].width = '3px';
                    styles[draggingDirection].height = `${tableRect.height}px`;
                }

                styles[draggingDirection].backgroundColor = '#adf';
            }

            return styles;
        }

        return {
            bottom: null,
            left: null,
            right: null,
            top: null,
        };
    }, [activeCell, draggingDirection, mouseCurrentPos]);

    const resizerStyles = getResizers();

    return (
        <div ref={resizerRef}>
            {activeCell != null && !isMouseDown && (
                <>
                    <div
                        className="TableCellResizer__resizer TableCellResizer__ui"
                        style={resizerStyles.right || undefined}
                        onMouseDown={toggleResize('right')}
                    />
                    <div
                        className="TableCellResizer__resizer TableCellResizer__ui"
                        style={resizerStyles.bottom || undefined}
                        onMouseDown={toggleResize('bottom')}
                    />
                </>
            )}
        </div>
    );
}

export default function TableCellResizerPlugin(): null | ReactPortal {
    const [editor] = useLexicalComposerContext();
    const isEditable = useLexicalEditable();

    // 編集が可能であればPortalとして画面に描画
    return useMemo(
        () =>
            isEditable
                ? createPortal(<TableCellResizer editor={editor} />, document.body)
                : null,
        [editor, isEditable],
    );
}