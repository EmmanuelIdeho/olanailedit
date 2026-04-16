// ── NAV SCROLL BEHAVIOUR ──
const nav = document.getElementById('site-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ── GALLERY REEL ──
(function () {
  const track = document.getElementById('reel-track');
  const dotsContainer = document.getElementById('reel-dots');
  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.reel-slide:not(.clone)'));
  const totalReal = slides.length;
  let current = 0;
  let slideWidth = 0;
  let autoplayInterval = null;
  let isDragging = false;
  let dragStartX = 0;
  let dragOffset = 0;

  // Build dots
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'reel-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  function updateDots() {
    dotsContainer.querySelectorAll('.reel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function getSlideWidth() {
    const s = track.querySelector('.reel-slide');
    if (!s) return 360;
    return s.offsetWidth + 20; // 20 = gap
  }

  function goTo(index, smooth = true) {
    slideWidth = getSlideWidth();
    current = ((index % totalReal) + totalReal) % totalReal;
    track.style.transition = smooth ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
    track.style.transform = `translateX(-${current * slideWidth}px)`;
    updateDots();
  }

  document.getElementById('reel-next')?.addEventListener('click', () => goTo(current + 1));
  document.getElementById('reel-prev')?.addEventListener('click', () => goTo(current - 1));

  // Drag to scroll
  track.addEventListener('mousedown', e => {
    isDragging = true;
    dragStartX = e.clientX;
    track.style.transition = 'none';
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    dragOffset = e.clientX - dragStartX;
    const base = current * getSlideWidth();
    track.style.transform = `translateX(${-base + dragOffset}px)`;
  });
  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    if (dragOffset < -60) goTo(current + 1);
    else if (dragOffset > 60) goTo(current - 1);
    else goTo(current);
    dragOffset = 0;
  });

  // Touch
  track.addEventListener('touchstart', e => { dragStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = e.changedTouches[0].clientX - dragStartX;
    if (diff < -50) goTo(current + 1);
    else if (diff > 50) goTo(current - 1);
  });

  // Autoplay
  function startAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(() => goTo(current + 1), 4000);
  }
  function stopAutoplay() {
    if (autoplayInterval) clearInterval(autoplayInterval);
  }
  track.closest('.reel-wrapper')?.addEventListener('mouseenter', stopAutoplay);
  track.closest('.reel-wrapper')?.addEventListener('mouseleave', startAutoplay);

  // Init
  goTo(0, false);
  startAutoplay();
  window.addEventListener('resize', () => goTo(current, false));
})();

// ── BOOKING FORM ──
let currentStep = 1;
let selectedServiceId = null;

function goToStep(step) {
  // Validate step 1 before advancing
  if (step === 2 && currentStep === 1) {
    const name = document.getElementById('client-name');
    const email = document.getElementById('client-email');
    const phone = document.getElementById('client-phone');
    if (!name.value.trim() || !email.value.trim() || !phone.value.trim()) {
      shakeInvalid([name, email, phone]);
      return;
    }
  }
  // Validate step 2 (service selected) before advancing
  if (step === 3 && currentStep === 2) {
    if (!selectedServiceId) {
      const grid = document.getElementById('service-select-grid');
      grid.classList.add('shake');
      setTimeout(() => grid.classList.remove('shake'), 500);
      return;
    }
  }

  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  document.getElementById(`step-${step}`).classList.add('active');

  document.querySelectorAll('.progress-step').forEach((el, i) => {
    el.classList.remove('active', 'done');
    if (i + 1 < step) el.classList.add('done');
    if (i + 1 === step) el.classList.add('active');
  });

  currentStep = step;
}

function pickService(id, name, price) {
  selectedServiceId = id;
  document.getElementById('selected-service-id').value = id;
  document.querySelectorAll('.service-option').forEach(el => {
    el.classList.toggle('selected', parseInt(el.dataset.id) === id);
  });
}

function selectService(id, name, price) {
  // Called from services section — scroll and pre-select
  document.getElementById('booking').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => {
    goToStep(2);
    setTimeout(() => pickService(id, name, price), 100);
  }, 600);
}

function shakeInvalid(fields) {
  fields.forEach(f => {
    if (!f.value.trim()) {
      f.style.borderColor = '#e55';
      f.addEventListener('input', () => f.style.borderColor = '', { once: true });
    }
  });
}

// Form submission
document.getElementById('booking-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const btn = e.target.querySelector('.btn-submit');
  btn.disabled = true;
  btn.textContent = 'Sending…';

  if(document.getElementById('appt-time').value == ''){
    alert("You forgot to choose a timeslot");
    btn.disabled = false;
    btn.textContent = 'REQUEST APPOINTMENT';
    return;
  }

  if(document.getElementById('appt-date').value == ''){
    alert("You forgot to choose a date");
    btn.disabled = false;
    btn.textContent = 'REQUEST APPOINTMENT';
    return;
  }

  const formData = {
    name: document.getElementById('client-name').value,
    email: document.getElementById('client-email').value,
    phone: document.getElementById('client-phone').value,
    service_id: document.getElementById('selected-service-id').value,
    date: document.getElementById('appt-date').value,
    time_slot_id: document.getElementById('appt-time').value,
    notes: document.getElementById('appt-notes').value,
  };

  const csrf = document.querySelector('[name=csrfmiddlewaretoken]').value;
  

  try {
    const resp = await fetch('/book/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf,
      },
      body: JSON.stringify(formData),
    });
    const data = await resp.json();
    if (data.success) {
      document.getElementById('booking-form').style.display = 'none';
      document.querySelector('.booking-progress').style.display = 'none';
      document.getElementById('booking-success').style.display = 'block';
    } else {
      alert('Something went wrong: ' + data.error);
      btn.disabled = false;
      btn.textContent = 'Request Appointment';
    }
  } catch (err) {
    alert('Network error. Please try again.');
    btn.disabled = false;
    btn.textContent = 'Request Appointment';
  }
});


function resetForm() {
  document.getElementById('booking-form').reset();
  document.getElementById('booking-form').style.display = 'block';
  document.querySelector('.booking-progress').style.display = 'flex';
  document.getElementById('booking-success').style.display = 'none';
  selectedServiceId = null;
  goToStep(1);
}

// Set min date to today
const dateInput = document.getElementById('appt-date');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}

dateInput?.addEventListener('change', async(e) => {
  document.getElementById('appt-time').value = '';
  try{
    const resp = await fetch(`/available-slots/?date=${e.target.value}`, {
      method:'GET'
    });
    const data = await resp.json();
    const timeSelect = document.getElementById('appt-time');
    timeSelect.innerHTML = '<option value="">Select a time…</option>';
    if(!data.success || data.data.length===0){
       timeSelect.innerHTML += '<option disabled>No availability on this date — try another</option>';
       return;
    }
    for(const slot of data.data){
      timeSelect.innerHTML += `<option value="${slot.id}">${slot.start_time.slice(0,5)} to ${slot.end_time.slice(0,5)}</option>`;
    }
  }catch(e){
    console.log(e);
  }
});

// ── SCROLL REVEAL ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(el => {
    if (el.isIntersecting) {
      el.target.style.opacity = '1';
      el.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .section-header').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});
