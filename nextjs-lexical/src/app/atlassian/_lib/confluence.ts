import { storeConfluenceToElasticSearch, storeToElasticSearch } from "@/app/actions";

interface ConfluencePage {
    id: string;
    title: string;
    body: {
        storage: {
            value: string;
        };
    };
    _links: {
        webui: string
    }
}

interface PageInfo {
    id: string
}
interface Page {
    results: PageInfo[]
}

// JIRA APIのベースURL
const baseUrl = process.env.CONFLUENCE_BASE_API_URL;
// JIRAのAPIトークン
const apiToken = process.env.JIRA_API_TOKEN;
// JIRAアカウントのメールアドレス
const email = process.env.JIRA_EMAIL
// 対象のコンフルエンスのキー
const spaceKeys: string[] = process.env.CONFLUENCE_SPACE_KEYS ? process.env.CONFLUENCE_SPACE_KEYS.split(',') : []

const headers: HeadersInit = {
    'Authorization': `Basic ${btoa(`${email}:${apiToken}`)}`,
    'Content-Type': 'application/json',
};

export async function storePageInfoToElasticSearch() {
    const pageIds = await getPageInfoInSpace(spaceKeys);
    const pageContents = await getConfluencePages(pageIds.map(id => id.id))
    for (const content of pageContents) {
        await storeConfluenceToElasticSearch(content._links.webui, content.body.storage.value, content.title)
    }
}

async function getPageInfoInSpace(spaceKeys: string[]): Promise<PageInfo[]> {
    const pageInfo: { id: string }[] = [];

    try {
        for (const spaceKey of spaceKeys) {
            const response = await fetch(`${baseUrl}/content?spaceKey=${spaceKey}&limit=1000`, {
                method: 'GET',
                headers,
                cache: 'no-cache'
            });

            const pageResult: Page = await response.json();
            pageInfo.push(...pageResult.results.map((page) => ({
                id: page.id,
            })));
        }
    } catch (error) {
        console.error('Failed to fetch page information:', error);
    }

    return pageInfo;
}

async function getConfluencePages(pageIds: string[]): Promise<ConfluencePage[]> {
    const pages: ConfluencePage[] = [];

    for (const pageId of pageIds) {
        try {
            const response = await fetch(`${baseUrl}/content/${pageId}?expand=body.storage`, {
                headers
            });

            const page: ConfluencePage = await response.json();
            pages.push(page);
        } catch (error) {
            console.error(`Failed to fetch page with ID ${pageId}:`, error);
        }
    }

    return pages;
}