// import type { EmbedConfig } from '@lexical/react/LexicalAutoEmbedPlugin';
// import { AutoEmbedOption, LexicalAutoEmbedPlugin } from '@lexical/react/LexicalAutoEmbedPlugin';
// import { createPortal } from 'react-dom';
// import { LinkPreviewConfig } from './config';
// import LinkPreviewSelect from './option-select';

// const LinkPreviewDispatcher = () => {
//     const getMenuOptions = (activeEmbedConfig: EmbedConfig, embedFn: () => void, dismissFn: () => void) => {
//         return [
//             new AutoEmbedOption('プレビュー表示', { onSelect: embedFn }),
//             new AutoEmbedOption('閉じる', { onSelect: dismissFn })
//         ]
//     }

//     return <LexicalAutoEmbedPlugin<EmbedConfig>
//         embedConfigs={[LinkPreviewConfig]}
//         onOpenEmbedModalForConfig={() => { }}
//         getMenuOptions={getMenuOptions}
//         menuRenderFn={
//             (anchorElementRef, { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex, options }) => anchorElementRef.current && createPortal((<div style={{ marginTop: anchorElementRef.current.clientHeight }}>
//                 <LinkPreviewSelect options={options} selectOptionAndCleanUp={selectOptionAndCleanUp} selectedIndex={selectedIndex} setHighlightedIndex={setHighlightedIndex}></LinkPreviewSelect>
//             </div>), anchorElementRef.current)
//         }
//     />
// }

// export default LinkPreviewDispatcher;