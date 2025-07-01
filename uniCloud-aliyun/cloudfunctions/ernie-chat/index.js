'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	
	//返回数据给客户端
	return event
};
'use strict';

exports.main = async (event, context) => {
    try {
        const API_KEY = 'PjZ06us3QMY9GKwP0XhW5Gk2';
        const SECRET_KEY = 'ejrLlyV5Az3JcyEZGX6CLwv8UNAgbp05';
        
        // 1. 获取access_token
        const tokenRes = await uniCloud.httpclient.request(
            'https://aip.baidubce.com/oauth/2.0/token',
            {
                method: 'POST',
                data: {
                    grant_type: 'client_credentials',
                    client_id: API_KEY,
                    client_secret: SECRET_KEY
                },
                dataType: 'json'
            }
        );
        
        if (!tokenRes.data.access_token) {
            throw new Error('获取access_token失败');
        }
        
        // 2. 调用文心一言API
        const chatRes = await uniCloud.httpclient.request(
            `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=${tokenRes.data.access_token}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                data: {
                    messages: [{
                        role: "user",
                        content: event.message
                    }]
                },
                dataType: 'json'
            }
        );
        
        if (chatRes.data.error_code) {
            throw new Error(chatRes.data.error_msg);
        }
        
        return {
            code: 0,
            result: chatRes.data.result
        };
        
    } catch (error) {
        console.error('云函数错误:', error);
        return {
            code: -1,
            message: error.message
        };
    }
};