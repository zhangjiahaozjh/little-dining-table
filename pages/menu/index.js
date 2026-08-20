const menu = require('../../data/menu')
const wishService = require('../../utils/wish-service')

Page({
  data: {
    menu,
    categories: ['全部', '家常', '肉肉', '海鲜', '主食', '甜甜', '喝点'],
    activeCategory: '全部',
    visibleMenu: menu,
    quantities: {},
    totalCount: 0
  },

  onLoad() { this.loadDraft() },

  loadDraft() {
    wishService.getWish().then((wish) => {
      const quantities = {}
      ;(wish.items || []).forEach((item) => { quantities[item.id] = item.quantity })
      this.refreshMenu(quantities)
    })
  },

  chooseCategory(e) {
    this.setData({ activeCategory: e.currentTarget.dataset.category }, () => this.refreshMenu())
  },

  changeQuantity(e) {
    const { id, delta } = e.currentTarget.dataset
    const quantities = Object.assign({}, this.data.quantities)
    quantities[id] = Math.max(0, (quantities[id] || 0) + Number(delta))
    this.refreshMenu(quantities)
  },

  refreshMenu(nextQuantities) {
    const quantities = nextQuantities || this.data.quantities
    const visibleMenu = menu.filter((item) => this.data.activeCategory === '全部' || item.category === this.data.activeCategory)
    const totalCount = Object.keys(quantities).reduce((sum, id) => sum + quantities[id], 0)
    this.setData({ quantities, visibleMenu, totalCount })
  },

  tellTa() {
    const items = menu.filter((item) => this.data.quantities[item.id] > 0)
      .map((item) => Object.assign({}, item, { quantity: this.data.quantities[item.id] }))
    if (!items.length) return wx.showToast({ title: '先挑一点好吃的吧', icon: 'none' })
    wishService.saveWish({ items, status: 'sent' }).then(() => {
      wx.showToast({ title: '我的心愿已经放上去啦', icon: 'none' })
      setTimeout(() => wx.navigateTo({ url: '/pages/wish/index' }), 500)
    }).catch(() => wx.showToast({ title: '没能传过去，再试一次', icon: 'none' }))
  },

  openWish() {
    wx.navigateTo({ url: '/pages/wish/index' })
  }
})
