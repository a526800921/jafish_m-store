/// <reference path="./index.d.ts" />

const deepNewData = (datas: Array<any>, newData = []): Array<any> => {
    if (datas.length === 0) return newData

    const data = datas.shift()

    if (datas.length === 0) newData.push(data)
    else {
        if (Array.isArray(data)) newData.push([...data])
        else newData.push({ ...data })
    }

    return deepNewData(datas, newData)
}
const splitReg: RegExp = /[.[\]]/g
const easySet: Jafish.EasySet<any> = (data) => state => {
    const newState: Jafish.State = {}

    Object.keys(data).forEach(key => {
        const germ = key.replace(splitReg, '-').split('-').filter(item => item)

        if (germ.length === 0) return
        if (germ.length === 1) return newState[germ[0]] = data[germ[0]]

        const sourceDatas: Array<Jafish.EasySetSource> = []
        const result: any = germ.reduce((downState, ckey, index) => {
            // 记录原始数据
            sourceDatas.push({ k: ckey, v: downState[ckey] })
            // 最后一个时，返回最终需要的数据
            if (index === germ.length - 1) {
                // 最后一个时，替换最终数据
                sourceDatas.splice(-1, 1, { k: ckey, v: data[key] })

                const newData: Array<any> = deepNewData(sourceDatas.map(item => item.v))
                const lastData: Jafish.State = {}
                // 重新赋值
                sourceDatas.reduce((a, item) => {
                    a[item.k] = newData.shift()

                    return a[item.k]
                }, lastData)

                return lastData[sourceDatas[0].k]
            }

            return downState[ckey]
        }, state)

        newState[germ[0]] = result
    })

    return newState
}

export default easySet
