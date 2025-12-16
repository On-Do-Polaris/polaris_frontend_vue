import './assets/css/tailwind.css'
import 'vue3-openlayers/styles.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import OpenLayersMap from 'vue3-openlayers'

import App from './App.vue'
import router from './router'

// 전역 에러 핸들러 - Storage 접근 에러 처리
window.addEventListener('error', (event) => {
  if (
    event.error &&
    event.error.message &&
    (event.error.message.includes('Access to storage') ||
      event.error.message.includes('storage is not allowed'))
  ) {
    console.warn('[Storage Error] Storage access is blocked by browser settings')
    console.warn('[Storage Error] App will continue with limited functionality')
    event.preventDefault() // 에러 팝업 방지
    return
  }
})

// 전역 unhandled promise rejection 핸들러
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason)

  // Storage 에러는 콘솔에만 경고 표시하고 기본 에러 동작 방지
  if (
    event.reason &&
    ((event.reason instanceof Error &&
      (event.reason.message.includes('Access to storage') ||
        event.reason.message.includes('storage is not allowed'))) ||
      (typeof event.reason === 'string' &&
        (event.reason.includes('Access to storage') ||
          event.reason.includes('storage is not allowed'))))
  ) {
    console.warn('[Storage Error] Storage access is blocked by browser settings')
    console.warn('[Storage Error] App will continue with limited functionality')
    event.preventDefault() // 에러 팝업 방지
  }
})

console.log('[Main] Starting app initialization...')
console.log('[Main] Environment:', {
  BASE_URL: import.meta.env.BASE_URL,
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
})

try {
  console.log('[Main] Creating Vue app...')
  const app = createApp(App)

  console.log('[Main] Installing Pinia...')
  app.use(createPinia())

  console.log('[Main] Installing Router...')
  app.use(router)

  console.log('[Main] Installing OpenLayersMap...')
  app.use(OpenLayersMap)

  // 전역 에러 핸들러
  app.config.errorHandler = (err, instance, info) => {
    console.error('[Global Error]', err)
    console.error('[Global Error Info]', info)
    // 에러를 화면에도 표시
    document.body.innerHTML = `
      <div style="padding: 20px; background: #fee; color: #c00; font-family: monospace;">
        <h1>Application Error</h1>
        <pre>${err}</pre>
        <pre>${info}</pre>
      </div>
    `
  }

  // 전역 경고 핸들러
  app.config.warnHandler = (msg, instance, trace) => {
    console.warn('[Global Warning]', msg, trace)
  }

  console.log('[Main] Mounting app to #app...')
  const mountedApp = app.mount('#app')
  console.log('[Main] App mounted successfully:', mountedApp)
} catch (error) {
  console.error('[Main] Failed to mount app:', error)
  // 에러를 화면에 표시
  const appDiv = document.getElementById('app')
  if (appDiv) {
    appDiv.innerHTML = `
      <div style="padding: 20px; background: #fee; color: #c00; font-family: monospace;">
        <h1>Failed to initialize application</h1>
        <pre>${error instanceof Error ? error.message : String(error)}</pre>
        <pre>${error instanceof Error ? error.stack : ''}</pre>
      </div>
    `
  }
}
