
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ulid } from "ulid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Config } from "./const";

const { ACCESS_KEY_ID, ACCESS_KEY_SECRET, BUCKET, REGION, STORAGE_ENDPOINT_FOR_CLIENT } = Config
const clientForFrontEnd = new S3Client({ region: REGION, credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: ACCESS_KEY_SECRET }, endpoint: STORAGE_ENDPOINT_FOR_CLIENT, forcePathStyle: true });
export const createPresignedUrl = async (fileName: string) => {

    const fileId = ulid()
    const match = /\.[a-zA-Z0-9]+$/gi.exec(fileName)
    if (!match) {
        throw new Error('ファイル名の形式がただしくありません')
    }
    const key = `${fileId}${match[0]}`;
    const command = new PutObjectCommand({ Bucket: BUCKET, Key: key });
    const url = await getSignedUrl(clientForFrontEnd, command, { expiresIn: 3600 })
    return { fileId, url }
};

export const getFileUrl = async (fileId: string, fileName: string) => {
    const match = /\.[a-zA-Z0-9]+$/gi.exec(fileName)
    if (!match) {
        throw new Error('ファイル名の形式がただしくありません')
    }
    const key = `${fileId}${match[0]}`;
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });

    return await getSignedUrl(clientForFrontEnd, command);
};