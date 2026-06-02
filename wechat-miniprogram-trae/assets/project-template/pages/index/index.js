const { http } = require('../../utils/request')

Page({
  data: { list: [] },
  onLoad() { this.fetchData() },
  onPullDownRefresh() { this.fetchData().then(() => wx.stopPullDownRefresh()) },
  async fetchData() {
    try {
      const res = await http.get('/example/list')
      this.setData({ list: res.data || [] })
    } catch (err) { console.error('获取数据失败', err) }
  }
})
