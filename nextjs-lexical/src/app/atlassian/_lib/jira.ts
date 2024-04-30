import { searchByElastciSearch } from "@/app/actions";
import { getTitleById } from "@/libs/handle-file";
import fs from 'fs';
import path from 'path';

// JIRA APIのベースURL
const baseUrl = process.env.JIRA_BASE_API_URL;
// JIRAのAPIトークン
const apiToken = process.env.JIRA_API_TOKEN;
// JIRAアカウントのメールアドレス
const email = process.env.JIRA_EMAIL
// 対象のJIRAプロジェクトのキー
const projectKeys = process.env.JIRA_PROJECT_KEYS ? process.env.JIRA_PROJECT_KEYS.split(',') : []

const headers = {
    'Authorization': `Basic ${btoa(`${email}:${apiToken}`)}`,
    'Content-Type': 'application/json',
};


export async function addDocumentLinkInJiraIssueComments() {
    // ファイルを取得するディレクトリのパス
    const directoryPath = path.join(process.cwd(), 'blogs');

    // ワイルドカードでファイルを取得
    const documentDirs = fs.readdirSync(directoryPath);
    const documents = documentDirs.map(dir => ({
        id: dir,
        content: fs.readFileSync(path.join(directoryPath, dir, 'content.txt')).toString()
    }));

    const issues = await getIssuesByStatus('In Progress')


    for (const issue of issues) {
        const description = issue.fields.description;
        if (!description) {
            continue;
        }
        const key = issue.key
        const { mustSearchWords, shouldSearchWords } = createSeacrhWords(description)
        const contentResults = await searchByElastciSearch(mustSearchWords, shouldSearchWords, 'content')
        const contentUrls = contentResults.hits.map((hit) => `[${getTitleById(hit._id)}|${process.env.BASE_URL}/${process.env.APPLICATION_POST_DETAIL_PATH}/${hit._id}]`)
        const confluenceResults = await searchByElastciSearch(mustSearchWords, shouldSearchWords, 'confluence')
        const confluenceUrls = confluenceResults.hits.filter(hit => hit.fields?.title).map(hit => `[${hit.fields?.title[0] ?? '無題'} - Confluence|${process.env.CONFLUENCE_BASE_URL}${hit._id}]`)

        const urls = [...contentUrls, ...confluenceUrls]
        if (urls.length > 0) {
            await deleteCommentsWithKeyword(key)
            await addCommentToIssue(key, `イシューに関わるドキュメント一覧：\n\r${urls.join('\n\r')}`)
        }
    }
}

async function getIssuesByStatus(issueStatus: string) {
    // JIRA APIへのGETリクエストを送信してイシュー一覧を取得する関数
    const url = `${baseUrl}/search?jql=status="${issueStatus}" AND project in (${projectKeys.join(', ')})&fields=key,description`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
            cache: 'no-cache'
        });

        if (response.ok) {
            const data: { issues: { key: string, fields: { description: string | null } }[] } = await response.json();
            const issues = data.issues;
            console.log(data)

            return issues;
        } else {
            console.error('Failed to get issues:', response.status, response.statusText);
            return [];
        }
    } catch (error) {
        console.error('Error:', error);
        return [];
    }

}

// JIRA APIへのPOSTリクエストを送信してコメントを追加する関数
async function addCommentToIssue(issueKey: string, commentBody: string) {
    const url = `${baseUrl}/issue/${issueKey}/comment`;

    const body = {
        body: commentBody,
    };

    try {
        if (projectKeys.length === 0) {
            throw Error('Not Found Jira Projects')
        }
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
        });

        if (response.ok) {
            console.log('Comment added successfully.');
        } else {
            console.error('Failed to add comment:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deleteCommentsWithKeyword(issueKey: string) {
    try {
        // イシューのコメントを取得
        const commentsResponse = await fetch(`${baseUrl}/issue/${issueKey}/comment`, {
            method: 'GET',
            headers: headers
        });

        if (!commentsResponse.ok) {
            throw new Error('Failed to fetch comments.');
        }

        const commentsData = await commentsResponse.json();
        const comments = commentsData.comments;

        const keyword = 'イシューに関わるドキュメント一覧'

        // キーワードを含むコメントを見つけて削除
        for (const comment of comments) {
            if (comment.body.includes(keyword)) {
                const deleteResponse = await fetch(comment.self, {
                    method: 'DELETE',
                    headers: headers
                });

                if (!deleteResponse.ok) {
                    console.warn(`Failed to delete comment with ID: ${comment.id}`);
                } else {
                    console.log(`Deleted comment with ID: ${comment.id}`);
                }
            }
        }

        console.log('Comment deletion completed.');
    } catch (error) {
        console.error('Error:', error);
    }
}

const createSeacrhWords = (inputString: string): { mustSearchWords: string[], shouldSearchWords: string[] } => {

    // 正規表現を使用して、andSearchWordsとorSearchWordsの値を抽出
    const searchWordsRegex = /\+\+SearchDocument\+\+\s+([\s\S]*?)\s+\+\+\+\+/;
    const searchWordsMatch = inputString.match(searchWordsRegex);

    if (searchWordsMatch) {
        const searchWordsString = searchWordsMatch[1];

        const andSearchWordsRegex = /andSearchWords:(.+)/;
        const orSearchWordsRegex = /orSearchWords:(.+)/;

        const andSearchWordsMatch = searchWordsString.match(andSearchWordsRegex);
        const orSearchWordsMatch = searchWordsString.match(orSearchWordsRegex);

        // 抽出した値を分割して配列に変換
        const mustSearchWords = andSearchWordsMatch ? andSearchWordsMatch[1].split(',').map(word => word.trim()) : [];
        const shouldSearchWords = orSearchWordsMatch ? orSearchWordsMatch[1].split(',').map(word => word.trim()) : [];

        return { mustSearchWords, shouldSearchWords }
    }


    return { mustSearchWords: [], shouldSearchWords: [] }
}