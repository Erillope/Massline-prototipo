/* ===== MassLine — Funciones compartidas ===== */

/* === Sidebar toggle === */
function toggleSection(header) {
  const section = header.closest('.nav-section');
  section.classList.toggle('open');
}

/* === Toast === */
function showToast() {
  const toast = document.getElementById('arrivalToast');
  toast.classList.add('show');
  setTimeout(() => { hideToast(); }, 4000);
}

function hideToast() {
  document.getElementById('arrivalToast').classList.remove('show');
}

/* === Photo lightbox === */
function openPhotoLightbox(src) {
  document.getElementById('lightboxImg').src = src;
  document.getElementById('photoLightbox').classList.add('active');
}

function closePhotoLightbox() {
  document.getElementById('photoLightbox').classList.remove('active');
  document.getElementById('lightboxImg').src = '';
}