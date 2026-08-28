(function () {
  'use strict';

  function initializeNotebook(root) {
    const tools = root.querySelector('[data-journal-tools]');
    const search = root.querySelector('[data-journal-search]');
    const entries = Array.from(root.querySelectorAll('[data-journal-entry]'));
    const count = root.querySelector('[data-journal-count]');
    const status = root.querySelector('[data-journal-status]');
    const empty = root.querySelector('[data-journal-empty]');
    const resetButtons = root.querySelectorAll('[data-journal-reset]');

    if (!tools || !search || !entries.length) return;
    tools.hidden = false;

    function filterEntries() {
      const query = search.value.trim().toLocaleLowerCase();
      let visible = 0;
      entries.forEach(function (entry) {
        const match = !query || (entry.dataset.searchText || '').includes(query);
        entry.hidden = !match;
        if (match) visible += 1;
      });
      if (count) count.textContent = String(visible);
      if (status) status.textContent = visible + (visible === 1 ? ' entry found.' : ' entries found.');
      if (empty) empty.hidden = visible !== 0;
    }

    search.addEventListener('input', filterEntries);
    resetButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        search.value = '';
        filterEntries();
        search.focus();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-notebook]').forEach(initializeNotebook);
  });
}());
