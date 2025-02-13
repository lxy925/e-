import App from './App';
import CustomNav from '@/components/custom-nav/custom-nav.vue';

// 全局mixins，用于实现setData等功能，请勿删除！';
import zpMixins from '@/uni_modules/zp-mixins/index.js';

// #ifndef VUE3
import Vue from 'vue';

Vue.use(zpMixins);

Vue.config.productionTip = false;
App.mpType = 'app';

// 全局注册 custom-nav 组件
Vue.component('custom-nav', CustomNav);

const app = new Vue({
    ...App
});
app.$mount();
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue';
export function createApp() {
    const app = createSSRApp(App);
    app.mixin(zpMixins);
    
    // 全局注册 custom-nav 组件
    app.component('custom-nav', CustomNav);
    
    return {
        app
    };
}
// #endif
