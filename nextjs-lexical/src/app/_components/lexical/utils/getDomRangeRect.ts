
export function getDOMRangeRect(
    nativeSelection: Selection,
    rootElement: HTMLElement,
): DOMRect {
    // 最初にカーソルで選択した値を取得
    // Chromeは一個しか範囲選択できない。
    // 一方で、FireFoxは複数選択できるので最初を取るようにしている
    // 参考資料：https://qiita.com/sho_U/items/da36bc34e401d103447e
    const domRange = nativeSelection.getRangeAt(0);

    const firstChildElement = rootElement.firstElementChild;

    // Q.全選択の時と何も書いていない時にキャレットが有効になっている場合のみこの分岐はとおるのか？
    if (nativeSelection.anchorNode === rootElement) {
        if (firstChildElement) {
            return firstChildElement.getBoundingClientRect()
        }
    }
    return domRange.getBoundingClientRect();


}