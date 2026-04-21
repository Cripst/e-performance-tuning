const mobileToggle = document.querySelector('.mobile-toggle');
const navLinks = document.querySelector('.nav-links');
const yearEl = document.getElementById('year');

if (yearEl) yearEl.textContent = new Date().getFullYear();

if (mobileToggle && navLinks) {
  mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    mobileToggle.setAttribute('aria-expanded', String(navLinks.classList.contains('open')));
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

const revealItems = document.querySelectorAll('[data-reveal]');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealItems.forEach(item => revealObserver.observe(item));

const slides = document.querySelectorAll('.testimonial-slide');
let currentSlide = 0;
function showSlide(index) {
  if (!slides.length) return;
  slides.forEach(slide => slide.classList.remove('active'));
  slides[index].classList.add('active');
}
if (slides.length) {
  showSlide(currentSlide);
  document.querySelector('[data-prev]')?.addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  });
  document.querySelector('[data-next]')?.addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  });
  setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }, 6000);
}

function validateForm(form) {
  let valid = true;
  const requiredFields = form.querySelectorAll('[data-required]');
  requiredFields.forEach(field => {
    const errorText = field.parentElement.querySelector('.error-text');
    const isEmail = field.type === 'email';
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
    const fileOk = field.type === 'file' ? field.files.length > 0 : true;
    const fieldValid = field.value.trim() && (!isEmail || emailOk) && fileOk;

    field.classList.toggle('error', !fieldValid);
    if (errorText) {
      errorText.style.display = fieldValid ? 'none' : 'block';
      errorText.textContent = isEmail && field.value.trim() && !emailOk
        ? 'Please enter a valid email address.'
        : 'This field is required.';
    }
    if (!fieldValid) valid = false;
  });
  return valid;
}

function attachFormBehavior(formId, noticeId, successMessage) {
  const form = document.getElementById(formId);
  const notice = document.getElementById(noticeId);
  if (!form || !notice) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    notice.className = 'notice';
    notice.textContent = '';

    if (!validateForm(form)) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    setTimeout(() => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      form.reset();
      notice.className = 'notice success';
      notice.textContent = successMessage;
    }, 1200);
  });
}

attachFormBehavior('uploadForm', 'uploadNotice', 'Demo upload submitted successfully. In a real production setup, this would be connected to your backend or CRM.');
attachFormBehavior('contactForm', 'contactNotice', 'Your message has been sent successfully. We will get back to you shortly.');
