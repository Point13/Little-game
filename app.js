const app = document.querySelector('#app');
const stepLabel = document.querySelector('#step-label');
const gameCount = 4;
let chosenCategories = [];
let wheelRotation = 0;

const wheelOptions = {
  'Bondage play': [
    'Boxtie with Ass fingerining',
    'Double column with nipple clamps',
    'Gags with Mummification',
    'Brat Taming like hot Wax and Ice and other things'
  ],
  'Discipline': [
    'Caning',
    'Remote Control Vibrators',
    'Spanking hard until Ass got red',
    'The Edging Marathon'
  ],
  'Dominance and submission': [
    'Put a collar and walk like Dog',
    'Golden Shower',
    'Feet worship Fuck mouth with Toes',
    'Leashes or whip'
  ],
  'Sadomasochism': [
    'electric stimulation',
    'The Strap-On Dominance',
    'The Chastity Keyholder',
    'Dominate completely'
  ]
};

const categoryColors = {
  'Bondage play': ['#bb805b', '#d69a70', '#e2ae86', '#efc7a2'],
  'Discipline': ['#718c79', '#89a591', '#a4b9a8', '#bfd0bf'],
  'Dominance and submission': ['#9a6e82', '#b18398', '#c69bad', '#dab9c8'],
  'Sadomasochism': ['#7279a3', '#8990b8', '#a5abcb', '#c1c5dc']
};

function promptKey(category, index) {
  return `${category}::${index}`;
}

function getUsedPrompts() {
  try {
    const saved = JSON.parse(sessionStorage.getItem('little-game-used-prompts') || '[]');
    return new Set(Array.isArray(saved) ? saved.filter((key) => typeof key === 'string') : []);
  } catch { return new Set(); }
}

function markPromptUsed(key) {
  const used = getUsedPrompts();
  used.add(key);
  try { sessionStorage.setItem('little-game-used-prompts', JSON.stringify([...used])); } catch { /* Keep the current run working if storage is unavailable. */ }
}

function getSpinHistory() {
  try {
    const history = JSON.parse(sessionStorage.getItem('little-game-spin-history') || '[]');
    return Array.isArray(history) ? history.filter((item) => item && typeof item.key === 'string' && typeof item.category === 'string' && typeof item.label === 'string').slice(0, 2) : [];
  } catch { return []; }
}

function saveSpinHistory(history) {
  try { sessionStorage.setItem('little-game-spin-history', JSON.stringify(history.slice(0, 2))); } catch { /* Keep the current run working if storage is unavailable. */ }
}

function getScratchResult() {
  try {
    const result = JSON.parse(sessionStorage.getItem('little-game-scratch-result') || 'null');
    return result && typeof result.key === 'string' && typeof result.category === 'string' && typeof result.label === 'string' ? result : null;
  } catch { return null; }
}

function getGameThreePick() {
  try {
    const result = JSON.parse(sessionStorage.getItem('little-game-game3-pick') || 'null');
    return result && typeof result.key === 'string' && typeof result.category === 'string' && typeof result.label === 'string' ? result : null;
  } catch { return null; }
}

function getGameFourPick() {
  try {
    const result = JSON.parse(sessionStorage.getItem('little-game-game4-pick') || 'null');
    return result && typeof result.key === 'string' && typeof result.category === 'string' && typeof result.label === 'string' ? result : null;
  } catch { return null; }
}

function renderResults() {
  const body = document.querySelector('#results-body');
  if (!body) return;
  const rows = [];
  const spinHistory = getSpinHistory();
  if (spinHistory.length) spinHistory.forEach((pick, index) => rows.push({ game: `Game 1 — Spin ${index + 1}`, category: pick.category, result: pick.label }));
  else rows.push({ game: 'Game 1', category: '—', result: 'No result recorded' });

  const picks = [
    ['Game 2', getScratchResult()],
    ['Game 3', getGameThreePick()],
    ['Game 4', getGameFourPick()]
  ];
  picks.forEach(([game, pick]) => rows.push(pick
    ? { game, category: pick.category, result: pick.label }
    : { game, category: '—', result: 'No result recorded' }));

  rows.forEach((item) => {
    const row = document.createElement('tr');
    [item.game, item.category, item.result].forEach((value, index) => {
      const cell = document.createElement(index === 0 ? 'th' : 'td');
      if (index === 0) cell.scope = 'row';
      cell.textContent = value;
      row.append(cell);
    });
    body.append(row);
  });
}

function screenFromHash() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'select') return { name: 'select' };
  if (parts[0] === 'preferences') return { name: 'preferences' };
  if (parts[0] === 'switch') return { name: 'switch' };
  if (parts[0] === 'switch-game-3') return { name: 'switch-game-3' };
  if (parts[0] === 'coin-toss') return { name: 'coin-toss' };
  if (parts[0] === 'voucher') return { name: 'voucher' };
  if (parts[0] === 'age-question') return { name: 'age-question' };
  if (parts[0] === 'change-category') return { name: 'change-category', nextGame: Number(parts[1]) === 3 ? 3 : 2 };
  if (parts[0] === 'game') {
    const number = Number(parts[1]);
    if (Number.isInteger(number) && number >= 1 && number <= gameCount) return { name: 'game', number };
  }
  if (parts[0] === 'score') return { name: 'score' };
  if (parts[0] === 'final') return { name: 'final' };
  return { name: 'home' };
}

