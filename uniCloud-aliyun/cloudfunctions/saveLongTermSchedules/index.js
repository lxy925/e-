'use strict';
exports.main = async (event, context) => {
	const db = uniCloud.database()
	 let user_id = event.user_id
	  const longTermData  = event.longTermData
	  
	  try {
	  // 检查是否已有该用户的数据
	          const countRes = await db.collection('time_base')
	              .where({ user_id })
	              .count();
	          
	          if (countRes.total > 0) {
	              // 已有数据，执行更新操作
	              // 先删除该用户的所有旧数据
	              await db.collection('time_base')
	                  .where({ user_id })
	                  .update({
						  longTermData
					  });
	              
	              
	              
	              return {
	                  code: 200,
	                  message: '更新成功',
	                
	              };
	          } else {
	              // 没有数据，直接插入
	              const addRes = await db.collection('time_base')
	                  .add({
						  user_id,
	                      longTermData
	                  });
	              
	              return {
	                  code: 200,
	                  message: '新增成功',
	                 
	              };
	          }
	  } catch (err) {
	    return {
	      code: 500,
	      message: '保存失败',
	      error: err
	    }
	  }
	
};
