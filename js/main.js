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
  const EMAIL_API = 'https://magest2api-3bbfb75c6660.herokuapp.com/email'
  const WHATSAPP_NUMBER = '351916881648'

  // Serviço de email em baixo: mensagem simpática + link WhatsApp com o texto já escrito
  const showEmailFallback = (msg, data) => {
    const body = [
      `${t('contact.name')}: ${data.name}`,
      `${t('contact.email')}: ${data.email}`,
      `${t('contact.message')}: ${data.message}`
    ].join('\n')
    const link = document.createElement('a')
    link.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      body
    )}`
    link.target = '_blank'
    link.rel = 'noopener'
    link.className = 'nav-whatsapp'
    link.style.marginTop = '12px'
    link.innerHTML = `<i class="bi bi-whatsapp"></i> `
    link.append(t('contact.fail.cta'))
    msg.className = 'form-msg error'
    msg.textContent = t('contact.fail')
    msg.append(document.createElement('br'), link)
  }

  contact.addEventListener('submit', async e => {
    e.preventDefault()
    const msg = $('#contactMsg')
    if (!validate(contact, msg)) return
    const data = {
      name: $('#cname').value.trim(),
      to: $('#cemail').value.trim(),
      message: $('#cmsg').value.trim(),
      from: 'manuelamorais1954@gmail.com'
    }
    const btn = $("button[type='submit']", contact)
    btn.disabled = true
    try {
      const res = await fetch(EMAIL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) throw new Error(res.status)
      msg.className = 'form-msg ok'
      msg.textContent = t('contact.success')
      contact.reset()
    } catch {
      showEmailFallback(msg, data)
    } finally {
      btn.disabled = false
    }
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
