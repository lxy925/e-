'use strict';
// 云函数 addEscort/index.js
exports.main = async (event, context) => {
	const db = uniCloud.database();
	const {
		user_id,
		name,
		age,
		gender,
		phone,
		city,
		idNumber,
		avatarList,
		qualificationNumber,
		certificateList,
		self_introduction,
		language,
		provide_transport,
		familiar_hospitals,
		familiar_departments
	} = event;


	try {
		// 将数据存储到云数据库
		const result = await db.collection('escorts').add({
			user_id: user_id,
			name: name,
			age: age,
			gender: gender,
			phone: phone,
			address: city,
			card_id: idNumber,
			avatarUrl: avatarList,
			qualification_id: qualificationNumber,
			is_certified:false,
			is_bookable:false,
			state:"待审核"


		});
		console.log('Insert result:', result);
		if (!result.id) {
			throw new Error('Insert operation did not return a valid _id');
		}
		
		// 调用 addEscortMore 云函数
		const moreResult = await uniCloud.callFunction({
			name: 'addEscortMore',
			data: {
				// 传递需要存储到 escorts_more 表的数据
				moreData: {
					user_id: user_id,
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