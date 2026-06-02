App({
  onLaunch() {
    this.checkUpdate()
  },
  globalData: {
    userInfo: null,
    token: '',
    baseUrl: 'https://your-domain.com/api'
  },
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const um = wx.getUpdateManager()
      um.onCheckUpdate(res => {
        if (res.hasUpdate) {
          um.onUpdateReady(() => wx.applyUpdate())
        }
      })
    }
  }
})
