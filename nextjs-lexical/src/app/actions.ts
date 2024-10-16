'use server'
import { SerializedEditorState } from "lexical";
import markdownToHtml from "zenn-markdown-html"
import fs from 'fs';
import path from "path";
import { S3Client, ListObjectsCommand, GetObjectCommand, DeleteObjectsCommand, PutObjectCommand, ObjectIdentifier, CreateBucketCommand } from "@aws-sdk/client-s3";
import { Client } from "@elastic/elasticsearch";
import { createPresignedUrl, getFileUrl } from "@/server/file";
import { getBlogJson, getBlogJsonByPublicDir, storeJsonInStorage, storeStorage, storeTitle } from "@/server/storage";
import { getBlogById, storePostInDb } from "@/server/dynamo-db";




export const createPresignedUrlAction = async (fileName: string) => {
    return createPresignedUrl(fileName)
};

export const getFileUrlAction = async (fileId: string, fileName: string) => {
    return await getFileUrl(fileId, fileName)
};

export async function storeContentAction(json: SerializedEditorState, contentText: string, blogId: string) {
    await storeStorage({ contentText, json, blogId })
    return await storePostInDb({ blogId })
}

export async function storeJsonInStorageAction(json: SerializedEditorState, blogId: string) {

    await storeJsonInStorage(json, blogId)

}

export async function storeTitleAction(postId: string, title: string) {
    await storeTitle(postId, title)
}

export async function getBlogJsonAction() {
    return await getBlogJson()
}

export async function getBlogJsonByPublicDirAction(postId: string) {
    return getBlogJsonByPublicDir(postId)
}

export async function getBlogByIdAction(blogId: string) {
    return await getBlogById(blogId)
}

export async function getUsers(userName: string) {
    return ['田中太郎', '田中二郎', '田中三郎'].filter(val => val.includes(userName))
}



