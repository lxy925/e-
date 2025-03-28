'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
  try {
    const servicesCollection = db.collection('services');
    const res = await servicesCollection.get();
    
    return {
      success: true,
      data: res.data
    };
  } catch (err) {
    return {
      success: false,
      error: err
    };
  }
}; 