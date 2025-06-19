'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	uniCloud.database().collection('questions').get()
	.then(res =>{
		console.log('题库数据',res)
	})
	
	//返回数据给客户端
	
};
