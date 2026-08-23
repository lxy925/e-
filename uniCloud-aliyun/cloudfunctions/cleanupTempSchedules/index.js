const db = uniCloud.database();

// 获取当前北京时间的时间戳（毫秒）
const getBeijingTimestamp = () => {
  const now = new Date();
  return now.getTime() + (now.getTimezoneOffset() * 60 * 1000) + (8 * 60 * 60 * 1000);
};

exports.main = async () => {
  // 获取北京时间戳
  const beijingTimestamp = getBeijingTimestamp();
  const beijingDate = new Date(beijingTimestamp);
  
  // 获取北京时间的星期几（0=周日,1=周一...6=周六）
  const dayOfWeek = beijingDate.getUTCDay(); 

  console.log('北京时间:', beijingDate.toLocaleString('zh-CN'));
  console.log('星期几:', dayOfWeek);

 
  
  // 只在北京时间周一清理
  if (dayOfWeek === 1 ) {
    // 计算本周周一的0点（北京时间）
    const monday = new Date(beijingTimestamp);
    monday.setUTCDate(monday.getUTCDate() - monday.getUTCDay() + 1);
    monday.setUTCHours(0, 0, 0, 0);
    
    // 使用毫秒级时间戳（与数据库存储格式一致）
    const weekStart = monday.getTime();
    
    console.log('本周开始时间:', new Date(weekStart).toLocaleString('zh-CN'));
    console.log('比较条件: tempData.week_start_date <', weekStart);
    
    // 获取所有数据
    const allData = await db.collection('time_temporary').get();
    
    let deletedCount = 0;
    
    // 遍历所有文档，处理嵌套的 tempData 数组
    for (const doc of allData.data) {
      if (doc.tempData && Array.isArray(doc.tempData)) {
        // 过滤掉过期的临时数据
        const originalLength = doc.tempData.length;
        doc.tempData = doc.tempData.filter(item => {
          // 如果 week_start_date 不存在或大于等于本周开始时间，保留
          if (!item.week_start_date || item.week_start_date >= weekStart) {
            return true;
          }
          // 否则删除
          deletedCount++;
          return false;
        });
        
        // 如果数据有变化，更新文档
        if (doc.tempData.length !== originalLength) {
          await db.collection('time_temporary')
            .doc(doc._id)
            .update({
              tempData: doc.tempData
            });
        }
      }
    }
    
    return { 
      code: 200,
      message: `已清除${deletedCount}条过期临时数据`,
      weekStart: new Date(weekStart).toLocaleString('zh-CN'),
      deletedCount: deletedCount
    };
  }
  
  return { code: 500, message: '非周一无需清理' };
};