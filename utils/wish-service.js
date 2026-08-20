const STORAGE_KEY = 'little_table_active_wish'
const listeners = []
let mode = 'demo'
let boardPoller = null
let lastBoardVersion = ''

function emptyWish() {
  return { items: [], status: 'draft', updatedAt: 0 }
}

function getDemoWish() {
  return wx.getStorageSync(STORAGE_KEY) || emptyWish()
}

function emit(wish) {
  listeners.slice().forEach((listener) => listener(wish))
}

function configure(nextMode) {
  mode = nextMode || 'demo'
}

function callCloud(data) {
  return wx.cloud.callFunction({
    name: 'mealWish',
    data
  }).then((res) => {
    const result = res.result || {}
    if (!result.ok) throw new Error(result.message || '云端饭饭心愿服务暂不可用')
    return result
  })
}

function getWish() {
  if (mode !== 'cloud') return Promise.resolve(getDemoWish())
  return getBoard().then((board) => board.mine || emptyWish())
}

function getBoard() {
  if (mode !== 'cloud') {
    const mine = getDemoWish()
    return Promise.resolve({ mine, partner: emptyWish() })
  }
  return callCloud({ action: 'getBoard' }).then((result) => result.board || { mine: emptyWish(), partner: emptyWish() })
}

function saveWish(wish) {
  const next = Object.assign({}, wish, { updatedAt: Date.now() })
  // 云数据库读取结果会带回保留字段，再次写入前必须移除。
  delete next._id
  delete next._openid
  if (mode !== 'cloud') {
    wx.setStorageSync(STORAGE_KEY, next)
    emit({ mine: next, partner: emptyWish() })
    return Promise.resolve(next)
  }
  return callCloud({ action: 'save', wish: next }).then((result) => result.wish || next)
}

function updateWishStatus(wishId, status) {
  if (mode !== 'cloud') {
    const next = Object.assign({}, getDemoWish(), { status, updatedAt: Date.now() })
    wx.setStorageSync(STORAGE_KEY, next)
    emit({ mine: next, partner: emptyWish() })
    return Promise.resolve(next)
  }
  return callCloud({ action: 'updateStatus', wishId, status }).then((result) => result.wish)
}

function boardVersion(board) {
  return [board.mine, board.partner]
    .map((wish) => `${wish.wishId || ''}:${wish.updatedAt || 0}:${wish.status || ''}`)
    .join('|')
}

function watchBoard(callback) {
  listeners.push(callback)
  if (mode === 'cloud' && !boardPoller) {
    boardPoller = setInterval(() => {
      getBoard().then((board) => {
        const version = boardVersion(board)
        if (version !== lastBoardVersion) {
          lastBoardVersion = version
          emit(board)
        }
      }).catch(() => {})
    }, 2500)
  }
  return () => {
    const index = listeners.indexOf(callback)
    if (index > -1) listeners.splice(index, 1)
    if (!listeners.length && boardPoller) {
      clearInterval(boardPoller)
      boardPoller = null
    }
  }
}

module.exports = { configure, getWish, getBoard, saveWish, updateWishStatus, watchBoard, emptyWish }
