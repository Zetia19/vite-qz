// storage二次封装
import config from "../config"

export default {
    setItem(key,val){
        let storage = this.getStorage();
        storage[key] = val;  //key是变量，所以不能用点语法，要用中括号语法
        window.localStorage.setItem(config.namespace,JSON.stringify(storage))
    },

    //获取本地存储对象中的某个值
    getItem(key){   
     /* 1. this.getStorage() 调用 getStorage 方法获取本地存储对象。
        2. [key] 中括号语法用于动态访问对象的属性。*/
        return this.getStorage()[key] || "" ;
    },

    //获取本地存储对象
    getStorage(){   
        //从浏览器本地存储中获取指定键名（config.namespace）对应的值
        /*
          将其解析为 JSON 对象: localStorage只能存储字符串类型数据，
        通过JSON序列化可以保存复杂数据结构（对象、数组等）。
        */ 
        return JSON.parse(window.localStorage.getItem(config.namespace) || "{}");
    },
    clearItem(key){
        let storage = this.getStorage();
        delete storage[key];
        window.localStorage.setItem(config.namespace,JSON.stringify(storage))
    },
    clearAll(){
        window.localStorage.clear();
    }
}