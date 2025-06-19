'use strict';
const jwt = require('./jwt.js');

exports.main = async (event, context) => {
    const db = uniCloud.database();
    const {
		
        name,
        age,
        gender,
        city,
        avatarList,
        certificateList,
        self_introduction,
        language,
        provide_transport,
        familiar_hospitals,
        familiar_departments,
        parentId
    } = event;

    // 获取用户ID
    let user_id = jwt.verifyToken(event.user_id).userId;
    let result;
    let moreResult;

    try {
        // 1. 首先检查陪诊师是否已存在
        const escortRecord = await db.collection('escorts')
            .where({ user_id: user_id })
            .get();

        // 存在则更新，不存在则添加
        if (escortRecord.data && escortRecord.data.length > 0) {
            // 更新现有记录
            result = await db.collection('escorts')
                .where({ user_id: user_id })
                .update({
                    name: name,
                    age: age,
                    gender: gender,
                    address: city,
                    avatarUrl: avatarList,
                    is_certified: false,
                    is_bookable: false,
                    parentId: parentId,
                    state: "待审核",
                    update_time: Date.now()
                });
        } else {
            // 添加新记录
            result = await db.collection('escorts').add({
                user_id: user_id,
                name: name,
                age: age,
                gender: gender,
                address: city,
                avatarUrl: avatarList,
                is_certified: false,
                is_bookable: false,
                parentId: parentId,
                state: "待审核",
                create_time: Date.now(),
                update_time: Date.now()
            });

            // 如果是新记录，还需要初始化关系和账户
            await uniCloud.callFunction({
                name: 'escort_relation',
                data: {
                    doctorId: parentId,
                    subordinateId: user_id
                }
            });

            await db.collection('escort_account').add({
                user_id,
                balance: 0,
                withdrawable_amount: 0,
                pending_amount: 0,
                create_time: Date.now(),
                update_time: Date.now()
            });
        }

        // 处理附加信息（同样采用存在则更新，不存在则添加的逻辑）
        const moreRecord = await db.collection('escorts_more')
            .where({ user_id: user_id })
            .get();

        if (moreRecord.data && moreRecord.data.length > 0) {
            moreResult = await db.collection('escorts_more')
                .where({ user_id: user_id })
                .update({
                   
                    certificate: certificateList,
                    provide_transport: provide_transport,
                    self_introduction: self_introduction,
                    familiar_hospitals: familiar_hospitals,
                    familiar_departments: familiar_departments,
                    update_time: Date.now()
                });
        } else {
            moreResult = await db.collection('escorts_more').add({
                user_id: user_id,
                
                rating: 0,
                order: 0,
                certificate: certificateList,
                provide_transport: provide_transport,
                self_introduction: self_introduction,
                familiar_hospitals: familiar_hospitals,
                familiar_departments: familiar_departments,
                create_time: Date.now(),
                update_time: Date.now()
            });
        }

        // 更新用户类型
        await db.collection('users')
            .where({ user_id: user_id })
            .update({ type: "陪诊师" });

        return {
            code: 200,
            message: '数据操作成功',
            data: {
                escort: result,
                escort_more: moreResult
            },
        };
    } catch (err) {
        console.error('操作失败:', err);
        return {
            code: 500,
            message: '数据操作失败',
            error: err.message,
        };
    }
};