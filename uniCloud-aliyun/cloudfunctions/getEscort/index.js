'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
	console.log("event的值：",event)
	const user_id=event.user_id;
  try {
    const servicesCollection = db.collection('users');
    const res = await servicesCollection.where({
	user_id:user_id
	})
	.get();
    
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