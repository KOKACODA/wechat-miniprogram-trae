// 工具函数
function formatTime(dateStr) {
  const d = new Date(dateStr.replace(/-/g, '/'))
  const pad = n => n < 10 ? '0' + n : n
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
    ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds())
}

function debounce(fn, delay = 300) {
  let timer = null
  return function (...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), delay) }
}

function throttle(fn, interval = 300) {
  let last = 0
  return function (...args) { const now = Date.now(); if (now - last >= interval) { last = now; fn.apply(this, args) } }
}

module.exports = { formatTime, debounce, throttle }
