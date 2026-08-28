(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    const root = document.querySelector('[data-post]');
    if (!root) return;
    const progress = root.querySelector('[data-reading-progress]');
    if (progress) {
      const update = function () {
        const maximum = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.transform = 'scaleX(' + (maximum > 0 ? Math.min(window.scrollY / maximum, 1) : 0) + ')';
      };
      update();
      window.addEventListener('scroll', update, { passive: true });
    }
    const copy = root.querySelector('[data-copy-link]');
    const status = root.querySelector('[data-copy-status]');
    if (copy && navigator.clipboard) copy.addEventListener('click', function () {
      navigator.clipboard.writeText(window.location.href).then(function () {
        if (status) status.textContent = 'Link copied.';
      });
    });

    const article = root.querySelector('.article-content');
    if (!article) return;

    const legacyCopy = function (text) {
      return new Promise(function (resolve, reject) {
        const field = document.createElement('textarea');
        field.value = text;
        field.setAttribute('readonly', '');
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        try {
          if (document.execCommand && document.execCommand('copy')) resolve();
          else reject(new Error('Copy is unavailable.'));
        } catch (error) {
          reject(error);
        }
        field.remove();
      });
    };

    const writeToClipboard = function (text) {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        return navigator.clipboard.writeText(text).catch(function () {
          return legacyCopy(text);
        });
      }
      return legacyCopy(text);
    };

    const codeText = function (shell, pre) {
      const source = shell.querySelector('.rouge-code code') || pre.querySelector('code') || pre;
      const clean = source.cloneNode(true);
      clean.querySelectorAll('.lineno, .rouge-gutter, [data-line-number], [aria-hidden="true"]').forEach(function (artifact) {
        artifact.remove();
      });
      return clean.textContent;
    };

    const codeBlocks = [];
    article.querySelectorAll('pre').forEach(function (pre, index) {
      const existingContainer = pre.closest('.highlighter-rouge');
      const shell = document.createElement('div');
      shell.className = 'code-block-shell';
      shell.dataset.codeCopyEnhanced = 'true';

      const target = existingContainer || pre;
      if (target.closest('[data-code-copy-enhanced]')) return;
      target.parentNode.insertBefore(shell, target);
      shell.appendChild(target);

      const button = document.createElement('button');
      button.className = 'code-copy-button';
      button.type = 'button';
      button.textContent = 'Copy code';
      button.setAttribute('aria-describedby', 'code-copy-status-' + index);

      const copyStatus = document.createElement('span');
      copyStatus.className = 'code-copy-status';
      copyStatus.id = 'code-copy-status-' + index;
      copyStatus.setAttribute('aria-live', 'polite');
      shell.insertBefore(button, shell.firstChild);
      shell.insertBefore(copyStatus, button.nextSibling);
      codeBlocks.push(pre);

      let resetTimer;
      button.addEventListener('click', function () {
        window.clearTimeout(resetTimer);
        writeToClipboard(codeText(shell, pre)).then(function () {
          button.textContent = 'Copied';
          copyStatus.textContent = 'Code copied to clipboard.';
        }).catch(function () {
          button.textContent = 'Copy failed';
          copyStatus.textContent = 'Could not copy code. Select and copy it manually.';
        }).finally(function () {
          resetTimer = window.setTimeout(function () {
            button.textContent = 'Copy code';
            copyStatus.textContent = '';
          }, 2000);
        });
      });
    });

    const syncCodeBlockFocus = function (pre) {
      if (pre.scrollWidth > pre.clientWidth + 1) pre.setAttribute('tabindex', '0');
      else pre.removeAttribute('tabindex');
    };
    const syncAllCodeBlockFocus = function () {
      codeBlocks.forEach(syncCodeBlockFocus);
    };

    if (codeBlocks.length) {
      if ('ResizeObserver' in window) {
        const codeBlockObserver = new ResizeObserver(function (entries) {
          entries.forEach(function (entry) { syncCodeBlockFocus(entry.target); });
        });
        codeBlocks.forEach(function (pre) { codeBlockObserver.observe(pre); });
      } else {
        let resizeFrame = 0;
        window.addEventListener('resize', function () {
          if (resizeFrame) return;
          resizeFrame = window.requestAnimationFrame(function () {
            resizeFrame = 0;
            syncAllCodeBlockFocus();
          });
        }, { passive: true });
      }
      syncAllCodeBlockFocus();
      window.requestAnimationFrame(syncAllCodeBlockFocus);
    }
  });
}());
