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
	/**
	 * 获取query里的参数
	 */
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
	},
	/**
	 * cookie读写
	 */
	setCookie: function (key, value, hour) {
		let d = new Date();
		hour = hour || 2;
		d.setTime(d.getTime() + 60 * 60 * 1000 * hour)
		window.document.cookie = key + '=' + value + ';path=/;expires=' + d.toGMTString()
	},
	getCookie: function (key) {
		var v = window.document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)')
		return v ? v[2] : null
	},
	removeCookie: function (key) {
		this.setCookie(key, '', -1)
	},
	/**
	 * 网络请求
	 * @url: 请求的url
	 * @params: 请求参数
	 * @method: 请求方法
	 */
	request: function(url, params, method) {
		const { axios, requestMethod } = global;
		method = method || requestMethod || 'post';
		return new Promise((resolve, reject) => {
			axios[method](url, params)
				.then((res) => {
					if (res.status !== 200) {
						return reject(res);
					}
					res = res.data;
					if (res.errCode === 10001 && global.wxInitParams) { // token失效通用的错误码，按实际需求调整
						if (global.config.retryCount < 3) {
							// token失效 重新登陆
							global.config.retryCount++;
							utils.removeCookie('openid');
							utils.removeCookie('token');
							global.config.launcher._login();
						} else {
							// 重新登陆3次，后台服务出问题
							console.log('token多次失效');

						}
					} else {
						resolve(res);
					}	
				})
				.catch((err) => {
					reject(err);
				});
		});
	}
};

class MobileLauncher {
    constructor(params) {
		global.config.retryCount = 0; // token失效重新登陆计算次数
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
				global.wxInitParams = params;
				_this._login();
			})
			.catch((code) => {
				alert('网络异常，请稍候再试');
			});
	}
	/**
	 * 登录
	 */
	_login() {
		const _this = this;
		const openId = utils.getItem('openId');
		const token = utils.getItem('token');
		const params = global.wxInitParams;
		if (!openId || !token) {
			const code = utils.get('code');
			if (code === null) {
				this._userAuthorize({
					appid: params.appid,
					url: params.redirectUrl || window.location.href,
					scope: params.scope || 'snsapi_base'
				});
			} else if (utils.get('state') === 'oauth') {
				// 获取token 根据实际接口进行调整
				axios.post('/getAccessToken', { code })
					.then((res) => {
						utils.setItem('openId', res.openId);
						utils.setItem('token', res.token);
						global.config.LOGINED = true;
						_this._jssdkConfig();
					})
					.catch((err) => {
						console.log(err);
						alert('系统异常，请稍候重试');
					});
			}
		} else {
			global.config.LOGINED = true;
			this._jssdkConfig();
			console.log('already auth');
		}
		
	}
	/**
	 * 用户授权
	 */
	_userAuthorize(params) {
		window.location.href = `ttps://open.weixin.qq.com/connect/oauth2/authorize?appid=${params.appid}&redirect_uri=${encodeURIComponent(params.url)}&response_type=code&scope=${params.scope}&state=oauth#wechat_redirect`;
	}
	/**
	 * JSSDK配置
	 */
	_jssdkConfig() {
		const params = global.wxInitParams;
		// 获取jssdk签名 根据实际接口进行调整
		utils.request('/wx/jssdk', {}).then((res) => {
			wx.config({
				debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
				appId: params.appId, // 必填，公众号的唯一标识
				timestamp: res.timestamp, // 必填，生成签名的时间戳
				nonceStr: res.nonceStr, // 必填，生成签名的随机串
				signature: res.signature,// 必填，签名
				jsApiList: params.jsApiList // 必填，需要使用的JS接口列表
			});
			wx.ready(function(){
				const configs = {
					title: params.share.title, // 分享标题
					desc: params.share.desc, // 分享描述
					link: params.share.link || window.location.href, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
					imgUrl: params.share.imgUrl, // 分享图标
					success: function (e) {
						// 用户点击了分享后执行的回调函数
					}
				};
				wx.onMenuShareTimeline(configs);
				wx.onMenuShareAppMessage(configs);
			});
		});
	}
}

export { MobileLauncher, utils };