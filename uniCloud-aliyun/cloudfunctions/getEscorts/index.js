'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
	console.log('event',event)
    const { timeObj, isFromOrder , searchKeyword} = event;
    const currentDate = new Date();
    const currentWeekStart = getWeekStartDate(currentDate);
    
    try {
        console.log('开始获取陪诊师数据');
       // 1. 构建基础查询条件
           let query = db.collection('escorts').aggregate()
             .lookup({
               from: 'escorts_more',
               localField: 'user_id',
               foreignField: 'user_id',
               as: 'moreInfo'
             })
             .unwind('$moreInfo');
       
           // 2. 添加姓名搜索条件（如果有搜索关键词）
           if (searchKeyword && searchKeyword.trim()) {
             query = query.match({
               name: new RegExp(searchKeyword, 'i') // 不区分大小写的模糊搜索
             });
           }
       
           // 3. 如果不是从order页面进入，直接返回所有陪诊师
           if (!isFromOrder) {
             const escortsRes = await query.end();
			 console.log("按名字查询",escortsRes)
             return {
               success: true,
               data: escortsRes.data.sort((a, b) => b.moreInfo.rating - a.moreInfo.rating)
             };
           }
       
           // 4. 从order页面进入的逻辑（按时间筛选）
           const escortsRes = await query.end();
           if (!escortsRes.data || escortsRes.data.length === 0) {
             return {
               success: true,
               data: [],
               msg: "没找到陪诊师"
             };
           }
        const escortIds = escortsRes.data.map(escort => escort.user_id);
		console.log("timeObj",timeObj)
        const dayOfWeek = timeObj < 7 ? timeObj + 1 : (timeObj - 6);
        const timePeriod = timeObj < 7 ? 1 : 2;
        console.log("dayOfWeek,timePeriod",dayOfWeek,timePeriod)
        // 2. 查询临时安排
        const tempRes = await db.collection('time_temporary')
            .where({
                user_id: db.command.in(escortIds),
               
            })
            .get();
        
        // 3. 查询长期安排
        const longTermRes = await db.collection('time_base')
            .where({
                user_id: db.command.in(escortIds)
            })
            .get();
        
        // 4. 处理可用陪诊师ID
        const availableEscortIds = new Set();
        console.log("tempRes",tempRes)
        // 处理临时安排
        tempRes.data.forEach(tempRecord => {
            const matchedTempData = tempRecord.tempData.find(item => 
                item.day_of_week === dayOfWeek && 
                item.time_period === timePeriod
            );
            console.log("找到的第一个matchedTempData",matchedTempData)
            if (matchedTempData && matchedTempData.status === 1) {
                availableEscortIds.add(tempRecord.user_id);
            }
        });
		 console.log("availableEscortIds",availableEscortIds)
         console.log("longTermRes",longTermRes)
        // 处理长期安排（只处理没有临时安排的陪诊师）
        const escortsWithoutTemp = escortIds.filter(id => !availableEscortIds.has(id));
        longTermRes.data.forEach(longTermRecord => {
            if (!escortsWithoutTemp.includes(longTermRecord.user_id)) return;
            
            const matchedLongTermData = longTermRecord.longTermData.find(item =>
                item.day_of_week === dayOfWeek && 
                item.time_period === timePeriod
            );
            
            if (matchedLongTermData && matchedLongTermData.status === 1) {
                availableEscortIds.add(longTermRecord.user_id);
            }
        });
        
        // 5. 筛选出符合条件的陪诊师
        const availableEscorts = escortsRes.data.filter(escort => 
            availableEscortIds.has(escort.user_id))
            .sort((a, b) => b.moreInfo.rating - a.moreInfo.rating);
        
        return {
            success: true,
            data: availableEscorts
        };
    } catch (e) {
        console.error('错误：', e);
        return {
            code: -1,
            msg: e.message || '获取陪诊师集合失败'
        };
    }
};

function getWeekStartDate(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).setHours(0, 0, 0, 0);
}