function render() {
  const screen = screenFromHash();
  const backgroundStage = screen.name === 'game'
    ? screen.number
    : screen.name === 'switch' || screen.name === 'age-question' || (screen.name === 'change-category' && screen.nextGame === 2)
      ? 2
      : screen.name === 'switch-game-3' || screen.name === 'coin-toss' || (screen.name === 'change-category' && screen.nextGame === 3)
        ? 3
        : screen.name === 'voucher' || screen.name === 'score' || screen.name === 'final'
          ? 4
          : 1;
  document.body.dataset.screenBackground = `game-${backgroundStage}`;
  const screens = {
    home: ['Welcome!', 'A small adventure is waiting for you. Play through four games before seeing your score.', '<a id="start-adventure" class="button" href="#/select">Let’s play</a>'],
    select: ['Mumma Choose Your Sub', 'who you wants to dominate?', '<div class="choices" role="group" aria-label="Choose a sub"><button class="choice-button" type="button" data-choice="Triz">1. Triz</button><button class="choice-button" type="button" data-choice="Kane">2. Kane</button><button class="choice-button" type="button" data-choice="Puppy">3. Puppy</button><button class="choice-button" type="button" data-choice="Faith">4. Faith</button></div><p id="answer-message" class="answer-message" aria-live="polite" hidden></p><div id="answer-actions" class="actions" hidden><a class="button" href="#/preferences">Continue</a></div>'],
    preferences: ['Choose any 2 catgeory of BDSM which you like to perform', 'Select exactly two options to continue.', '<div class="choices" role="group" aria-label="Choose two BDSM categories"><button class="choice-button" type="button" data-bdsm-choice="Bondage play" aria-pressed="false"><strong>1. Bondage play</strong></button><button class="choice-button" type="button" data-bdsm-choice="Discipline" aria-pressed="false"><strong>2. Discipline</strong></button><button class="choice-button" type="button" data-bdsm-choice="Dominance and submission" aria-pressed="false"><strong>3. Dominance and submission</strong></button><button class="choice-button" type="button" data-bdsm-choice="Sadomasochism" aria-pressed="false"><strong>4. Sadomasochism</strong></button></div><p id="selection-status" class="selection-status" aria-live="polite">Choose 2 options (0 selected).</p><div class="actions"><button id="preferences-continue" class="button" type="button" disabled>Continue</button></div>'],
    switch: ['Switch a category?', 'Would you like to switch one of your categories before Game 2?', '<div class="actions"><a class="button" href="#/age-question">Yes, switch</a><a class="button secondary" href="#/game/2">No, continue to Game 2</a></div>'],
    'switch-game-3': ['Try to switch categories?', 'You can flip a coin for a chance to change your categories before Game 3.', '<div class="actions"><a class="button" href="#/coin-toss">Flip the coin</a><a class="button secondary" href="#/game/3">No, continue to Game 3</a></div>'],
    'coin-toss': ['Coin toss', 'Heads wins the category change. Tails means you keep your current categories.', '<div class="coin-stage"><div id="coin" class="coin" aria-live="polite">?</div><button id="flip-coin" class="button" type="button">Toss coin</button><p id="coin-outcome" class="answer-message" aria-live="polite" hidden></p><div id="heads-actions" class="actions" hidden><a class="button" href="#/change-category/3">Change categories</a></div><div id="tails-actions" class="actions" hidden><a class="button" href="#/game/3">Continue to Game 3</a></div></div>'],
    voucher: ['A little voucher for you', 'Mumma Puppy made this for you and You know Puppy hate to see mumma lose 🥺🥹, So This is your +1 voucher You can choose anything you want And don\'t Try to be soft Old hag 😝😝😝🤪, Don\'t feel Pity for me You can choose whatever U want 😝. Old hag <3, No matter what you choose I will always Love you 😘😘', '<div class="actions"><a class="button" href="#/game/4">Continue to Game 4</a></div>'],
    'age-question': ['Sorry mumma, but to change you have to answer this question.', 'According to puppy What is your age in my eyes', '<div class="choices age-choices" role="group" aria-label="Choose an age"><button class="choice-button" type="button" data-age-answer="17">1. 17</button><button class="choice-button" type="button" data-age-answer="35">2. 35</button><button class="choice-button" type="button" data-age-answer="34">3. 34</button><button class="choice-button" type="button" data-age-answer="65">4. 65</button></div><p class="hint">Hint: Remember what he assumes, whatever you say is truth to him 🥰😘</p><p id="age-response" class="selection-status" aria-live="polite" hidden></p><div id="age-correct-actions" class="actions" hidden><a class="button" href="#/change-category">Continue to category change</a></div><div id="age-wrong-actions" class="actions" hidden><a class="button" href="#/game/2">Continue to Game 2</a></div>'],
    score: ['Your game results', 'Here is a recap of what you won in each game.', '<div class="results-table-wrap"><table class="history-table results-table"><thead><tr><th scope="col">Game</th><th scope="col">Category</th><th scope="col">What you won</th></tr></thead><tbody id="results-body"></tbody></table></div><div class="actions"><a class="button" href="#/final">Continue</a></div>'],
    final: ['Thank You!', 'I don\'t Know what You got lol, But i hope <strong><em>MUMMA</em></strong> you enjoyed it and this is my First time also, And you asked me what I offer my EX so i offered her Starpon lol', '']
  };

  if (screen.name === 'game') {
    const next = screen.number < gameCount ? `#/game/${screen.number + 1}` : '#/score';
    if (screen.number === 1) {
      const categories = getChosenCategories();
      if (categories.length === 2) renderSpinWheel(categories);
      else app.innerHTML = `<section class="card"><p class="eyebrow">Game 1 of ${gameCount}</p><h1>Choose your categories first</h1><p class="intro">Pick two categories to set up the wheel.</p><div class="actions"><a class="button" href="#/preferences">Choose categories</a></div></section>`;
    } else if (screen.number === 2) {
      const categories = getChosenCategories();
      if (categories.length === 2) renderScratchCards(categories);
      else app.innerHTML = '<section class="card"><h1>Choose your categories first</h1><div class="actions"><a class="button" href="#/preferences">Choose categories</a></div></section>';
    } else if (screen.number === 3) {
      const categories = getChosenCategories();
      if (categories.length === 2) renderShuffleGame(categories);
      else app.innerHTML = '<section class="card"><h1>Choose your categories first</h1><div class="actions"><a class="button" href="#/preferences">Choose categories</a></div></section>';
    } else if (screen.number === 4) {
      renderGameFour(Object.keys(wheelOptions));
    } else {
      app.innerHTML = `<section class="card" aria-labelledby="screen-title"><p class="eyebrow">Your adventure</p><span class="game-tag">Game ${screen.number} of ${gameCount}</span><h1 id="screen-title">Game ${screen.number} goes here</h1><p class="intro">This is a placeholder for the game you’ll describe. We can add its instructions, images, controls, and scoring when you send the details.</p><div class="note">Game ${screen.number} content and scoring are not set yet.</div><div class="actions"><a class="button" href="${next}">${screen.number < gameCount ? `Continue to Game ${screen.number + 1}` : 'See score'}</a>${screen.number > 1 ? `<a class="button secondary" href="#/game/${screen.number - 1}">Previous game</a>` : ''}</div></section>`;
    }
    stepLabel.textContent = `${screen.number} / ${gameCount}`;
  } else {
    if (screen.name === 'score') {
      const [title, intro, content] = screens.score;
      app.innerHTML = `<section class="card" aria-labelledby="screen-title"><p class="eyebrow">The results</p><h1 id="screen-title">${title}</h1><p class="intro">${intro}</p>${content}</section>`;
      renderResults();
    } else if (screen.name === 'change-category') {
      renderCategorySwitch(screen.nextGame);
    } else {
      const [title, intro, content] = screens[screen.name];
      app.innerHTML = `<section class="card" aria-labelledby="screen-title"><p class="eyebrow">${screen.name === 'home' ? 'A new adventure' : screen.name === 'select' ? 'Before we begin' : screen.name === 'score' ? 'The results' : screen.name === 'switch' || screen.name === 'age-question' ? 'Before Game 2' : screen.name === 'switch-game-3' || screen.name === 'coin-toss' ? 'Before Game 3' : screen.name === 'preferences' ? 'Category selection' : 'The last page'}</p><h1 id="screen-title">${title}</h1><p class="intro">${intro}</p>${content}</section>`;
    }
    stepLabel.textContent = screen.name === 'home' ? '' : screen.name === 'select' ? 'Your choice' : screen.name === 'preferences' ? 'Choose 2' : screen.name === 'switch' || screen.name === 'switch-game-3' ? 'Category switch' : screen.name === 'coin-toss' ? 'Coin toss' : screen.name === 'age-question' ? 'Quick question' : screen.name === 'change-category' ? 'Choose a category' : screen.name === 'voucher' ? 'A bonus for you' : screen.name === 'score' ? 'Results' : 'Finished';
  }

  document.querySelector('#start-adventure')?.addEventListener('click', () => {
    chosenCategories = [];
    try {
      sessionStorage.removeItem('little-game-categories');
      sessionStorage.removeItem('little-game-used-prompts');
      sessionStorage.removeItem('little-game-spin-history');
      sessionStorage.removeItem('little-game-scratch-result');
      sessionStorage.removeItem('little-game-game3-toss');
      sessionStorage.removeItem('little-game-game3-pick');
      sessionStorage.removeItem('little-game-game4-pick');
    } catch { /* A fresh run still starts if storage is unavailable. */ }
  });

  document.querySelectorAll('[data-choice]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.choice !== 'Puppy') {
        dodgeButton(button);
        return;
      }

      const feedback = document.querySelector('#answer-message');
      feedback.textContent = "It's my first time If you go extreme Please show a little love after that🥹🥺";
      feedback.hidden = false;
      document.querySelector('#answer-actions').hidden = false;
      document.querySelectorAll('[data-choice]').forEach((choice) => {
        choice.disabled = true;
      });
    });
  });

  document.querySelectorAll('[data-age-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-age-answer]').forEach((answer) => {
        answer.disabled = true;
        answer.classList.toggle('selected', answer === button);
      });
      const isCorrect = button.dataset.ageAnswer === '17';
      const response = document.querySelector('#age-response');
      response.textContent = isCorrect ? 'Correct' : "It's sad mumma U can't chnage the catgeory";
      response.hidden = false;
      document.querySelector(isCorrect ? '#age-correct-actions' : '#age-wrong-actions').hidden = false;
    });
  });

  const flipButton = document.querySelector('#flip-coin');
  if (flipButton) {
    let savedToss = null;
    try { savedToss = sessionStorage.getItem('little-game-game3-toss'); } catch { /* The toss can still run for this page view. */ }
    if (savedToss === 'Heads' || savedToss === 'Tails') showCoinResult(savedToss);
    flipButton.addEventListener('click', () => {
      if (flipButton.disabled) return;
      const toss = Math.random() < 0.5 ? 'Heads' : 'Tails';
      try { sessionStorage.setItem('little-game-game3-toss', toss); } catch { /* A single toss still works for this page view. */ }
      flipButton.disabled = true;
      document.querySelector('#coin').classList.add('flipping');
      window.setTimeout(() => showCoinResult(toss), 1200);
    });
  }

  const categoryButtons = [...document.querySelectorAll('[data-bdsm-choice]')];
  if (categoryButtons.length) {
    const selected = new Set();
    const continueButton = document.querySelector('#preferences-continue');
    const status = document.querySelector('#selection-status');
    categoryButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const category = button.dataset.bdsmChoice;
        if (selected.has(category)) selected.delete(category);
        else if (selected.size < 2) selected.add(category);

        button.setAttribute('aria-pressed', String(selected.has(category)));
        button.classList.toggle('selected', selected.has(category));
        categoryButtons.forEach((option) => {
          option.disabled = selected.size === 2 && !selected.has(option.dataset.bdsmChoice);
        });
        status.textContent = `Choose 2 options (${selected.size} selected).`;
        continueButton.disabled = selected.size !== 2;
      });
    });
    continueButton.addEventListener('click', () => {
      if (selected.size === 2) {
        chosenCategories = [...selected];
        try { sessionStorage.setItem('little-game-categories', JSON.stringify(chosenCategories)); } catch { /* Keep the current session working if storage is unavailable. */ }
        location.hash = '#/game/1';
      }
    });
  }
}

