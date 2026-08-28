(function () {
  'use strict';
  var constellation = document.querySelector('[data-constellation]');
  if (!constellation) return;
  var tablist = constellation.querySelector('[data-era-tabs]');
  var tabs = Array.prototype.slice.call(constellation.querySelectorAll('[data-era-tab]'));
  var panels = Array.prototype.slice.call(constellation.querySelectorAll('[data-era-panel]'));
  if (!tablist || !tabs.length || tabs.length !== panels.length) return;
  constellation.classList.add('is-enhanced');
  tablist.setAttribute('role', 'tablist');
  function activate(index, moveFocus) {
    tabs.forEach(function (tab, tabIndex) {
      var selected = tabIndex === index;
      tab.classList.toggle('is-current', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.setAttribute('tabindex', selected ? '0' : '-1');
      panels[tabIndex].classList.toggle('is-current', selected);
      panels[tabIndex].hidden = !selected;
    });
    if (moveFocus) tabs[index].focus();
  }
  tabs.forEach(function (tab, index) {
    var panel = panels[index];
    var tabId = 'era-tab-' + (index + 1);
    tab.id = tabId;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabId);
    tab.addEventListener('click', function () { activate(index, false); });
    tab.addEventListener('keydown', function (event) {
      var next = index;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault(); activate(next, true);
    });
  });
  activate(0, false);
}());
