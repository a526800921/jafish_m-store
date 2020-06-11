# @jafish/m-store

![https://img.shields.io/npm/v/@jafish/m-store](https://www.npmjs.com/package/@jafish/m-store)

简易的状态管理库，仅有 get set subscribe

可以针对不同的功能分别实现各自的状态，分布式管理

### 使用

```javascript
import MStore, { UseStorage } from '@jafish/m-store'

// 初始化
export const store = new MStore({
    test: 1
}, [
    new UseStorage('namespace', ['test'])
])

// 设置值
store.set({ test: 2 })
store.set(state => ({ test: state.test + 1 }))

// 获取值
console.log(store.get().test)

// 发起订阅，拿到变更的值
const subscriber = store.subscribe((updates) => {
    console.log(updates)
})

// 取消订阅
subscriber()
```

### API

> get(): state

返回最新的全部状态

> set(newState | state => newState)

设置新的状态，接受两种参数，对象或函数

设置值是同步设置的，通知订阅者是异步通知的

```javascript
store.set({ 
    test: 1,
    test2: 2,
})

store.set(state => ({
    test: state.test + 1,
}))
```

> subscribe(updates => {}): unsubscribe()

发起订阅，当数据改变时，触发更新。返回一个取消订阅的方法

```javascript
const subscriber = store.subscribe(updates => {
    updates.forEach(item => {
        item.key
        item.newValue
        item.oldValue
    })
    
    console.log(updates)
})

// 取消订阅
subscriber()
```

### 插件

> UseStorage

使用 storage 进行缓存

```javascript
new MStore({
    test: 1
}, [
    new UseStorage(
        'namespace', // 命名空间，唯一值 
        ['test'], // 需要缓存的key，与传入的状态对应
        { // 配置项，可选
            // 为 true 时使用 sessionStorage ，默认使用 localStorage 进行缓存
            useShort: false, 
        }
    )
])
```

### 工具

> easySet

能够更加容易的进行赋值

```javascript
import MStore, { easySet } from '@jafish/m-store'

// 假如有复杂类型的值
export const store = new MStore({
    obj: {
        a: 1,
        b: 2,
    },
    arr: [
        {
            c: 3
        }
    ]
})

// 在常见情况，想要仅修改一个值，会显得尤为复杂
store.set(state => ({
    obj: {
        ...state.obj,
        b: 4,
    },
}))
store.set(state => {
    const arr = state.arr.slice()

    arr.splice(0, 1, {
        c: 5
    })

    return {
        arr
    }
})

// 针对复杂结构赋值，可以使用 easySet
// 写法参照微信小程序的 this.setData({ 'obj.b': 4 })
store.set(easySet({
    'obj.b': 4,
    'arr[0].c': 5,
}))

// ps: 相同顶级key一次只能赋值一个
// 如：该情况后面的会覆盖前面的
store.set(easySet({
    'arr[0].c': 5,
    'arr[1].c': 5,
}))
```

合理使用 easySet 可以大大的简化重复代码，更加直观

### 实践

```javascript
import MStore, { UseStorage } from '@jafish/m-store'

// 初始化
export const store = new MStore({
    test: 1
}, [
    new UseStorage('namespace', ['test'])
])

// 修改 test
export const updateTest = (num) => {
    ... // 其他操作

    store.set({ test: num })
} 

// 异步修改 test
export const syncUpdateTest = async (num) => {
    const { test } = store.get()

    const newTest = await axios.post('xxx', { test })

    store.set(state => ({
        test: state.test + newTest
    }))
}
```


