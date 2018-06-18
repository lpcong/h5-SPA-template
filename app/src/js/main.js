import Vue from '_vue';
import axios from '_axios';
import { MobileLauncher, utils } from './mobileLauncher';
import '../css/index.css';

document.addEventListener('DOMContentLoaded', () => {
    axios.defaults.withCredentials = true; // 用于请求做验证
    axios.defaults.baseURL = 'https://api.example.com'; // 网络请求的域名，根据需要更新
    global.config = {
        axios,
        requestMethod: 'post'  // 网络请求的method，根据需要调整
    }
    global.config.launcher = new MobileLauncher({
        useRem: true,
        preloadImage: {
            preloadList: [],  // 预加载图像列表
            success: (count) => {  // 预加载完成回调

            }, 
            fail: () => {  // 预加载图片失败回调
				
            }
        },
        checkOrientation: {
            isHorizontal: () => {  // 横屏

            },
            isVertical: () => {  // 竖屏

            }
		},
		wxJSSDKInit: {
            appid: '', // 公众号的appid
            jsApiList: [],  // 授权api列表
            share: {  // 微信分享相关配置 选填
                title: '',
                desc: '',
                imgUrl: '',
                link: ''
            },
            redirectUrl: ''  // 授权重定向url，默认是本页面
		}
    });
	
    global.config.vm = new Vue({
        el: '#container',
        data: {

        },
        mounted: function() {
            // 查询用户当前状态
            this.checkUserStatus();
        },
        methods: {
            checkUserStatus: function() {
                const _this = this;
                if (global.config.LOGINED) {
                    // 已登陆，可以执行业务逻辑
                    // utils.request('/doSomething', { data: 123 })
                    //     .then((res) => {

                    //     });
                } else {
                    setTimeout(function() {
                        _this.checkUserStatus();
                    }, 500);
                }
            }
        }
    });
}, false);