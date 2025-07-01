'use strict';

exports.main = async (event, context) => {
  const { filePath, fileName ,listName} = event;
console.log(listName)
console.log(filePath)
console.log(fileName)
  try {
    // 指定 cloudPath，将文件存储到 images 文件夹中
	
		 const cloudPath = `${listName}/${fileName}`; // 例如：images/avatar_12345.jpg
	
   

    // 上传图片到云存储
    const uploadRes = await uniCloud.uploadFile({
      filePath:'Hello, uniCloud!', // 上传一个简单的文本文件
      cloudPath,
    });

    // 返回文件 ID
    return {
      code: 200,
      message: '上传成功',
      data: {
        fileID: uploadRes.fileID,
        cloudPath: uploadRes.fileID, // fileID 可以直接作为访问 URL
      },
    };
  } catch (err) {
    console.error('上传失败:', err);
    return {
      code: 500,
      message: '上传失败',
      data: null,
    };
  }
};