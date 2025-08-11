'use strict';
const db = uniCloud.database();
const refundsCollection = db.collection('refund'); // 退款记录所在集合

/**
 * 更新退款记录状态
 * @param {Object} event - 前端传递的参数
 * @param {string} event.refund_id - 退款记录ID
 * @param {string} event.status - 退款状态（如：SUCCESS、FAIL、PROCESSING等）
 * @param {Object} event.refund_data - 退款相关数据（如微信支付返回的退款结果）
 * @param {number} event.update_time - 更新时间戳
 */
exports.main = async (event, context) => {
	try {
		// 校验必填参数
		if (!event.refund_id) {
			return {
				code: -1,
				msg: 'refund_id不能为空',
				data: null
			};
		}

		// 构建更新数据（只包含需要更新的字段）
		const updateData = {
			status: event.status,
			update_time: event.update_time,
			// 仅当refund_data存在时才更新该字段
			...(event.refund_data && {
				refund_data: event.refund_data
			})
		};

		// 执行更新操作（根据refund_id匹配记录）
		const updateResult = await refundsCollection
			.where({
				_id: event.refund_id // 匹配条件：refund_id相等
			})
			.update(updateData);

		// 处理更新结果
		if (updateResult.stats.updated === 0) {
			// 没有匹配到记录
			return {
				code: -2,
				msg: `未找到refund_id为${event.refund_id}的记录`,
				data: updateResult
			};
		}

		// 更新成功
		return {
			code: 0,
			msg: '退款记录状态更新成功',
			data: {
				updated: updateResult.stats.updated, // 实际更新的记录数
				refund_id: event.refund_id,
				status: event.status
			}
		};

	} catch (error) {
		// 捕获异常并返回
		console.error('更新退款记录失败：', error);
		return {
			code: 500,
			msg: '更新退款记录失败',
			data: error.message
		};
	}
};