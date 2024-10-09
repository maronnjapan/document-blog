
import { pagesPath } from "@/router/$path";
import NewPostButton from "./_components/button/NewPostButton";
import { ulid } from "ulid";
import { storeToElasticSearch } from "./actions";
import { getPosts } from "@/libs/handle-file";
import { LinkCard } from "./_components/cards/link-card";
import { summarizeWithNLTK } from "@/libs/summary";
import axios from "axios";
import HandleAuthButton from "./_components/auth/HandleAuthButton";

export default async function Page() {

  let summarizePosts = getPosts()
  // try {
  //   const posts = getPosts().map(async (p) => ({ ...p, content: (await axios.post('http://localhost:3000/summarize', { text: p.content, sentenceCount: 3 })).data }))
  //   summarizePosts = await Promise.all(posts.filter((_, index) => index === 0))
  // } catch (e) {
  //   console.log('エラーですうう')
  //   return null;
  // }

  // posts.forEach(
  //   post => {
  //     try {
  //       storeToElasticSearch(post.postId, post.content)
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
      <div>
        {summarizePosts.map((post) => {
          return (
            <LinkCard key={post.postId} link={pagesPath.posts._postId(post.postId).$url().path} title={post.title} content={post.content} />
          )
        })}
      </div>
      <div>
        <NewPostButton postId={newPostId} />
        <HandleAuthButton></HandleAuthButton>
      </div>
    </div>
  );
};