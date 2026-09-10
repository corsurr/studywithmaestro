const questions = [
  {
    topic: 'Osmosis & diffusion',
    text: 'What happens to a plant cell when it is placed in a hypotonic solution?',
    options: ['It loses water and becomes plasmolyzed.', 'It gains water and becomes turgid.', 'There is no net movement of water.', 'It actively pumps water out.'],
    correct: 1,
    source: 'Water moves across a selectively permeable membrane from an area of lower solute concentration to higher solute concentration.',
    explanation: 'A hypotonic solution has a lower solute concentration outside the cell, so water moves into the plant cell. The cell becomes turgid because its cell wall prevents it from bursting.'
  },
  {
    topic: 'Cell membrane structure',
    text: 'Which property allows the cell membrane to control what enters and leaves the cell?',
    options: ['It is made entirely of carbohydrates.', 'It is a rigid wall with no openings.', 'It is selectively permeable.', 'It contains no proteins.'],
    correct: 2,
    source: 'The cell membrane is selectively permeable, meaning some substances can cross more easily than others.',
    explanation: 'Selective permeability lets the membrane regulate transport rather than allowing every substance to pass freely.'
  },
  {
    topic: 'Active transport',
    text: 'Why does active transport require cellular energy?',
    options: ['It moves substances against their concentration gradient.', 'It always moves water into the cell.', 'It breaks down the cell membrane.', 'It only happens in dead cells.'],
    correct: 0,
    source: 'Active transport uses energy to move substances against their concentration gradient.',
    explanation: 'Moving a substance from low concentration to high concentration goes against the gradient, so the cell must use energy, usually from ATP.'
  },
  {
    topic: 'Osmosis & diffusion',
    text: 'In diffusion, particles generally move until they reach:',
    options: ['A higher concentration on one side.', 'An equilibrium of concentration.', 'A complete stop in all movement.', 'A state requiring ATP.'],
    correct: 1,
    source: 'Diffusion is the net movement of particles from an area of higher concentration to lower concentration until equilibrium is reached.',
    explanation: 'Particles continue moving randomly, but there is no net movement once the concentrations are balanced.'
  },
  {
    topic: 'Coverage gap',
    text: 'Which topic is identified as not yet tested in your current material map?',
    options: ['Active transport', 'Cell membrane structure', 'ATP energy coupling', 'Osmosis & diffusion'],
    correct: 2,
    source: 'Coverage map: detected but not yet tested.',
    explanation: 'MAESTRO should show coverage gaps instead of implying that untested material is already mastered.'
  }
];

const syllabusData = {
  biology: {
    subject: 'BIOLOGY',
    name: 'Biology',
    description: 'Cell transport and the movement of substances across membranes.',
    progress: 72,
    material: 'Biology: Cell transport notes',
    chapters: [
      { number: '01', title: 'Osmosis & diffusion', detail: 'Water, solutes, and equilibrium', status: 'Needs review', state: 'needs', action: 'Review now' },
      { number: '02', title: 'Cell membrane structure', detail: 'Selective permeability and transport proteins', status: 'Improving', state: 'improving', action: 'Continue' },
      { number: '03', title: 'Active transport', detail: 'Energy, gradients, and ATP', status: 'Steady', state: 'steady', action: 'Quick check' },
      { number: '04', title: 'ATP energy coupling', detail: 'Detected in your notes but not tested', status: 'Not tested', state: 'gap', action: 'Add questions' }
    ]
  },
  chemistry: {
    subject: 'CHEMISTRY',
    name: 'Chemistry',
    description: 'A new classroom ready for your chemistry notes and reviewer.',
    progress: 0,
    material: 'No chemistry material yet',
    chapters: [
      { number: '01', title: 'Add your first chemistry chapter', detail: 'Upload notes to map this syllabus', status: 'Waiting for material', state: 'gap', action: 'Add material' }
    ]
  },
  history: {
    subject: 'WORLD HISTORY',
    name: 'World history',
    description: 'A new classroom ready for your history notes and reviewer.',
    progress: 0,
    material: 'No history material yet',
    chapters: [
      { number: '01', title: 'Add your first history chapter', detail: 'Upload notes to map this syllabus', status: 'Waiting for material', state: 'gap', action: 'Add material' }
    ]
  }
};

