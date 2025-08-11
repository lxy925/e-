'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
  const userId = event.user_id || (context && context.auth && context.auth.uid);
/*  if (!userId) {
    return { code: 401, msg: '未登录' };
  } */
  const data = {
    userId,
    name: event.name,
    idType: event.idType,
    idNumber: event.idNumber,
    examType: event.examType,
    jobType: event.jobType,
    examLevel: event.examLevel,
    applicationFormUrl: event.applicationFormUrl,
    idCardImagesUrls: event.idCardImagesUrls,
    educationProofUrl: event.educationProofUrl,
    photoUrl: event.photoUrl,
    workProofUrl: event.workProofUrl || '',
    socialSecurityUrl: event.socialSecurityUrl || '',
    otherProofUrl: event.otherProofUrl || '',
    auditStatus: 'unreviewed', // 默认未审核
    createdAt: new Date()
  };
  // 职业报考校验
  if (data.examType === '职业报考' && (!data.workProofUrl || !data.socialSecurityUrl || !data.otherProofUrl)) {
    return { code: 400, msg: '职业报考需上传相关证明材料' };
  }
  try {
    await db.collection('signup').add(data);
    return { code: 0, msg: '报名成功' };
  } catch (e) {
    return { code: 500, msg: '报名失败', error: e };
  }
}; 