import {
	defineConfig
} from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// 完整配置
export default defineConfig({
	plugins: [uni()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './'), // 明确指向项目根目录
		}
	},
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, '/api')
			}
		}
	},
	optimizeDeps: {
		include: ['crypto-js'], // 显式包含依赖
		exclude: ['your-other-package'] // 可选：排除某些不需要预构建的包
	}
})