import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

async function vectorizeTexts(texts: string[]): Promise<tf.Tensor2D> {
    const model = await use.load();
    const embeddings = await model.embed(texts);
    return embeddings;
}

export async function searchSimilarTexts(query: string, texts: string[]): Promise<{ text: string; similarity: number }[]> {
    const model = await use.load();
    const queryEmbedding = await model.embed([query]);
    const textEmbeddings = await vectorizeTexts(texts);

    const similarities = tf.tidy(() => {
        const queryTensor = queryEmbedding.shape;
        const textTensor = textEmbeddings.reshape([texts.length, -1]);
        const querySim = tf.matMul(queryTensor, textTensor.transpose()).flatten();
        return querySim.arraySync() as number[];
    });

    const results = texts.map((text, index) => ({
        text,
        similarity: similarities[index],
    }));

    results.sort((a, b) => b.similarity - a.similarity);
    return results;
}

