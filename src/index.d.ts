declare namespace Jafish_MStore {
    // 状态对象
    interface State {
        [key: string]: any
    }

    // 更新的值
    interface Update {
        key: string
        oldValue: any
        newValue: any
    }

    // 订阅回调格式
    type Callback = (updates: Array<Update>, adCb: () => Function) => void

    // 设置值
    type Next<T> = (state: T) => State

    // 状态类
    interface MStore<T> {
        readonly id: number
        state: T
        hooks: Array<Callback>
        updates: Array<Update>

        // 获取状态
        get(): T
        // 设置状态
        set(next: State): Promise<void>
        set(next: Next<T>): Promise<void>
        // 订阅
        subscribe(callback: Callback): Function
        // 异步通知订阅者
        runSubscribe(datas: Array<Update>): Promise<void>
    }

    // 插件格式
    interface Plugin {
        init: (store: MStore<any>) => void
    }

    // 插件配置参数
    interface PluginOptions {
        useShort?: boolean // 使用临时缓存 sessionStorage
    }

    // easySet 相关
    type EasySet<T> = (newState: State) => Next<T> 
    interface EasySetSource {
        k: string
        v: any
    }
}
