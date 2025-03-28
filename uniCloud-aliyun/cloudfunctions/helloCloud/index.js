// helloCloud/index.js 云函数入口函数
exports.main = async (event, context) => {
    const { APPID, OPENID } = cloud.getWXContext(); // 获取小程序的 APPID 和 OPENID
    return {
        APPID,
        OPENID
    };
};