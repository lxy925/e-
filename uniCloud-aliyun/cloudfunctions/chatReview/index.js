'use strict';
const db = uniCloud.database();
const ordersCollection = db.collection('order');
const reviewsCollection = db.collection('reviews');
const summariesCollection = db.collection('visit_summaries');

exports.main = async (event, context) => {
	const { action, data } = event;
	
	try {
		switch (action) {
			case 'checkOrderAndReview':
				return await checkOrderAndReview(data);
			case 'checkOrderAndSummary':
				return await checkOrderAndSummary(data);
			case 'submitReview':
				return await submitReview(data);
			case 'submitSummary':
				return await submitSummary(data);
			default:
				return {
					code: 400,
					msg: '未知的操作类型'
				};
		}
	} catch (e) {
		console.error('操作失败:', e);
		return {
			code: 500,
			msg: e.message || '操作失败'
		};
	}
};

// 检查订单和评价
async function checkOrderAndReview(data) {
	const { userId, escortId } = data;
	
	const { data: orders } = await ordersCollection
		.where({
			user_id: userId,
			escort_id: escortId,
			order_status: '已完成'
		})
		.get();
		
	if (orders && orders.length > 0) {
		const completedOrder = orders[0];
		
		const { data: reviews } = await reviewsCollection
			.where({
				order_id: completedOrder._id
			})
			.get();
			
		return {
			code: 200,
			data: {
				hasOrder: true,
				orderId: completedOrder._id,
				hasReview: reviews && reviews.length > 0
			}
		};
	}
	
	return {
		code: 200,
		data: {
			hasOrder: false
		}
	};
}

// 检查订单和总结
async function checkOrderAndSummary(data) {
	const { userId, escortId } = data;
	
	const { data: orders } = await ordersCollection
		.where({
			escort_id: userId,
			user_id: escortId,
			order_status: '已完成'
		})
		.get();
		
	if (orders && orders.length > 0) {
		const completedOrder = orders[0];
		
		const { data: summaries } = await summariesCollection
			.where({
				order_id: completedOrder._id
			})
			.get();
			
		return {
			code: 200,
			data: {
				hasOrder: true,
				orderId: completedOrder._id,
				hasSummary: summaries && summaries.length > 0
			}
		};
	}
	
	return {
		code: 200,
		data: {
			hasOrder: false
		}
	};
}

// 提交评价
async function submitReview(data) {
	const { result } = await reviewsCollection.add(data);
	return {
		code: 200,
		data: result
	};
}

// 提交总结
async function submitSummary(data) {
	const { result } = await summariesCollection.add(data);
	return {
		code: 200,
		data: result
	};
} 