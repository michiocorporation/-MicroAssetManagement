'use strict';
const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.nav');
function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'メニューを開く');
}
menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
});
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && navigation.classList.contains('open')) { closeMenu(); menuButton.focus(); } });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
window.matchMedia('(min-width:801px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

// Biographies live in HTML; the native details cards work without JavaScript.
const profileDialog = document.querySelector('#profile-dialog');
if (typeof profileDialog.showModal === 'function') {
  document.querySelectorAll('.member-card[data-member]').forEach(card => {
    const summary = card.querySelector('summary');
    summary.setAttribute('aria-haspopup', 'dialog');
    summary.addEventListener('click', event => {
      event.preventDefault();
      for (const key of ['name', 'english', 'role']) {
        document.querySelector('#profile-' + key).textContent = card.querySelector('.member-' + key).textContent;
      }
      if (card.dataset.qualification) document.querySelector('#profile-english').textContent += '｜' + card.dataset.qualification;
      document.querySelector('#profile-bio').replaceChildren(...Array.from(card.querySelector('.member-bio').children, node => node.cloneNode(true)));
      document.querySelector('#profile-tags').replaceChildren(...Array.from(card.querySelector('.profile-tags').children, node => node.cloneNode(true)));
      profileDialog.showModal();
      profileDialog.scrollTop = 0;
    });
  });
}
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
});
document.querySelector('.profile-contact').addEventListener('click', () => profileDialog.close());
const form = document.querySelector('#contact-form');
const confirmation = document.querySelector('#confirmation-dialog');
let inquiryText = '';
const contactEmail = String(window.MAM_CONFIG?.contactEmail || '').trim();
const hasContact = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail);
if (hasContact) {
  document.querySelector('#contact-notice').textContent = 'ご相談内容の確認後、お使いのメールアプリから送信できます。';
  document.querySelector('#confirmation-notice').textContent = '内容をご確認のうえ、メールアプリから送信してください。この画面ではまだ送信されていません。';
  document.querySelector('#email-inquiry').hidden = false;
}
document.querySelectorAll('[data-topic]').forEach(link => link.addEventListener('click', () => { form.elements.topic.value = link.dataset.topic; }));
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const labels = { company: '会社名', name: 'お名前', email: 'メールアドレス', topic: 'ご相談内容', message: 'ご相談の詳細' };
  const rows = Object.entries(labels).map(([key, label]) => {
    const value = String(data.get(key) || '').trim() || '未記入';
    const row = document.createElement('div');
    const dt = document.createElement('dt'); dt.textContent = label;
    const dd = document.createElement('dd'); dd.textContent = value;
    row.append(dt, dd); return { row, text: `${label}：${value}` };
  });
  document.querySelector('#confirmation-details').replaceChildren(...rows.map(item => item.row));
  inquiryText = 'MicroAsset Management ご担当者様\n\n' + rows.map(item => item.text).join('\n\n');
  if (hasContact) document.querySelector('#email-inquiry').href = `mailto:${encodeURIComponent(contactEmail)}?subject=${encodeURIComponent('経営のご相談：' + data.get('company'))}&body=${encodeURIComponent(inquiryText)}`;
  document.querySelector('#copy-status').textContent = '';
  confirmation.showModal(); confirmation.scrollTop = 0;
});
document.querySelector('#copy-inquiry').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(inquiryText); document.querySelector('#copy-status').textContent = '相談内容をコピーしました。まだ送信されていません。'; }
  catch { document.querySelector('#copy-status').textContent = 'コピーできませんでした。上の内容を選択してコピーしてください。'; }
});
// Content is visible by default. Only below-the-fold content is enhanced.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: .08 });
  document.querySelectorAll('.section-heading,.problem-body,.concept-layout>div,.platform-copy,.section-top,.team-intro,.leadership-heading,.bpo-layout>div,.network-layout>div,.company>div,.contact-copy').forEach(element => { if (element.getBoundingClientRect().top > window.innerHeight) { element.classList.add('reveal-ready'); observer.observe(element); } });
  reducedMotion.addEventListener('change', event => { if (event.matches) document.querySelectorAll('.reveal-ready').forEach(element => element.classList.add('is-visible')); });
}
// Expand the service targeted from the platform diagram or a direct link.
function revealLinkedService() { const id = window.location.hash.slice(1); const target = document.getElementById(id); if (target?.matches('details.service-card')) target.open = true; }
window.addEventListener('hashchange', revealLinkedService); revealLinkedService();