function getChosenCategories() {
  if (chosenCategories.length === 2) return chosenCategories;
  try {
    const saved = JSON.parse(sessionStorage.getItem('little-game-categories') || '[]');
    if (Array.isArray(saved) && saved.length === 2 && saved.every((category) => wheelOptions[category])) {
      chosenCategories = saved;
    }
  } catch { /* Fall back to the categories held in memory. */ }
  return chosenCategories;
}

function renderCategorySwitch(nextGame = 2) {
  const current = getChosenCategories();
  if (current.length !== 2) {
    app.innerHTML = '<section class="card"><h1>Choose your categories first</h1><p class="intro">Pick two categories to continue.</p><div class="actions"><a class="button" href="#/preferences">Choose categories</a></div></section>';
    return;
  }

  app.innerHTML = `<section class="card" aria-labelledby="screen-title"><p class="eyebrow">Before Game ${nextGame}</p><h1 id="screen-title">Choose your categories</h1><p class="intro">Keep both, switch one, or switch both. Choose exactly two categories.</p><div class="choices" role="group" aria-label="Choose two categories">${Object.keys(wheelOptions).map((category) => `<button class="choice-button${current.includes(category) ? ' selected' : ''}" type="button" data-switch-category="${category}" aria-pressed="${current.includes(category)}">${category}</button>`).join('')}</div><p id="switch-selection-status" class="selection-status" aria-live="polite">2 categories selected.</p><div class="actions"><button id="save-switch-categories" class="button" type="button">Continue to Game ${nextGame}</button><a class="button secondary" href="#/game/${nextGame}">Keep current choices</a></div></section>`;
  const selected = new Set(current);
  const status = document.querySelector('#switch-selection-status');
  const saveButton = document.querySelector('#save-switch-categories');
  const categoryButtons = [...document.querySelectorAll('[data-switch-category]')];
  categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.dataset.switchCategory;
      if (selected.has(category)) selected.delete(category);
      else if (selected.size < 2) selected.add(category);
      categoryButtons.forEach((option) => {
        const isSelected = selected.has(option.dataset.switchCategory);
        option.classList.toggle('selected', isSelected);
        option.setAttribute('aria-pressed', String(isSelected));
        option.disabled = selected.size === 2 && !isSelected;
      });
      status.textContent = `${selected.size} of 2 categories selected.`;
      saveButton.disabled = selected.size !== 2;
    });
  });
  saveButton.addEventListener('click', () => {
    if (selected.size !== 2) return;
    chosenCategories = [...selected];
    try { sessionStorage.setItem('little-game-categories', JSON.stringify(chosenCategories)); } catch { /* Keep navigation working if storage is unavailable. */ }
    location.hash = `#/game/${nextGame}`;
  });
}

