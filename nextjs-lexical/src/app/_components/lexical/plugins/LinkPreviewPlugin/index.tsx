import { NodeKey } from 'lexical';
import { DecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode';
import type { SerializedDecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode';
import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents';
import styles from './style/index.module.css';

const LinkPreview = ({ url, nodeKey }: { url: string, nodeKey: NodeKey }) => {
    return (
        <BlockWithAlignableContents
            format={''}
            nodeKey={nodeKey}
            className={{
                base: 'relative',
                focus: 'relative outline outline-indigo-300'
            }}
        >
            <iframe className={`hatenablogcard ${styles['link-preview-card']}`} src={`https://hatenablog-parts.com/embed?url=${url}`}
                width={'300'} height={'150'}>

            </iframe>
        </BlockWithAlignableContents>
    )
}



