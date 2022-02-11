const comicTitleSplit = (comicTitle) => {
    const comicArr = []
    for (let x = 0; x < comicTitle.length; x++) {
        if (x === comicTitle.length - 1) {
            comicArr.push(comicTitle)
            comicArr.push('')
        }
        if (comicTitle[x] === '#') {
            comicArr.push(comicTitle.substring(0, x - 1))
            const z = comicTitle.length - x
            for (let y = 1; y <= z; y++) {
                if (comicTitle[x + y] === ' ' || comicTitle.length === x + y) {
                    comicArr.push(comicTitle.substring(x + 1, x + y))
                }
            }
        }
    }
    return comicArr
}

module.exports = comicTitleSplit
