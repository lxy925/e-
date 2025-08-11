'use strict';

// const { v4: uuidv4 } = require('uuid');

exports.main = async (event, context) => {
    const db = uniCloud.database();
    const {
        user_id,
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

    try {
        let result;
        let moreResult;
        
        // 生成唯一的资格证ID (格式: QZ-年月日-8位随机字符)
        const generateQualificationId = () => {
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
            const randomStr = Math.random().toString(36).substr(2, 8).toUpperCase();
            return `QZ-${dateStr}-${randomStr}`;
        };
        
        const qualification_id = generateQualificationId();

        // 1. 首先检查陪诊师是否已存在
        const escortRecord = await db.collection('escorts')
            .where({
                user_id: user_id
            })
            .get();

        // 存在则更新，不存在则添加
        if (escortRecord.data && escortRecord.data.length > 0) {
            // 更新现有记录
            result = await db.collection('escorts')
                .where({
                    user_id: user_id
                })
                .update({
                    name: name,
                    age: age,
                    gender: gender,
                    address: city,
                    avatarUrl: avatarList,
                    certificate: certificateList,
                    qualification_id: escortRecord.data[0].qualification_id || qualification_id, // 保留已有的或生成新的
                    parentId: parentId,
                    update_time: Date.now()
                });
        } else {
            // 添加新记录
            result = await db.collection('escorts').add({
                user_id: user_id,
                qualification_id: qualification_id, // 新增的唯一资格证ID
                name: name,
                age: age,
                gender: gender,
                address: city,
                avatarUrl: avatarList,
                certificate: certificateList,
                is_certified: false,
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
            
            const row = await db.collection('escort_account').add({
                user_id,
                // balance: 0,
				frozen_amount:0,
                withdrawable_amount: 0,
                // pending_amount: 0,
                create_time: Date.now(),
                update_time: Date.now()
            });
            console.log("打印账户添加错误", row);
        }

        // 处理附加信息
        const moreRecord = await db.collection('escorts_more')
            .where({
                user_id: user_id
            })
            .get();

        if (moreRecord.data && moreRecord.data.length > 0) {
            moreResult = await db.collection('escorts_more')
                .where({
                    user_id: user_id
                })
                .update({
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
            .where({
                user_id: user_id
            })
            .update({
                type: "陪诊师"
            });

        return {
            code: 200,
            message: '数据操作成功',
            data: {
                escort: result,
                escort_more: moreResult,
                qualification_id: qualification_id
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