// 云函数 deleteUserAddress 的 index.js（增加详细日志）
'use strict';
const db = uniCloud.database();
const https = require('https');

exports.main = async (event) => {
	console.log('【1. 收到到删除请求】参数:', event); // 打印始日志

	try {
		const appid = 'wxf8afb6dce14d487a'; // 建议迁移到环境变量
		const secret = '06d3e5f2f7ed1bf8504fe90a1a1e04e5';
		const COLLECTION_NAME = 'user_address'; // 确认集合名是否正确
		let openid = '';

		// 1. 获取 openid
		if (event.wxContext && event.wxContext.OPENID) {
			openid = event.wxContext.OPENID;
			console.log('【2. 通过 wxContext 获取 openid】', openid);
		} else if (event.js_code) {
			console.log('【2. 开始始通过 js_code 获取 openid】');
			const getOpenid = () => {
				return new Promise((resolve, reject) => {
					const url =
						`https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${event.js_code}&grant_type=authorization_code`;
					https.get(url, (res) => {
						let data = '';
						res.on('data', (chunk) => data += chunk);
						res.on('end', () => {
							console.log('【3. 微信接口返回结果】', data); // 打印微信返回的完整数据
							const result = JSON.parse(data);
							if (result.openid) {
								resolve(result.openid);
							} else {
								reject({
									code: 401,
									message: `微信接口错误: ${result.errmsg}`
								});
							}
						});
					}).on('error', (err) => {
						reject({
							code: 500,
							message: `请求微信接口失败: ${err.message}`
						});
					});
				});
			};
			openid = await getOpenid();
			console.log('【3. 通过 js_code 获取到 openid】', openid);
		} else {
			return {
				code: 401,
				message: '未获取到用户身份'
			};
		}

		// 2. 校验 addressId
		if (!event.addressId) {
			return {
				code: 400,
				message: '缺少 addressId'
			};
		}
		console.log('【4. 待删除的 addressId】', event.addressId);

		// 3. 执行删除逻辑
		const deleteResult = await deleteAddress({
			addressId: event.addressId,
			openid: openid,
			collectionName: COLLECTION_NAME
		});
		return deleteResult;

	} catch (error) {
		console.error('【全局错误捕获】', error); // 打印完整错误栈
		return {
			code: 500,
			message: `删除失败: ${error.message}` // 返回具体错误原因
		};
	}
};

async function deleteAddress({
	addressId,
	openid,
	collectionName
}) {
	try {
		// 1. 查询地址（结果是数组，需取第一个元素）
		const addressRes = await db.collection(collectionName).doc(addressId).get();
		console.log('【6. 地址查询原始结果】', addressRes); // 确认返回结构

		// 2. 从数组中取第一个元素（关键修复）
		const address = addressRes.data && addressRes.data.length > 0 ? addressRes.data[0] : null;
		if (!address) { // 若数组为空，说明地址不存在
			console.error('【7. 地址不存在】查询结果数组为空');
			return {
				code: 404,
				message: '地址不存在'
			};
		}

		// 3. 校验 user_id（现在从正确的地址对象中获取）
		if (address.user_id !== openid) {
			console.error('【7. 权限校验失败】地址所属 user_id:', address.user_id, '当前用户 openid:', openid);
			return {
				code: 403,
				message: '无权限删除此地址'
			};
		}

		// 4. 执行删除（正常执行）
		const removeRes = await db.collection(collectionName).doc(addressId).remove();
		console.log('【8. 删除成功】结果:', removeRes);
		return {
			code: 200,
			message: '删除成功',
			data: removeRes
		};
	} catch (error) {
		console.error('【删除函数内部错误】', error);
		return {
			code: 500,
			message: `删除失败: ${error.message}`
		};
	}
}