const replaceWord = 'replaceWordWrapChangedAnotherWord'
//markdownのコードブロック内に改行を付与する
// これがないとブログに添付した時に、改行ができない
const addNewLinesInCode = (content: string) => {
    return content.replace(/`{3}[a-zA-Z0-9\-]*\n([\s\S]*?)`{3}/g, (match, code: string) => {
        const matchCodeMarkdown = match.match(/`{3}[a-zA-Z0-9\-]*/g)
        if (!matchCodeMarkdown) {
            return match
        }
        const first = matchCodeMarkdown[0];
        const second = matchCodeMarkdown[1]
        return `${first}\n${code.split('\n').join(replaceWord)}\n${second} `;
    });
}

export async function convertHtml(markdown: string, isBlog: boolean = true) {
    const pickNoSrcImgPattern = /<img(?=\s+alt)(?![\s>]*src)[\s\S]*? \/>/gi
    const pickBase64SourcePattern = /\(data:image\/[a-zA-Z0-9\+\/,;\=]+\)/gi
    const pickBase64Source = markdown.match(pickBase64SourcePattern);

    const normalMessagePattern = /:::message(?!\s+(?:warning|alert))\s*([\s\S]*?)\s*:::/g;
    const normalMessageKey = '----normal----'
    const normalMessages = markdown.match(normalMessagePattern)
    let convertMarkDown = markdown.replaceAll(normalMessagePattern, normalMessageKey).replaceAll(':::message warning', ':::message ');

    const linkCardPattern = /@(?:\[linkCard\])(?:\(([^(]+)\))/gi;
    const matchLinkCards = markdown.match(linkCardPattern)
    const urls: string[] = []
    matchLinkCards?.forEach(val => {
        convertMarkDown = convertMarkDown.replace(val, `----focusUrl----`)
        urls.push(val.replace(/@\[linkCard\]\(/gi, '').replace(/\)$/, ''))
    })

    const tweetPattern = /----tweetEmbed----\(https?:\/\/(?:www\.)?(twitter|x)\.com\/(?:#!\/)?(?:\w+)\/status(?:es)?\/(\d+)\)/gi;
    const matchTweets = convertMarkDown.match(tweetPattern)
    const matchTweetIds = matchTweets?.map((t) => t.replace(/----tweetEmbed----\(https?:\/\/(?:www\.)?(twitter|x)\.com\/(?:#!\/)?(?:\w+)\/status(?:es)?\//, '').replace('\)', ''))
    convertMarkDown = convertMarkDown.replaceAll(/----tweetEmbed----\(https?:\/\/(?:www\.)?(twitter|x)\.com\/(?:#!\/)?(?:\w+)\/status(?:es)?\//gi, '----tweetEmbed----')


    let contentHtml = markdownToHtml(isBlog ? addNewLinesInCode(convertMarkDown) : convertMarkDown);

    urls.forEach(val => {
        contentHtml = contentHtml.replace('<p>----focusUrl----</p>', `<p><iframe class="hatenablogcard" style="width: 100%;height: 155px;max-width: 680px;border-style:none;"src="https://hatenablog-parts.com/embed?url=${val}"></iframe></p>`)
    })

    normalMessages?.forEach(val => {
        const insertText = val.replace(':::message \n', '').replace('\n:::', '').replaceAll('\n', '<br />');
        contentHtml = contentHtml.replace(`<p>${normalMessageKey}</p>`, `<aside class="msg normal"><span class="msg-symbol">!</span><div class="msg-content"><p>${insertText}</p></aside>`)
    })

    const pickNoSrcImg = contentHtml.match(pickNoSrcImgPattern)
    pickBase64Source?.forEach((val, index) => {
        if (pickNoSrcImg) {
            contentHtml = contentHtml
                .replace(pickNoSrcImg[index], `${pickNoSrcImg[index].replace('/>', '')} src="${val.replace(/\(|\)/gi, '')}" >`)
        }
    })

    matchTweetIds?.forEach((val, index) => {
        if (!matchTweets) { return }
        const matchTweetUrl = matchTweets[index].replace('----tweetEmbed----(', '').replace(/\)$/gi, '')
        contentHtml = contentHtml.replace(`<p>----tweetEmbed----${val})</p>`, `<div class="twitter-tweet twitter-tweet-rendered"
        style="display: flex; max-width: 550px; width: 100%; margin-top: 10px; margin-bottom: 10px;position:relative;height: 300px;overflow-y:hidden;">
        <a href="${matchTweetUrl}"
        onMouseOut="this.style.opacity='0.8';" onMouseOver="this.style.opacity='0.6'"
        target="_blank" rel="noopener noreferrer"
            style="position: absolute;bottom: 0;width: 100%;height: 100px;background-color: #fff;opacity: 0.8;display: flex;align-items: center;justify-content: center;">
            詳細を確認する
        </a>
        <iframe id="twitter-widget-0" scrolling="no" frameborder="0" allowtransparency="true" allowfullscreen="true"
            class="tweet-iframe"
            style="position: static; visibility: visible; width: 550px; height: 400%; display: block; flex-grow: 1;pointer-events: none;"
            title="X Post"
            src="https://platform.twitter.com/embed/Tweet.html?dnt=false&amp;embedId=twitter-widget-0&amp;features=e30%3D&amp;frame=false&amp;hideCard=false&amp;hideThread=false&amp;id=${val}&amp;lang=en&amp;origin=file%3A%2F%2Fwsl%24%2FUbuntu%2Fvar%2Fwww%2Fdocument-blog%2Ftest.html&amp;theme=light&amp;widgetsVersion=2615f7e52b7e0%3A1702314776716&amp;width=550px"
            data-tweet-id="${val}"></iframe>
    </div>`)
    })

    contentHtml = contentHtml.replaceAll('<p><span class="embed-block embed-youtube">', '<p class="youtube-embed-warpper"><span class="embed-block embed-youtube">')

    const html = `<style>${css}</style><div class='znc'>${contentHtml.replaceAll(replaceWord, '<br />')}</div>`
    return html;
}

const elasticsearchCient = new Client({ node: 'http://document-blog-elasticsearch:9200', auth: { username: 'elastic', password: 'yourStrongPassword' } })
export async function storeToElasticSearch(postId: string, content: string) {
    try {
        const response = await elasticsearchCient.index({
            index: 'content',
            body: { content },
            id: postId
        });

        console.log('Document saved:', response);
    } catch (error) {
        console.error('Error saving document:', error);
    }
}

export async function storeConfluenceToElasticSearch(postId: string, content: string, title: string) {
    try {
        const response = await elasticsearchCient.index({
            index: 'confluence',
            body: { content, title },
            id: postId
        });

        console.log('Document saved:', response);
    } catch (error) {
        console.error('Error saving document:', error);
    }
}

export async function searchByElastciSearch(mustSearchWords: string[], shouldSearchWords: string[], indexName: 'content' | 'confluence', min_score = 0.6) {
    const response = await elasticsearchCient.search({
        index: indexName,
        body: {
            query: {
                bool: {
                    must: mustSearchWords.map(word => ({
                        match: {
                            content: {
                                query: word,
                                fuzziness: 'AUTO',
                            }
                        }
                    })),
                    should: shouldSearchWords.map(word => ({
                        match: {
                            content: {
                                query: word,
                                fuzziness: 'AUTO',
                            }
                        }
                    }))
                }
            },
            min_score
        },
        fields: ['_id', 'title']
    });

    return response.hits;
}

const css = `@import url(https://fonts.googleapis.com/css?family=Noto+Sans+JP);p{margin-top:0;margin-bottom:0}h3{margin-top:0;margin-bottom:0}.znc{line-height:1.5;font-family:'Noto Sans JP',sans-serif!important}.znc>*:first-child{margin-top:0}.znc i,.znc cite,.znc em{font-style:italic}.znc strong{font-weight:700}.znc a{color:#0f83fd}.znc a:hover{text-decoration:underline}.znc ul,.znc ol{margin:.75rem 0;line-height:1.7}.znc ul>li,.znc ol>li{margin:.4rem 0}.znc ul ul,.znc ul ol,.znc ol ul,.znc ol ol{margin:.2em 0}.znc ul p,.znc ol p{margin:0}.znc ul{padding-left:1.8em}.znc ul>li{list-style:disc}.znc ul>li::marker{font-size:1.1em;color:#65717b}.znc ol{padding-left:1.7em}.znc ol>li{list-style:decimal;padding-left:.2em}.znc ol>li::marker{color:#65717b;font-weight:600;letter-spacing:-.05em}.znc .contains-task-list .task-list-item{list-style:none}.znc .task-list-item-checkbox{margin-left:-1.5em;font-size:1em;pointer-events:none}.znc h1{padding-bottom:.2em;font-size:1.7em;border-bottom:solid 1px #d6e3ed}.znc h2{padding-bottom:.3em;font-size:1.5em;border-bottom:solid 1px #d6e3ed}.znc h3{font-size:1.3em}.znc h4{font-size:1.1em}.znc h5{font-size:1em}.znc h6{font-size:.9em}@media screen and (max-width:576px){.znc h1{font-size:1.6em}.znc h2{font-size:1.4em}.znc h3{font-size:1.2em}.znc h4{font-size:1.1em}.znc h5{font-size:1em}.znc h6{font-size:.85em}}.znc hr{border-top:2px solid #d6e3ed;margin:2.5rem 0}.znc blockquote{font-size:.97em;margin:1.4rem 0;border-left:solid 3px #8f9faa;padding:2px 0 2px .7em;color:#65717b}.znc blockquote p{margin:1rem 0}.znc blockquote>:first-child{margin-top:0}.znc blockquote>:last-child{margin-bottom:0}.znc blockquote.twitter-tweet{display:none}.znc table{margin:.5rem auto;width:auto;border-collapse:collapse;font-size:.95em;line-height:1.5;word-break:normal;display:block;overflow:auto;-webkit-overflow-scrolling:touch}.znc th,.znc td{padding:.5rem;border:solid 1px #d6e3ed;background:#fff}.znc th{font-weight:700;background:#edf2f7}.znc code{padding:.2em .4em;background:rgba(33,90,160,.07);font-size:.85em;border-radius:4px;vertical-align:.08em}.znc code,.znc .code-block-filename{font-family:"SFMono-Regular",Consolas,"Liberation Mono",Menlo,monospace,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";-webkit-font-smoothing:antialiased}.znc pre{margin:1.3rem 0;background:#1a2638;overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:4px;word-break:normal;word-wrap:normal;display:flex}.znc pre:after{content:"";width:8px;flex-shrink:0}.znc pre code{margin:0;padding:0;background:rgba(0,0,0,0);font-size:.9em;color:#fff}.znc pre>code{display:block;padding:1.1rem}@media screen and (max-width:576px){.znc pre>code{padding:1rem .8rem;font-size:.85em}}.znc .code-block-container{position:relative;margin:1.3rem 0}.znc .code-block-container pre{margin:0}.znc .code-block-filename{display:table;max-width:100%;background:#323e52;color:rgba(255,255,255,.9);font-size:12px;line-height:1.3;border-radius:4px 4px 0 0;padding:6px 12px 20px;margin-bottom:-16px}.znc .code-block-filename-container+pre{border-top-left-radius:0}.znc img:not(.emoji){display:table;max-width:100%;height:auto}.znc img+br{display:none}.znc img~em{display:block;margin:-1rem auto 0;line-height:1.3;text-align:center;color:#65717b;font-size:.92em}.znc a:has(img){display:table;margin:0 auto}.znc details{font-size:.95em;margin:1rem 0;line-height:1.7}.znc summary{cursor:pointer;outline:0;padding:.7em .7em .7em .9em;border:solid 1px #d6e3ed;color:var(--c-contrast);font-size:.9em;border-radius:14px;background:#fff}.znc summary::-webkit-details-marker{color:#65717b}.znc details[open]>summary{border-radius:14px 14px 0 0;box-shadow:none;background:#f1f5f9;border-bottom:none}.znc .details-content{padding:.5em .9em;border:solid 1px #d6e3ed;border-radius:0 0 14px 14px;background:#fff}.znc .details-content>*{margin:.5em 0}.znc span.embed-block{display:block;width:100%;margin:1.5rem 0}.znc .embed-slideshare,.znc .embed-speakerdeck,.znc .embed-codepen,.znc .embed-jsfiddle,.znc .embed-youtube,.znc .embed-stackblitz{padding-bottom:calc(56.25% + 38px);position:relative;width:100%;height:0}.znc .embed-slideshare iframe,.znc .embed-speakerdeck iframe,.znc .embed-codepen iframe,.znc .embed-jsfiddle iframe,.znc .embed-youtube iframe,.znc .embed-stackblitz iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:none}.znc .embed-slideshare iframe{border:1px solid #d6e3ed}.znc .embed-jsfiddle iframe{border:1px solid #d6e3ed}.znc .embed-figma{border:1px solid #d6e3ed}.znc .zenn-embedded iframe{width:100%;display:block}.znc .zenn-embedded-link-card{margin:1rem auto}.znc .zenn-embedded-link-card iframe{height:125px}.znc .zenn-embedded-tweet,.znc .zenn-embedded-mermaid,.znc .zenn-embedded-github,.znc .zenn-embedded-gist{margin:1.5rem auto}.znc embed-katex:not([display-mode="1"]){display:inline-flex;overflow-x:auto;max-width:100%;-ms-overflow-style:none;scrollbar-width:none}.znc embed-katex:not([display-mode="1"])::-webkit-scrollbar{display:none}.znc embed-katex[display-mode="1"]{display:block;width:100%;overflow-x:auto}.znc pre[class*=language-]{position:relative}.znc .token.namespace{opacity:.7}.znc .token.comment,.znc .token.prolog,.znc .token.doctype,.znc .token.cdata{color:#94a1b3}.znc .token.operator,.znc .token.boolean,.znc .token.number{color:#ffc56d}.znc .token.attr-name,.znc .token.string{color:#ffc56d}.znc .token.entity,.znc .token.url,.znc .language-css .token.string,.znc .style .token.string{color:#ffc56d}.znc .token.selector{color:#ff8fa3}.znc .token.atrule,.znc .token.attr-value,.znc .token.keyword,.znc .token.important{color:#ff8fa3}.znc .token.deleted{color:#ff8fa3}.znc .token.inserted{color:#b4ff9b}.znc .token.deleted:not(.prefix){background:rgba(218,54,50,.2);color:inherit;display:block}.znc .token.prefix{user-select:none}.znc .token.inserted:not(.prefix){background:rgba(0,146,27,.2);color:inherit;display:block}.znc .token.coord{color:#aad4ff}.znc .token.regex,.znc .token.statement{color:#ffc56d}.znc .token.placeholder,.znc .token.variable{color:#fff}.znc .token.important,.znc .token.statement,.znc .token.bold{font-weight:700}.znc .token.punctuation{color:#939bc1}.znc .token.entity{cursor:help}.znc .token.italic{font-style:italic}.znc .token.tag,.znc .token.property,.znc .token.function{color:#38c7ff}.znc .token.attr-name{color:#ff8fa3}.znc .token.attr-value{color:#ffc56d}.znc .token.style,.znc .token.script{color:#ffc56d}.znc .token.script .token.keyword{color:#ffc56d}.znc aside.msg{display:flex;align-items:flex-start;margin:.5rem 0;padding:.75em 1em;border-radius:4px;background:#fff6e4;color:rgba(0,0,0,.7);font-size:.94em;line-height:1.6}.znc aside.msg.alert{background:#ffeff2}.znc aside.msg.normal{background:#e9f2ff}.znc aside.msg a{color:inherit;text-decoration:underline}.znc .msg-symbol{display:flex;align-items:center;justify-content:center;font-weight:700;width:1.4rem;height:1.4rem;border-radius:99rem;background-color:#ffb84c;color:#fff}.znc aside.msg.alert .msg-symbol{background-color:#ff7670}.znc aside.msg.normal .msg-symbol{background-color:#1d7afc}.znc .msg-content{flex:1;margin-left:.6em;min-width:0}.znc .msg-content>*{margin:.7rem 0}.znc .msg-content>*:first-child{margin-top:0}.znc .msg-content>*:last-child{margin-bottom:0}.znc .footnotes{margin-top:3rem;color:#65717b;font-size:.9em}.znc .footnotes li::marker{color:#65717b}.znc .footnotes-title{padding-bottom:3px;border-bottom:solid 1px #65717b;font-weight:700;font-size:15px}.znc .footnotes-list{margin:13px 0 0}.znc .footnote-item:target{background:#f1f5f9}.twitter-tweet>a{position:absolute;bottom:0;width:100%;height:100px;background-color:#fff;opacity:.8;display:flex;align-items:center;justify-content:center}.twitter-tweet>a:hover{opacity:.6}.youtube-embed-warpper{max-width:550px}.embed-figma{max-width:550px}`