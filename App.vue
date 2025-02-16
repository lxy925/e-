<script>
// app.js
export default {
    data() {
        return {};
    },
    onLaunch: function () {
        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力');
        } else {
            wx.cloud.init({
                // env 参数说明：
                //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
                //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
                //   如不填则使用默认环境（第一个创建的环境）
                env: '',
                traceUser: true
            });
        }
		
        this.globalData = {};
		
		
    },
	onShow() {
	    
	  },
	   methods: {
	  //     updateTabBar() {
	  //       // 获取缓存的 userInfo
	  //       const userInfo = uni.getStorageSync('userInfo');
			// console.log("userInfo",userInfo)
	  //       if (userInfo) {
	  //         const type = userInfo.type;
	  
	  //         // 根据 type 动态设置 tabBar
	  //         let tabBarList = [];
	  //         if (type === '陪诊师') {
	  //           tabBarList = [
	  //            {
	  //            	"pagePath": "pages/index/index",
	  //            	"text": "首页",
	  //            	"iconPath": "static/images/icons/home.png",
	  //            	"selectedIconPath": "static/images/icons/home-active.png"
	  //            },
	  //            {
	  //            	"pagePath": "pages/doctor/doctor",
	  //            	"text": "陪诊师",
	  //            	"iconPath": "static/images/icons/doctor.png",
	  //            	"selectedIconPath": "static/images/icons/doctor-active.png"
	  //            },
	  //            {
	  //            	"pagePath": "pages/health/health",
	  //            	"text": "健康管理",
	  //            	"iconPath": "static/images/icons/health.png",
	  //            	"selectedIconPath": "static/images/icons/health-active.png"
	  //            },
	  //            {
	  //            	"pagePath": "pages/doctorlogin/doctorlogin",
	  //            	"text": "我的",
	  //            	"iconPath": "static/images/icons/mine.png",
	  //            	"selectedIconPath": "static/images/icons/mine-active.png"
	  //            }
	  //           ];
	  //         } else {
	  //           tabBarList = [
	  //            {
	  //            	"pagePath": "pages/index/index",
	  //            	"text": "首页",
	  //            	"iconPath": "static/images/icons/home.png",
	  //            	"selectedIconPath": "static/images/icons/home-active.png"
	  //            },
	  //            {
	  //            	"pagePath": "pages/doctor/doctor",
	  //            	"text": "陪诊师",
	  //            	"iconPath": "static/images/icons/doctor.png",
	  //            	"selectedIconPath": "static/images/icons/doctor-active.png"
	  //            },
	  //            {
	  //            	"pagePath": "pages/health/health",
	  //            	"text": "健康管理",
	  //            	"iconPath": "static/images/icons/health.png",
	  //            	"selectedIconPath": "static/images/icons/health-active.png"
	  //            },
	  //            {
	  //            	"pagePath": "pages/mine/mine",
	  //            	"text": "我的",
	  //            	"iconPath": "static/images/icons/mine.png",
	  //            	"selectedIconPath": "static/images/icons/mine-active.png"
	  //            }
	  //           ];
	  //         }
	  
	  //         // 更新 tabBar
	  //         if (tabBarList.length > 0) {
	  //           uni.setTabBarItem({
	  //             index: 0,
	  //             ...tabBarList[0],
			// 				success: () => {
			// 					console.log('tabBar 更新成功');
			// 				},
	  //           });
	  //           uni.setTabBarItem({
	  //             index: 1,
	  //             ...tabBarList[1]
	  //           });
			// 	uni.setTabBarItem({
			// 	  index: 2,
			// 	  ...tabBarList[2]
			// 	});
			// 	uni.setTabBarItem({
			// 	  index: 3,
			// 	  ...tabBarList[3]
			// 	});
	  //         }
	  //       }
			// }
			// }
    globalData: {}
	}
};
</script>
<style>
/**app.wxss**/
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
}

button {
    background: initial;
}

button:focus {
    outline: 0;
}

button::after {
    border: none;
}

page {
    background: linear-gradient(to bottom, #1cd6c7, #99efe9,rgb(239, 239, 239),rgb(239, 239, 239),rgb(239, 239, 239),rgb(239, 239, 239));
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    min-height: 100vh;;
}
@import "/wxcomponents/vant/common/index.wxss";
</style>
