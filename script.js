// Verbesserte, aber einfache JS-Logik (behält die ursprüngliche Funktionalität)
document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('modal');
  const modalName = document.getElementById('modal-name');
  const modalDesc = document.getElementById('modal-desc');
  const modalPrice = document.getElementById('modal-price');
  const closeBtn = document.querySelector('.close');

  // Karten-Click öffnet Modal
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const name = card.dataset.name || card.querySelector('h3').innerText;
      const desc = card.dataset.desc || '';
      const price = card.dataset.price || card.querySelector('.price')?.innerText || '';
      openModal(name, desc, price);
    });
  });

  function openModal(name, desc, price) {
    modalName.innerText = name;
    modalDesc.innerText = desc;
    modalPrice.innerText = price;
    modal.setAttribute('aria-hidden', 'false');
    closeBtn.focus();
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });

  document.querySelectorAll('.categories .btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.target;
      document.querySelectorAll('#menu .grid').forEach(div => {
        div.style.display = 'none';
        div.setAttribute('aria-hidden', 'true');
      });
      const target = document.getElementById(id);
      if (target) {
        target.style.display = 'grid';
        target.setAttribute('aria-hidden', 'false');
      }
      document.querySelectorAll('.categories .btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  const first = document.querySelector('.categories .btn.active');
  if (first) first.click();
});
