/// <reference path="./index.d.ts" />

var id: number = 1

export default class MStorer<T> implements Jafish_MStore.MStore<T> {
    readonly id: number = id++
    state: T = null
    hooks: Array<Jafish_MStore.Callback> = []
    updates: Array<Jafish_MStore.Update> = []

    constructor(state: T, plugins?: Array<Jafish_MStore.Plugin>) {
        if (!state) throw new Error('请传入初始数据')

        this.state = state

        !!plugins && plugins.forEach(plugin => plugin.init(this))
    }

    // 获取状态
    get(): T {
        return this.state
    }

    // 设置状态
    set(next: Jafish_MStore.State | Jafish_MStore.Next<T>): Promise<void> {
        const newState: Jafish_MStore.State = typeof next === 'function' ? next(this.state) : next
        const updates: Array<Jafish_MStore.Update> = []

        Object.keys(newState).forEach(key => {
            const oldValue = this.state[key]
            const newValue = newState[key]

            if (oldValue === void 0 || newValue === void 0) return

            // 仅做浅比较，完全比较会消耗性能
            const change = oldValue !== newValue/*  && JSON.stringify(oldValue) !== JSON.stringify(newValue) */

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
    subscribe(callback: Jafish_MStore.Callback): Function {
        this.hooks.push(callback)

        return () => {
            // 取消订阅
            const index = this.hooks.indexOf(callback)

            if (index > -1) this.hooks.splice(index, 1)
        }
    }

    // 异步通知订阅者
    runSubscribe(datas: Array<Jafish_MStore.Update>): Promise<void> {
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


