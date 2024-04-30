'use client';
import { storeTitle } from "@/app/actions";
import { ChangeEvent, useRef, useState } from "react";

const AutoSaveTitleInput = (props: { postId: string, title: string }) => {
    const [title, setTitle] = useState(props.title)
    const timer = useRef<NodeJS.Timeout | null>(null);


    const storeAndSetTitle = async (e: ChangeEvent<HTMLInputElement>) => {
        setTitle(() => e.target.value);
        if (timer.current) {
            clearTimeout(timer.current);
        }
        timer.current = setTimeout(async () => {
            await storeTitle(props.postId, e.target.value.length > 0 ? e.target.value : '無題')
        }, 1000);
    }

    return <>
        <label>タイトル</label>
        <input value={title} onChange={(e) => storeAndSetTitle(e)} />
    </>;
}

export default AutoSaveTitleInput;
