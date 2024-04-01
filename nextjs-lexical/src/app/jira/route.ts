import { NextResponse } from "next/server";
import { addDocumentLinkInJiraIssueComments } from "./_lib";

export async function POST() {
    await addDocumentLinkInJiraIssueComments()
    return NextResponse.json({})
}