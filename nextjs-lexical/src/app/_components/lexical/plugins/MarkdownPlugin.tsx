import { TRANSFORMERS, TextMatchTransformer, ElementTransformer } from "@lexical/markdown";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { $createImageNode, $isImageNode, ImageNode } from "./InserImagePlugin/node";
import { $createCollapsibleContainerNode, $isCollapsibleContainerNode, CollapsibleContainerNode } from "./CollapsiblePlugin/container-node";
import { $createCollapsibleContentNode, $isCollapsibleContentNode, CollapsibleContentNode } from "./CollapsiblePlugin/content-node";
import { $createCollapsibleTitleNode, $isCollapsibleTitleNode, CollapsibleTitleNode } from "./CollapsiblePlugin/title-node";
import { $createParagraphNode, $createTextNode, $isParagraphNode, ElementNode, LexicalNode } from "lexical";
import { $createLinkPreviewNode, $isLinkPreviewNode, LinkPreviewNode } from "./LinkPreviewPlugin/node";

export const IMAGE: TextMatchTransformer = {
  dependencies: [ImageNode],
  export: (node, exportChildren, exportFormat) => {
    if (!$isImageNode(node)) {
      return null;
    }

    return `![${node.getAltText()}](${node.getSrc()})`;
  },
  importRegExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))/,
  regExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))$/,
  replace: (textNode, match) => {
    const [, altText, src] = match;
    const imageNode = $createImageNode({ src, altText, maxWidth: 800 });
    textNode.replace(imageNode);
  },
  trigger: ')',
  type: 'text-match',
};


export const COLLAPSIBLE: ElementTransformer = {
  dependencies: [CollapsibleContainerNode, CollapsibleContentNode, CollapsibleTitleNode],
  export: (node, exportChildren: (node: ElementNode) => string) => {
    if (!$isCollapsibleContainerNode(node)) {
      return null;
    }

    const titleNode = node.getFirstChild();
    const contentNode = node.getLastChild();

    if (!$isCollapsibleTitleNode(titleNode) || !$isCollapsibleContentNode(contentNode)) {
      return null;
    }

    const title = exportChildren(titleNode);
    const content = exportChildren(contentNode);

    return ':::details ' + title + '\n' + content + '\n:::';
  },
  replace: (parentNode: ElementNode, children: LexicalNode[], match) => {
    const [all, title, content] = match;
    const collapsibleContainer = $createCollapsibleContainerNode(true);
    const collapsibleTitle = $createCollapsibleTitleNode().append($createTextNode(all.replace(':::details ', '').trim()));
    const collapsibleContent = $createCollapsibleContentNode().append($createParagraphNode())

    // childrenをParagraphNodeにラップしてcollapsibleContentに追加
    children.forEach((child) => {
      if ($isParagraphNode(child)) {
        collapsibleContent.append(child);
      } else {
        const paragraphNode = $createParagraphNode();
        paragraphNode.append(child);
        collapsibleContent.append(paragraphNode);
      }
    });

    collapsibleContainer.append(collapsibleTitle, collapsibleContent);
    parentNode.replace(collapsibleContainer);
  },
  regExp: /^[ \t]*:::details [\s\S]+(\w{1,10})?\s/,
  type: 'element',
};

export const LINK_CARD: TextMatchTransformer = {
  dependencies: [LinkPreviewNode],
  export: (node) => {
    if (!$isLinkPreviewNode(node)) {
      return null;
    }

    return '@[linkCard](' + node.getUrl() + ')';
  },
  replace: (node, match) => {
    const [, url] = match
    const linkPreviewNode = $createLinkPreviewNode({ url })
    node.replace(linkPreviewNode)
  },
  importRegExp: /@(?:\[linkCard\])(?:\(([^(]+)\))/,
  regExp: /@(?:\[linkCard\])(?:\(([^(]+)\))$/,
  trigger: ')',
  type: 'text-match',
};


export const TRANSFORMER_PATTERNS = [IMAGE, COLLAPSIBLE, LINK_CARD, ...TRANSFORMERS]

export const MarkdownPlugin = () => {
  return <MarkdownShortcutPlugin transformers={TRANSFORMER_PATTERNS}></MarkdownShortcutPlugin>;
};