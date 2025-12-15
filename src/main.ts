import './assets/css/tailwind.css'
import 'vue3-openlayers/styles.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import OpenLayersMap from 'vue3-openlayers'

import App from './App.vue'
import router from './router'

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
