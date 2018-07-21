import debounce from 'lodash/debounce'
import {
  getDevicePixelRatio,
  degToRad
} from '../utils/util'
import {
  O2_AMBIENT_CLASSNAME,
  O2_AMBIENT_CONFIG
} from '../utils/const'
import AmbientBase from './ambient-base'

class Ember extends AmbientBase {
  constructor () {
    super()
    this.devicePixelRatio = getDevicePixelRatio()
    this.isPaused = false
    this.isInited = false
    this.reset()
    // this.initFPS()
    this.initDOM()
    this.bindEvents()
    this.init()
  }

  init () {
    this.isInited = true
    this.create()
  }

  async create () {
    this.draw = this.drawDefault
    if (this.canvas) {
      this.canvas.style.filter = `blur(${this.blur}px)`
    }
    this.addParticles()
    this.play()
  }

  reset () {
    this.width = window.innerWidth * this.devicePixelRatio
    this.height = window.innerHeight * this.devicePixelRatio
    this.parent = document.querySelector('.o2team_ambient_main')
    this.FPS = 30
    this.particleNumber = window[O2_AMBIENT_CONFIG].particleNumber
    this.blur = 2
    this.UPPER_LIMIT = 10
    this.LOWER_LIMIT = 1
    this.UPPER_SIZE = 10
    this.LOWER_SIZE = 4
    this.frameCount = 0
    this.className = O2_AMBIENT_CLASSNAME
    this.isInited && this.create()
  }

  bindEvents () {
    this.windowResizeHandleSelf = debounce(this.windowResizeHandle.bind(this), 300)
    window.addEventListener('resize', this.windowResizeHandleSelf, false)
  }

  unbindEvents () {
    window.removeEventListener('resize', this.windowResizeHandleSelf, false)
  }

  windowResizeHandle (e) {
    const devicePixelRatio = this.devicePixelRatio

    this.width = window.innerWidth * devicePixelRatio
    this.height = window.innerHeight * devicePixelRatio
    this.canvas.width = this.width
    this.canvas.height = this.height
    this.canvas.style.width = `${this.width / devicePixelRatio}px`
    this.canvas.style.height = `${this.height / devicePixelRatio}px`
  }

  floored (val) {
    return Math.floor(Math.random() * val)
  }

  changeValue (val) {
    return Math.random() > 0.5
      ? Math.max(this.LOWER_LIMIT, val - 1)
      : Math.min(val + 1, this.UPPER_LIMIT)
  }

  resetPosition (particle) {
    particle.x = particle.startX
    particle.y = particle.startY
  }

  addParticles () {
    const particles = []
    for (let i = 0; i < this.particleNumber; i++) {
      const size = this.floored(this.UPPER_SIZE) + this.LOWER_SIZE
      const r = degToRad(this.floored(360))
      const color = `rgba(255, ${100 + this.floored(70)}, 0, ${Math.random()})`
      const xDelayed = Math.random() > 0.5
      const startX = xDelayed
        ? -(size + this.floored(this.width))
        : this.floored(this.width * 0.25)
      const startY = xDelayed
        ? size + this.floored(this.height * 0.25) + Math.floor(this.height * 0.75)
        : this.height + size + this.floored(this.height)
      particles.push({
        x: startX,
        y: startY,
        startX,
        startY,
        r,
        vx: this.floored(this.UPPER_LIMIT / 4),
        vy: this.floored(this.UPPER_LIMIT / 4),
        size,
        color
      })
    }
    this.particles = particles
  }

  drawDefault () {
    const ctx = this.ctx
    this.particles.forEach((particle, index) => {
      const size = particle.size
      ctx.save()
      ctx.translate(particle.x + (size / 2), particle.y + (size / 2))
      ctx.rotate(particle.r)
      ctx.fillStyle = particle.color
      ctx.fillRect(-size / 2, -size / 2, size, size)
      ctx.restore()
      if (particle.y < this.height || particle.startX < 0) {
        particle.x += particle.vx
      }
      if (particle.x > 0 || particle.startY > this.height) {
        particle.y -= particle.vy
      }
      if (this.frameCount % 11 === 0 && Math.random() > 0.5) {
        particle.vx = this.changeValue(particle.vx)
      }
      if (this.frameCount % 13 === 0 && Math.random() > 0.5) {
        particle.vy = this.changeValue(particle.vy)
      }
      if (particle.x > this.width || particle.y < -particle.size) {
        this.resetPosition(particle)
      }
    })
  }

  loop () {
    this.rafId = requestAnimationFrame(this.loop.bind(this))
    if (this.isPaused) return
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.draw()
  }
}

export default Ember
