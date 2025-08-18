'use strict';
const jwt = require('./jwt.js')
const crypto = require('crypto');
// const jwt = require('jsonwebtoken');

// 配置
const APPID = 'wxf8afb6dce14d487a';
const SECRET = '06d3e5f2f7ed1bf8504fe90a1a1e04e5';
// const JWT_SECRET = 'fc9a8d7e4b4a2c1f0e3d2c7b6a5d4e3f2c110a9f8e7d6c1es4a3f2e1dee9b8a7';
// const JWT_REFRESH_SECRET = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6';

exports.main = async (event, context) => {
	const {
		code,
		encryptedData,
		iv,
		nickName,
		realName,
		idCard,
		phoneNumber,
		avatar
	} = event;
	console.log("code是:", code);
	let openid,session_key,decryptedPhone;

	// 1. 获取openid
	const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${code}&grant_type=authorization_code`;
	let wxRes;
	try {
		wxRes = await uniCloud.httpclient.request(wxUrl, {
			dataType: 'json'
		});
		console.log('微信接口响应:', wxRes.data);
		
		openid=wxRes.data.openid;
		session_key=wxRes.data.session_key;
		// 2. 解密手机号（如果传了encryptedData）
		decryptedPhone = phoneNumber;
		if (encryptedData) {
			try {
				const decryptedData = decryptPhone(encryptedData, iv, session_key);
				return {
					code: 200,
					data: decryptedPhone = decryptedData.phoneNumber || decryptedData.purePhoneNumber
				};
			} catch (err) {
				return {
					code: -3,
					msg: '手机号解密失败',
					error: err.message
				};
			}
		}
	} catch (err) {
		return {
			code: -2,
			msg: '请求微信接口失败',
			error: err
		};
	}

	

	// 3. 数据校验
	if (!validateIdCard(idCard)) {
		return {
			code: -1,
			msg: '身份证格式错误'
		};
	}

	// 4. 存储或更新用户信息
	const db = uniCloud.database();
	const usersCollection = db.collection('users');
	let type;

	// 检查用户是否已存在
	const userRes = await usersCollection.where({
		user_id: openid
	}).get();

	if (userRes.data.length === 0) {
		// 新用户注册
		type="普通用户";
		await usersCollection.add({
			user_id: openid,
			avatar,
			nickName,
			realName,
			idNumber: idCard,
			phone: decryptedPhone,
			type:type ,
			create_time:Date.now(),
			update_time: Date.now()
		});
	} else {
		// 老用户更新信息
		type="陪诊师";
		await usersCollection.doc(userRes.data[0]._id).update({
			avatar,
			nickName,
			realName,
			idNumber: idCard,
			phone: decryptedPhone,
			update_time: Date.now()
		});
	}

	// 5. 生成token和refreshToken
	const payload = {
		userId: openid,
		role: 'user'
	};

	const token = jwt.generateToken(payload);
	// const refreshToken = jwt.generateRefreshToken(payload);

	// 6. 存储refreshToken到数据库（可选）
	// await db.collection('user_tokens').add({
	// 	userId: openid,
	// 	token: refreshToken,
	// 	type: 'refresh_token',
	// 	createdAt: Date.now(),
	// 	expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30天后过期
	// });

	return {
		code: 0,
		data: {
			

			token:token,
			userInfo: {
				user_id: openid,
				avatar,
				nickName,
				realName,
				idNumber: idCard,
				phone: decryptedPhone,
				type:type

			}
		}
	};
};

// // 生成accessToken (15分钟过期)
// function generateToken(payload) {
//   return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
// }

// // 生成refreshToken (7天过期)
// function generateRefreshToken(payload) {
//   return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
// }

// 解密手机号
/**
 * 解密微信手机号加密数据
 * @param {string} encryptedData 加密数据（wx.getPhoneNumber 返回的 encryptedData）
 * @param {string} iv 加密向量（wx.getPhoneNumber 返回的 iv）
 * @param {string} session_key 微信登录后的 session_key
 * @returns {Object} 解密后的数据（包含手机号等信息）
 */
function decryptPhone(encryptedData, iv, session_key) {
	if (!encryptedData || !iv || !session_key) {
		throw new Error('参数缺失: encryptedData, iv, session_key 均不能为空');
	}

	try {
		const encryptedDataBuf = Buffer.from(encryptedData, 'base64');
		const session_keyBuf = Buffer.from(session_key, 'base64');
		const ivBuf = Buffer.from(iv, 'base64');

		// 验证 key 和 iv 长度
		if (session_keyBuf.length !== 16 || ivBuf.length !== 16) {
			throw new Error('session_key 或 iv 长度不正确（需16字节）');
		}

		// AES-128-CBC 解密
		const decipher = crypto.createDecipheriv('aes-128-cbc', session_keyBuf, ivBuf);
		decipher.setAutoPadding(true);
		const decoded = Buffer.concat([
			decipher.update(encryptedDataBuf),
			decipher.final()
		]);

		const result = JSON.parse(decoded.toString('utf8'));

		// 校验 APPID
		if (result.watermark?.appid !== APPID) {
			throw new Error('解密数据 APPID 不匹配');
		}

		return result;
	} catch (err) {
		throw new Error(`解密失败: ${err.message}`);
	}
}

// 数据加密
function encryptData(text) {
	return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * 校验中国大陆身份证号码
 * @param {string} idCard 身份证号码
 * @returns {boolean} 是否有效
 */
function validateIdCard(idCard) {
	// 1. 基本格式校验
	const regex = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/;
	if (!regex.test(idCard)) {
		return false;
	}

	// 2. 地区码校验（前6位，示例仅校验范围）
	const areaCode = idCard.substring(0, 6);
	if (!/^[1-9]\d{5}$/.test(areaCode)) {
		return false;
	}

	// 3. 生日校验
	const birthYear = parseInt(idCard.substring(6, 10));
	const birthMonth = parseInt(idCard.substring(10, 12)) - 1; // 月份0-11
	const birthDay = parseInt(idCard.substring(12, 14));
	const birthDate = new Date(birthYear, birthMonth, birthDay);
	if (
		birthDate.getFullYear() !== birthYear ||
		birthDate.getMonth() !== birthMonth ||
		birthDate.getDate() !== birthDay
	) {
		return false; // 非法日期（如2月30日）
	}

	// 4. 校验码验证（第18位）
	const weightFactors = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]; // 加权因子
	const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']; // 校验码对应表
	let sum = 0;

	// 前17位加权求和
	for (let i = 0; i < 17; i++) {
		sum += parseInt(idCard.charAt(i)) * weightFactors[i];
	}

	// 计算校验码
	const mod = sum % 11;
	const lastChar = idCard.charAt(17).toUpperCase();
	return lastChar === checkCodes[mod];
}