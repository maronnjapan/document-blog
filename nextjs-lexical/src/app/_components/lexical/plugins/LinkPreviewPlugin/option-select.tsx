import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodes, $getSelection, $isRangeSelection } from "lexical";
import { AutoEmbedOption } from "@lexical/react/LexicalAutoEmbedPlugin";

type LinkPreviewSelectProps = {
    selectedIndex: number | null;
    selectOptionAndCleanUp: (option: AutoEmbedOption) => void;
    setHighlightedIndex: (index: number) => void;
    options: Array<AutoEmbedOption>;
}
const LinkPreviewSelect = ({ options, selectOptionAndCleanUp, selectedIndex, setHighlightedIndex }: LinkPreviewSelectProps) => {
    const [editor] = useLexicalComposerContext();

    // const handleSelectOption = (option:AutoEmbedOption, selectOptionAndCleanUp) => {
    //     editor.update(() => {
    //         const selection = $getSelection();
    //         if ($isRangeSelection(selection)) {
    //             $insertNodes([]);
    //         }
    //         selectOptionAndCleanUp();
    //     });
    // };

    return (
        <div className="select-box">
            {options.map((option, index) => (
                <div
                    key={option.key}
                    className={`select-option ${selectedIndex === index ? "selected" : ""
                        }`}
                    onMouseEnter={() => setHighlightedIndex(index)}
                >
                    {option.title}
                </div>
            ))}
        </div>
    );
};

export default LinkPreviewSelect;