function showCoinResult(result) {
  const coin = document.querySelector('#coin');
  const outcome = document.querySelector('#coin-outcome');
  const flipButton = document.querySelector('#flip-coin');
  if (!coin || !outcome || !flipButton) return;
  coin.classList.remove('flipping');
  coin.textContent = result === 'Heads' ? 'H' : 'T';
  outcome.textContent = result === 'Heads' ? 'Heads! You won the chance to change categories.' : 'Tails! You can’t change categories this time.';
  outcome.hidden = false;
  flipButton.hidden = true;
  document.querySelector(result === 'Heads' ? '#heads-actions' : '#tails-actions').hidden = false;
}

function renderSpinWheel(categories) {
  const used = getUsedPrompts();
  const options = categories.flatMap((category) => wheelOptions[category].map((label, index) => ({ category, label, index, key: promptKey(category, index), color: categoryColors[category][index] })).filter((option) => !used.has(option.key)));
  if (options.length === 0) {
    app.innerHTML = '<section class="card"><h1>No unused wheel prompts remain</h1><p class="intro">Continue to the next game.</p><div class="actions"><a class="button" href="#/switch">Continue</a></div></section>';
    return;
  }
  const sector = 360 / options.length;
  const gradient = options.map((option, index) => `${option.color} ${index * sector}deg ${(index + 1) * sector}deg`).join(', ');
  const labels = options.map((_, index) => `<span class="wheel-number" style="--angle:${index * sector + sector / 2}deg">${index + 1}</span>`).join('');
  const optionList = categories.map((category) => `<div class="wheel-group"><h3>${category}</h3><ol>${wheelOptions[category].map((option, index) => ({ option, index })).filter(({ index }) => !used.has(promptKey(category, index))).map(({ option }) => `<li>${option}</li>`).join('')}</ol></div>`).join('');

  app.innerHTML = `<section class="card" aria-labelledby="screen-title"><p class="eyebrow">Game 1 of ${gameCount}</p><h1 id="screen-title">Spin the wheel</h1><p class="intro">Your two chosen categories mumma, set the wheel options. You can spin twice, and the same punishment won’t come up again.</p><div class="wheel-game"><div class="wheel-wrap"><div class="wheel-pointer" aria-hidden="true"></div><div id="wheel" class="wheel" style="--wheel-gradient:conic-gradient(${gradient})" role="img" aria-label="Spin wheel with ${options.length} prompts">${labels}<div class="wheel-hub">SPIN</div></div></div><div class="wheel-controls"><button id="spin-button" class="button" type="button">Spin 1 of 2</button><p id="spin-result" class="answer-message" aria-live="polite">Ready when you are.</p></div></div><section class="spin-history" aria-labelledby="history-title"><h2 id="history-title">Spin history</h2><div class="history-table-wrap"><table class="history-table"><thead><tr><th scope="col">Spin</th><th scope="col">Category</th><th scope="col">Result</th></tr></thead><tbody id="spin-history-body"><tr class="empty-history"><td colspan="3">No spins yet</td></tr></tbody></table></div></section><details class="wheel-details"><summary>See what Wheels numbers are</summary><div class="wheel-groups">${optionList}</div></details><div id="game-one-actions" class="actions" hidden><a class="button" href="#/switch">Continue</a></div></section>`;

  const availableIndices = options.map((_, index) => index);
  const history = getSpinHistory();
  let spinCount = history.length;
  history.forEach((item, index) => addHistoryRow(index + 1, item));
  const spinButton = document.querySelector('#spin-button');
  const spinResult = document.querySelector('#spin-result');
  if (spinCount === 1) {
    spinButton.textContent = 'Spin 2 of 2';
    spinResult.textContent = `Previous result: ${history[0].category}: ${history[0].label}`;
  } else if (spinCount >= 2) {
    spinButton.textContent = 'Both spins used';
    spinButton.disabled = true;
    spinResult.textContent = `Last result: ${history[1].category}: ${history[1].label}`;
    document.querySelector('#game-one-actions').hidden = false;
  }
  document.querySelector('#spin-button').addEventListener('click', () => {
    if (spinCount >= 2) return;
    const spinButton = document.querySelector('#spin-button');
    const wheel = document.querySelector('#wheel');
    const result = document.querySelector('#spin-result');
    const availablePosition = Math.floor(Math.random() * availableIndices.length);
    const selectedIndex = availableIndices[availablePosition];
    const centerAngle = selectedIndex * sector + sector / 2;
    const currentAngle = ((wheelRotation % 360) + 360) % 360;
    const targetAngle = ((360 - centerAngle - currentAngle) % 360 + 360) % 360;
    wheelRotation += 360 * 5 + targetAngle;
    wheel.style.transform = `rotate(${wheelRotation}deg)`;
    spinButton.disabled = true;
    result.textContent = 'Spinning…';
    window.setTimeout(() => {
      const picked = options[selectedIndex];
      availableIndices.splice(availablePosition, 1);
      spinCount += 1;
      markPromptUsed(picked.key);
      history.push({ key: picked.key, category: picked.category, label: picked.label });
      saveSpinHistory(history);
      result.textContent = `${picked.category}: ${picked.label}`;
      addHistoryRow(spinCount, picked);
      if (spinCount === 2) {
        spinButton.textContent = 'Both spins used';
        spinButton.disabled = true;
        document.querySelector('#game-one-actions').hidden = false;
      } else {
        spinButton.textContent = 'Spin 2 of 2';
        spinButton.disabled = false;
      }
    }, 4400);
  });
}

