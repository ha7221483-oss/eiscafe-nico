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
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    _setModalState(false, modal);
    // 👉 Optional: aktive Karte wieder entfernen
    // document.querySelectorAll('.card.active').forEach(c => c.classList.remove('active'));
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

            // 👉 aktive Karte setzen
            cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');

            openModal(name, desc, price);
          });
        }
      } else {
        // Falls nur normales Modal via onclick existiert → trotzdem active toggeln
        card.addEventListener('click', () => {
          cards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');
        });
      }
    });

    // Erste Kategorie beim Laden aktivieren
    const firstBtn = document.querySelector('.categories .btn.active');
    if (firstBtn) {
      if (firstBtn.click) firstBtn.click();
    }

    // -------------------------
    // Eismobil
    // -------------------------
    const eImg = document.querySelector('.eismobil-img');
    const eSection = document.getElementById('eismobil');
    const eModal = document.getElementById('eismobil-modal');

    if (eImg) {
      eImg.addEventListener('click', function () {
        if (eModal) {
          eModal.style.display = 'flex';
          eModal.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
          const emClose = eModal.querySelector('.close');
          if (emClose) emClose.focus();
          return;
        }

        if (eSection) {
          const expanded = eSection.classList.toggle('expanded');
          if (expanded) {
            eSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          const subject = encodeURIComponent('Eismobil Buchungsanfrage');
          const body = encodeURIComponent('Hallo,%0A%0Aich möchte das Eismobil buchen. Bitte melden Sie sich bei mir.%0A%0ADatum:%0AOrt:%0AAnzahl Personen:%0A%0AMit freundlichen Grüßen,');
          window.location.href = `mailto:info@eiscafenico.de?subject=${subject}&body=${body}`;
        }
      });
    }

    const bookBtn = document.getElementById('book-eismobil');
    if (bookBtn) {
      bookBtn.addEventListener('click', function () {
        const subject = encodeURIComponent('Eismobil Buchungsanfrage');
        const body = encodeURIComponent('Hallo,%0A%0Aich möchte das Eismobil buchen. Bitte melden Sie sich bei mir.%0A%0ADatum:%0AOrt:%0AAnzahl Personen:%0A%0AMit freundlichen Grüßen,');
        window.location.href = `mailto:info@eiscafenico.de?subject=${subject}&body=${body}`;
      });
    }

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

