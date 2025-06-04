'use strict';
/**
 * 要求：只改下订单状态，保证能及时返回给第三方支付服务器成功状态（必须要在5秒内返回）
 */

const db = uniCloud.database(); // 全局数据库引用
const _ = db.command; // 数据库操作符
const $ = _.aggregate; // 聚合查询操作符

module.exports = async (obj) => {
	let { data = {} } = obj;
	let {
		appid, // appid
		create_time, // 创建时间
		mch_id, // 商户号
		openid, // 用户openid
		out_bill_no, // 商户转账单号
		state, // 状态：SUCCESS
		transfer_amount, // 转账金额
		transfer_bill_no, // 微信转账单号
		transfer_remark, // 转账备注
		update_time, // 更新时间
	} = data;

	// 1. 基础验证
	if (!out_bill_no || !state) {
		console.error('缺少必要参数:', data);
		return false;
	}

	// 2. 快速响应微信支付
	let response = true;

	try {
		// 3. 获取分布式锁
		const lockKey = `withdraw_lock_${out_bill_no}`;
		const lockResult = await db.collection('sys_locks').add({
			_id: lockKey,
			createdAt: new Date(),
			expireAt: new Date(Date.now() + CONFIG.LOCK_TIMEOUT)
		}).catch(() => null);

		if (!lockResult) {
			console.log(`[${out_bill_no}] 操作正在处理中，跳过本次回调`);
			return response;
		}

		// 4. 查询现有记录
		const recordRes = await db.collection('withdraw_records')
			.where({ out_bill_no })
			.get();
		const existingRecord = recordRes.data[0];

		// 5. 状态检查与处理
		if (existingRecord) {
			// 5.1 已存在记录的情况
			if (existingRecord.status === state) {
				console.log(`[${out_bill_no}] 状态未变化，无需处理`);
				return response;
			}

			// 5.2 更新记录
			const updateData = {
				status: state,
				transfer_bill_no,
				update_time: new Date(update_time).getTime(),
				options: data // 保存完整回调数据
			};

			if (state === 'FAIL') {
				updateData.error_msg = data.fail_reason || '未知错误';
			}

			await db.collection('withdraw_record')
				.doc(existingRecord._id)
				.update(updateData);
		} else {
			// 5.3 新记录（异常情况）
			const date = new Date(create_time);
			if (!openid) {
				console.error(`[${out_bill_no}] 缺少用户openid，无法创建新记录`);
				return response;
			}

			await db.collection('withdraw_records').add({
				user_id: openid,
				amount: parseFloat(transfer_amount / 100), // 转换为元并确保精度
				status: state,
				out_bill_no,
				transfer_bill_no,
				options: data,
				year: date.getFullYear(),
				month: date.getMonth() + 1,
				week: getWeekNumber(date),
				day: date.getDate(),
				create_time: date.getTime(),
				update_time: new Date(update_time).getTime(),
				error_msg: state === 'FAIL' ? (data.fail_reason || '未知错误') : ''
			});
		}

		// 6. 业务处理
		// if (state === 'SUCCESS') {
		//   await handleSuccessBusiness(out_bill_no, transfer_amount);
		// }

	} catch (e) {
		console.error(`[${out_bill_no}] 处理失败:`, e);
		await db.collection('error_logs').add({
			type: 'withdraw_callback',
			out_bill_no,
			error: e.message,
			data: JSON.stringify(data),
			createdAt: new Date().getTime()
		});
		response = false; // 通知微信需要重发
	} finally {
		// 7. 释放锁（实际可通过TTL自动过期）
		try {
			await db.collection('sys_locks').doc(lockKey).remove();
		} catch (e) {
			console.error(`[${out_bill_no}] 释放锁失败:`, e);
		}
	}

	return response;
};

// 获取ISO周数
function getWeekNumber(date) {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
	const week1 = new Date(d.getFullYear(), 0, 4);
	return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}