import path from "path"
import * as fs from 'fs'

export const getTitles = () => {
    const titleFilePattern = /[\s\S]*\.title/g

    const postDirs = getPostDirs()
    return postDirs.map(dir => (
        {
            postId: dir,
            title: fs.readdirSync(path.join(process.cwd(), 'blogs', dir)).find(file => titleFilePattern.test(file))?.replace('.title', '') ?? '無題'
        }
    )
    )
}

export const getTitleById = (id: string) => {
    const titleFilePattern = /[\s\S]*\.title/g

    const postDirs = getPostDirs()
    const postDir = postDirs.find(dir => dir === id);
    if (!postDir) {
        return '無題'
    }
    return fs.readdirSync(path.join(process.cwd(), 'blogs', postDir)).find(file => titleFilePattern.test(file))?.replace('.title', '') ?? '無題'
}

export const getPostDirs = () => {
    const publicPath = path.join(process.cwd(), 'blogs')
    const files = fs.readdirSync(publicPath)

    return files.filter((file) => {
        return fs.statSync(path.join(publicPath, file)).isDirectory()
    })
}