(function () {
  const input = document.getElementById('q');
  const results = document.getElementById('results');
  const status = document.getElementById('status');
  if (!input || !results) return;

  let index = [];

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }

  function snippet(text, q) {
    const t = String(text || '');
    const i = t.toLowerCase().indexOf(q);
    if (i < 0) return t.slice(0, 140);
    const start = Math.max(0, i - 40);
    const end = Math.min(t.length, i + q.length + 80);
    return (start ? '…' : '') + t.slice(start, end) + (end < t.length ? '…' : '');
  }

  function render(q) {
    const query = q.trim().toLowerCase();
    if (!query) {
      results.innerHTML = '';
      status.textContent = 'Type to search. Bios, contracts, and marriage — unknowns stay open.';
      return;
    }
    const hits = index.filter((item) => item.text.toLowerCase().includes(query));
    status.textContent = hits.length
      ? hits.length + ' result' + (hits.length === 1 ? '' : 's')
      : 'No matches. I don\'t know — nothing invented to fill the gap.';
    results.innerHTML = hits
      .map((item) => {
        const label = item.type === 'contract' ? 'Family Contract' : (item.type === 'marriage' ? 'Marriage Certificate' : 'Biography');
        return (
          '<li><a href="' +
          esc(item.url) +
          '">' +
          esc(item.title) +
          '</a><span class="meta">' +
          esc(label) +
          (item.kind ? ' · ' + esc(item.kind) : '') +
          '</span><span class="snippet">' +
          esc(snippet(item.text, query)) +
          '</span></li>'
        );
      })
      .join('');
  }

  fetch('data/search-index.json')
    .then((r) => r.json())
    .then((data) => {
      index = [].concat(data.people || [], data.contracts || [], data.marriage || []);
      const params = new URLSearchParams(location.search);
      const initial = params.get('q') || '';
      if (initial) input.value = initial;
      render(input.value);
    })
    .catch(() => {
      status.textContent = 'Search index unavailable.';
    });

  input.addEventListener('input', () => render(input.value));
})();
