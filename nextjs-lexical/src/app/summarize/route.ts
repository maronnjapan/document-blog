import { NextRequest, NextResponse } from 'next/server';
import { Worker } from 'worker_threads';

export async function POST(request: NextRequest) {

    try {
        console.log('bbbbbbbbbbbbbbbbbbbbbbbbb')
        const { text, sentenceCount } = await request.json();
        console.log(sentenceCount, 'aaaaaaaaaaaaa')
        const worker = new Worker('./src/app/summarize/worker.js');

        worker.postMessage({ text, sentenceCount });


        worker.on('message', (summary) => {
            return NextResponse.json({ summary });
        });

        // worker.on('error', (error) => {
        //     return NextResponse.json({ summary: 'test' })
        // });
    } catch (e) {
        console.log('エラーです')
    }

}