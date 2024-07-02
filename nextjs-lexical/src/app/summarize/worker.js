import natural from 'natural'
import { parentPort, workerData } from 'worker_threads';


const pp = parentPort

if (pp) {
    pp.on('message', (data) => {
        const { text, sentenceCount } = data;
        const tokenizer = new natural.SentenceTokenizer();
        const sentences = tokenizer.tokenize(text);

        const tfidf = new natural.TfIdf();
        sentences.forEach(sentence => tfidf.addDocument(sentence));

        const scoreMap = sentences.map((sentence, index) => ({
            index,
            score: tfidf.tfidf(sentence, index)
        }));

        scoreMap.sort((a, b) => b.score - a.score);
        const topSentences = scoreMap.slice(0, sentenceCount).sort((a, b) => a.index - b.index);

        const summary = topSentences.map(item => sentences[item.index]).join(' ');
        pp.postMessage(summary);
    });
}