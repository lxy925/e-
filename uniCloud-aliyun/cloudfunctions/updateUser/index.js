'use strict';


exports.main = async (event, context) => {
    // event为客户端上传的参数
    console.log('event : ', event);

    // 获取传入的参数
    const { user_id, type } = event;

    // 检查参数是否存在
    if (!user_id || !type) {
        return {
            success: false,
            message: '缺少必要的参数 user_id 或 type'
        };
    }

    try {
        // 获取数据库引用
        const db = uniCloud.database();

        // 更新表 users 中 user_id 相同的记录的 type 字段
        const updateResult = await db.collection('users').where({
            user_id: user_id
        }).update({
           
                type: type
            
        });

        // 检查更新是否成功
        if (updateResult.matchedCount === 0) {
            return {
                success: false,
                message: '未找到匹配的记录'
            };
        } else {
            return {
                success: true,
                message: '更新成功',
                updatedCount: updateResult.modifiedCount
            };
        }
    } catch (error) {
        console.error('更新失败：', error);
        return {
            success: false,
            message: '更新失败，服务器错误',
            error: error
        };
    }
};