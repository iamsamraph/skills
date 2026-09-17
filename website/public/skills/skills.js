const status = document.querySelector('.status');
async function copy(text, success) {
  try { await navigator.clipboard.writeText(text); status.textContent = success; }
  catch { status.textContent = 'Copy unavailable. Select and copy the text below.'; const details = document.querySelector('details'); details.open = true; details.scrollIntoView({behavior:'smooth'}); }
}
document.querySelector('[data-copy]').addEventListener('click', () => copy(document.querySelector('#skill-text').textContent, 'Instructions copied. Make them yours.'));
document.querySelector('[data-share]').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(location.href); status.textContent = 'Link copied.'; }
  catch { status.textContent = 'Copy the link from your browser’s address bar.'; }
});
