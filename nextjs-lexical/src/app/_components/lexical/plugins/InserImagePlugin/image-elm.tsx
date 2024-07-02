import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, $getNearestNodeFromDOMNode } from 'lexical';
import React, { MouseEvent, useRef, useState } from 'react';
import { getSelectedNode } from '../../utils/getSelectedNode';
import { $isImageNode } from './node';

type ResizableImageProps = {
    src: string;
    alt: string;
    width: 'inherit' | number;
    height: 'inherit' | number;
}

const ResizableImage = ({ src, alt, height, width }: ResizableImageProps) => {

    const [editor] = useLexicalComposerContext();
    const imageRef = useRef<HTMLImageElement>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeStartX, setResizeStartX] = useState(0);
    const [resizeStartY, setResizeStartY] = useState(0);
    const [resizeStartWidth, setResizeStartWidth] = useState(0);
    const [resizeStartHeight, setResizeStartHeight] = useState(0);

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        setIsResizing(() => true);
        setResizeStartX(e.clientX);
        setResizeStartY(e.clientY);
        if (imageRef.current) {
            setResizeStartWidth(imageRef.current.width);
            setResizeStartHeight(imageRef.current.height);
        }
    };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (isResizing) {
            const deltaX = e.clientX - resizeStartX;
            const deltaY = e.clientY - resizeStartY;
            const newWidth = resizeStartWidth + deltaX;
            const newHeight = resizeStartHeight + deltaY;
            if (imageRef.current) {
                imageRef.current.width = newWidth;
                imageRef.current.height = newHeight;
            }
        }
    };

    const handleMouseUp = (event: MouseEvent) => {
        setIsResizing(() => false);
        const dom = event.target as HTMLElement
        editor.update(() => {
            const node = $getNearestNodeFromDOMNode(dom)
            if ($isImageNode(node)) {
                node.setWidthAndHeight(imageRef.current?.width ?? 'inherit', imageRef.current?.height ?? 'inherit')
            }
        })
    };

    return (
        <div
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseMove={handleMouseMove}
        >
            <img
                ref={imageRef}
                src={src}
                alt={alt}
                width={width}
                height={height}
            />
            <div
                style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 0,
                    width: '40px',
                    height: '40px',
                    cursor: 'se-resize',
                }}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}

            >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M15.5 14.5L19 19M19 19L14.5 19M19 19L19 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
    );
};

export default ResizableImage;