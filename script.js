/*
  script.js – Eiscafé Nico
  - Speisekarten-Modal (Name, Beschreibung, Preis)
  - Kategorienumschaltung
  - Eismobil-Modal (Logo klickbar)
  - Slideshow mit Auto-Play
*/

(function () {
  // === Allgemeines Modal für Speisekarte ===
  const modal = document.getElementById('modal');
  const nameEl = document.getElementById('modal-name');
  const descEl = document.getElementById('modal-desc');
  const priceEl = document.getElementById('modal-price');
  const closeBtn = modal?.querySelector('.close');

  function _setModalState(open) {
    if (!modal) return;
    modal.style.display = open ? 'flex' : 'none';
    modal.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  function openModal(name, desc, price) {
    if (!modal) return;
    nameEl.textContent = name || '';
    descEl.textContent = desc || '';
    priceEl.textContent = price || '';
    _setModalState(true);
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    _setModalState(false);
  }

  window.openModal = openModal;
  window.closeModal = closeModal;
  window.showCategory = function (id, btn) {
    document.querySelectorAll('#menu .grid').forEach(div => {
      div.style.display = 'none';
    });
    const target = document.getElementById(id);
    if (target) target.style.display = 'grid';

    document.querySelectorAll('#menu .btn').forEach(b => b.classList.remove('active'));
    if (btn && btn.classList) btn.classList.add('active');
  };

  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.card').forEach(card => {
      if (card.dataset && (card.dataset.name || card.dataset.price)) {
        if (!card.getAttribute('onclick')) {
          card.addEventListener('click', function () {
            const name = card.dataset.name || card.querySelector('h3')?.innerText || '';
            const desc = card.dataset.desc || '';
            const price = card.dataset.price || card.querySelector('.price')?.innerText || '';
            openModal(name, desc, price);
          });
        }
      }
    });

    const firstBtn = document.querySelector('.categories .btn.active');
    if (firstBtn) {
      firstBtn.click && firstBtn.click();
    }
  });

  // === Eismobil Modal ===
  const eismobilLogo = document.getElementById('eismobil-logo');
  const eismobilModal = document.getElementById('eismobil-modal');
  const eismobilClose = eismobilModal?.querySelector('.close');

  function openEismobilModal() {
    if (!eismobilModal) return;
    eismobilModal.style.display = 'flex';
    eismobilModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeEismobilModal() {
    if (!eismobilModal) return;
    eismobilModal.style.display = 'none';
    eismobilModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (eismobilLogo) eismobilLogo.addEventListener('click', openEismobilModal);
  if (eismobilClose) eismobilClose.addEventListener('click', closeEismobilModal);
  if (eismobilModal) {
    eismobilModal.addEventListener('click', e => {
      if (e.target === eismobilModal) closeEismobilModal();
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeEismobilModal();
  });

  // === Slideshow Auto-Play ===
  document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('#slideshow .slide');
    let index = 0;
    function showSlide(i) {
      slides.forEach((s, j) => {
        s.style.display = j === i ? 'block' : 'none';
      });
    }
    if (slides.length > 0) {
      showSlide(index);
      setInterval(() => {
        index = (index + 1) % slides.length;
        showSlide(index);
      }, 4000);
    }
  });
})();

