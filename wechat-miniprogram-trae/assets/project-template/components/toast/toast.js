Component({
  properties: { show: { type: Boolean, value: false }, message: { type: String, value: '' } },
  observers: {
    show(val) { if (val) setTimeout(() => this.triggerEvent('hide'), 2000) }
  }
})
