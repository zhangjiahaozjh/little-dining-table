const wishService = require('./utils/wish-service')
const config = require('./config')

App({
  globalData: {
    dataMode: config.dataMode || 'demo'
  },

  onLaunch() {
    if (this.globalData.dataMode === 'cloud' && wx.cloud) {
      wx.cloud.init({
        env: config.cloudEnvId,
        traceUser: true
      })
    }
    wishService.configure(this.globalData.dataMode)
  }
})
