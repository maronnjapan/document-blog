import SideMenu, { SideMenuProps } from "../menu/SideMenu";
import { getPosts } from "@/libs/handle-file";
import { pagesPath } from "@/router/$path";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const posts = getPosts()
    const urlItems: SideMenuProps['items'] = posts.map((post) => ({ url: `${pagesPath.posts._postId(post.postId).$url().path}`, title: post.title }))
    return (
        <div style={{ display: 'flex' }}>
            <SideMenu items={urlItems}></SideMenu>
            {children}
        </div>
    )
}