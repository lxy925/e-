// cleanupTempSchedules/index.js
const db = uniCloud.database();
const getBeijingDate = () => {
  return new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }); // 直接获取北京时间
};

exports.main = async () => {
  const beijingNow = new Date(getBeijingDate()); // 转换为 Date 对象
  const dayOfWeek = beijingNow.getDay(); // 使用 getDay() 而非 getUTCDay()

  console.log('北京时间:', beijingNow.toLocaleString('zh-CN'));
  console.log('星期几:', dayOfWeek);

  if (dayOfWeek === 1) {
    // 计算本周周一0点（北京时间）
    const monday = new Date(beijingNow);
    monday.setDate(beijingNow.getDate() - (beijingNow.getDay() || 7) + 1);
    monday.setHours(0, 0, 0, 0);
    const weekStart = monday.getTime();

    const res = await db.collection('time_temporary')
      .where({ week_start_date: db.command.lt(weekStart) })
      .remove();
    return { 
      code: 200,
      message: `已清除${res.deleted}条过期临时数据`,
      weekStart
    };
  }
  
  return { code: 0, message: '非周一无需清理' };
};