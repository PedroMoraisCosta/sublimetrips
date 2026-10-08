document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, c = document) => c.querySelector(s)
  const $$ = (s, c = document) => [...c.querySelectorAll(s)]

  /* ---------- Mobile menu ---------- */
  const navToggle = $('#navToggle')
  const navMenu = $('#navMenu')

  const setMenu = open => {
    navMenu.classList.toggle('open', open)
    navToggle.setAttribute('aria-expanded', open)
    document.body.classList.toggle('menu-open', open)
  }
  navToggle.addEventListener('click', () =>
    setMenu(!navMenu.classList.contains('open'))
  )
  document.body.addEventListener('click', e => {
    if (
      document.body.classList.contains('menu-open') &&
      !navMenu.contains(e.target) &&
      !navToggle.contains(e.target)
    )
      setMenu(false)
  })
  // close menu when a plain link is clicked
  $$('#navMenu a:not(.dropdown-toggle)').forEach(a =>
    a.addEventListener('click', () => setMenu(false))
  )

  /* ---------- Dropdowns (click/touch/keyboard) ---------- */
  const closeDropdowns = except =>
    $$('.has-dropdown.open').forEach(d => {
      if (d !== except) {
        d.classList.remove('open')
        $('.dropdown-toggle', d)?.setAttribute('aria-expanded', 'false')
      }
    })

  $$('.has-dropdown > .dropdown-toggle').forEach(toggle => {
    toggle.addEventListener('click', e => {
      const parent = toggle.parentElement
      const isMobile = window.matchMedia('(max-width: 960px)').matches
      // on desktop the Services link still navigates; hover opens the menu
      if (isMobile || toggle.tagName === 'BUTTON') e.preventDefault()
      const open = !parent.classList.contains('open')
      closeDropdowns(parent)
      parent.classList.toggle('open', open)
      toggle.setAttribute('aria-expanded', open)
    })
  })
  document.addEventListener('click', e => {
    if (!e.target.closest('.has-dropdown')) closeDropdowns()
  })
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeDropdowns()
      setMenu(false)
    }
  })

  /* ---------- Sticky shadow + back-to-top ---------- */
  const navbar = $('#navbar')
  const toTop = $('#toTop')
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10)
    toTop.classList.toggle('show', window.scrollY > 600)
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
  toTop.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  )

  /* ---------- Active link on scroll ---------- */
  const links = $$(".navbar__links a[href^='#']")
  const sections = links.map(l => $(l.getAttribute('href'))).filter(Boolean)
  const spy = new IntersectionObserver(
    entries =>
      entries.forEach(en => {
        if (en.isIntersecting) {
          links.forEach(l =>
            l.classList.toggle(
              'active',
              l.getAttribute('href') === '#' + en.target.id
            )
          )
        }
      }),
    { rootMargin: '-45% 0px -50% 0px' }
  )
  sections.forEach(s => spy.observe(s))

  /* ---------- Scroll reveal ---------- */
  const revealEls = $$('.card, .destination, .step, .section__head')
  revealEls.forEach(el => el.classList.add('reveal'))
  const revealObs = new IntersectionObserver(
    entries =>
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('visible')
          revealObs.unobserve(en.target)
        }
      }),
    { threshold: 0.12 }
  )
  revealEls.forEach(el => revealObs.observe(el))

  /* ---------- Form validation ---------- */
  const validate = (form, msgEl) => {
    let ok = true
    $$('[required]', form).forEach(f => {
      const bad = !f.value.trim()
      f.closest('.input')?.classList.toggle('invalid', bad)
      if (bad) ok = false
    })
    msgEl.className = 'form-msg ' + (ok ? 'ok' : 'error')
    if (!ok) msgEl.textContent = t('contact.error')
    return ok
  }

  /* ---------- Contact form ---------- */
  const contact = $('#contactForm')
  const WHATSAPP_NUMBER = '351916881648'

  // Clicar em "Reservar" num serviço/rota preenche a mensagem com "Título - "
  let lastPrefix = ''
  $$('.service__cta, .destination__cta').forEach(cta =>
    cta.addEventListener('click', () => {
      const titleEl = cta.closest('.service, .destination')?.querySelector(
        'h3, [data-i18n$=".title"]'
      )
      if (!titleEl) return
      const title = titleEl.innerText.replace(/\s+/g, ' ').trim()
      const field = $('#cmsg')
      const rest = field.value.startsWith(lastPrefix)
        ? field.value.slice(lastPrefix.length)
        : field.value
      lastPrefix = `${t('contact.subject')}: ${title}\n`
      field.value = lastPrefix + rest
      field.closest('.input')?.classList.remove('invalid')
      field.focus({ preventScroll: true })
      field.setSelectionRange(lastPrefix.length, lastPrefix.length)
    })
  )

  // Envio apenas por WhatsApp, com o texto já escrito
  contact.addEventListener('submit', e => {
    e.preventDefault()
    const msg = $('#contactMsg')
    if (!validate(contact, msg)) return
    const text = $('#cmsg').value.trim()
    // Se a mensagem já começa com "Título: ...", não repetir o rótulo "Mensagem:"
    const hasTitle = lastPrefix && text.startsWith(lastPrefix.trim())
    const body = [
      `${t('contact.name')}: ${$('#cname').value.trim()}`,
      hasTitle ? text : `${t('contact.message')}: ${text}`
    ].join('\n')
    lastPrefix = ''
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(body)}`,
      '_blank',
      'noopener'
    )
    msg.className = 'form-msg'
    msg.textContent = ''
    contact.reset()
  })
  $$('.input input, .input textarea, .input select').forEach(f =>
    f.addEventListener('input', () =>
      f.closest('.input').classList.remove('invalid')
    )
  )

  /* ---------- FAQ accordion ---------- */
  $$('.accordion__btn').forEach(btn =>
    btn.addEventListener('click', () => {
      const panel = btn.nextElementSibling
      const open = btn.getAttribute('aria-expanded') === 'true'
      $$('.accordion__btn').forEach(b => {
        b.setAttribute('aria-expanded', 'false')
        b.nextElementSibling.style.maxHeight = null
      })
      if (!open) {
        btn.setAttribute('aria-expanded', 'true')
        panel.style.maxHeight = panel.scrollHeight + 'px'
      }
    })
  )

  /* ---------- Footer year ---------- */
  $('#year').textContent = new Date().getFullYear()
})
