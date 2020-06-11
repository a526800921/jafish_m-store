/// <reference path="./index.d.ts" />

var id: number = 1

export default class MStorer<T> implements Jafish.MStore<T> {
    readonly id: number = id++
    state: T = null
    hooks: Array<Jafish.Callback> = []
    updates: Array<Jafish.Update> = []

    constructor(state: T, plugins?: Array<Jafish.Plugin>) {
        if (!state) throw new Error('请传入初始数据')

        this.state = state

        !!plugins && plugins.forEach(plugin => plugin.init(this))
    }

    // 获取状态
    get(): T {
        return this.state
    }

    // 设置状态
    set(next: Jafish.State | Jafish.Next<T>): Promise<void> {
        const newState: Jafish.State = typeof next === 'function' ? next(this.state) : next
        const updates: Array<Jafish.Update> = []

        Object.keys(newState).forEach(key => {
            const oldValue = this.state[key]
            const newValue = newState[key]

            if (oldValue === void 0 || newValue === void 0) return

            const change = oldValue !== newValue && JSON.stringify(oldValue) !== JSON.stringify(newValue)

            if (change) {
                updates.push({
                    key,
                    oldValue,
                    newValue,
                })

                this.state[key] = newState[key]
            }
        })

        if (updates.length) {
            // 更新
            return this.runSubscribe(updates)
        } else return Promise.resolve()
    }

    // 订阅
    subscribe(callback: Jafish.Callback): Function {
        this.hooks.push(callback)

        return () => {
            // 取消订阅
            const index = this.hooks.indexOf(callback)

            if (index > -1) this.hooks.splice(index, 1)
        }
    }

    // 异步通知订阅者
    runSubscribe(datas: Array<Jafish.Update>): Promise<void> {
        this.updates.push(...datas)

        return Promise.resolve().then(() => {
            if (!this.updates.length) return

            const updates = this.updates.splice(0, this.updates.length)
            const cbs: Array<Promise<void>> = []

            this.hooks.forEach(fn => fn(
                updates,
                () => {
                    // 用作 setState 或类似操作 的回调，保证状态修改后顺序执行能够拿到最新数据
                    var reso: Function
                    const promise: Promise<void> = new Promise(resolve => reso = resolve)

                    cbs.push(promise)

                    return () => reso()
                }
            ))

            if (cbs.length > 0) return Promise.all(cbs).then(() => void 0)
        })
    }
}


