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

const members = {
  ito: { name: '伊藤 義一', english: 'Yoshikazu ITO｜弁護士', role: '代表取締役 / CEO', bio: '慶應大学理工学部・東京大学大学院を修了後、Microsoftでエンジニアとして勤務。\n\nその後、弁護士へ転身し、法律家として活動する傍ら、IT支援を基軸とした総合コンサルティングファームを設立。', tags: ['法務', 'IT', '経営戦略', 'DX'] },
  yamazaki: { name: '山崎 泰斗', english: 'Taito Yamazaki', role: '取締役', bio: '東京大学大学院を修了後、シンクタンクにて研究員として勤務。\n\n伊藤と合流しコンサルティング業務に従事する傍ら、コンサルティング先であった建設会社の共同代表に就任。', tags: ['経営管理', '建設経営', '事業戦略', 'コンサルティング'] },
  suzuki: { name: '鈴木 利幸', english: 'Toshiyuki Suzuki｜一級建築士', role: '取締役', bio: '三菱地所ホーム株式会社にて部長職を務める傍ら、社内コンペティションにて高評価を得たプロジェクトを推進。\n\nMAMにてその事業化を企画し、参画。', tags: ['建築', '不動産', '事業開発', 'プロジェクトマネジメント'] },
  minagawa: { name: '皆川 直志', english: 'Naoyuki Minagawa', role: '取締役', bio: '環境省補助事業の管理業務や、火力・バイオマス発電所工事の現場責任者を歴任。\n\n多数の案件において、現場調整・施工管理に従事。', tags: ['施工管理', '建設', 'エネルギー', 'プロジェクト管理'] },
  uchida: { name: '内田 慎也', english: 'Shinya Uchida', role: '取締役', bio: '米国カリフォルニア州立大学への留学後、技術実装支援を経て創業。\n\n再生可能エネルギー分野において、国内外の事業開発、導入支援、戦略立案、運営管理を統括。', tags: ['再生可能エネルギー', '海外事業', '事業開発', '経営戦略'] }
};
const profileDialog = document.querySelector('#profile-dialog');
document.querySelectorAll('[data-member]').forEach(button => button.addEventListener('click', () => {
  const member = members[button.dataset.member];
  for (const key of ['name', 'english', 'role', 'bio']) document.querySelector(`#profile-${key}`).textContent = member[key];
  document.querySelector('#profile-tags').replaceChildren(...member.tags.map(tag => { const li = document.createElement('li'); li.textContent = tag; return li; }));
  profileDialog.showModal();
  profileDialog.scrollTop = 0;
}));
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
