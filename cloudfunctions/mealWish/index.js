const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const COLLECTION = 'meal_wishes'
const VALID_STATUSES = ['draft', 'sent', 'received', 'ready']

function emptyWish() {
  return { items: [], status: 'draft', updatedAt: 0 }
}

function cleanText(value, maxLength) {
  return String(value || '').slice(0, maxLength)
}

function cleanWish(input) {
  const source = input || {}
  const items = Array.isArray(source.items) ? source.items.slice(0, 30) : []
  return {
    items: items.map((item) => ({
      id: cleanText(item.id, 60),
      name: cleanText(item.name, 30),
      category: cleanText(item.category, 20),
      emoji: cleanText(item.emoji, 8),
      color: cleanText(item.color, 20),
      note: cleanText(item.note, 80),
      sprite: cleanText(item.sprite, 120),
      spriteLeft: cleanText(item.spriteLeft, 12),
      spriteTop: cleanText(item.spriteTop, 12),
      quantity: Math.max(1, Math.min(20, Number(item.quantity) || 1))
    })),
    status: VALID_STATUSES.includes(source.status) ? source.status : 'draft',
    updatedAt: Date.now()
  }
}

async function ensureCollection() {
  try {
    await db.createCollection(COLLECTION)
  } catch (error) {
    // 集合已存在时会报错，可以安全忽略；后续读写仍会验证它是否可用。
  }
}

function publicWish(wish, openid) {
  return {
    wishId: wish._id,
    items: wish.items || [],
    status: wish.status || 'draft',
    updatedAt: wish.updatedAt || 0,
    isMine: wish.ownerId === openid
  }
}

async function readBoard(openid) {
  const result = await db.collection(COLLECTION).limit(10).get()
  const wishes = (result.data || [])
    .filter((wish) => wish.ownerId)
    .map((wish) => publicWish(wish, openid))
    .sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt))
  return {
    mine: wishes.find((wish) => wish.isMine) || emptyWish(),
    partner: wishes.find((wish) => !wish.isMine) || emptyWish()
  }
}

exports.main = async (event) => {
  try {
    await ensureCollection()
    const { OPENID } = cloud.getWXContext()
    if (event.action === 'save') {
      const existing = await db.collection(COLLECTION).limit(10).get()
      const owners = (existing.data || []).filter((wish) => wish.ownerId)
      if (!owners.some((wish) => wish.ownerId === OPENID) && owners.length >= 2) {
        return { ok: false, message: '小饭桌已经坐满两个人啦' }
      }
      const wish = cleanWish(event.wish)
      await db.collection(COLLECTION).doc(OPENID).set({ data: Object.assign({}, wish, { ownerId: OPENID }) })
      return { ok: true, wish: Object.assign({}, wish, { wishId: OPENID, isMine: true }) }
    }
    if (event.action === 'updateStatus') {
      const wishId = cleanText(event.wishId, 80)
      const status = ['received', 'ready'].includes(event.status) ? event.status : 'received'
      const target = await db.collection(COLLECTION).doc(wishId).get()
      if (!target.data || target.data.ownerId === OPENID) {
        return { ok: false, message: '只能回应 TA 的饭饭心愿' }
      }
      const updatedAt = Date.now()
      await db.collection(COLLECTION).doc(wishId).update({ data: { status, updatedAt } })
      return { ok: true, wish: publicWish(Object.assign({}, target.data, { status, updatedAt }), OPENID) }
    }
    return { ok: true, board: await readBoard(OPENID) }
  } catch (error) {
    return { ok: false, message: error.message || '云端服务暂不可用' }
  }
}
