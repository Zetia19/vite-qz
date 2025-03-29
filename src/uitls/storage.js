// storage二次封装
import config from "../config"

export default {
    setItem(key,val){
        let storage = this.getStorage();
        storage[key] = val;  //key是变量，所以不能用点语法，要用中括号语法
        window.localStorage.setItem(config.namespace,JSON.stringify(storage))
    },
    getItem(key){
        return this.getStorage()[key] || "" ;
    },
    getStorage(){
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