function renderScratchCards(categories) {
  const used = getUsedPrompts();
  const options = categories.flatMap((category) => wheelOptions[category].map((label, index) => ({ category, label, key: promptKey(category, index), color: categoryColors[category][index] })).filter((option) => !used.has(option.key)));
  const previousPick = getScratchResult();
  if (previousPick) {
      app.innerHTML = `<section class="card" aria-labelledby="screen-title"><p class="eyebrow">Game 2 of ${gameCount}</p><h1 id="screen-title">Scratch card</h1><p class="intro">Your card has already been scratched this round.</p><p class="answer-message">You revealed: ${previousPick.category} — ${previousPick.label}</p><div class="actions"><a class="button" href="#/switch-game-3">Continue</a></div></section>`;
    return;
  }
  const cardMarkup = options.map((option, index) => `<button class="scratch-card" type="button" data-scratch-index="${index}" style="--scratch-color:${option.color}"><span class="scratch-cover">Scratch card ${index + 1}</span></button>`).join('');
  const empty = options.length === 0;
  app.innerHTML = `<section class="card" aria-labelledby="screen-title"><p class="eyebrow">Game 2 of ${gameCount}</p><h1 id="screen-title">Scratch card</h1><p class="intro">Choose one card to reveal a prompt. Used prompts from earlier games are removed, so you won’t get a repeat.</p><p class="selection-status">${options.length} cards available. Choose 1.</p><div class="scratch-grid" role="group" aria-label="Choose one scratch card">${cardMarkup || '<p class="note">No unused prompts remain in these categories.</p>'}</div><p id="scratch-result" class="answer-message" aria-live="polite" ${empty ? '' : 'hidden'}>${empty ? 'Continue to the next game.' : ''}</p><div id="game-two-actions" class="actions" ${empty ? '' : 'hidden'}><a class="button" href="#/switch-game-3">Continue</a></div></section>`;

  document.querySelectorAll('[data-scratch-index]').forEach((card) => {
    card.addEventListener('click', () => {
      const picked = options[Number(card.dataset.scratchIndex)];
      if (!picked || getUsedPrompts().has(picked.key)) return;
      markPromptUsed(picked.key);
      try { sessionStorage.setItem('little-game-scratch-result', JSON.stringify(picked)); } catch { /* Keep the current run working if storage is unavailable. */ }
      document.querySelectorAll('[data-scratch-index]').forEach((other) => {
        other.disabled = true;
        other.classList.toggle('revealed', other === card);
        if (other === card) {
          const result = document.createElement('span');
          result.className = 'scratch-reveal';
          result.textContent = `${picked.category}: ${picked.label}`;
          other.replaceChildren(result);
        }
      });
      const result = document.querySelector('#scratch-result');
      result.textContent = `You revealed: ${picked.category} — ${picked.label}`;
      result.hidden = false;
      document.querySelector('#game-two-actions').hidden = false;
    });
  });
}

