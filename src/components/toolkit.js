// 计时器
function TimeFormat(time) {
  let m = Math.floor(time / 60);
  m = m > 9 ? m : (m > 0 ? '0' + m : '00');
  let s = time % 60;
  s = s > 9 ? s : (s > 0 ? '0' + s : '00');
  return m + ':' + s;
};
// 获取当前日期时间
function current() {
  let d = new Date();
  let str = '';
  // str += d.getFullYear() + '年'; // 获取当前年份
  // str += d.getMonth() + 1 + '月'; // 获取当前月份（0——11）
  // str += d.getDate() + '日';
  str += d.getHours() + ':';
  str += d.getMinutes() + ':';
  str += d.getSeconds();
  return str;
}
export { TimeFormat, current };
