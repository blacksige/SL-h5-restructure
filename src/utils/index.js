// 计算当前星期
function getWeek(dateString) {
  let dateArray = dateString.split('-');
  let date = new Date(dateArray[0], parseInt(dateArray[1] - 1), dateArray[2]);
  return '星期' + '日一二三四五六'.charAt(date.getDay());
};
// 数组切割
function group(array, subGroupLength) {
  let index = 0;
  let newArray = [];
  while (index < array.length) {
    newArray.push(array.slice(index, index += subGroupLength));
  }
  return newArray;
}
function countDown(startTime, endTime) {
  let nowtime = startTime; // 获取当前时间
  let endtime = new Date(endTime); // 定义结束时间
  let lefttime = endtime.getTime() - nowtime; // 距离结束时间的毫秒数
  let leftd = Math.floor(lefttime / (1000 * 60 * 60 * 24)); // 计算天数
  let lefth = Math.floor(lefttime / (1000 * 60 * 60) % 24); // 计算小时数
  let leftm = Math.floor(lefttime / (1000 * 60) % 60); // 计算分钟数
  let lefts = Math.floor(lefttime / 1000 % 60); // 计算秒数
  if (lefttime <= 0) {
    return 0;
  } else {
    return leftd + '天' + lefth + '时' + leftm + '分' + lefts + '秒';// 返回倒计时的字符串
  }
}

export { getWeek, group, countDown };
