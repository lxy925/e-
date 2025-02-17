<script>
// app.js
export default {
    data() {
        return {};
    },
    onLaunch: function () {
            wx.cloud.init({
                // env 参数说明：
                //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
                //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
                //   如不填则使用默认环境（第一个创建的环境）
                env: 'mp-d3196fd4-48df-43aa-88ae-e8c598b0fa18'
            });
    },
    globalData: {}
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
    background: linear-gradient(to bottom, #0bd6c8, #99efe9,#ddf5f4,rgb(226, 226, 226));
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    min-height: 100vh;;
}

</style>
