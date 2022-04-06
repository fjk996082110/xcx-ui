import { httpBaseUrl } from '../config/http_config';
let token = '';
wx.getStorage({
  key: 'userToken',
  success: (s) => {
    token = s.data;
  },
  fail: () => {
    token = '';
  }
})

/**
 * GET请求封装
 */
function get(url, data = {}) {
  return request(url, data, 'GET')
}

/**
 * POST请求封装
 */
function post(url, data = {}) {
  return request(url, data, 'POST')
}

/**
 * 微信的request
 */
function request(url, data = {}, method = "GET") {
  const contentType = 'application/json'
  return new Promise((resolve, reject) => {
    wx.request({
      url: httpBaseUrl + url,
      data: data,
      method: method,
      header: {
        'Content-Type': contentType,
        'authorization': token
      },
      success: function(res) {
        const { data } = res
        if (data.status == 200) {
          //请求正常200
          resolve(data);
        } else {
          //请求失败
          reject("请求失败：" + res.status)
        }
      },
      fail: function(err) {
        const { data } = res;
        if (res.status == 501) {
          wx.showToast({
            title: '请重新登陆',
            icon: 'none'
          })
          wx.navigateTo({
            url: '/pages/login/index',
          })
        }
        //服务器连接异常
        reject(`错误状态：${data.status}, ${data.msg}`)
      }
    })
  });
}

module.exports = {
  request,
  get,
  post
}