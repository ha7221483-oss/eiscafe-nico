/*
  script.js – angepasst an dein jetziges HTML
  - Modal (Name, Beschreibung, Preis)
  - Kategorienumschaltung
  - Karten mit "active"-Markierung
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
      document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
      lastActiveCard = card;
      card.classList.add('active');
    }
  }

  function closeModal() {
    _setModalState(false, modal);
    if (lastActiveCard) lastActiveCard.focus();
  }

  window.openModal = function (name, desc, price) {
    // Karte anhand des Preises oder Titels ermitteln
    const allCards = document.querySelectorAll('.card');
    let cardMatch = null;
    allCards.forEach(c => {
      const h3 = c.querySelector('h3')?.innerText;
      const pr = c.querySelector('.price')?.innerText;
      if (h3?.includes(name) || pr === price) {
        cardMatch = c;
      }
    });
    openModal(name, desc, price, cardMatch);
  };

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
    }
  });

  // -------------------------
  // Karten & Klick-Handling
  // -------------------------
  document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.card');

    // Damit auch ohne data-Attribute die "active"-Markierung gesetzt wird
    cards.forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
        lastActiveCard = card;
        card.classList.add('active');
      });
    });

    // Erste Kategorie beim Laden aktivieren
    const firstBtn = document.querySelector('.categories .btn.active');
    if (firstBtn && firstBtn.click) firstBtn.click();
  });
})();