const quizLibrary = [
  { title: 'Cell transport check-in', detail: '5 questions · mixed recall', topic: 'all', state: 'steady', label: 'Full review', filter: 'all' },
  { title: 'Osmosis & diffusion', detail: '2 questions · priority topic', topic: 'Osmosis & diffusion', state: 'needs', label: 'Needs review', filter: 'priority' },
  { title: 'Membrane structure', detail: '1 question · keep momentum', topic: 'Cell membrane structure', state: 'improving', label: 'Quick check', filter: 'quick' },
  { title: 'Active transport', detail: '1 question · confident recall', topic: 'Active transport', state: 'steady', label: 'Quick check', filter: 'quick' },
  { title: 'Coverage gaps', detail: '1 question · test what is missing', topic: 'Coverage gap', state: 'gap', label: 'Needs review', filter: 'priority' }
];

let currentTopic = 'Osmosis & diffusion';
let sessionQuestions = questions.filter(question => question.topic === currentTopic);
let current = 0;
let selected = null;
let answered = false;
let xp = 680;
let currentSyllabus = 'biology';
let uploadedMaterials = [];
let uploadedText = '';
let documentExtractionAvailable = true;
let reviewerData = null;
let activeLesson = 'biology';
let mainLoadingTimer = null;
let toastTimer = null;
let sessionConfidences = {};
let storageWarningShown = false;

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const confidenceLabels = ['Very unsure', 'Unsure', 'Somewhat sure', 'Confident', 'Very confident'];
const lessonTitles = {
  biology: { subject: 'BIOLOGY', title: 'Cell transport check-in', material: 'Biology: Cell transport notes' },
  coverage: { subject: 'REVIEW', title: 'Coverage gap review', material: 'Biology: Cell transport notes' }
};
const defaultSettings = { largeText: false, highContrast: false, reducedMotion: false };

