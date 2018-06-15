'use strict';
const utils = {
	/**
	 * 动态加载脚本
	 */
	loadScript: (url) => {
		return new Promise((resolve, reject) => {
			if (!url) reject(0);
			const script = document.createElement('script');
			script.type = 'text/javascript';
			script.onload = () => resolve();
			script.src = url;
			document.getElementsByTagName('head')[0].appendChild(script);
		});
	},
	get: (name) => {
		var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
		var location = decodeURIComponent(window.location.search);
		var r = location.substr(1).match(reg);
		if (r != null) return (r[2]);
		return null;
	},
	/**
	 * localStorage读写
	 */
	setItem: (key, value, hour) => {
		key = key.replace(/\//g, '_');
		if (value === undefined) return;
		try {
			localStorage.setItem(key, JSON.stringify(value));
		} catch (e) {
			return false;
		}
	},
	getItem: (key) => {
		key = key.replace(/\//g, '_');
        return JSON.parse(localStorage.getItem(key));
	},
	removeItem: (key) => {
		key = key.replace(/\//g, '_');
        localStorage.removeItem(key);
	},
	removeAll: () => {
		localStorage.clear();
	}
};

class MobileLauncher {
    constructor(params) {
        for (let item in params) {
            if (typeof this[`_${[item]}`] === 'function') {
                this[`_${[item]}`].call(this, params[item]);
            }
        }
	}
    /**
	 * 使用REM
	 */
    _useRem(param) {
        const htmlFontSize = parseInt(param.htmlFontSize, 10) || 100;
        const originWidth = parseInt(param.originWidth, 10) || 375;
        const docEl = document.documentElement;
        const resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
        const recalc = () => {
            const clientWidth = docEl.clientWidth;
            if (!clientWidth) return;
            docEl.style.fontSize = htmlFontSize * (clientWidth / originWidth) + 'px';
        };
        if (!document.addEventListener) return;
        window.addEventListener(resizeEvt, recalc, false);
        recalc();
    }
    /**
	 * 预加载图像
	 */
    _preloadImage(params) {
		const preloadList = params.preloadList;
		if (!Array.isArray(preloadList) || preloadList.length === 0) {
			params.success && params.success(0);
			return;
		}
		const length = preloadList.length;
		let count = 0;
		const loadImg = (src) => {
			let image = new Image();
			image.onload = (e) => {
				count++;
				if (count === length) {
					params.success && params.success(count);
				}
			};
			image.onerror = () => params.fail && params.fail();
			image.src = src;
		};
		for (let src of preloadList) {
			loadImg(src);
		}
	}
	/**
	 * 屏幕横竖屏判断
	 */
	_checkOrientation(params) {
		const checkOrientation = () => {
			if (window.orientation === '-90' || window.orientation === '90') {
				params.isHorizontal && params.isHorizontal(); // 横屏
			} else {
				params.isVertical && params.isVertical();
			}
		};
		window.onorientationchange = checkOrientation;
		checkOrientation();
	}
	/**
	 * 微信分享
	 */
	_wxJSSDKInit(params) {
		const _this = this;
		const ua = window.navigator.userAgent.toLowerCase();
		if (!params.appid || ua.match(/MicroMessenger/i) !== 'micromessenger') return;
		utils.loadScript(`http://res.wx.qq.com/open/js/jweixin-1.2.0.js?t=${+new Date()}`)
			.then(() => {
				_this._login(params);
			})
			.catch((code) => {
				alert('网络异常，请稍候再试');
			});
	}
	/**
	 * 登录
	 */
	_login(params) {
		const openId = utils.getItem('openId');
		const token = utils.getItem('token');
		const axios = params.axios;
		if (!openId || !token) {
			const code = utils.get('code');
			if (code === null) {
				this._userAuthorize({
					appid: params.appid,
					url: params.redirectUrl || window.location.href,
					scope: params.scope || 'snsapi_base'
				});
			} else {
				if (utils.get('state') === 'oauth') {
					// 获取token
					axios.post('/getAccessToken', { code })
						.then((res) => {
							utils.setItem('openId', res.openId);
							utils.setItem('token', res.token);
						})
						.catch((err) => {
							console.log(err);
							alert('系统异常，请稍候重试');
						});
				}
			}
		} else {
			console.log('already auth');
		}
		
	}
	/**
	 * 用户授权
	 */
	_userAuthorize(params) {
		window.location.href = `ttps://open.weixin.qq.com/connect/oauth2/authorize?appid=${params.appid}&redirect_uri=${encodeURIComponent(params.url)}&response_type=code&scope=${params.scope}&state=oauth#wechat_redirect`;
	}
}

export { MobileLauncher, utils };