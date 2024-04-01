import { TRANSFORMERS } from "@lexical/markdown";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";


export const MarkdownPlugin = () => {
  return <MarkdownShortcutPlugin transformers={TRANSFORMERS}></MarkdownShortcutPlugin>;
};