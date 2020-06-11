/// <reference path="./index.d.ts" />

const setItem = (key: string, value: any, useShort?: boolean) => (useShort ? sessionStorage : localStorage).setItem(key, JSON.stringify(value))
const getItem = (key: string, useShort?: boolean) => {
   const data = (useShort ? sessionStorage : localStorage).getItem(key)

   if (data === null) return void 0

   try {
      return JSON.parse(data)
   } catch (error) {
      console.error(error)

      return data
   }
}

const getKey = (name: string, key: string): string => `storage/${name}/${key}`

export default class UseStorage {
   name: string
   keys: Array<string>
   options: Jafish.PluginOptions

   constructor(name: string, keys: Array<string>, options: Jafish.PluginOptions) {
      this.name = name || 'default'
      this.keys = keys || []
      this.options = Object.assign({
         useShort: false, // 使用临时缓存 sessionStorage
      }, options || {})
   }

   init(store: Jafish.MStore<any>) {
      const { useShort } = this.options

      // 读缓存
      const cache: Jafish.State = this.keys.reduce((obj, key) => {
         const value = getItem(getKey(this.name, key), useShort)

         if (value !== void 0) obj[key] = value

         return obj
      }, {})

      // 初始化
      store.set(cache)
      // 监听缓存
      store.subscribe(updates => {
         updates.forEach(item => {
            const useCache = this.keys.indexOf(item.key) > -1

            if (useCache) setItem(getKey(this.name, item.key), item.newValue, useShort)
         })
      })
   }
}

