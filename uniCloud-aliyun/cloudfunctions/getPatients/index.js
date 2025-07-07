'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
    console.log("event的值：", event);
    const userid = event.userid; // 统一使用 userid
    const type = event.type;
	const openid=userid;
    try {
        const collection = db.collection('server_object');
        const res = await collection
            .where({ userid: openid })
            .orderBy('createTime', 'desc')
            .get();

        if (!res || !res.data || res.data.length === 0) {
            return {
                code: -1,
                msg: '未找到匹配的患者数据',
                data: null
            };
        }

        return {
            code: 0,
            msg: 'success',
            data: res.data || []
        };
    } catch (err) {
        console.error('查询患者数据失败：', err);
        return {
            code: -1,
            msg: err.message || '查询患者数据失败',
            data: null
        };
    }
};