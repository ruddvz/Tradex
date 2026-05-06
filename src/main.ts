import './style.css'

const root = document.querySelector('#app')
if (!(root instanceof HTMLDivElement)) {
  throw new Error('Missing #app root')
}

const standalone =
  window.matchMedia('(display-mode: standalone)').matches ||
  // iOS Safari
  (window.navigator as Navigator & { standalone?: boolean }).standalone === true

root.innerHTML = `
    <main class="shell">
      <header class="hero">
        <p class="eyebrow">${standalone ? 'Running as installed app' : 'Progressive Web App'}</p>
        <h1>Tradex</h1>
        <p class="lede">
          Deployed from GitHub Actions to GitHub Pages. Install this site as an app on desktop
          (Chrome: install icon in the address bar or menu → Install Tradex) for a focused window
          and shortcut on your taskbar or dock.
        </p>
        <div class="actions">
          <button type="button" class="btn primary" id="install" hidden>Install app</button>
          <span class="hint" id="install-hint" hidden>Installation is not available in this browser session.</span>
        </div>
      </header>
      <section class="panel">
        <h2>Offline-ready shell</h2>
        <p>
          A service worker caches the built assets so revisiting this URL loads quickly. After the first visit,
          try opening it while offline (once cached).
        </p>
        <ul class="checks">
          <li><span class="dot ok"></span> Manifest + icons for installability</li>
          <li><span class="dot ok"></span> <code>display: standalone</code> when installed</li>
          <li><span class="dot ok"></span> Base path <code>/Tradex/</code> for project Pages</li>
        </ul>
      </section>
    </main>
  `

const installBtn = document.querySelector<HTMLButtonElement>('#install')
const hint = document.querySelector<HTMLSpanElement>('#install-hint')

let deferred: BeforeInstallPromptEvent | null = null

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferred = e as BeforeInstallPromptEvent
  if (hint) hint.hidden = true
  if (installBtn) {
    installBtn.hidden = false
    installBtn.addEventListener(
      'click',
      async () => {
        if (!deferred) return
        await deferred.prompt()
        await deferred.userChoice
        deferred = null
        installBtn.hidden = true
      },
      { once: true }
    )
  }
})

window.addEventListener('appinstalled', () => {
  if (installBtn) installBtn.hidden = true
  if (hint) hint.hidden = true
})

if (!standalone && installBtn && hint) {
  window.setTimeout(() => {
    if (!deferred && !window.matchMedia('(display-mode: standalone)').matches) {
      hint.hidden = false
    }
  }, 2500)
}
