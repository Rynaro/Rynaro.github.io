(() => {
  'use strict';

  const SIZE = 5;

  const flattenRows = (rows) => rows.join('').split('').map(Number);
  const boardsEqual = (left, right) => left.every((value, index) => value === right[index]);
  const describeRows = (rows) => `Target pattern by row. ${rows.map((row, index) => (
    `Row ${index + 1}: ${row.split('').map((value) => value === '1' ? 'awake' : 'dormant').join(', ')}`
  )).join('; ')}.`;

  function tutorialStepAfterEvent(step, { event, folioIndex, folioComplete = false }) {
    if (event === 'restart') return folioIndex === 0 ? 'guided-first' : 'complete';
    if (folioIndex !== 0) return 'complete';
    if (event === 'pulse') return folioComplete ? 'complete' : 'independent-second';
    if (event === 'undo' && !folioComplete && step !== 'guided-first') return 'independent-second';
    return step;
  }

  function pulseBoard(board, index) {
    const next = [...board];
    const row = Math.floor(index / SIZE);
    const column = index % SIZE;
    [[row, column], [row - 1, column], [row + 1, column], [row, column - 1], [row, column + 1]]
      .filter(([candidateRow, candidateColumn]) => (
        candidateRow >= 0 && candidateRow < SIZE && candidateColumn >= 0 && candidateColumn < SIZE
      ))
      .forEach(([candidateRow, candidateColumn]) => {
        const candidate = candidateRow * SIZE + candidateColumn;
        next[candidate] = next[candidate] ? 0 : 1;
      });
    return next;
  }

  function mount(root, options = {}) {
    if (!root) return null;
    const dataNode = root.querySelector('[data-harmonic-seal-data]');
    if (!dataNode) return null;

    let content;
    try {
      content = JSON.parse(dataNode.textContent);
    } catch (_error) {
      return null;
    }
    if (!Array.isArray(content.folios) || content.folios.length !== 4) return null;

    const elements = {
      folioScreen: root.querySelector('[data-harmonic-seal-screen="folio"]'),
      reflectionScreen: root.querySelector('[data-harmonic-seal-screen="reflection"]'),
      completeScreen: root.querySelector('[data-harmonic-seal-screen="reflection-complete"]'),
      folioNumber: root.querySelector('[data-harmonic-seal-folio-number]'),
      folioName: root.querySelector('[data-harmonic-seal-folio-name]'),
      instruction: root.querySelector('[data-harmonic-seal-instruction]'),
      grid: root.querySelector('[data-harmonic-seal-grid]'),
      target: root.querySelector('[data-harmonic-seal-target]'),
      targetDescription: root.querySelector('[data-harmonic-seal-target-description]'),
      undo: root.querySelector('[data-harmonic-seal-undo]'),
      restart: root.querySelector('[data-harmonic-seal-restart]'),
      end: root.querySelector('[data-harmonic-seal-end]'),
      completion: root.querySelector('[data-harmonic-seal-completion]'),
      next: root.querySelector('[data-harmonic-seal-next]'),
      note: root.querySelector('[data-harmonic-seal-note]'),
      finish: root.querySelector('[data-harmonic-seal-finish]'),
      resume: root.querySelector('[data-harmonic-seal-resume]'),
      status: root.querySelector('[data-harmonic-seal-status]'),
      back: root.querySelector('[data-harmonic-seal-back]'),
    };
    if (Object.values(elements).some((element) => !element)) return null;

    const state = {
      gameScreen: 'folio',
      folioIndex: 0,
      board: flattenRows(content.folios[0].initial),
      history: [],
      folioComplete: false,
      tutorialStep: 'guided-first',
      reflection: { interest: null, note: '' },
      gridCursor: 0,
    };

    function currentFolio() {
      return content.folios[state.folioIndex];
    }

    function targetBoard() {
      return flattenRows(currentFolio().target);
    }

    function setStatus(message) {
      elements.status.textContent = '';
      window.requestAnimationFrame(() => { elements.status.textContent = message; });
    }

    function updateCell(button, index) {
      const row = Math.floor(index / SIZE) + 1;
      const column = index % SIZE + 1;
      const awake = state.board[index] === 1;
      button.classList.toggle('is-awake', awake);
      button.classList.toggle('is-dormant', !awake);
      button.classList.toggle('is-guide-center', state.tutorialStep === 'guided-first' && index === 12);
      button.classList.toggle('is-guide-neighbour', state.tutorialStep === 'guided-first' && [7, 11, 13, 17].includes(index));
      button.setAttribute('aria-label', `Row ${row}, column ${column}, ${awake ? 'awake' : 'dormant'} sigil`);
      button.setAttribute('aria-disabled', state.folioComplete ? 'true' : 'false');
      button.tabIndex = index === state.gridCursor ? 0 : -1;
      button.querySelector('span').textContent = awake ? '✦' : '·';
    }

    function buildGrid() {
      elements.grid.replaceChildren();
      for (let row = 0; row < SIZE; row += 1) {
        const rowElement = document.createElement('div');
        rowElement.className = 'harmonic-seal__grid-row';
        rowElement.setAttribute('role', 'row');
        for (let column = 0; column < SIZE; column += 1) {
          const index = row * SIZE + column;
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'harmonic-seal__sigil';
          button.setAttribute('role', 'gridcell');
          button.dataset.sigilIndex = String(index);
          const mark = document.createElement('span');
          mark.setAttribute('aria-hidden', 'true');
          button.append(mark);
          button.addEventListener('click', () => activateCell(index));
          button.addEventListener('focus', () => {
            state.gridCursor = index;
            updateRovingTabindex();
          });
          rowElement.append(button);
        }
        elements.grid.append(rowElement);
      }
    }

    function renderTarget() {
      elements.target.replaceChildren();
      elements.target.setAttribute('aria-label', `Target chord for Folio ${state.folioIndex + 1}, ${currentFolio().name}`);
      elements.targetDescription.textContent = describeRows(currentFolio().target);
      currentFolio().target.forEach((row) => {
        const rowElement = document.createElement('span');
        rowElement.className = 'harmonic-seal__target-row';
        row.split('').forEach((value) => {
          const cell = document.createElement('span');
          cell.className = `harmonic-seal__target-sigil ${value === '1' ? 'is-awake' : 'is-dormant'}`;
          cell.textContent = value === '1' ? '✦' : '·';
          cell.setAttribute('aria-hidden', 'true');
          rowElement.append(cell);
        });
        elements.target.append(rowElement);
      });
    }

    function updateRovingTabindex() {
      elements.grid.querySelectorAll('[data-sigil-index]').forEach((button, index) => {
        button.tabIndex = index === state.gridCursor ? 0 : -1;
      });
    }

    function renderBoard() {
      elements.grid.querySelectorAll('[data-sigil-index]').forEach(updateCell);
      elements.undo.disabled = state.history.length === 0;
      elements.completion.hidden = !state.folioComplete;
      elements.next.textContent = state.folioIndex === content.folios.length - 1 ? 'Share a reflection' : 'Open next folio';

      if (state.folioComplete) {
        elements.instruction.textContent = 'The target chord is matched.';
      } else if (state.tutorialStep === 'guided-first') {
        elements.instruction.textContent = content.tutorial.guided;
      } else if (state.tutorialStep === 'independent-second') {
        elements.instruction.textContent = content.tutorial.independent;
      } else {
        elements.instruction.textContent = content.introduction;
      }
    }

    function renderFolio() {
      elements.folioNumber.textContent = `Folio ${['I', 'II', 'III', 'IV'][state.folioIndex]}`;
      elements.folioName.textContent = currentFolio().name;
      renderTarget();
      renderBoard();
    }

    function renderScreen() {
      elements.folioScreen.hidden = state.gameScreen !== 'folio';
      elements.reflectionScreen.hidden = state.gameScreen !== 'reflection';
      elements.completeScreen.hidden = state.gameScreen !== 'reflection-complete';
      if (state.gameScreen === 'reflection') {
        root.querySelectorAll('input[name="harmonic-interest"]').forEach((radio) => {
          radio.checked = radio.value === state.reflection.interest;
        });
        elements.note.value = state.reflection.note;
      }
    }

    function activateCell(index) {
      if (state.gameScreen !== 'folio' || state.folioComplete) return;
      if (state.tutorialStep === 'guided-first' && index !== 12) {
        setStatus(content.tutorial.invalid);
        return;
      }
      state.gridCursor = index;
      state.history.push([...state.board]);
      state.board = pulseBoard(state.board, index);
      state.folioComplete = boardsEqual(state.board, targetBoard());
      state.tutorialStep = tutorialStepAfterEvent(state.tutorialStep, {
        event: 'pulse', folioIndex: state.folioIndex, folioComplete: state.folioComplete,
      });
      renderBoard();
      if (state.folioComplete) {
        setStatus(`Folio ${state.folioIndex + 1} complete. The chord is in concordance.`);
        elements.next.focus();
      } else {
        setStatus(`Pulsed row ${Math.floor(index / SIZE) + 1}, column ${index % SIZE + 1}.`);
        elements.grid.querySelector(`[data-sigil-index="${index}"]`)?.focus();
      }
    }

    function resetFolio(index = state.folioIndex) {
      state.folioIndex = index;
      state.board = flattenRows(currentFolio().initial);
      state.history = [];
      state.folioComplete = false;
      state.tutorialStep = tutorialStepAfterEvent(state.tutorialStep, { event: 'restart', folioIndex: index });
      state.gridCursor = index === 0 ? 12 : 0;
      renderFolio();
    }

    function showReflection() {
      state.gameScreen = 'reflection';
      renderScreen();
      setStatus('Local reflection opened. Nothing entered here is sent or stored.');
      root.querySelector('input[name="harmonic-interest"]')?.focus();
    }

    function restartSession() {
      state.gameScreen = 'folio';
      state.reflection = { interest: null, note: '' };
      root.querySelectorAll('input[name="harmonic-interest"]').forEach((radio) => { radio.checked = false; });
      elements.note.value = '';
      resetFolio(0);
      renderScreen();
      setStatus('Session restarted at Folio I.');
      elements.grid.querySelector('[tabindex="0"]')?.focus();
    }

    elements.grid.addEventListener('keydown', (event) => {
      const active = event.target.closest('[data-sigil-index]');
      if (!active) return;
      const index = Number(active.dataset.sigilIndex);
      const row = Math.floor(index / SIZE);
      const column = index % SIZE;
      let next = index;
      if (event.key === 'ArrowLeft' && column > 0) next -= 1;
      else if (event.key === 'ArrowRight' && column < SIZE - 1) next += 1;
      else if (event.key === 'ArrowUp' && row > 0) next -= SIZE;
      else if (event.key === 'ArrowDown' && row < SIZE - 1) next += SIZE;
      else if (event.key === 'Home') next = event.ctrlKey ? 0 : row * SIZE;
      else if (event.key === 'End') next = event.ctrlKey ? SIZE * SIZE - 1 : row * SIZE + SIZE - 1;
      else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activateCell(index);
        return;
      } else return;
      event.preventDefault();
      state.gridCursor = next;
      updateRovingTabindex();
      elements.grid.querySelector(`[data-sigil-index="${next}"]`)?.focus();
    });

    elements.undo.addEventListener('click', () => {
      if (!state.history.length) return;
      state.board = state.history.pop();
      state.folioComplete = boardsEqual(state.board, targetBoard());
      state.tutorialStep = tutorialStepAfterEvent(state.tutorialStep, {
        event: 'undo', folioIndex: state.folioIndex, folioComplete: state.folioComplete,
      });
      renderBoard();
      setStatus('Last pulse undone.');
      elements.grid.querySelector(`[data-sigil-index="${state.gridCursor}"]`)?.focus();
    });
    elements.restart.addEventListener('click', () => {
      resetFolio();
      setStatus(`Folio ${state.folioIndex + 1} restarted.`);
      elements.grid.querySelector('[tabindex="0"]')?.focus();
    });
    elements.end.addEventListener('click', showReflection);
    elements.next.addEventListener('click', () => {
      if (!state.folioComplete) return;
      if (state.folioIndex === content.folios.length - 1) {
        showReflection();
        return;
      }
      state.gameScreen = 'folio';
      resetFolio(state.folioIndex + 1);
      setStatus(`Folio ${state.folioIndex + 1}, ${currentFolio().name}.`);
      elements.grid.querySelector('[tabindex="0"]')?.focus();
    });
    elements.resume.addEventListener('click', () => {
      state.gameScreen = 'folio';
      renderScreen();
      setStatus(`Returned to Folio ${state.folioIndex + 1}.`);
      elements.grid.querySelector('[tabindex="0"]')?.focus();
    });
    root.querySelectorAll('input[name="harmonic-interest"]').forEach((radio) => {
      radio.addEventListener('change', () => { state.reflection.interest = radio.value; });
    });
    elements.note.addEventListener('input', () => { state.reflection.note = elements.note.value; });
    elements.finish.addEventListener('click', () => {
      state.reflection.note = elements.note.value;
      state.gameScreen = 'reflection-complete';
      renderScreen();
      setStatus('Session finished. Your reflection remains local to this page.');
      elements.completeScreen.querySelector('[data-harmonic-seal-restart-session]')?.focus();
    });
    root.querySelectorAll('[data-harmonic-seal-restart-session]').forEach((button) => button.addEventListener('click', restartSession));
    elements.back.addEventListener('click', () => options.onBack?.());
    root.querySelector('[data-harmonic-seal-complete-back]')?.addEventListener('click', () => options.onBack?.());

    buildGrid();
    resetFolio(0);
    renderScreen();

    return {
      focusInitial() {
        if (state.gameScreen === 'folio') elements.grid.querySelector('[tabindex="0"]')?.focus();
        else if (state.gameScreen === 'reflection') root.querySelector('input[name="harmonic-interest"]')?.focus();
        else elements.completeScreen.querySelector('[data-harmonic-seal-restart-session]')?.focus();
      },
      getState() {
        return {
          ...state,
          board: [...state.board],
          history: state.history.map((board) => [...board]),
          reflection: { ...state.reflection },
        };
      },
    };
  }

  window.HarmonicSeal = Object.freeze({ SIZE, flattenRows, boardsEqual, describeRows, pulseBoard, tutorialStepAfterEvent, mount });
})();