function renderShuffleGame(categories) {
  const previousPick = getGameThreePick();
  if (previousPick) {
    app.innerHTML = `<section class="card" aria-labelledby="screen-title"><p class="eyebrow">Game 3 of ${gameCount}</p><h1 id="screen-title">Show and shuffle</h1><p class="intro">You already chose a card this round.</p><p class="answer-message">You picked: ${previousPick.category} — ${previousPick.label}</p><div class="actions"><a class="button" href="#/voucher">Continue</a></div></section>`;
    return;
  }

  const used = getUsedPrompts();
  const options = categories.flatMap((category) => wheelOptions[category].map((label, index) => ({ category, label, key: promptKey(category, index) })).filter((option) => !used.has(option.key)));
  if (options.length === 0) {
    app.innerHTML = '<section class="card"><p class="eyebrow">Game 3 of 4</p><h1>No cards left</h1><p class="intro">Every prompt in these categories has already been used.</p><div class="actions"><a class="button" href="#/voucher">Continue</a></div></section>';
    return;
  }

  const cards = options.map((option, index) => `<button class="shuffle-card" type="button" data-shuffle-index="${index}" disabled aria-label="Card ${index + 1}"><span class="shuffle-card-inner"><span class="shuffle-card-front">${option.category}<br>${option.label}</span><span class="shuffle-card-back">?</span></span></button>`).join('');
  app.innerHTML = `<section class="card" aria-labelledby="screen-title"><p class="eyebrow">Game 3 of ${gameCount}</p><h1 id="screen-title">Show and shuffle</h1><p class="intro">Look over the remaining cards. They’ll turn over and shuffle across rows, columns, and diagonals. Then choose one.</p><p id="shuffle-status" class="selection-status" aria-live="polite">Memorize the cards…</p><div id="shuffle-grid" class="shuffle-grid" role="group" aria-label="Game 3 cards">${cards}</div><p id="shuffle-result" class="answer-message" aria-live="polite" hidden></p><div id="game-three-actions" class="actions" hidden><a class="button" href="#/voucher">Continue</a></div></section>`;

  const grid = document.querySelector('#shuffle-grid');
  const cardButtons = [...grid.querySelectorAll('.shuffle-card')];
  window.setTimeout(async () => {
    if (!grid.isConnected) return;
    cardButtons.forEach((card) => card.classList.add('face-down'));
    document.querySelector('#shuffle-status').textContent = 'Shuffling…';
    const columns = Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(' ').length);
    for (const pattern of ['rows', 'columns', 'diagonal-down', 'diagonal-up', 'all', 'columns', 'rows']) {
      if (!grid.isConnected) return;
      await shuffleCards(grid, pattern, columns);
    }
    const status = document.querySelector('#shuffle-status');
    if (!status) return;
    status.textContent = 'Choose one card.';
    cardButtons.forEach((card) => { card.disabled = false; });
  }, 1700);

  cardButtons.forEach((card) => {
    card.addEventListener('click', () => {
      if (card.disabled) return;
      const picked = options[Number(card.dataset.shuffleIndex)];
      if (!picked || getUsedPrompts().has(picked.key)) return;
      markPromptUsed(picked.key);
      try { sessionStorage.setItem('little-game-game3-pick', JSON.stringify(picked)); } catch { /* Keep this page view working if storage is unavailable. */ }
      cardButtons.forEach((other) => {
        other.disabled = true;
        if (other === card) {
          other.classList.remove('face-down');
          other.classList.add('picked');
        }
      });
      const result = document.querySelector('#shuffle-result');
      result.textContent = `You picked: ${picked.category} — ${picked.label}`;
      result.hidden = false;
      document.querySelector('#shuffle-status').textContent = 'Card revealed.';
      document.querySelector('#game-three-actions').hidden = false;
    });
  });
}

