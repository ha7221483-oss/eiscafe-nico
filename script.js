/*
  script.js – angepasst für dein aktuelles Setup
  - Speisekarten-Modal (Name, Beschreibung, Preis)
  - Kategorienumschaltung (showCategory)
  - Karten-Click-Fallback (data-* oder inline onclick)
  - Eismobil: falls #eismobil-modal vorhanden -> öffne Modal,
             sonst toggle Ansicht / scrollt zum Eismobil-Bereich
  - Saubere Fokus- & ESC-Logik
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

  function _setModalState(open, container = modal) {
    if (!container) return;
    container.style.display = open ? 'flex' : 'none';
    container.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  function openModal(name, desc, price) {
    if (!modal) return;
    nameEl.textContent = name || '';
    descEl.textContent = desc || '';
    priceEl.textContent = price || '';
    _setModalState(true, modal);
    // Fokus auf Schließen-Button
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    _setModalState(false, modal);
  }

  // Exponiere global für inline onclick in HTML
  window.openModal = openModal;
  window.closeModal = closeModal;

  // showCategory (Kategorien Umschaltung)
  window.showCategory = function (id, btn) {
    document.querySelectorAll('#menu .grid').forEach(div => {
      div.style.display = 'none';
    });
    const target = document.getElementById(id);
    if (target) target.style.display = 'grid';

    document.querySelectorAll('#menu .btn').forEach(b => b.classList.remove('active'));
    if (btn && btn.classList) btn.classList.add('active');
  };

  // Modal: Overlay-Klick und ESC schließen
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      // schließe allgemeines Modal, falls offen
      if (modal && modal.getAttribute('aria-hidden') === 'false') closeModal();
      // schließe Eismobil-Modal, falls offen (handled weiter unten)
      const em = document.getElementById('eismobil-modal');
      if (em && em.getAttribute('aria-hidden') === 'false') {
        em.style.display = 'none';
        em.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    }
  });

  // -------------------------
  // Karten & progressive enhancement für .card
  // -------------------------
  document.addEventListener('DOMContentLoaded', function () {
    // Wenn Karten data-* nutzen, binde Click-Listener (nur falls kein inline onclick existiert)
    document.querySelectorAll('.card').forEach(card => {
      if (card.dataset && (card.dataset.name || card.dataset.price || card.dataset.desc)) {
        if (!card.getAttribute('onclick')) {
          card.addEventListener('click', function () {
            const name = card.dataset.name || card.querySelector('h3')?.innerText || '';
            const desc = card.dataset.desc || card.querySelector('p')?.innerText || '';
            const price = card.dataset.price || card.querySelector('.price')?.innerText || '';
            openModal(name, desc, price);
          });
        }
      }
    });

    // initial: erste Kategorie sichtbar machen (wenn eine .btn.active existiert)
    const firstBtn = document.querySelector('.categories .btn.active');
    if (firstBtn) {
      // safe click
      const id = firstBtn.getAttribute('onclick')?.match(/'([^']+)'/);
      // benutze vorhandene Klick-Handler wenn möglich (falls inline onclick existiert)
      if (firstBtn.click) firstBtn.click();
      else if (id && id[1]) window.showCategory(id[1], firstBtn);
    }

    // -------------------------
    // Eismobil: Klick-Verhalten für .eismobil-img
    // -------------------------
    const eImg = document.querySelector('.eismobil-img');
    const eSection = document.getElementById('eismobil');
    const eModal = document.getElementById('eismobil-modal'); // optional

    if (eImg) {
      eImg.addEventListener('click', function () {
        // Wenn ein Eismobil-Modal existiert, öffne es (falls du es wieder hinzufügen willst)
        if (eModal) {
          eModal.style.display = 'flex';
          eModal.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
          const emClose = eModal.querySelector('.close');
          if (emClose) emClose.focus();
          return;
        }

        // Sonst: Toggle eine "expanded" Klasse am Eismobil-Bereich und scrollen
        if (eSection) {
          const expanded = eSection.classList.toggle('expanded');
          // falls gerade geöffnet wurde, scroll into view
          if (expanded) {
            eSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          // fallback: öffne Mail-Client mit vorformuliertem Text
          const subject = encodeURIComponent('Eismobil Buchungsanfrage');
          const body = encodeURIComponent('Hallo,%0A%0Aich möchte das Eismobil buchen. Bitte melden Sie sich bei mir.%0A%0ADatum:%0AOrt:%0AAnzahl Personen:%0A%0AMit freundlichen Grüßen,');
          window.location.href = `mailto:info@eiscafenico.de?subject=${subject}&body=${body}`;
        }
      });
    }

    // Falls ein Buchungsbutton innerhalb Eismobil-Sektion existiert, öffne Mail-Client
    const bookBtn = document.getElementById('book-eismobil');
    if (bookBtn) {
      bookBtn.addEventListener('click', function () {
        const subject = encodeURIComponent('Eismobil Buchungsanfrage');
        const body = encodeURIComponent('Hallo,%0A%0Aich möchte das Eismobil buchen. Bitte melden Sie sich bei mir.%0A%0ADatum:%0AOrt:%0AAnzahl Personen:%0A%0AMit freundlichen Grüßen,');
        window.location.href = `mailto:info@eiscafenico.de?subject=${subject}&body=${body}`;
      });
    }

    // Falls Eismobil-Modal vorhanden: Overlay und Close-Logik
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
  }); // end DOMContentLoaded
})();

