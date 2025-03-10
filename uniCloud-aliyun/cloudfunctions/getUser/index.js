'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
    console.log("event的值：", event);
    const user_id = event.user_id;
    const type = event.type;
    console.log("当前类型", type);

    try {
         let res;// 提前声明 res，确保其在整个 try 块中可用
 const servicesCollection = db.collection('users');
           res = await servicesCollection.where({
                user_id: user_id
            }).get();
        if (res.data[0].type === "陪诊师") {
            const servicesCollection = db.collection('users');
             res = await servicesCollection
                .aggregate()
                .match({
                    user_id: user_id
                })
                .lookup({
                    from: 'escorts', // 关联的表名
                    localField: 'user_id', // users 表中的字段
                    foreignField: 'user_id', // escorts 表中的字段
                    as: 'moreInfo' // 输出的字段名
                })
                .unwind('$moreInfo') // 展开 moreInfo 数组
                .end();
        } 
           
        

        // 检查 res 是否存在
        if (!res || !res.data || res.data.length === 0) {
            return {
                success: false,
                error: '未找到匹配的用户数据'
            };
        }

        return {
            success: true,
            data: res.data
        };
    } catch (err) {
        console.error("查询失败：", err);
        return {
            success: false,
            error: err.message || '查询失败'
        };
    }
};