function renderGameFour(categories) {
  const previousPick = getGameFourPick();
  if (previousPick) {
    app.innerHTML = `<section class="card" aria-labelledby="screen-title"><p class="eyebrow">Game 4 of ${gameCount}</p><h1 id="screen-title">Choose one remaining option</h1><p class="intro">Your choice has been saved for this round.</p><p class="answer-message">You chose: ${previousPick.category} — ${previousPick.label}</p><div class="actions"><a class="button" href="#/score">See your results</a></div></section>`;
    return;
  }

  const used = getUsedPrompts();
  const options = categories.flatMap((category) => wheelOptions[category].map((label, index) => ({ category, label, key: promptKey(category, index) })).filter((option) => !used.has(option.key)));
  if (options.length === 0) {
    app.innerHTML = '<section class="card"><p class="eyebrow">Game 4 of 4</p><h1>No unused options remain</h1><p class="intro">Every option in your selected categories has already appeared.</p><div class="actions"><a class="button" href="#/score">See your results</a></div></section>';
    return;
  }

  const cards = options.map((option, index) => `<button class="game-four-option" type="button" data-game-four-index="${index}" aria-pressed="false"><span class="game-four-category">${option.category}</span><span>${option.label}</span></button>`).join('');
  app.innerHTML = `<section class="card" aria-labelledby="screen-title"><p class="eyebrow">Game 4 of ${gameCount}</p><h1 id="screen-title">Choose one remaining option</h1><p class="intro">These are all the options left across the four categories. Choices from Games 1, 2, and 3 are excluded. Choose one.</p><p class="selection-status">${options.length} options remaining.</p><div class="game-four-grid" role="group" aria-label="Choose one remaining option">${cards}</div><p id="game-four-result" class="answer-message" aria-live="polite" hidden></p><div id="game-four-actions" class="actions" hidden><a class="button" href="#/score">See your results</a></div></section>`;

  document.querySelectorAll('[data-game-four-index]').forEach((button) => {
    button.addEventListener('click', () => {
      const picked = options[Number(button.dataset.gameFourIndex)];
      if (!picked || getUsedPrompts().has(picked.key)) return;
      markPromptUsed(picked.key);
      try { sessionStorage.setItem('little-game-game4-pick', JSON.stringify(picked)); } catch { /* Keep the current page working if storage is unavailable. */ }
      document.querySelectorAll('[data-game-four-index]').forEach((option) => {
        option.disabled = true;
        const selected = option === button;
        option.classList.toggle('selected', selected);
        option.setAttribute('aria-pressed', String(selected));
      });
      const result = document.querySelector('#game-four-result');
      result.textContent = `You chose: ${picked.category} — ${picked.label}`;
      result.hidden = false;
      document.querySelector('#game-four-actions').hidden = false;
    });
  });
}

