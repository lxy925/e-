'use strict';
const jwt = require('./jwt.js');
exports.main = async (event, context) => {
	const db = uniCloud.database()
	 let user_id = jwt.verifyToken(event.user_id).userId;
	  
	  try {
	    // 获取本周一的日期
	    const currentDate = new Date()
	    const dayOfWeek = currentDate.getDay() || 7
	    const monday = new Date(currentDate)
	    monday.setDate(currentDate.getDate() - (dayOfWeek - 1))
	    monday.setHours(0, 0, 0, 0)
	    const weekStartTimestamp = monday.getTime()
	    
	    const res = await db.collection('time_temporary')
	      .where({ 
	        user_id
	       
	      })
	      .get()
	    
		console.log(res.data[0].tempData)
	    return {
	      code: 200,
	      message: '获取成功',
	      data: res.data[0].tempData
	    }
	  } catch (err) {
	    return {
	      code: 500,
	      message: '获取失败',
	      error: err
	    }
	  }
};
