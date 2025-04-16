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
				state:"待审核"
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
				state:"待审核"
			});
			//更新escort_relation表（上下级关系）
			relationResult = await uniCloud.callFunction({
				name: 'escort_relation',
				data: {
					// 传递上级和下级的陪诊师id的数据
					doctorId:parentId,
					subordinateId:user_id
				}
			});
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
					familiar_departments: familiar_departments
				},
			}
		});
		console.log('Insert result:', moreResult);
		const updateResult = await uniCloud.callFunction({
			name: 'updateUser',
			data: {
				// 传递需要存储到 escorts_more 表的数据

				user_id: user_id,
				type: "陪诊师"

			}
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