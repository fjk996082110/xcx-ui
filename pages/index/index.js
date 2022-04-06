// pages/index/index.js
// const amapFile = require('../../libs/amap-wx.130');
const QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
const {
  TX_MAP_KEY
} = require('../../config/map');
import { getDistance } from '../../api/distance';

let qqmapsdk;
let token;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasToken: false,
    markers: [],
    latitude: '',
    longitude: '',
    textData: {},
    showMap: false,
    setDis: {},
  },
  // 获取打卡
  getUserLocation() {
    const that = this;
    qqmapsdk.reverseGeocoder({
      success: function (res) {
        const { address, location } = res.result;
        that.setData({
          textData: address,
          latitude: location.lat,
          longitude: location.lng,
          markers: [{
            id: res.request_id,
            latitude: location.lat,
            longitude: location.lng,
            iconPath: '../../images/position.png',
            width: 45,
            height: 50,
          }],
          showMap: true,
        }, () => {
          that.judgeDistances();
        });
      },
      fail: function (err) {
        that.showToast('获取定位失败', 'error')
      },
    });
  },
  // 判断距离
  judgeDistances() {
    const that = this;
    const { setDis, latitude, longitude, disScope } = this.data;
    if (setDis && latitude && longitude) {
      qqmapsdk.calculateDistance({
        mode: 'straight',
        from: {
          latitude,
          longitude,
        },
        to: [{
          latitude: setDis.latitude,
          longitude: setDis.longitude
        }],
        success: (res) => {
          /**
           * distance:
           * 起点到终点的距离，单位：米，
           * 如果radius半径过小或者无法搜索到，则返回-1
           */
          const { distance } = res.result.elements[0];
          that.judgeAndUpload(distance)
        },
        fail: (err) => {
          that.showToast('距离错误', 'error');
        }
      })
    }
  },
  // 判断距离并拍照上传
  judgeAndUpload(distance) {
    const that = this;
    const { disScope } = this.data;
    // 接口中获得范围，判断distance是否在范围内)
    if (distance < disScope) {
      that.showToast('超过打卡距离', 'error')
    } else {
      // 在范围内，拍照并上传
      that.showToast('打卡成功，请拍照')
      wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        // 仅允许拍照，不允许从相册选择
        sourceType: ['camera', 'album'],
        // maxDuration: 30,
        camera: 'back',
        success(res) {
          const { tempFilePath } = res.tempFiles[0]
          wx.showModal({
            title: '提示',
            content: '确认使用该图片吗?',
            success: (res) => {
              if (res.confirm) {
                wx.uploadFile({
                  filePath: tempFilePath,
                  name: 'image',
                  url: 'http://localhost:4000/img/upload',
                  header: {
                    'authorization': token
                  },
                  success: (res) => {
                    if (res.data) {
                      res = JSON.parse(res.data)
                    }
                    if (res.status === 200) {
                      const { name, url } = res.data

                    }
                  },
                  complete: (res) => {
                    console.log('上传结果,', res)
                  }
                })
              }
            }
          })
        },
        fail: (err) => {
          console.log(err)
        }
      })
    }
  },
  // 获取预设打卡点
  getSetDitance() {
    getDistance().then((res) => {
      if (res) {
        const { latitude, longitude, scope } = res.data;
        this.setData({
          setDis: {
            latitude,
            longitude,
          },
          disScope: scope
        })
      }
    }).catch((err) => {
      this.showToast('获取预设地点失败', 'error')
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const that = this;
    // 获取本地token 
    wx.getStorage({
      key: 'userToken',
      success: (s) => {
        if (s.data) {
          console.log('本地token', s.data)
          token = s.data
          this.setData({
            hasToken: true,
          }, function () {
            console.log('执行')
            that.getSetDitance();
          })
        }
      },
      fail: (e) => {
        if (e) {
          this.setData({
            hasToken: false,
          })
          wx.redirectTo({
            url: '/pages/login/index',
          })
        }
      }
    });
    // 地图map
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: TX_MAP_KEY
    });
  },

  // toast
  showToast(title, icon='success', duration=3000) {
    wx.showToast({
      title,
      icon: 'none',
      duration,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})