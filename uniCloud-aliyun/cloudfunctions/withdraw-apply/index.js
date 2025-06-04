'use strict';
const db = uniCloud.database();
const withdrawRecords = db.collection('withdraw_records');
const escortAccount = db.collection('escort_account');
// const uniPay = uniCloud.importObject('uni-pay');
const jwt = require('./jwt.js');

exports.main = async (event, context) => {
	const {
		accountInfo,
		amount,
		
	} = event;

	// 参数校验
	if (!accountInfo.user_id || !amount || amount <= 0 ) {
		return {
			code: 400,
			msg: '参数错误'
		};
	}

	let openid;
	// 验证主token
	try {
		let decoded = jwt.verifyToken(accountInfo.user_id);
		openid = decoded.userId;
		if (!openid) {
			return {
				code: 403,
				msg: 'Token无效'
			};
		}
	} catch (err) {
		return {
			code: 401,
			msg: '登录过期，需重新登录'
		};
		
	}

	console.log("账户id", openid);

	// // 查询用户账户
	// const accountRes = await escortAccount.where({
	// 	user_id: openid
	// }).get();

	// console.log("账户", accountRes);

	// if (accountRes.data.length === 0) {
	// 	return {
	// 		code: 404,
	// 		msg: '账户不存在'
	// 	};
	// }

	// const account = accountRes.data[0];
	// console.log("提取的钱", amount)
	// console.log("余额", account)
	// 检查余额
	if (accountInfo.withdrawable_amount < amount) {
		return {
			code: 403,
			msg: '余额不足'
		};
	}

	// 开始事务
	const transaction = await db.startTransaction();
	try {
		// 冻结金额
		await transaction.collection('escort_account').doc(accountInfo._id).update({
			withdrawable_amount: accountInfo.withdrawable_amount - amount,
			frozen_amount: (accountInfo.frozen_amount || 0) + amount,
			update_time: Date.now()
		});

		// 创建提现记录
		const record = {
			openid,
			amount,
			status: 'PROCESSING',
			create_time: Date.now(),
			update_time: Date.now(),
			year: new Date().getFullYear(),
			month: new Date().getMonth() + 1,
			week: getWeekNumber(new Date()),
			day: new Date().getDate()
		};

		const recordRes = await transaction.collection('withdraw_records').add(record);
		const _id=recordRes.id;
		// 提交事务
		await transaction.commit();

		// 异步触发提现处理（放在事务外）
		try {
			const {
				result
			} =await uniCloud.callFunction({
				name: 'withdraw-process',
				data: {
					_id: recordRes.id,
					user_id: openid,
					amount: amount
				}
			});
			console.log("result.data",result.data)
			if(result.code==200){
				return {
					code: 201,
					msg: result.msg,
					data: {
						options:result.data.options,
						out_bill_no:result.data.out_bill_no
					}
			}
			}
		} catch (e) {
			console.error('异步提现处理失败:', e);
			
			await db.collection('withdraw_records').doc(_id).update({
			  status: 'FAIL',
			  error_msg: e.message,
			  update_time: Date.now()
			});
		}

		return {
			code: 200,
			msg: '提现申请已提交',
			data: {
				record_id: recordRes.id,
				user_id:openid
			}
		};
	} catch (e) {
		// 确保事务已回滚
		if (transaction) {
			try {
				await transaction.rollback();
			} catch (rollbackErr) {
				console.error('事务回滚失败:', rollbackErr);
			}
		}
		console.error('提现申请提交失败:', e);
		
		await db.collection('withdraw_records').doc(_id).update({
		  status: 'FAIL',
		  error_msg: e.message,
		  update_time: Date.now()
		});
		return {
			code: 500,
			msg: '提现申请提交失败',
			error: e.message
		};
	}
};

// 辅助函数：获取周数
function getWeekNumber(date) {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
	const week1 = new Date(d.getFullYear(), 0, 4);
	return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}