function escapeHtml(value) {
  return String(value).replace(/[&<>\"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[character]));
}

function readSettings() {
  try {
    return { ...defaultSettings, ...JSON.parse(localStorage.getItem('maestro-settings') || '{}') };
  } catch {
    return { ...defaultSettings };
  }
}

let settings = readSettings();

function saveSettings() {
  try {
    localStorage.setItem('maestro-settings', JSON.stringify(settings));
  } catch {
    if (!storageWarningShown) {
      storageWarningShown = true;
      toast('Settings could not be saved in this browser.');
    }
  }
}

function applySettings() {
  document.body.classList.toggle('large-text', settings.largeText);
  document.body.classList.toggle('high-contrast', settings.highContrast);
  document.body.classList.toggle('reduced-motion', settings.reducedMotion);
  $$('[data-setting]').forEach(button => {
    const active = Boolean(settings[button.dataset.setting]);
    button.classList.toggle('enabled', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function readProgress() {
  try {
    return JSON.parse(localStorage.getItem('maestro-progress') || 'null');
  } catch {
    return null;
  }
}

function saveProgress() {
  try {
    localStorage.setItem('maestro-progress', JSON.stringify({
      topic: currentTopic,
      syllabus: currentSyllabus,
      current,
      total: sessionQuestions.length,
      confidences: sessionConfidences,
      savedAt: new Date().toISOString()
    }));
  } catch {
    if (!storageWarningShown) {
      storageWarningShown = true;
      toast('Progress could not be saved in this browser.');
    }
  }
}

function clearProgress() {
  localStorage.removeItem('maestro-progress');
}

function showMainLoading(label = 'Opening classroom') {
  const loading = $('#main-loading');
  if (!loading) return;
  clearTimeout(mainLoadingTimer);
  $('#main-loading-label').textContent = label;
  loading.classList.remove('hidden');
  mainLoadingTimer = setTimeout(() => loading.classList.add('hidden'), settings.reducedMotion ? 0 : 280);
}

function showView(view) {
  const target = $('#' + view + '-view');
  if (!target) return;
  const labels = {
    overview: ['OVERVIEW', 'Good afternoon, Eric.', 'Opening your overview'],
    syllabus: ['SYLLABUS', 'Your syllabus.', 'Opening syllabus'],
    practice: ['PRACTICE', 'Practice what you remember.', 'Opening practice'],
    quizzes: ['QUIZ LIBRARY', 'Choose your next quiz.', 'Opening quiz library'],
    coverage: ['COVERAGE MAP', 'Your coverage map.', 'Opening coverage map'],
    materials: ['MATERIALS', 'Your study shelf.', 'Opening materials'],
    settings: ['SETTINGS', 'Make studying fit you.', 'Opening settings']
  };
  const [crumb, title, loadingLabel] = labels[view] || labels.overview;
  showMainLoading(loadingLabel);
  $$('.view').forEach(section => section.classList.remove('active-view'));
  target.classList.add('active-view');
  $$('.nav-item').forEach(item => {
    const active = item.dataset.view === view;
    item.classList.toggle('active', active);
    if (active) item.setAttribute('aria-current', 'page');
    else item.removeAttribute('aria-current');
  });
  $('#breadcrumb').textContent = crumb + ' / MONDAY, SEPTEMBER 7';
  $('#page-title').textContent = title;
  if (view === 'syllabus') renderSyllabusChapters();
  if (view === 'quizzes') renderQuizLibrary();
  if (view === 'materials') renderMaterialLibrary();
  window.scrollTo({ top: 0, behavior: settings.reducedMotion ? 'auto' : 'smooth' });
}

function getQuestionsForTopic(topic) {
  if (topic === 'all') return questions.filter(question => question.topic !== 'Coverage gap' || currentSyllabus === 'biology');
  const matching = questions.filter(question => question.topic === topic);
  return matching.length ? matching : questions;
}

function setActiveLesson(lesson) {
  activeLesson = lesson;
  $$('.lesson-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.lesson === lesson));
  const config = lessonTitles[lesson] || lessonTitles.biology;
  $('#hero-subject').textContent = config.subject;
  $('#practice-title').textContent = config.title;
  $('#material-name').textContent = config.material;
  $('#source-title').textContent = config.material.replace(' notes', '');
}

function setSourceRevealed(revealed) {
  const excerpt = $('#source-excerpt');
  const hint = $('#source-hint');
  const button = $('#reveal-source');
  if (!excerpt || !hint || !button) return;
  excerpt.classList.toggle('hidden', !revealed);
  hint.classList.toggle('hidden', revealed);
  button.setAttribute('aria-expanded', String(revealed));
  button.textContent = revealed ? 'Hide source excerpt ↗' : 'Reveal source excerpt ↗';
}

function openLesson(lesson) {
  setActiveLesson(lesson);
  if (lesson === 'coverage') {
    showView('coverage');
    return;
  }
  showView('overview');
  toast('Biology classroom selected.');
}

function switchSyllabus(value, announce = true) {
  currentSyllabus = syllabusData[value] ? value : 'biology';
  const data = syllabusData[currentSyllabus];
  $('#sidebar-syllabus').value = currentSyllabus;
  $('#quick-syllabus').value = currentSyllabus;
  $('#hero-subject').textContent = data.subject;
  $('#hero-description').textContent = data.description;
  $('#syllabus-heading').textContent = data.name + ' syllabus';
  $('#syllabus-current-name').textContent = data.name;
  $('#syllabus-current-description').textContent = data.description;
  $('#syllabus-progress').textContent = data.progress + '%';
  $('#syllabus-progress-bar').style.width = data.progress + '%';
  $('#material-name').textContent = data.material;
  renderSyllabusChapters();
  renderQuizLibrary();
  if (announce) {
    showView('syllabus');
    toast(data.name + ' syllabus selected.');
  }
}

function renderSyllabusChapters() {
  const container = $('#syllabus-chapters');
  if (!container) return;
  const data = syllabusData[currentSyllabus];
  container.innerHTML = data.chapters.map(chapter => {
    const canPractice = currentSyllabus === 'biology' && chapter.action !== 'Add questions';
    const action = canPractice
      ? '<button class="small-action" data-action="start-practice" data-topic="' + escapeHtml(chapter.title) + '">' + escapeHtml(chapter.action) + ' ↗</button>'
      : '<button class="small-action" data-action="open-upload">' + escapeHtml(chapter.action) + ' ↗</button>';
    return '<article class="chapter-row panel"><span class="chapter-number">' + escapeHtml(chapter.number) + '</span><div><h3>' + escapeHtml(chapter.title) + '</h3><p>' + escapeHtml(chapter.detail) + '</p></div><span class="topic-status ' + escapeHtml(chapter.state) + '">' + escapeHtml(chapter.status) + '</span>' + action + '</article>';
  }).join('');
}

function renderQuizLibrary() {
  const list = $('#quiz-list');
  if (!list) return;
  if (currentSyllabus !== 'biology') {
    list.innerHTML = '<div class="empty-state panel"><span class="empty-mark">+</span><h3>No quizzes for ' + escapeHtml(syllabusData[currentSyllabus].name) + ' yet.</h3><p>Upload notes for this syllabus and MAESTRO can build its first reviewer.</p><button class="secondary-btn" data-action="open-upload">Add material ↗</button></div>';
    return;
  }
  const filter = $('#quiz-filter')?.value || 'all';
  const visible = quizLibrary.filter(quiz => filter === 'all' || quiz.filter === filter);
  list.innerHTML = visible.map((quiz, index) => '<article class="quiz-card panel"><div class="quiz-card-top"><span class="quiz-number">0' + (index + 1) + '</span><span class="topic-status ' + escapeHtml(quiz.state) + '">' + escapeHtml(quiz.label) + '</span></div><h3>' + escapeHtml(quiz.title) + '</h3><p>' + escapeHtml(quiz.detail) + '</p><button class="secondary-btn" data-action="start-practice" data-topic="' + escapeHtml(quiz.topic) + '">Start quiz <span>↗</span></button></article>').join('');
}

function renderMaterialLibrary() {
  const list = $('#material-library-list');
  if (!list) return;
  const rows = uploadedMaterials.length ? uploadedMaterials : [{ name: syllabusData[currentSyllabus].material, text: '', demo: true }];
  list.innerHTML = rows.map((material, index) => '<div class="library-row"><span class="material-index">' + String(index + 1).padStart(2, '0') + '</span><span class="material-icon" aria-hidden="true">' + (material.demo ? 'B' : 'T') + '</span><div><strong>' + escapeHtml(material.name) + '</strong><small>' + (material.demo ? 'Starter material in the prototype' : material.text.split(/\s+/).filter(Boolean).length + ' words read locally') + '</small></div><span class="material-status">' + (material.demo ? 'Demo' : 'Ready') + '</span></div>').join('');
}

function startPractice(topic = currentTopic) {
  if (currentSyllabus !== 'biology') {
    toast('Upload material for this syllabus before starting a quiz.');
    showView('materials');
    return;
  }
  currentTopic = topic;
  sessionQuestions = getQuestionsForTopic(topic);
  setActiveLesson(topic === 'Coverage gap' ? 'coverage' : 'biology');
  const saved = readProgress();
  const canResume = saved && saved.syllabus === currentSyllabus && saved.topic === currentTopic && saved.current < sessionQuestions.length;
  current = canResume ? saved.current : 0;
  sessionConfidences = canResume && saved.confidences && typeof saved.confidences === 'object'
    ? { ...saved.confidences }
    : {};
  selected = null;
  answered = false;
  $('#topic-select').value = currentTopic;
  $('#session-status').textContent = canResume ? 'Resuming from question ' + (current + 1) + '.' : 'Your progress saves in this browser.';
  showView('practice');
  renderQuestion();
}

function renderQuestion() {
  const question = sessionQuestions[current];
  if (!question) return;
  const generated = Boolean(question.generated);
  selected = null;
  answered = false;
  $('#question-count').textContent = (current + 1) + ' / ' + sessionQuestions.length;
  $('#question-number').textContent = 'QUESTION ' + String(current + 1).padStart(2, '0');
  $('#session-progress-bar').style.width = ((current + 1) / sessionQuestions.length * 100) + '%';
  $('#question-topic').textContent = question.topic;
  $('#question-text').textContent = question.text;
  $('#source-excerpt').textContent = question.source;
  setSourceRevealed(false);
  $('#feedback').className = 'feedback hidden';
  $('#confidence-wrap').className = 'confidence-wrap';
  const savedConfidence = Number(sessionConfidences[current]);
  const confidence = savedConfidence >= 1 && savedConfidence <= 5 ? savedConfidence : 3;
  $('#confidence-slider').value = String(confidence);
  $('#confidence-slider').setAttribute('aria-valuetext', confidence + ' of 5: ' + confidenceLabels[confidence - 1]);
  $('#confidence-value').textContent = confidence + ': ' + confidenceLabels[confidence - 1];
  $('#submit-answer').innerHTML = generated ? 'Reveal answer <span>↗</span>' : 'Check answer <span>↗</span>';
  $('#submit-answer').disabled = false;
  $('#generated-answer-area').classList.toggle('hidden', !generated);
  $('#answer-options').classList.toggle('hidden', generated);
  $('#generated-answer').value = '';
  $('#answer-options').innerHTML = generated ? '' : question.options.map((option, index) => '<button class="answer-option" data-index="' + index + '"><span class="answer-letter">' + String.fromCharCode(65 + index) + '</span>' + escapeHtml(option) + '</button>').join('');
  if (!generated) {
    $$('.answer-option').forEach(button => button.addEventListener('click', () => {
      if (answered) return;
      selected = Number(button.dataset.index);
      $$('.answer-option').forEach(option => option.classList.remove('selected'));
      button.classList.add('selected');
    }));
  }
}

function submitAnswer() {
  if (answered) {
    if (current >= sessionQuestions.length - 1) {
      clearProgress();
      startPractice(currentTopic);
      return;
    }
    current += 1;
    saveProgress();
    renderQuestion();
    return;
  }

  const question = sessionQuestions[current];
  const confidence = Number($('#confidence-slider').value);

  if (question.generated) {
    const response = $('#generated-answer').value.trim();
    if (!response) {
      toast('Write an answer before revealing it.');
      return;
    }
    answered = true;
    setSourceRevealed(true);
    const feedback = $('#feedback');
    feedback.className = 'feedback';
    feedback.innerHTML = '<strong>Compare your recall with the source.</strong><div class="generated-source-answer">' + escapeHtml(question.answer) + '</div><br><span class="feedback-confidence">Confidence: ' + confidence + '/5</span>';
    $('#session-status').textContent = 'Answer revealed. Decide what you knew and what needs another pass.';
    $('#submit-answer').innerHTML = current === sessionQuestions.length - 1 ? 'Finish quiz <span>↗</span>' : 'Next question <span>↗</span>';
    xp += 20;
    $('#xp-value').textContent = xp;
    saveProgress();
    return;
  }

  if (selected === null) {
    toast('Choose an answer first.');
    return;
  }

  const correct = selected === question.correct;
  answered = true;
  setSourceRevealed(true);

  $$('.answer-option').forEach((button, index) => {
    if (index === question.correct) button.classList.add('correct');
    if (index === selected && index !== question.correct) button.classList.add('incorrect');
  });

  const feedback = $('#feedback');
  feedback.className = 'feedback ' + (correct ? '' : 'wrong');
  feedback.innerHTML = '<strong>' + (correct ? 'Correct. You remembered this.' : 'Not quite. Review this one again.') + '</strong>' + escapeHtml(question.explanation) + '<br><span class="feedback-confidence">Confidence: ' + confidence + '/5</span>';
  $('#session-status').textContent = correct ? 'Answer recorded. Nice work.' : 'Answer recorded. This topic needs another pass.';
  $('#submit-answer').innerHTML = current === sessionQuestions.length - 1 ? 'Restart session <span>↗</span>' : 'Next question <span>↗</span>';

  if (correct) {
    xp += 40;
    $('#xp-value').textContent = xp;
  }
  saveProgress();
}

function exitPractice() {
  saveProgress();
  showView('overview');
  updateResumeLabel();
}

function updateResumeLabel() {
  const saved = readProgress();
  const label = $('#primary-session-label');
  if (!label) return;
  label.textContent = saved ? 'Resume your review' : 'Review osmosis & diffusion';
}

function toast(message) {
  const toastElement = $('#toast');
  if (!toastElement) return;
  clearTimeout(toastTimer);
  toastElement.textContent = message;
  toastElement.classList.add('show');
  toastTimer = setTimeout(() => toastElement.classList.remove('show'), 2400);
}

function setUploadLoading(active, label = 'Reading material...') {
  $('#upload-loading').classList.toggle('hidden', !active);
  $('#upload-loading-label').textContent = label;
  $('#file-input').disabled = active;
}

async function detectHostCapabilities() {
  try {
    const response = await fetch('/health', { cache: 'no-store' });
    if (!response.ok) return;
    const data = await response.json();
    if (data.documentExtraction === false) {
      documentExtractionAvailable = false;
      $('#file-input').setAttribute('accept', '.txt,.md,.text,text/plain,text/markdown');
      $('#upload-subtitle').textContent = 'Choose a .txt or .md file, or drop it here. Public text-only mode is active.';
    }
  } catch {
    // Keep the local default so a file can still be selected while the host is starting.
  }
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

async function readStudyFile(file) {
  if (/\.(txt|md|text)$/i.test(file.name)) return file.text();
  let response;
  try {
    response = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: file.name, data: arrayBufferToBase64(await file.arrayBuffer()) })
    });
  } catch {
    throw Object.assign(new Error('The document service could not be reached.'), { code: 'network' });
  }

  let result = {};
  try {
    result = await response.json();
  } catch {
    result = {};
  }
  if (!response.ok) {
    throw Object.assign(new Error(result.error || 'The document could not be read.'), { code: result.code || 'extraction_failed' });
  }
  if (!result.text || !result.text.trim()) throw Object.assign(new Error('No selectable text was found in this document.'), { code: 'no_text' });
  return result.text;
}

function makeReviewerQuiz(data) {
  return (data.questions || []).filter(question => question && question.prompt).map((question, index) => ({
    topic: 'Generated reviewer',
    text: question.prompt,
    options: [],
    correct: null,
    source: question.answer || 'Answer grounded in your uploaded material.',
    answer: question.answer || 'Review this point in your uploaded material.',
    explanation: question.answer || 'Compare your response with the source-grounded answer.',
    generated: true,
    number: Number(question.number) || index + 1
  }));
}

function startReviewerQuiz() {
  const generatedQuestions = makeReviewerQuiz(reviewerData || {});
  if (!generatedQuestions.length) {
    toast('Generate a reviewer with questions first.');
    return;
  }
  currentTopic = 'Generated reviewer';
  sessionQuestions = generatedQuestions;
  current = 0;
  selected = null;
  answered = false;
  $('#practice-title').textContent = reviewerData.title || 'Generated reviewer quiz';
  $('#session-status').textContent = 'Write your answer, then reveal the source-grounded answer.';
  $('#topic-select').value = 'all';
  showView('practice');
  renderQuestion();
}

function buildLocalReviewer(text) {
  const sentences = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).map(sentence => sentence.trim()).filter(sentence => sentence.length > 25);
  const points = sentences.slice(0, 6);
  const title = points[0] ? points[0].split(' ').slice(0, 7).join(' ') + (points[0].split(' ').length > 7 ? '...' : '') : 'Uploaded study material';
  const questionsForReview = points.slice(0, 5).map((point, index) => ({
    prompt: 'Explain this idea in your own words: ' + point,
    answer: point,
    number: index + 1
  }));
  return { title, points, questions: questionsForReview, source: 'Local reviewer from your uploaded text' };
}

function renderReviewer(data) {
  reviewerData = data;
  const output = $('#reviewer-output');
  const points = (data.points || []).map(point => '<li>' + escapeHtml(point) + '</li>').join('');
  const questionsHtml = (data.questions || []).map(question => '<article class="review-question"><span class="question-index">' + String(question.number).padStart(2, '0') + '</span><div><h4>' + escapeHtml(question.prompt) + '</h4><details><summary>Show answer</summary><p>' + escapeHtml(question.answer || '') + '</p></details></div></article>').join('');
  output.innerHTML = '<div class="reviewer-heading"><div><span class="eyebrow">' + escapeHtml(data.source || 'REVIEWER') + '</span><h3>' + escapeHtml(data.title || 'Your reviewer') + '</h3></div><button class="secondary-btn" id="start-review-session" type="button">Practice these questions ↗</button></div><div class="reviewer-columns"><div><h4>Key points</h4><ul class="review-points">' + (points || '<li>No clear points found yet.</li>') + '</ul></div><div><h4>Questions</h4><div class="review-questions">' + (questionsHtml || '<p>No questions were created.</p>') + '</div></div></div>';
  output.classList.remove('hidden');
  $('#reviewer-area').classList.remove('hidden');
  $('#start-review-session').addEventListener('click', () => {
    if (!data.questions || !data.questions.length) return;
    toast('Reviewer questions are ready in the practice view.');
    startReviewerQuiz();
  });
}

async function generateReviewer() {
  if (!uploadedText.trim()) {
    toast('Upload study material first.');
    return;
  }
  const button = $('#generate-reviewer');
  const label = button.querySelector('.button-label');
  button.disabled = true;
  if (label) label.textContent = 'Making reviewer...';
  button.classList.add('button-loading');
  $('#reviewer-status').textContent = 'Reading your material and building questions...';
  $('#reviewer-output').innerHTML = '<div class="review-loading"><span class="spinner" aria-hidden="true"></span><strong>Building your reviewer</strong><p>Checking the source and arranging useful questions.</p></div>';
  $('#reviewer-output').classList.remove('hidden');
  try {
    const response = await fetch('/api/reviewer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: uploadedText })
    });
    if (!response.ok) throw new Error('AI service unavailable');
    const data = await response.json();
    renderReviewer(data);
    $('#reviewer-status').textContent = 'Reviewer ready.';
  } catch {
    renderReviewer(buildLocalReviewer(uploadedText));
    $('#reviewer-status').textContent = 'Local reviewer ready. It works without an API key.';
  } finally {
    button.disabled = false;
    button.classList.remove('button-loading');
    if (label) label.textContent = 'Regenerate reviewer';
  }
}

async function processFiles(fileList) {
  const files = [...fileList].filter(file => {
    if (/\.(txt|md|text)$/i.test(file.name)) return true;
    return documentExtractionAvailable && /\.(pdf|docx)$/i.test(file.name);
  });
  if (!files.length) {
    toast(documentExtractionAvailable
      ? 'Choose a .txt, .md, .pdf, or .docx file.'
      : 'This public build accepts .txt or .md files.');
    return;
  }

  setUploadLoading(true, 'Reading material...');
  await new Promise(resolve => setTimeout(resolve, settings.reducedMotion ? 0 : 160));
  try {
    const contents = await Promise.all(files.map(readStudyFile));
    uploadedMaterials = uploadedMaterials.concat(files.map((file, index) => ({ name: file.name, text: contents[index], type: file.name.split('.').pop().toLowerCase() })));
    const combined = contents.join('\n\n').replace(/\s+/g, ' ').trim();
    const words = combined ? combined.split(/\s+/).length : 0;
    const preview = combined.length > 620 ? combined.slice(0, 620).trimEnd() + '...' : combined;
    const extractedDocument = files.some(file => /\.(pdf|docx)$/i.test(file.name));
    uploadedText = combined;
    reviewerData = null;
    $('#reviewer-area').classList.remove('hidden');
    $('#reviewer-output').classList.add('hidden');
    $('#reviewer-status').textContent = 'Material loaded. Ready to make a reviewer.';
    $('#material-name').textContent = files.length === 1 ? files[0].name : files.length + ' materials selected';
    $('#material-meta').textContent = 'Added just now: ' + words + ' words read locally';
    $('#material-status').textContent = extractedDocument ? 'Document text extracted' : 'Preview ready';
    $('#upload-title').textContent = 'Material ready to review';
    $('#upload-subtitle').textContent = files.length === 1
      ? (extractedDocument ? 'Document text was extracted on the local server.' : 'Your text was read in this browser.')
      : 'Your materials were read and combined locally.';
    $('#preview-text').textContent = preview || 'The file was empty.';
    $('#upload-preview').classList.remove('hidden');
    renderMaterialLibrary();
    toast(files.length === 1 ? 'Material added locally.' : files.length + ' materials added locally.');
  } catch (error) {
    const messages = {
      too_large: 'That document is too large. Choose a file under 8 MB.',
      no_text: 'No selectable text was found. Try a text-based PDF or DOCX.',
      invalid_document: 'That document could not be opened. Export it again and retry.',
      network: 'The document service could not be reached. Try again or upload a .txt or .md file.',
      public_text_only: 'The public build accepts .txt or .md files. Export this document as text and retry.',
      extraction_failed: 'The document could not be read. Try a text-based PDF or DOCX.'
    };
    toast(messages[error?.code] || 'The material could not be read. Try a .txt or .md file.');
  } finally {
    setUploadLoading(false);
  }
}

function resetLocalProgress() {
  clearProgress();
  current = 0;
  currentTopic = 'Osmosis & diffusion';
  sessionQuestions = getQuestionsForTopic(currentTopic);
  sessionConfidences = {};
  updateResumeLabel();
  toast('Local progress reset.');
}

document.addEventListener('click', event => {
  const nav = event.target.closest('[data-view]');
  if (nav) {
    const view = nav.dataset.view;
    if (view === 'practice') startPractice(currentTopic);
    else showView(view);
    return;
  }

  const target = event.target.closest('[data-view-target]');
  if (target) {
    showView(target.dataset.viewTarget);
    return;
  }

  const action = event.target.closest('[data-action]');
  if (!action) return;
  if (action.dataset.action === 'start-practice') startPractice(action.dataset.topic || currentTopic);
  if (action.dataset.action === 'exit-practice') exitPractice();
  if (action.dataset.action === 'open-upload') {
    showView('overview');
    setTimeout(() => $('#file-input').click(), settings.reducedMotion ? 0 : 120);
  }
  if (action.dataset.action === 'open-materials') showView('materials');
});

$('#submit-answer').addEventListener('click', submitAnswer);
$('#reveal-source').addEventListener('click', () => {
  const hidden = $('#source-excerpt').classList.contains('hidden');
  setSourceRevealed(hidden);
});
$('#flag-question').addEventListener('click', () => toast('Question flagged for review.'));
$('#confidence-slider').addEventListener('input', event => {
  const value = Number(event.target.value);
  sessionConfidences[current] = value;
  event.target.setAttribute('aria-valuetext', value + ' of 5: ' + confidenceLabels[value - 1]);
  $('#confidence-value').textContent = value + ': ' + confidenceLabels[value - 1];
});
$('#confidence-slider').addEventListener('change', () => saveProgress());
$('#topic-select').addEventListener('change', event => startPractice(event.target.value));
$('#quiz-filter').addEventListener('change', renderQuizLibrary);
$('#sidebar-syllabus').addEventListener('change', event => switchSyllabus(event.target.value));
$('#quick-syllabus').addEventListener('change', event => switchSyllabus(event.target.value));
$('#file-input').addEventListener('change', event => processFiles(event.target.files));
$('#generate-reviewer').addEventListener('click', generateReviewer);
$('#upload-panel').addEventListener('dragover', event => {
  event.preventDefault();
  $('#upload-panel').classList.add('dragging');
});
$('#upload-panel').addEventListener('dragleave', () => $('#upload-panel').classList.remove('dragging'));
$('#upload-panel').addEventListener('drop', event => {
  event.preventDefault();
  $('#upload-panel').classList.remove('dragging');
  processFiles(event.dataTransfer.files);
});
$('#clear-material').addEventListener('click', () => {
  uploadedMaterials = [];
  uploadedText = '';
  reviewerData = null;
  $('#file-input').value = '';
  $('#upload-preview').classList.add('hidden');
  $('#reviewer-area').classList.add('hidden');
  $('#reviewer-output').classList.add('hidden');
  $('#upload-title').textContent = 'Upload your notes, slides, or reading';
  $('#upload-subtitle').textContent = 'Choose a .txt or .md file, or drop it here.';
  $('#material-name').textContent = syllabusData[currentSyllabus].material;
  $('#material-meta').textContent = currentSyllabus === 'biology' ? 'Added today: 3 topics detected' : 'No material uploaded yet';
  $('#material-status').textContent = 'Ready to review';
  renderMaterialLibrary();
  toast('Local material cleared.');
});
$$('.lesson-tab').forEach(tab => tab.addEventListener('click', () => openLesson(tab.dataset.lesson)));
$$('[data-setting]').forEach(button => button.addEventListener('click', () => {
  const key = button.dataset.setting;
  settings[key] = !settings[key];
  saveSettings();
  applySettings();
  toast(button.querySelector('strong').textContent + (settings[key] ? ' on.' : ' off.'));
}));
$('#reset-progress').addEventListener('click', resetLocalProgress);

applySettings();
detectHostCapabilities();
switchSyllabus('biology', false);
setActiveLesson('biology');
updateResumeLabel();
renderSyllabusChapters();
renderQuizLibrary();
renderMaterialLibrary();
renderQuestion();
