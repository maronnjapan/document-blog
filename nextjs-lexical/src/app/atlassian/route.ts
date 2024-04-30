import { NextResponse } from "next/server";
import { addDocumentLinkInJiraIssueComments } from "./_lib/jira";
import { storePageInfoToElasticSearch } from "./_lib/confluence";

export async function POST() {
    await storePageInfoToElasticSearch()
    await addDocumentLinkInJiraIssueComments()
    return NextResponse.json({})
}