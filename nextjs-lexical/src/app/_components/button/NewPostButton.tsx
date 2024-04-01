'use client';

import { pagesPath } from "@/router/$path";
import { useRouter } from 'next/navigation';
import PrimaryButton from "./PrimaryButton";

export default function NewPostButton({ postId }: { postId: string }) {

    const router = useRouter()
    const redirectNewPost = () => {
        router.push(pagesPath.posts._postId(postId).$url().path)
    }

    return (
        <PrimaryButton onClick={redirectNewPost}>新規作成</PrimaryButton>
    )
}