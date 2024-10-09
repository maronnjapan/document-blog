import AutoSaveTitleInput from "@/app/_components/forms/AutoSaveTitleInput";
import { Lexical } from "@/app/_components/lexical/Lexical";
import { pagesPath } from "@/router/$path";
import Link from "next/link";
import * as fs from 'fs'
import path from "path";
import { VStack } from "@chakra-ui/react";
import { getBlogByIdAction, getBlogJsonByPublicDirAction } from "@/app/actions";

export default async function Page({ params }: { params: { postId: string } }) {
    /** プロジェクト内に直接書き込みで行う場合 */
    const fileNamePattern = /[\s\S]*\.title/g
    let title = '';
    try {
        title = fs.readdirSync(path.join(process.cwd(), 'blogs', params.postId)).find(file => fileNamePattern.test(file))?.replace('.title', '') ?? ''
    } catch { }

    const content = await getBlogJsonByPublicDirAction(params.postId)

    /** DynamoDBとS3の併用 */
    // const title2 = await getBlogByIdAction(params.postId)
    // if (!title2) {
    //     throw new Error('記事が存在しません')
    // }
    // console.log(title2)

    return (
        <VStack align={'start'}>
            <AutoSaveTitleInput postId={params.postId} title={title}></AutoSaveTitleInput>
            <Lexical postId={params.postId} content={content ?? ''} isResize></Lexical>
        </VStack>
    );
};