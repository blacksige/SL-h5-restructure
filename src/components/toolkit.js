// 计时器
function TimeFormat(time) {
  var m = Math.floor(time / 60);
  m = m > 9 ? m : (m > 0 ? '0' + m : '00');
  var s = time % 60;
  s = s > 9 ? s : (s > 0 ? '0' + s : '00');
  return m + ':' + s;
};
export { TimeFormat };
