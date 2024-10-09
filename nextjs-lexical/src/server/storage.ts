'use server'
import { SerializedEditorState } from "lexical";
import markdownToHtml from "zenn-markdown-html"
import fs from 'fs';
import path from "path";
import { S3Client, ListObjectsCommand, GetObjectCommand, DeleteObjectsCommand, PutObjectCommand, ObjectIdentifier, CreateBucketCommand } from "@aws-sdk/client-s3";
import { Client } from "@elastic/elasticsearch";
import { ulid } from "ulid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Config } from "./const";

const { ACCESS_KEY_ID, ACCESS_KEY_SECRET, BUCKET, REGION, STORAGE_ENDPOINT } = Config

const client = new S3Client({ region: REGION, credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: ACCESS_KEY_SECRET }, endpoint: STORAGE_ENDPOINT, forcePathStyle: true });

export async function storeStorage({ contentText, json, blogId }: { json: SerializedEditorState, contentText: string, blogId: string }) {
    const storeData = JSON.stringify(json, null, "\t")
    const publicPath = path.join(process.cwd(), 'blogs', blogId);
    if (!fs.existsSync(publicPath)) {
        fs.mkdirSync(publicPath, { recursive: true });
    }
    const jsonFileName = `content.json`
    const textFileName = `content.txt`
    fs.writeFileSync(path.join(publicPath, jsonFileName), storeData)
    fs.writeFileSync(path.join(publicPath, textFileName), contentText)
    // await storeJsonInStorage(json, postId)
}

export async function storeJsonInStorage(json: SerializedEditorState, postId: string) {

    const storeData = JSON.stringify(json, null, "\t")
    const fileName = `content.json`

    const comand = new PutObjectCommand({ Bucket: 'blogs', Key: `${postId}/${fileName}`, Body: storeData })
    await client.send(comand)

    // バックアップが一定個数超えたら削除する
    // なお今は一つのファイルを上書きしているので、以下削除処理は実行されない
    const getCommand = new ListObjectsCommand({ Bucket: 'blogs', Prefix: `${postId}` })
    const res = await client.send(getCommand)
    const maxObjectCount = 10;
    const contents = res.Contents;
    if (contents && contents.length >= maxObjectCount) {
        const deleteNums = contents.length - maxObjectCount;
        const delteObjects = [...Array(deleteNums)].map((_, index): ObjectIdentifier => ({ Key: contents[index].Key }))
        const deleteCommands = new DeleteObjectsCommand({ Bucket: 'blogs', Delete: { Objects: delteObjects } })
        await client.send(deleteCommands)
    }

}

export async function storeTitle(postId: string, title: string) {
    const publicPath = path.join(process.cwd(), 'blogs', postId);
    if (!fs.existsSync(publicPath)) {
        fs.mkdirSync(publicPath, { recursive: true });
    }
    const fileNamePattern = /[\s\S]*\.title/g
    const titleFileName = fs.readdirSync(publicPath).find(file => fileNamePattern.test(file))
    if (titleFileName) {
        fs.unlinkSync(path.join(publicPath, titleFileName));
    }
    fs.writeFileSync(path.join(publicPath, `${title}.title`), title)
}

export async function getBlogJson() {
    const command = new ListObjectsCommand({ Bucket: 'blogs', Prefix: 'uuid/' })
    const objects = await client.send(command)
    const latestJsonFile = objects.Contents?.at(-1);
    if (!latestJsonFile) {
        return null;
    }

    const getCommand = new GetObjectCommand({ Bucket: 'blogs', Key: latestJsonFile.Key })
    const object = await client.send(getCommand);
    return await object.Body?.transformToString();
}

export async function getBlogJsonByPublicDir(postId: string) {
    const publicPath = path.join(process.cwd(), 'blogs', postId);
    const fileName = `content.json`
    try {
        const contentFile = fs.readFileSync(path.join(publicPath, fileName))
        return contentFile.toString()
    } catch {
        return null
    }
}