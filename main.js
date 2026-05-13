const header = document.querySelector('[data-header]');
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('#nav-menu');

if (toggle && menu) {
  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));
}

const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  reveals.forEach((el) => observer.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('is-visible'));
}

const countEls = document.querySelectorAll('[data-count]');
const animateCount = (el) => {
  const target = Number(el.dataset.count || 0);
  const suffix = target === 100 ? '%' : target === 48 ? 'h' : '+';
  let current = 0;
  const step = Math.max(1, Math.ceil(target / 42));
  const timer = setInterval(() => {
    current = Math.min(target, current + step);
    el.textContent = current + suffix;
    if (current >= target) clearInterval(timer);
  }, 28);
};
if ('IntersectionObserver' in window) {
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });
  countEls.forEach((el) => countObserver.observe(el));
} else countEls.forEach(animateCount);

const serviceMap = {
  'recruitment': 'Recruitment Solutions',
  'staffing': 'Staffing Services',
  'hr-solutions': 'HR Solutions',
  'resume-writing': 'Resume Writing',
  'linkedin-optimization': 'LinkedIn Profile Optimization',
  'cover-letter-writing': 'Cover Letter Writing',
  'career-counseling': 'Career Counseling',
  'talent-acquisition': 'Talent Acquisition',
  'workforce-consulting': 'Workforce Consulting'
};
const serviceSelect = document.querySelector('#service');
if (serviceSelect) {
  const params = new URLSearchParams(window.location.search);
  const service = params.get('service');
  if (service && serviceMap[service]) serviceSelect.value = serviceMap[service];
}

const contactForm = document.querySelector('#contact-form');
const statusEl = document.querySelector('.form-status');
function setStatus(message, type) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = `form-status ${type || ''}`;
}
async function submitToNetlify(form) {
  const data = new FormData(form);
  data.set('form-name', 'contact');
  const response = await fetch('/', { method: 'POST', body: data });
  if (!response.ok) throw new Error('Netlify form submission failed');
}
if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      setStatus('Please complete the required fields correctly.', 'error');
      return;
    }
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const payload = Object.fromEntries(new FormData(contactForm).entries());
    delete payload['form-name'];
    delete payload['bot-field'];
    if (submitBtn) submitBtn.disabled = true;
    setStatus('Submitting your inquiry...', '');
    try {
      const response = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error('API submission failed');
      contactForm.reset();
      setStatus('Thank you. Your inquiry has been received and Brenvo Core will respond shortly.', 'success');
    } catch (apiError) {
      try {
        await submitToNetlify(contactForm);
        contactForm.reset();
        setStatus('Thank you. Your inquiry has been received.', 'success');
      } catch (fallbackError) {
        setStatus('We could not submit the form right now. Please email hello@brenvocore.com.', 'error');
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}