function shuffleCards(grid, pattern, columns) {
  const cards = [...grid.children];
  const rows = Math.ceil(cards.length / columns);
  const order = [...cards];
  const groups = new Map();

  cards.forEach((_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    let groupKey;
    if (pattern === 'rows') groupKey = `r${row}`;
    else if (pattern === 'columns') groupKey = `c${column}`;
    else if (pattern === 'diagonal-down') groupKey = `d${row - column}`;
    else if (pattern === 'diagonal-up') groupKey = `u${row + column}`;
    else groupKey = 'all';
    if (!groups.has(groupKey)) groups.set(groupKey, []);
    groups.get(groupKey).push(index);
  });

  for (const indexes of groups.values()) {
    if (indexes.length < 2) continue;
    const values = indexes.map((index) => order[index]);
    for (let index = values.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [values[index], values[swapIndex]] = [values[swapIndex], values[index]];
    }
    if (values.every((card, index) => card === order[indexes[index]])) values.push(values.shift());
    indexes.forEach((slot, index) => { order[slot] = values[index]; });
  }

  const firstRects = new Map(cards.map((card) => [card, card.getBoundingClientRect()]));
  order.forEach((card) => grid.append(card));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) return Promise.resolve();

  order.forEach((card) => {
    const first = firstRects.get(card);
    const last = card.getBoundingClientRect();
    card.style.transition = 'none';
    card.style.transform = `translate(${first.left - last.left}px, ${first.top - last.top}px)`;
  });
  void grid.offsetHeight;
  requestAnimationFrame(() => {
    order.forEach((card) => {
      card.style.transition = 'transform 170ms ease-in-out';
      card.style.transform = 'translate(0, 0)';
    });
  });
  return new Promise((resolve) => window.setTimeout(() => {
    order.forEach((card) => {
      card.style.removeProperty('transition');
      card.style.removeProperty('transform');
    });
    resolve();
  }, 190));
}

function addHistoryRow(spinNumber, picked) {
  const body = document.querySelector('#spin-history-body');
  if (spinNumber === 1) body.replaceChildren();
  const row = document.createElement('tr');
  const numberCell = document.createElement('th');
  numberCell.scope = 'row';
  numberCell.textContent = String(spinNumber);
  const categoryCell = document.createElement('td');
  categoryCell.textContent = picked.category;
  const resultCell = document.createElement('td');
  resultCell.textContent = picked.label;
  row.append(numberCell, categoryCell, resultCell);
  body.append(row);
}

function dodgeButton(button) {
  const margin = 12;
  const rect = button.getBoundingClientRect();
  const width = Math.min(Math.max(rect.width, 150), 220, window.innerWidth - margin * 2);
  const height = rect.height;
  const left = [
    margin,
    Math.max(margin, (window.innerWidth - width) / 2),
    Math.max(margin, window.innerWidth - width - margin)
  ];
  const top = [
    82,
    Math.max(82, (window.innerHeight - height) / 2),
    Math.max(82, window.innerHeight - height - margin)
  ];
  const spots = [
    [left[0], top[0]], [left[2], top[0]],
    [left[0], top[2]], [left[2], top[2]],
    [left[0], top[1]], [left[2], top[1]],
    [left[1], top[0]], [left[1], top[2]]
  ];
  const current = Number(button.dataset.spot ?? -1);
  let next = Math.floor(Math.random() * spots.length);
  if (spots.length > 1 && next === current) next = (next + 1 + Math.floor(Math.random() * (spots.length - 1))) % spots.length;
  const [x, y] = spots[next];

  button.classList.add('evading');
  button.style.width = `${width}px`;
  button.style.left = `${x}px`;
  button.style.top = `${y}px`;
  button.dataset.spot = String(next);
}

window.addEventListener('hashchange', render);
render();
