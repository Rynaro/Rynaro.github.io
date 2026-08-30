(function () {
  'use strict';

  var plate = document.querySelector('[data-home-plate]');
  if (plate) {
    var plateImage = plate.querySelector('[data-home-plate-image]');
    var plateCaption = plate.querySelector('[data-home-plate-caption]');
    var plateOptions = plate.querySelector('[data-home-plate-options]');
    if (plateImage && plateCaption && plateOptions) {
      var fallbackSrc = plateImage.getAttribute('src');
      var fallbackCaption = plateCaption.textContent;
      var optionsText = plateOptions.content ? plateOptions.content.textContent : plateOptions.textContent;
      var options = [];
      try {
        options = JSON.parse(optionsText);
      } catch (error) {
        options = [];
      }
      options = options.filter(function (option) {
        return option && typeof option.src === 'string' && typeof option.caption === 'string';
      });
      if (options.length) {
        var selectedPlate = options[Math.floor(Math.random() * options.length)];
        plateImage.addEventListener('error', function restoreFallback() {
          plateImage.removeEventListener('error', restoreFallback);
          plateImage.setAttribute('src', fallbackSrc);
          plateCaption.textContent = fallbackCaption;
        });
        plateCaption.textContent = selectedPlate.caption;
        plateImage.setAttribute('src', selectedPlate.src);
      }
    }
  }

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
