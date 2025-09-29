/*
  script.js – final angepasst
  - Speisekarten-Modal (Name, Beschreibung, Preis)
  - Kategorienumschaltung
  - Karten mit "active"-Markierung, die korrekt bleibt
  - Eismobil (Modal oder Bereich)
*/

(function () {
  // -------------------------
  // Allgemeines Modal (Produkte)
  // -------------------------
  const modal = document.getElementById('modal');
  const nameEl = document.getElementById('modal-name');
  const descEl = document.getElementById('modal-desc');
  const priceEl = document.getElementById('modal-price');
  const closeBtn = modal?.querySelector('.close');

  let lastActiveCard = null; // zuletzt angeklickte Karte merken

  function _setModalState(open, container = modal) {
    if (!container) return;
    container.style.display = open ? 'flex' : 'none';
    container.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  function openModal(name, desc, price, card = null) {
    if (!modal) return;
    nameEl.textContent = name || '';
    descEl.textContent = desc || '';
    priceEl.textContent = price || '';
    _setModalState(true, modal);

    if (closeBtn) closeBtn.focus();

    if (card) {
      // vorherige aktive Karte zurücksetzen
      document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
      // neue Karte merken und markieren
      lastActiveCard = card;
      card.classList.add('active');
    }
  }

  function closeModal() {
    _setModalState(false, modal);

    // Fokus zurück auf zuletzt aktive Karte
    if (lastActiveCard) {
      lastActiveCard.focus();
    }
  }

  window.openModal = openModal;
  window.closeModal = closeModal;

  // -------------------------
  // Kategorienumschaltung
  // -------------------------
  window.showCategory = function (id, btn) {
    document.querySelectorAll('#menu .grid').forEach(div => {
      div.style.display = 'none';
    });
    const target = document.getElementById(id);
    if (target) target.style.display = 'grid';

    document.querySelectorAll('#menu .btn').forEach(b => b.classList.remove('active'));
    if (btn && btn.classList) btn.classList.add('active');
  };

  // -------------------------
  // ESC & Overlay schließen
  // -------------------------
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (modal && modal.getAttribute('aria-hidden') === 'false') closeModal();
      const em = document.getElementById('eismobil-modal');
      if (em && em.getAttribute('aria-hidden') === 'false') {
        em.style.display = 'none';
        em.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    }
  });

  // -------------------------
  // Karten & Klick-Handling
  // -------------------------
  document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
      if (card.dataset && (card.dataset.name || card.dataset.price || card.dataset.desc)) {
        if (!card.getAttribute('onclick')) {
          card.addEventListener('click', function () {
            const name = card.dataset.name || card.querySelector('h3')?.innerText || '';
            const desc = card.dataset.desc || card.querySelector('p')?.innerText || '';
            const price = card.dataset.price || card.querySelector('.price')?.innerText || '';
            openModal(name, desc, price, card);
          });
        }
      } else {
        // Falls nur inline onclick → trotzdem active markieren
        card.addEventListener('click', () => {
          document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
          lastActiveCard = card;
          card.classList.add('active');
        });
      }
    });

    // Erste Kategorie beim Laden aktivieren
    const firstBtn = document.querySelector('.categories .btn.active');
    if (firstBtn && firstBtn.click) firstBtn.click();

    if (eModal) {
      const eClose = eModal.querySelector('.close');
      if (eClose) eClose.addEventListener('click', () => {
        eModal.style.display = 'none';
        eModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
      eModal.addEventListener('click', (ev) => {
        if (ev.target === eModal) {
          eModal.style.display = 'none';
          eModal.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        }
      });
    }
  });
})();


