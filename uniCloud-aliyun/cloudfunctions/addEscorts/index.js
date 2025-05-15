'use strict';
// 云函数 addEscort/index.js
const jwt = require('../common/jwt.js');
exports.main = async (event, context) => {
	const db = uniCloud.database();
	const {
		type,
		
		name,
		age,
		gender,
		
		city,
		
		avatarList,
		
		certificateList,
		self_introduction,
		language,
		provide_transport,
		familiar_hospitals,
		familiar_departments,
		parentId
	} = event;
	console.log(event)
let	user_id=jwt.verifyToken(event.user_id).userId;
let result;
let moreResult;

	try {
		// 将数据存储到云数据库
		//用户已经入驻过
		if(type=="陪诊师"){
				
			result = await db.collection('escorts')
				
			.where({
				user_id: user_id
			})
			.update({
				name: name,
				age: age,
				gender: gender,
				
				address: city,
				
				avatarUrl: avatarList,
				
				is_certified:false,
				is_bookable:false,
				parentId:parentId,
				state:"待审核",
				
				update_time: Date.now()
			})
		}else{
			//用户未入驻过
			result = await db.collection('escorts').add({
				user_id: user_id,
				name: name,
				age: age,
				gender: gender,
				
				address: city,
				
				avatarUrl: avatarList,
				
				is_certified:false,
				is_bookable:false,
				parentId:parentId,
				state:"待审核",
				create_time:Date.now(),
				update_time: Date.now()
			});
			//更新escort_relation表（上下级关系）
			let relationResult = await uniCloud.callFunction({
				name: 'escort_relation',
				data: {
					// 传递上级和下级的陪诊师id的数据
					doctorId:parentId,
					subordinateId:user_id
				}
			});
			 //初始化账户表
				let accountResult = await db.collection('escorts').add({
					user_id,
					balance:0,
					withdrawable_amount:0,
					pending_amount:0,
					create_time:Date.now(),
					update_time: Date.now()
				})
		}
		// 调用 addEscortMore 云函数
		
		moreResult = await uniCloud.callFunction({
			name: 'addEscortMore',
			data: {
				// 传递需要存储到 escorts_more 表的数据
				moreData: {
					user_id: user_id,
					type:type,
					rating: 0,
					order: 0,
					certificate: certificateList,
					provide_transport: provide_transport,
					self_introduction: self_introduction,
					familiar_hospitals: familiar_hospitals,
					familiar_departments: familiar_departments,
					create_time:Date.now(),
					update_time: Date.now()
				},
			}
		});
		console.log('Insert result:', moreResult);
		
		// 更新表 users 中 user_id 相同的记录的 type 字段
		const updateResult = await db.collection('users').where({
		    user_id: user_id
		}).update({
		   
		        type: type
		    
		});
		
		console.log('updateResult:', updateResult);
		return {
			code: 200,
			message: '数据提交成功',
			data: result,
		};
	} catch (err) {
		return {
			code: 500,
			message: '数据提交失败',
			error: err,
		};
	}
};