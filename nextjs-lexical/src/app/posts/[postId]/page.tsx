import AutoSaveTitleInput from "@/app/_components/forms/AutoSaveTitleInput";
import { Lexical } from "@/app/_components/lexical/Lexical";
import { pagesPath } from "@/router/$path";
import Link from "next/link";
import * as fs from 'fs'
import path from "path";
import { VStack } from "@chakra-ui/react";

export default function Page({ params }: { params: { postId: string } }) {
    const fileNamePattern = /[\s\S]*\.title/g
    let title = '';
    try {
        title = fs.readdirSync(path.join(process.cwd(), 'blogs', params.postId)).find(file => fileNamePattern.test(file))?.replace('.title', '') ?? ''
    } catch { }

    return (
        <VStack align={'start'}>
            <AutoSaveTitleInput postId={params.postId} title={title}></AutoSaveTitleInput>
            <Lexical postId={params.postId} isResize></Lexical>
        </VStack>
    );
};