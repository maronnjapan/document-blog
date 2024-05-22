import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $getSelection, $insertNodes, $isRangeSelection } from "lexical";
import { useEffect } from "react";
import { getSelectedNode } from "../../utils/getSelectedNode";
import { $getFigmaId, $getTweetId, $getYoutubeVideoId, $isFigmaUrl, $isTweetUrl, $isYoutubeUrl } from "./node";
import { $createTweetNode } from "./TwitterPlugin/node";
import { $createYouTubeNode } from "./YoutubePlugin/node";
import { $createFigmaNode } from "./FigmaPlugin/node";

export default function EmbedExternalSystemPlugin() {
    const [editor] = useLexicalComposerContext();
    useEffect(() => {
        return editor.registerUpdateListener(({ editorState }) => {
            editor.update(() => {
                const selection = $getSelection()
                if (!$isRangeSelection(selection)) { return }
                const node = getSelectedNode(selection);
                const url = node.getTextContent()
                const tweetId = $getTweetId(url);
                const youtubeId = $getYoutubeVideoId(url)
                const figmaId = $getFigmaId(url)

                if ($isTweetUrl(url) && tweetId) {
                    node.remove()
                    $insertNodes([$createTweetNode(tweetId), $createParagraphNode()])
                    return;
                }

                if ($isYoutubeUrl(url) && youtubeId) {
                    node.remove()
                    $insertNodes([$createYouTubeNode(youtubeId), $createParagraphNode()])
                    return;
                }

                if ($isFigmaUrl(url) && figmaId) {
                    node.remove()
                    $insertNodes([$createFigmaNode(figmaId), $createParagraphNode()])
                    return
                }

            })
        })
    }, [editor])

    return null;
}