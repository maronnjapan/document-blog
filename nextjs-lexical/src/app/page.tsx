import path from "path";
import * as fs from 'fs'
import Link from "next/link";
import { pagesPath } from "@/router/$path";
import NewPostButton from "./_components/button/NewPostButton";
import { ulid } from "ulid";
import { storeToElasticSearch } from "./actions";
import { getPostDirs, getTitles } from "@/libs/handle-file";

export default function Page() {
  const postDirs = getPostDirs()
  const posts = getTitles()


  // postDirs.forEach(
  //   dir => {
  //     try {
  //       const fileContent = fs.readFileSync(path.join(process.cwd(), 'blogs', dir, 'content.txt'))
  //       storeToElasticSearch(dir, fileContent.toString())
  //     } catch (e) {
  //       if (e instanceof Error) {
  //         console.log('右記の理由でElasticsearchに保存できませんでした', e.message)
  //       }
  //       return
  //     }

  //   }
  // )

  // try {
  //   fetch('http://localhost:3000/atlassian', {
  //     method: 'POST',
  //     cache: 'no-cache'
  //   });
  // } catch (e) {
  //   console.log(e)
  // }

  const newPostId = ulid()

  return (
    <div>
      <ul>
        {posts.map((post) => {
          return (
            <li key={post.postId}><Link href={pagesPath.posts._postId(post.postId).$url().path}>{post.title}</Link></li>
          )
        })}
      </ul>
      <div>
        <NewPostButton postId={newPostId} />
      </div>
    </div>
  );
};