const SPRITES = {
  savoryA: '/assets/menu/savory-a.jpg',
  savoryB: '/assets/menu/savory-b.jpg',
  stapleC: '/assets/menu/staple-c.jpg',
  sweetD: '/assets/menu/sweet-d.jpg'
}

function menuItem(id, name, category, emoji, color, note, sprite, column, row) {
  return {
    id,
    name,
    category,
    emoji,
    color,
    note,
    sprite: SPRITES[sprite],
    spriteLeft: `${column * -100}%`,
    spriteTop: `${row * -100}%`
  }
}

module.exports = [
  menuItem('tomato-eggs', '番茄炒蛋', '家常', '🍅', 'sunset', '酸酸甜甜，永远不会错', 'savoryA', 0, 0),
  menuItem('mapo-tofu', '麻婆豆腐', '家常', '🌶️', 'chili', '麻麻辣辣很下饭', 'savoryA', 1, 0),
  menuItem('broccoli', '蒜蓉西兰花', '家常', '🥦', 'green', '清爽一点也很好吃', 'savoryA', 2, 0),
  menuItem('three-delicacies', '地三鲜', '家常', '🍆', 'gold', '普通日子里的好味道', 'savoryA', 0, 1),
  menuItem('cola-wings', '可乐鸡翅', '肉肉', '🍗', 'berry', '甜咸刚刚好', 'savoryA', 1, 1),
  menuItem('braised-pork', '红烧肉', '肉肉', '🥩', 'cocoa', '软糯的一小碗幸福', 'savoryA', 2, 1),
  menuItem('beef-stew', '土豆牛腩', '肉肉', '🥔', 'cocoa', '炖得软烂才安心', 'savoryB', 2, 0),
  menuItem('sweet-ribs', '糖醋排骨', '肉肉', '🍖', 'tomato', '酸甜得很有食欲', 'savoryB', 0, 0),
  menuItem('kung-pao', '宫保鸡丁', '肉肉', '🥜', 'chili', '多一点花生更香', 'savoryB', 1, 0),
  menuItem('steamed-fish', '清蒸鲈鱼', '海鲜', '🐟', 'ocean', '鲜到不用多说话', 'savoryB', 1, 1),
  menuItem('pickled-fish', '酸菜鱼', '海鲜', '🍲', 'green', '酸酸辣辣的热闹', 'savoryB', 0, 1),
  menuItem('shrimp-eggs', '虾仁滑蛋', '海鲜', '🦐', 'sunset', '嫩嫩滑滑的一盘', 'savoryB', 2, 1),
  menuItem('fried-rice', '蛋炒饭', '主食', '🍚', 'gold', '粒粒分明的满足', 'stapleC', 0, 0),
  menuItem('beef-noodles', '牛肉面', '主食', '🍜', 'cocoa', '热乎乎的一大碗', 'stapleC', 1, 0),
  menuItem('wontons', '鲜肉馄饨', '主食', '🥣', 'ocean', '一口一个暖呼呼', 'stapleC', 2, 0),
  menuItem('dumplings', '饺子', '主食', '🥟', 'gold', '蘸点醋更完美', 'stapleC', 0, 1),
  menuItem('pumpkin-porridge', '南瓜粥', '主食', '🥣', 'sunset', '胃也要被温柔照顾', 'stapleC', 1, 1),
  menuItem('rice', '白米饭', '主食', '🍚', 'green', '每一餐都少不了它', 'stapleC', 2, 1),
  menuItem('strawberry-cake', '草莓蛋糕', '甜甜', '🍰', 'berry', '饭后当然要甜一点', 'sweetD', 0, 0),
  menuItem('tiramisu', '提拉米苏', '甜甜', '🍮', 'cocoa', '一小口就很幸福', 'sweetD', 1, 0),
  menuItem('ice-cream', '冰淇淋', '甜甜', '🍨', 'ocean', '分享才更好吃', 'sweetD', 2, 0),
  menuItem('milk-tea', '珍珠奶茶', '喝点', '\u{1F9CB}', 'cocoa', '少冰，刚好想你', 'sweetD', 0, 1),
  menuItem('lemon-tea', '柠檬茶', '喝点', '🍋', 'gold', '清清爽爽碰个杯', 'sweetD', 1, 1),
  menuItem('cola', '可乐', '喝点', '🥤', 'chili', '冰一点，快乐一点', 'sweetD', 2, 1)
]
