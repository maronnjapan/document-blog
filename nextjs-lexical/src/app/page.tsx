import path from "path";
import * as fs from 'fs'
import Link from "next/link";
import { pagesPath } from "@/router/$path";
import NewPostButton from "./_components/button/NewPostButton";
import { ulid } from "ulid";
import { storeToElasticSearch } from "./actions";

export default function Page() {

  const titleFilePattern = /[\s\S]*\.title/g
  const publicPath = path.join(process.cwd(), 'blogs', 'posts')
  const files = fs.readdirSync(publicPath)

  const postDirs = files.filter((file) => {
    return fs.statSync(path.join(publicPath, file)).isDirectory()
  })
  const posts = postDirs.map(dir => (
    {
      postId: dir,
      title: fs.readdirSync(path.join(process.cwd(), 'blogs', 'posts', dir)).find(file => titleFilePattern.test(file))?.replace('.title', '') ?? '無題'
    }
  )
  )


  postDirs.forEach(
    dir => {
      try {
        const fileContent = fs.readFileSync(path.join(process.cwd(), 'blogs', 'posts', dir, 'content.txt'))
        console.log(fileContent.toString())
        storeToElasticSearch(dir, fileContent.toString())
      } catch (e) {
        if (e instanceof Error) {
          console.log('右記の理由でElasticsearchに保存できませんでした', e.message)
        }
        return
      }

    }
  )

  try {
    fetch('http://localhost:3000/jira', {
      method: 'POST',
      cache: 'no-cache'
    });
  } catch (e) {
    console.log(e)
  }

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