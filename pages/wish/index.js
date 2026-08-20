const wishService = require('../../utils/wish-service')

const statusMap = {
  draft: { text: '还没许愿', emoji: '💭' },
  sent: { text: '等待回应', emoji: '💌' },
  received: { text: '已经收到', emoji: '🫶' },
  ready: { text: '可以开饭', emoji: '✨' }
}

Page({
  data: { cards: [], hasAnyWish: false },

  onLoad() {
    this.loadBoard()
    this.stopWatching = wishService.watchBoard((board) => this.setBoard(board))
  },
  onShow() { this.loadBoard() },
  onUnload() { if (this.stopWatching) this.stopWatching() },

  loadBoard() {
    wishService.getBoard().then((board) => this.setBoard(board))
  },

  setBoard(board) {
    const mine = board.mine || wishService.emptyWish()
    const partner = board.partner || wishService.emptyWish()
    const cards = [
      this.makeCard(mine, true, '我的饭饭心愿'),
      this.makeCard(partner, false, 'TA 的饭饭心愿')
    ]
    this.setData({ cards, hasAnyWish: cards.some((card) => card.items.length) })
  },

  makeCard(wish, isMine, label) {
    const safeWish = Object.assign({ items: [], status: 'draft' }, wish)
    return Object.assign({}, safeWish, {
      isMine,
      label,
      display: statusMap[safeWish.status] || statusMap.draft,
      emptyCopy: isMine ? '去挑几样今天想吃的吧。' : 'TA 还在慢慢挑，等等就好。',
      footer: isMine ? '这是我今天的小小心愿 💗' : '来自 TA 的小小心愿 💌'
    })
  },

  updateStatus(e) {
    const { wishId, status } = e.currentTarget.dataset
    wishService.updateWishStatus(wishId, status)
      .then(() => this.loadBoard())
      .catch((error) => wx.showToast({ title: error.message || '回应失败，再试一次', icon: 'none' }))
  },

  chooseMine() { wx.navigateBack({ delta: 1 }) }
})
