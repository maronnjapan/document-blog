
export const Config = {
    get REGION() {
        if (!process.env.REGION) {
            throw new Error('リージョンが設定されていません')
        }

        return process.env.REGION;
    },
    get BUCKET() {
        if (!process.env.NEXT_PUBLIC_BUCKET) {
            throw new Error('バケットが設定されていません')
        }

        return process.env.NEXT_PUBLIC_BUCKET;
    },
    get ACCESS_KEY_ID() {
        if (!process.env.ACCESS_KEY_ID) {
            throw new Error('アクセスキーIDが設定されていません')
        }

        return process.env.ACCESS_KEY_ID;
    },
    get ACCESS_KEY_SECRET() {
        if (!process.env.ACCESS_KEY_SECRET) {
            throw new Error('アクセスシークレットが設定されていません')
        }

        return process.env.ACCESS_KEY_SECRET;
    },
    get STORAGE_ENDPOINT() {
        if (!process.env.STORAGE_ENDPOINT) {
            throw new Error('ストレージエンドポイントが設定されていません')
        }

        return process.env.STORAGE_ENDPOINT;
    },
    get STORAGE_ENDPOINT_FOR_CLIENT() {
        if (!process.env.NEXT_PUBLIC_STORAGE_ENDPOINT_FOR_CLIENT) {
            throw new Error('クライアント用ストレージエンドポイントが設定されていません')
        }

        return process.env.NEXT_PUBLIC_STORAGE_ENDPOINT_FOR_CLIENT;
    },
}