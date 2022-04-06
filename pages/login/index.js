// index.js
import { login } from '../../api/user';
// 获取应用实例
const app = getApp()

Page({
  data: {
    loginInfo: {
      username: "",
      password: "",
    },
  },
  onLoad() {
    
  },
  usernameChange(event) {
    const { detail } = event;
    this.setData({
      loginInfo: {
        ...this.data.loginInfo,
        username: detail
      }
    })
  },
  passwordChange(event) {
    const { detail } = event;
    this.setData({
      loginInfo: {
        ...this.data.loginInfo,
        password: detail
      }
    })
  },
  userLogin() {
    const { loginInfo } = this.data
    login(loginInfo.username, loginInfo.password).then((res) => {
      console.log(res)
      const { token, userInfo } = res.data
      wx.setStorage({ key: 'userToken', data: token })
      wx.setStorage({ key: 'trueName', data: userInfo.trueName})
      wx.redirectTo({
        url: '/pages/index/index',
      })
    })
  }
})
