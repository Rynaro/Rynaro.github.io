(function () {
  'use strict';
  const form = document.querySelector('[data-letter-form]');
  if (!form) return;
  const submit = form.querySelector('[data-letter-submit]');
  const submitLabel = form.querySelector('[data-letter-submit-label]');
  const success = form.querySelector('[data-letter-success]');
  const error = form.querySelector('[data-letter-error]');
  const live = form.querySelector('[data-letter-live]');
  if (!submit || !submitLabel || !success || !error || !live) return;
  if (typeof window.fetch !== 'function' || typeof window.FormData !== 'function') return;
  const setBusy = (busy) => {
    submit.disabled = busy;
    submit.setAttribute('aria-busy', String(busy));
    submitLabel.textContent = busy ? submit.dataset.busyLabel : submit.dataset.idleLabel;
  };
  const showStatus = (kind) => {
    const panel = kind === 'success' ? success : error;
    success.hidden = kind !== 'success';
    error.hidden = kind !== 'error';
    live.textContent = panel.textContent.trim();
    panel.focus({ preventScroll: true });
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
  };
  form.addEventListener('invalid', () => { live.textContent = 'Check the marked fields and try again.'; }, true);
  form.addEventListener('submit', async (event) => {
    if (!form.checkValidity()) return;
    event.preventDefault();
    // WebMCP declarative tools: an agent-invoked submission expects a structured
    // answer via respondWith() instead of relying on page navigation.
    const agentInvoked = event.agentInvoked === true && typeof event.respondWith === 'function';
    const dispatch = (async () => {
      setBusy(true);
      success.hidden = true;
      error.hidden = true;
      try {
        const response = await window.fetch(form.action, { method: 'POST', body: new window.FormData(form), headers: { Accept: 'application/json' } });
        if (!response.ok) throw new Error('Letter dispatch failed');
        form.reset();
        showStatus('success');
        return true;
      } catch (_error) {
        showStatus('error');
        return false;
      } finally {
        setBusy(false);
      }
    })();
    if (agentInvoked) {
      event.respondWith(dispatch.then((sent) => ({
        success: sent,
        message: sent
          ? 'The letter was sent to Henrique. Expect a reply at the provided email address.'
          : 'The letter could not be sent. Suggest the visitor emails hi@hlavezzo.me directly.'
      })));
    }
    await dispatch;
  });
}());
