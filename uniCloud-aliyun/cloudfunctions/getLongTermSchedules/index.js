'use strict';
exports.main = async (event, context) => {
	 const db = uniCloud.database()
	 
	  let user_id = event.user_id
	  try {
	    const res = await db.collection('time_base')
	      .where({ user_id })
	      .get()
	    console.log(res.data[0].longTermData)
		const longTermData=res.data[0].longTermData
	    return {
	      code: 200,
	      message: '获取成功',
	      data: longTermData
	    }
	  } catch (err) {
	    return {
	      code: 500,
	      message: '获取失败',
	      error: err
	    }
	  }
};
