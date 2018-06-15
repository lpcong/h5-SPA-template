import Vue from '_vue';
import axios from '_axios';
import { MobileLauncher, utils } from './mobileLauncher';
import '../css/index.css';

document.addEventListener('DOMContentLoaded', () => {
    new MobileLauncher({
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
            axios,
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
	
    const vm = new Vue({
        data: {

        },
        mounted: function() {

        },
        methods: {
            
        }
    });
}, false);