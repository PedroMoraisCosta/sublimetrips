const DEFAULT_LANG = 'pt'
const SUPPORTED_LANGS = ['pt', 'en', 'es', 'fr']
// valor do atributo <html lang="..."> para cada ficheiro de língua
const HTML_LANG = { pt: 'pt', en: 'en', es: 'es', fr: 'fr' }

let translations = {}

// Devolve a tradução de uma chave (usado também pelo main.js)
function t (key, fallback) {
  return translations[key] || fallback || key
}

// Lê "translations.<lang>=true/false" do sections.txt. Só fica ativa com true explícito (se faltar a chave ou o ficheiro, fica bloqueada).
// O português está sempre ativo.
let enabledLangsPromise
function enabledLanguages () {
  if (!enabledLangsPromise) {
    enabledLangsPromise = fetch('sections.txt', { cache: 'no-store' })
      .then(r => (r.ok ? r.text() : ''))
      .catch(() => '')
      .then(text => {
        const enabled = {}
        SUPPORTED_LANGS.forEach(l => {
          const m = text.match(new RegExp('^\\s*translations\\.' + l + '\\s*=\\s*(\\w+)', 'mi'))
          enabled[l] = l === DEFAULT_LANG || (!!m && m[1].toLowerCase() === 'true')
        })
        return enabled
      })
  }
  return enabledLangsPromise
}

async function loadLanguage (lang) {
  const enabled = await enabledLanguages()
  // Língua inválida ou bloqueada: cai para português
  if (!SUPPORTED_LANGS.includes(lang) || !enabled[lang]) lang = DEFAULT_LANG

  // Guarda a língua selecionada no armazenamento local
  localStorage.setItem('selectedLanguage', lang)

  return fetch(`./lang/${lang}.json`)
    .then(response => response.json())
    .then(dict => {
      translations = dict
      applyTranslations()
      document.documentElement.lang = HTML_LANG[lang]
      const label = document.getElementById('currentLang')
      if (label) label.textContent = lang.toUpperCase()
      const flag = document.getElementById('currentFlag')
      if (flag) flag.src = `assets/languages/${lang}.png`
    })
    .catch(err => console.error(`Erro ao carregar a língua "${lang}":`, err))
}

function applyTranslations () {
  // Texto / HTML:  data-i18n="chave"
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n')
    if (translations[key]) el.innerHTML = translations[key]
  })

  // Atributos:  data-i18n-attr="alt:chave;aria-label:outra.chave"
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.getAttribute('data-i18n-attr').split(';').forEach(pair => {
      const [attr, key] = pair.split(':').map(s => s.trim())
      if (attr && translations[key]) el.setAttribute(attr, translations[key])
    })
  })

  // Título e meta description
  // (páginas com <title data-i18n> usam a sua própria chave)
  if (translations['meta.title'] && !document.querySelector('title[data-i18n]')) document.title = translations['meta.title']
  const desc = document.querySelector('meta[name="description"]')
  if (desc && translations['meta.description']) desc.setAttribute('content', translations['meta.description'])
}

function getLanguage () {
  return localStorage.getItem('selectedLanguage') || DEFAULT_LANG
}

function getTranslationFromLangFile (key) {
  return enabledLanguages()
    .then(en => fetch(`./lang/${en[getLanguage()] ? getLanguage() : DEFAULT_LANG}.json`))
    .then(res => res.json())
    .then(dict => dict[key] || key)
}

document.addEventListener('DOMContentLoaded', () => {
  // Seletor de língua: <a data-lang="en">
  document.querySelectorAll('[data-lang]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault()
      enabledLanguages().then(en => { if (en[link.getAttribute('data-lang')]) loadLanguage(link.getAttribute('data-lang')) })
      document.querySelectorAll('.has-dropdown.open').forEach(d => d.classList.remove('open'))
    })
  })

  // Aplica a língua guardada (português por defeito)
  loadLanguage(getLanguage())
})
