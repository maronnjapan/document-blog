import { searchByElastciSearch } from "@/app/actions";

// JIRA APIのベースURL
const baseUrl = process.env.JIRA_BASE_API_URL;
// JIRAのAPIトークン
const apiToken = process.env.JIRA_API_TOKEN;
// JIRAアカウントのメールアドレス
const email = process.env.JIRA_EMAIL

const headers = {
    'Authorization': `Basic ${btoa(`:${apiToken}`)}`,
    'Content-Type': 'application/json',
};


export async function addDocumentLinkInJiraIssueComments() {
    const issues = await getIssuesByStatus('In Progress')


    for (const issue of issues) {
        const description = issue.fields.description;
        if (!description) {
            continue;
        }
        const key = issue.key
        const results = await searchByElastciSearch(description)
        const urls = results.hits.map((hit) => `[テスト|http://localhost:62162/posts/${hit._id}]`)
        if (urls.length > 0) {
            await deleteCommentsWithKeyword(key)
            await addCommentToIssue(key, `イシューに関わるドキュメント一覧：\n\r${urls.join('\n\r')}`)
        }
    }
}


async function getIssuesByStatus(issueStatus: string) {
    // JIRA APIへのGETリクエストを送信してイシュー一覧を取得する関数
    const url = `${baseUrl}/search?jql=status="${issueStatus}"&fields=key,description`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
            cache: 'no-cache'
        });

        if (response.ok) {
            const data: { issues: { key: string, fields: { description: string | null } }[] } = await response.json();
            const issues = data.issues;
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
                console.log(comment)
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