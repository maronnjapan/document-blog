import { Worker } from 'worker_threads';
import natural from 'natural/lib/natural/';
import { TfIdf } from 'natural/lib/natural/tfidf';

export function summarizeWithNLTK(text: string, sentenceCount: number = 3): string {
    const tokenizer = new natural.SentenceTokenizer();
    const sentences = tokenizer.tokenize(text);

    const tfidf = new TfIdf();
    sentences.forEach(sentence => tfidf.addDocument(sentence));

    const scoreMap = sentences.map((sentence, index) => ({
        index,
        score: tfidf.tfidf(sentence, index)
    }));

    scoreMap.sort((a, b) => b.score - a.score);
    const topSentences = scoreMap.slice(0, sentenceCount).sort((a, b) => a.index - b.index);

    return topSentences.map(item => sentences[item.index]).join(' ');
}