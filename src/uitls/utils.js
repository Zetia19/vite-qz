/**
 * 工具函数封装
 */
export default {
    formateDate(date, rule) {
        // 设置默认格式
        let fmt = rule || 'yyyy-MM-dd hh:mm:ss';

        const o = {
            'y+': date.getFullYear(), // 年份
            'M+': date.getMonth() + 1, // 月份
            'd+': date.getDate(), // 日
            'h+': date.getHours(), // 小时
            'm+': date.getMinutes(), // 分
            's+': date.getSeconds() // 秒
        }
        for (let k in o) {
            const pattern = new RegExp(`(${k})`);
            const Match = pattern.exec(fmt);
            if (Match) {
                const str = o[k] + '';
                fmt = fmt.replace(Match[0], Match[0].length === 1 ? str : str.padStart(2, '0'));
            }
        }
        return fmt;
    }
}