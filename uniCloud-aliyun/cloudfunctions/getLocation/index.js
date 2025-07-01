'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
  const { latitude, longitude, address, name } = event;
  
  console.log('接收到的位置参数:', { latitude, longitude, address, name });
  
  try {
    // 构建完全符合数据库location字段结构的对象
    const location = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: address || `经度:${longitude},纬度:${latitude}`,
      name: name || '未知位置'
    };
    
    // 验证数据类型
    if (isNaN(location.latitude) || isNaN(location.longitude)) {
      throw new Error('无效的经纬度数据');
    }
    
    console.log('格式化后的位置信息:', location);
    
    return {
      code: 200,
      msg: '获取地址成功',
      data: location
    };
  } catch (e) {
    console.error('处理位置信息失败，错误详情:', {
      message: e.message,
      stack: e.stack,
      name: e.name
    });
    
    // 返回符合数据库结构的数据，即使发生错误
    return {
      code: 500,
      msg: '处理位置信息失败',
      data: {
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        address: `经度:${longitude || 0},纬度:${latitude || 0}`,
        name: '未知位置'
      }
    };
  }
}; 