
/*
  Kompatibles script.js —
  - stellt globale Funktionen `openModal`, `closeModal`, `showCategory` bereit (sodass inline onclick(...) funktioniert)
  - schließt Modal bei Klick auf Overlay & ESC
  - unterstützt sowohl inline onclick-Handler als auch data-* Karten
*/
(function () {
  // Helfer-Elemente
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
    // Fokus auf Schließen-Button für Zugänglichkeit
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    _setModalState(false);
  }

  // Öffentlich (global) verfügbar machen — kompatibel mit inline onclick="openModal(...)" aus deinem HTML
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

  // Overlay-Klick und ESC
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
  }

  // Falls Karten data-* statt onclick benutzen: Füge Fallback-Listener hinzu (progressive enhancement)
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.card').forEach(card => {
      // Wenn Karte data-name hat und keine inline-onclick (für bessere Kompatibilität), dann Listener hinzufügen
      if (card.dataset && (card.dataset.name || card.dataset.price)) {
        // wenn bereits ein inline onclick existiert, skip (nutzt user's handler)
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

    // initial: erste sichtbare Kategorie sicherstellen
    const firstBtn = document.querySelector('.categories .btn.active');
    if (firstBtn) {
      // benutze showCategory damit Klassen & Sichtbarkeit konsistent sind
      firstBtn.click && firstBtn.click();
    }
  });
})();
