(() => {
  const lessons = window.LESSONS || [];
  const paths = {
    friendship: "unit-1-friendship/", "teen-life": "unit-2-teen-life/", kitchen: "unit-3-in-the-kitchen/",
    phone: "unit-4-on-the-phone/", internet: "unit-5-the-internet/"
  };
  const icons = {
    friends: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3 20v-1.3a5.8 5.8 0 0 1 11.6 0V20zM16 5.2a3 3 0 0 1 0 5.7M17 14a4.8 4.8 0 0 1 4 4.7V20h-3"/></svg>',
    chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.5h16v12H9l-5 4z"/><path d="M8 9h8M8 13h5"/></svg>',
    pot: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9h14l-1 11H6zM3 9h18M9 5h6M12 5V3M8 13h8"/><path d="M7 20v1M17 20v1"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h3l1.2 5-2 1.7a15 15 0 0 0 5.1 5.1l1.7-2 5 1.2v3c0 1.1-.9 2-2 2A16 16 0 0 1 5 5c0-1.1.9-2 2-2z"/></svg>',
    globe: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>'
  };
  const iconFor = lesson => icons[lesson.icon] || icons.chat;
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
  const readProgress = () => {
    try { return JSON.parse(localStorage.getItem("english8-progress-v1") || "{}") || {}; }
    catch { return {}; }
  };
  const writeProgress = state => {
    try { localStorage.setItem("english8-progress-v1", JSON.stringify(state)); }
    catch { announce("Bu tarayıcı ilerlemeyi kaydedemedi. Sayfayı açık tutarak çalışabilirsin."); }
  };
  const unitProgress = id => {
    const all = readProgress();
    if (!all.units) all.units = {};
    if (!all.units[id]) all.units[id] = { points: 0, rewards: [], quizBest: 0, lgsBest: 0, vocabBest: 0, sprintBest: 0, mastered: false, matched: [] };
    // Migrate existing browser progress without changing any saved scores.
    let migrated = false;
    if (all.units[id].lgsBest == null) { all.units[id].lgsBest = 0; migrated = true; }
    if (all.units[id].vocabBest == null) { all.units[id].vocabBest = 0; migrated = true; }
    if (all.units[id].sprintBest == null) { all.units[id].sprintBest = 0; migrated = true; }
    if (migrated) writeProgress(all);
    return all.units[id];
  };
  const masteryCount = () => lessons.filter(lesson => (unitProgress(lesson.id).mastered)).length;
  const totalPoints = () => lessons.reduce((sum, lesson) => sum + unitProgress(lesson.id).points, 0);
  function updateProgressUI() {
    const count = masteryCount();
    const fill = document.getElementById("sidebar-progress-fill");
    const label = document.getElementById("sidebar-progress-label");
    if (fill) fill.style.width = `${count / lessons.length * 100}%`;
    if (label) label.textContent = `${count} / ${lessons.length}`;
    document.querySelectorAll("[data-points-total]").forEach(el => el.textContent = totalPoints());
  }
  function announce(message) {
    let region = document.querySelector(".toast-region");
    if (!region) { region = document.createElement("div"); region.className = "toast-region"; region.setAttribute("aria-live", "polite"); document.body.append(region); }
    const item = document.createElement("div"); item.className = "toast"; item.textContent = message; region.append(item);
    window.setTimeout(() => item.remove(), 3200);
  }
  function reward(lessonId, key, points, message) {
    const all = readProgress(); all.units ||= {};
    const current = all.units[lessonId] || { points: 0, rewards: [], quizBest: 0, mastered: false, matched: [] };
    current.rewards ||= [];
    if (current.rewards.includes(key)) return false;
    current.rewards.push(key); current.points = (current.points || 0) + points;
    all.units[lessonId] = current; writeProgress(all); updateProgressUI();
    if (message) announce(message);
    return true;
  }
  function setQuizBest(lesson, score) {
    const all = readProgress(); all.units ||= {};
    const current = all.units[lesson.id] || { points: 0, rewards: [], quizBest: 0, mastered: false, matched: [] };
    const oldBest = current.quizBest || 0;
    current.rewards ||= [];
    if (score > oldBest) {
      const gain = (score - oldBest) * 5;
      current.quizBest = score; current.points = (current.points || 0) + gain;
      current.rewards.push(`quiz-best-${score}`);
      announce(`Yeni en iyi sonuç! +${gain} puan`);
    }
    if (score >= 7) current.mastered = true;
    all.units[lesson.id] = current; writeProgress(all); updateProgressUI();
  }
  function setLgsBest(lesson, score) {
    const all = readProgress(); all.units ||= {};
    const current = all.units[lesson.id] || { points: 0, rewards: [], quizBest: 0, lgsBest: 0, mastered: false, matched: [] };
    const oldBest = current.lgsBest || 0;
    current.rewards ||= [];
    if (score > oldBest) {
      const gain = (score - oldBest) * 5;
      current.lgsBest = score; current.points = (current.points || 0) + gain;
      current.rewards.push(`lgs-best-${score}`);
      announce(`Yeni LGS en iyi sonucun! +${gain} puan`);
    }
    all.units[lesson.id] = current; writeProgress(all); updateProgressUI();
    const bestLabel = document.querySelector("[data-lgs-best]");
    if (bestLabel) bestLabel.textContent = current.lgsBest || 0;
  }
  function setVocabBest(lesson, score) {
    const all = readProgress(); all.units ||= {};
    const current = all.units[lesson.id] || { points: 0, rewards: [], quizBest: 0, lgsBest: 0, vocabBest: 0, mastered: false, matched: [] };
    const oldBest = current.vocabBest || 0;
    current.rewards ||= [];
    if (score > oldBest) {
      const gain = (score - oldBest) * 2;
      current.vocabBest = score; current.points = (current.points || 0) + gain;
      current.rewards.push(`vocab-best-${score}`);
      announce(`Yeni kelime alıştırması rekorun! +${gain} puan`);
    }
    all.units[lesson.id] = current; writeProgress(all); updateProgressUI();
    const bestLabel = document.querySelector("[data-vocab-best]");
    if (bestLabel) bestLabel.textContent = current.vocabBest || 0;
  }
  function setSprintBest(lesson, score) {
    const all = readProgress(); all.units ||= {};
    const current = all.units[lesson.id] || { points: 0, rewards: [], quizBest: 0, lgsBest: 0, vocabBest: 0, sprintBest: 0, mastered: false, matched: [] };
    const oldBest = current.sprintBest || 0;
    current.rewards ||= [];
    if (score > oldBest) {
      const gain = (score - oldBest) * 3;
      current.sprintBest = score; current.points = (current.points || 0) + gain;
      current.rewards.push(`sprint-best-${score}`);
      announce(`Yeni sprint rekoru! +${gain} puan`);
    }
    all.units[lesson.id] = current; writeProgress(all); updateProgressUI();
    const bestLabel = document.querySelector("[data-sprint-best]");
    if (bestLabel) bestLabel.textContent = current.sprintBest || 0;
  }
  function renderNotes(pageId, pageTitle) {
    document.getElementById("notes-widget")?.remove();
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem("english8-notes-v1") || "{}") || {}; } catch {}
    document.body.insertAdjacentHTML("beforeend", `<div class="notes-widget" id="notes-widget"><button class="notes-toggle" type="button" aria-expanded="false" aria-controls="notes-panel"><span aria-hidden="true">✎</span><span>Notlarım</span></button><section class="notes-panel" id="notes-panel" aria-label="${escapeHtml(pageTitle)} not defteri" hidden><div class="notes-panel-head"><div><span class="activity-kicker">KİŞİSEL ÇALIŞMA ALANI</span><h2>${escapeHtml(pageTitle)} notları</h2></div><button class="notes-close" type="button" aria-label="Not defterini kapat">×</button></div><label class="notes-label" for="lesson-notes">Kelimeler, örnekler ve hatırlatmalar</label><textarea id="lesson-notes" rows="9" placeholder="Buraya notlarını yaz..." spellcheck="true"></textarea><div class="notes-footer"><span class="notes-save-status" aria-live="polite">Bu sayfa için otomatik kaydedilir.</span><button class="notes-clear" type="button">Notları temizle</button></div></section></div>`);
    const widget = document.getElementById("notes-widget"), toggle = widget.querySelector(".notes-toggle"), panel = widget.querySelector(".notes-panel"), textarea = widget.querySelector("textarea"), status = widget.querySelector(".notes-save-status");
    textarea.value = typeof saved[pageId] === "string" ? saved[pageId] : "";
    const close = () => { panel.hidden = true; toggle.setAttribute("aria-expanded", "false"); toggle.focus(); };
    toggle.addEventListener("click", () => { panel.hidden = !panel.hidden; toggle.setAttribute("aria-expanded", String(!panel.hidden)); if (!panel.hidden) textarea.focus(); });
    widget.querySelector(".notes-close").addEventListener("click", close);
    textarea.addEventListener("input", () => {
      try { saved[pageId] = textarea.value; localStorage.setItem("english8-notes-v1", JSON.stringify(saved)); status.textContent = "Kaydedildi · Bu sayfa için saklandı."; }
      catch { status.textContent = "Notlar kaydedilemedi."; }
    });
    widget.querySelector(".notes-clear").addEventListener("click", () => {
      if (!textarea.value || !window.confirm("Bu sayfanın notlarını temizlemek istiyor musun?")) return;
      textarea.value = ""; saved[pageId] = "";
      try { localStorage.setItem("english8-notes-v1", JSON.stringify(saved)); status.textContent = "Notlar temizlendi."; textarea.focus(); }
      catch { status.textContent = "Notlar temizlenemedi."; }
    });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && !panel.hidden) close(); });
  }
  function renderNav(activeId) {
    const nav = document.getElementById("unit-nav"); if (!nav) return;
    nav.innerHTML = lessons.map(lesson => `<a class="unit-link ${activeId === lesson.id ? "active" : ""}" href="${paths[lesson.id]}" ${activeId === lesson.id ? 'aria-current="page"' : ""}>${iconFor(lesson)}<span>${escapeHtml(lesson.title)}</span><span class="unit-number">${String(lesson.number).padStart(2,"0")}</span></a>`).join("");
  }
  function renderHome() {
    const main = document.getElementById("main-content");
    const image = `assets/${lessons[0].image}`;
    const rows = lessons.map(lesson => {
      const state = unitProgress(lesson.id), percent = Math.min(100, state.quizBest * 10);
      const status = state.mastered ? "Tamamlandı" : state.quizBest ? `En iyi ${state.quizBest}/10` : "Başlamadı";
      return `<a class="home-unit" href="${paths[lesson.id]}"><span class="unit-icon ${lesson.color}">${iconFor(lesson)}</span><span><span class="home-unit-title">${String(lesson.number).padStart(2,"0")} · ${escapeHtml(lesson.title)}</span><span class="home-unit-detail">${escapeHtml(lesson.tr)} · ${escapeHtml(lesson.goal)}</span></span><span class="home-unit-status"><span>${status}</span><span class="mini-track" aria-hidden="true"><span style="width:${percent}%"></span></span><span class="row-arrow" aria-hidden="true">→</span></span></a>`;
    }).join("");
    const steps = [["▤","Grammar","Dil bilgisini örneklerle keşfet."],["▥","Reading","Kısa metinleri oku ve anla."],["Aa","Vocabulary","Yeni kelimeleri bağlamda öğren."],["◌","Speaking","Kendini İngilizce ifade et."],["✎","Practice","Alıştırmaları çöz, yanıtını gör."],["☼","Tips","Akıllı çalışma ipuçlarını uygula."],["✣","Play & Learn","Oyunla tekrar et, puan kazan."]];
    main.innerHTML = `<section class="home-hero"><div class="hero-copy"><h1>English 8</h1><p class="hero-heading-sub">8. Sınıf İngilizce <span aria-hidden="true">·</span> Dönem 1</p><p>Beş ünite, bol bol pratik. İngilizceyi adım adım öğren; öğrendiklerini test ve oyunlarla pekiştir.</p><a class="home-start" href="${paths.friendship}">Öğrenmeye başla <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7"/></svg></a><div class="progress-summary"><div class="progress-heading"><span>Dönem ilerlemen</span><strong>${masteryCount()} / ${lessons.length} ünite</strong></div><div class="progress-track"><span style="width:${masteryCount()/lessons.length*100}%"></span></div><div class="home-unit-detail" style="margin-top:8px"><strong data-points-total>${totalPoints()}</strong> öğrenme puanı</div></div></div><div class="hero-visual"><img src="${image}" alt="Birlikte hafta sonu planı yapan dört öğrenci"></div></section>
      <section aria-labelledby="units-heading"><div class="section-heading"><div><h2 id="units-heading">Dönem üniteleri</h2><p>Bir ünite seç ve kendi hızında çalış.</p></div><span class="badge-note">${masteryCount()} / 5 tamamlandı</span></div><div class="unit-list">${rows}</div></section>
      <section aria-labelledby="learning-heading"><div class="section-heading"><div><h2 id="learning-heading">Her ünitede neler var?</h2><p>Öğrenme, uygulama ve tekrar tek yerde.</p></div></div><div class="learning-map">${steps.map(([symbol,title,desc]) => `<div class="learning-step"><div class="step-symbol" aria-hidden="true">${symbol}</div><strong>${title}</strong><span>${desc}</span></div>`).join("")}</div></section>`;
    renderNotes("home", "Dönem 1");
  }
  function sectionHead(number, title, desc) {
    return `<div class="lesson-section-head"><span class="section-index">${number}</span><div><h2>${title}</h2>${desc ? `<p>${desc}</p>` : ""}</div></div>`;
  }
  function quizQuestions(items, prefix) {
    return items.map((item, i) => `<fieldset class="question-row"><legend>${i+1}. ${escapeHtml(item[0])}</legend>${item[4] ? `<div class="question-context">${escapeHtml(item[4])}</div>` : ""}<div class="choice-list">${item[1].map((option, j) => `<label class="choice-label"><input type="radio" name="${prefix}-${i}" value="${j}" required><span>${escapeHtml(option)}</span></label>`).join("")}</div></fieldset>`).join("");
  }
  function renderQuizForm(items, id, label, mode, index = "") {
    return `<form class="assessment-form" data-kind="${mode}" data-id="${id}" ${index !== "" ? `data-index="${index}"` : ""}>${quizQuestions(items, id)}<div class="action-row"><button class="primary-button" type="submit">${label}</button><span class="feedback" aria-live="polite"></span></div><div class="result-slot" aria-live="polite"></div></form>`;
  }
  function renderLesson(lesson) {
    const main = document.getElementById("main-content");
    document.title = `${lesson.title} — English 8`;
    const anchors = [["grammar","Grammar"],["vocabulary","Vocabulary"],["reading","Reading"],["speaking","Speaking"],["practice","Practice"],["quiz","Test"],["lgs","LGS Practice"],["tips","Tips"],["game","Play & Learn"]];
    const vocabRows = lesson.vocab.map(([en,tr,example]) => `<tr><td>${escapeHtml(en)}</td><td>${escapeHtml(tr)}</td><td>${escapeHtml(example)}</td></tr>`).join("");
    const extraReadings = lesson.extraReadings.map((reading,index) => `<article class="reading-card extra-reading-card"><div class="activity-kicker">OKUMA ${index+2}</div><h3>${escapeHtml(reading.title)}</h3><p>${escapeHtml(reading.text)}</p><div class="practice-box reading-check"><h4>Comprehension check · Anlama soruları</h4>${renderQuizForm(reading.questions,lesson.id,"Yanıtları kontrol et","reading-extra",index)}</div></article>`).join("");
    const speakingExercises = lesson.speakingExercises.map((exercise,index) => `<article class="speaking-exercise"><span class="activity-kicker">KONUŞMA ${index+1}</span><h3>${escapeHtml(exercise.title)}</h3><p><strong>Situation:</strong> ${escapeHtml(exercise.situation)}</p><p><strong>Your task:</strong> ${escapeHtml(exercise.task)}</p><div class="phrase-bank"><strong>Useful phrases</strong><p>${escapeHtml(exercise.phrases)}</p></div><p class="speaking-challenge"><strong>Challenge:</strong> ${escapeHtml(exercise.challenge)}</p>${exercise.model ? `<details class="model-answer"><summary>Example answer · Örnek konuşma</summary><p>${escapeHtml(exercise.model)}</p></details>` : ""}<details><summary>Bitirdiğinde kendini kontrol et</summary><ul><li>Konuşmamı İngilizce tamamladım.</li><li>Hedef ifadelerden en az ikisini kullandım.</li><li>Eşimin konuşmasını dinledim ve rolümüzü değiştirdim.</li></ul></details></article>`).join("");
    const grammar = lesson.grammar.map(item => `<article class="grammar-card"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.rule)}</p><div class="example-list">${item.examples.map(example => `<div class="example-line">${escapeHtml(example)}</div>`).join("")}</div>${item.mistake ? `<p class="grammar-mistake"><strong>Sık yapılan hata:</strong> ${escapeHtml(item.mistake)}</p>` : ""}</article>`).join("");
    const tips = lesson.tips.map((tip,i) => `<li><span class="prompt-mark">${i+1}</span><span>${escapeHtml(tip)}</span></li>`).join("");
    const speaking = lesson.speak.map((prompt,i) => `<li><span class="prompt-mark">${i+1}</span><span>${escapeHtml(prompt)}</span></li>`).join("");
    const practiceA = lesson.practiceA.map(([question,answer,hint],i) => `<div class="fill-row"><label for="fill-${lesson.id}-${i}">${i+1}. ${escapeHtml(question)}</label><input type="text" id="fill-${lesson.id}-${i}" autocomplete="off" data-answer="${escapeHtml(answer.toLowerCase())}" aria-label="${i+1}. boşluk cevabı"></div>`).join("");
    const gameSaved = new Set(unitProgress(lesson.id).matched || []);
    const matchedCount = gameSaved.size;
    const progress = unitProgress(lesson.id);
    main.innerHTML = `<div class="breadcrumb"><a href="../">Dönem 1</a><span aria-hidden="true">/</span><span>Ünite ${lesson.number}</span></div>
      <section class="unit-hero"><div class="unit-copy"><div class="unit-number-label">ÜNİTE ${String(lesson.number).padStart(2,"0")}</div><h1>${escapeHtml(lesson.title)}</h1><p>${escapeHtml(lesson.intro)}</p><div class="goal-line"><span class="goal-dot"></span>${escapeHtml(lesson.goal)}</div></div><div class="hero-visual"><img src="../assets/${lesson.image}" alt="${escapeHtml(lesson.tr)} konulu öğrenme illüstrasyonu"></div></section>
      <nav class="unit-section-nav" aria-label="Ünite bölümleri">${anchors.map(([id,label])=>`<a class="section-pill" href="#${id}">${label}</a>`).join("")}</nav>
      <section class="lesson-section" id="grammar">${sectionHead("01","Grammar · Dil Bilgisi","Kuralı incele, örnekleri sesli oku.")}<div class="grammar-grid">${grammar}</div></section>
      <section class="lesson-section" id="vocabulary">${sectionHead("02","Vocabulary · Kelime Bilgisi","Kelimeleri örnekleriyle öğren; ardından anlam ve kullanım alıştırmasını çöz.")}<div class="table-wrap"><table class="vocab-table"><thead><tr><th>English</th><th>Türkçe</th><th>Example</th></tr></thead><tbody>${vocabRows}</tbody></table></div><div class="practice-box vocabulary-practice"><div class="practice-heading"><div><span class="activity-kicker">10 SORULUK ALIŞTIRMA</span><h3>Vocabulary Challenge · Kelime Alıştırması</h3><p>Kelimenin anlamını veya cümledeki doğru kullanımını seç.</p></div><span class="badge-note">En iyi: <strong data-vocab-best>${progress.vocabBest || 0}</strong> / 10</span></div>${renderQuizForm(lesson.vocabularyPractice,lesson.id,"Kelime alıştırmasını bitir","vocabulary")}</div></section>
      <section class="lesson-section" id="reading">${sectionHead("03","Reading · Okuma","Metinleri oku, ayrıntıları bul ve anlama sorularını yanıtla.")}<article class="reading-card"><h3>${escapeHtml(lesson.reading.title)}</h3><p>${escapeHtml(lesson.reading.text)}</p></article><div class="practice-box" style="margin-top:15px"><h3>Reading check</h3><p>Metne göre doğru cevabı seç.</p>${renderQuizForm(lesson.readQuestions,lesson.id,"Cevapları kontrol et","reading")}</div><div class="extra-reading-list">${extraReadings}</div></section>
      <section class="lesson-section" id="speaking">${sectionHead("04","Speaking · Konuşma","Görev kartlarını bir eşle canlandır. Sonra rolleri değiştir ve öz değerlendirme listesini kullan.")}<ul class="speaking-list">${speaking}</ul><div class="speaking-exercise-grid">${speakingExercises}</div></section>
      <section class="lesson-section" id="practice">${sectionHead("05","More Exercises · Ek Alıştırmalar","Önce boşlukları doldur, sonra doğru seçeneği bul.")}<div class="practice-box"><h3>Set A · Complete the sentences</h3><p>İngilizce cevabını yaz ve kontrol et. Büyük / küçük harf farkı aranmaz.</p><form class="fill-form" data-id="${lesson.id}">${practiceA}<div class="action-row"><button class="primary-button" type="submit">Cevapları kontrol et</button><span class="feedback" aria-live="polite"></span></div></form></div><div class="practice-box"><h3>Set B · Choose the correct answer</h3><p>Her soruda bir doğru cevap var.</p>${renderQuizForm(lesson.practiceB,lesson.id,"Set B’yi kontrol et","practice")}</div></section>
      <section class="lesson-section" id="quiz">${sectionHead("06","Unit Test · Ünite Testi","10 soru · Her doğru cevap 1 puan. 7/10 ve üzeri üniteyi tamamlar.")}<div class="badge-note">En iyi sonuç: ${progress.quizBest || 0} / 10 · ${progress.points || 0} puan</div><div style="height:12px"></div>${renderQuizForm(lesson.quiz,lesson.id,"Testi bitir","quiz")}</section>
      <section class="lesson-section" id="lgs">${sectionHead("07","LGS Practice · LGS Alıştırması","10 kısa senaryo, her senaryoda 2 soru · Her doğru cevap 1 puan.")}<div class="badge-note">LGS en iyi sonuç: <strong data-lgs-best>${progress.lgsBest || 0}</strong> / ${lesson.lgsQuestions.length} · Ayrı kaydedilir</div><div style="height:12px"></div>${renderQuizForm(lesson.lgsQuestions,lesson.id,"LGS sorularını bitir","lgs")}</section>
      <section class="lesson-section" id="tips">${sectionHead("08","Study Tips · İpuçları","Küçük hatırlatmalar daha doğru cümleler kurmana yardım eder.")}<ul class="tip-list">${tips}</ul></section>
      <section class="lesson-section" id="game">${sectionHead("09","Play & Learn · Oyun","30 kelimelik sprintte seri yap, rozet kazan; ardından eşleştirme oyununu tamamla.")}<div class="word-sprint" data-word-sprint data-id="${lesson.id}"><div class="sprint-heading"><div><span class="activity-kicker">30 KELİME · STREAK BONUSU</span><h3>Word Sprint · Kelime Sprinti</h3><p>30 kelimenin anlamını bul. Üç doğru cevaplık seride bonus XP kazan.</p></div><span class="badge-note">Rekor: <strong data-sprint-best>${progress.sprintBest || 0}</strong> / 30</span></div><div class="sprint-progress" aria-label="30 kelimelik sprint ilerlemesi"><span data-sprint-progress></span></div><div class="sprint-content" data-sprint-content><p>Her doğru cevap 10 XP, üçlü seri için +5 bonus XP. En iyi tur sayın kaydedilir.</p><button class="primary-button" type="button" data-sprint-start>30 kelimelik sprinti başlat</button></div></div><div class="game-panel"><p>${escapeHtml(lesson.game.prompt)} <strong>${matchedCount}/${lesson.game.pairs.length}</strong></p><div class="match-board" data-match-board data-id="${lesson.id}"><div class="match-column" aria-label="Kelimeler">${lesson.game.pairs.map(([left],i)=>`<button type="button" class="match-button ${gameSaved.has(String(i))?"matched":""}" data-side="left" data-index="${i}" ${gameSaved.has(String(i))?"disabled":""}>${escapeHtml(left)}</button>`).join("")}</div><div class="match-column" aria-label="Anlamlar">${lesson.game.pairs.map((pair,i)=>{const original=lesson.game.pairs.length-1-i;return `<button type="button" class="match-button ${gameSaved.has(String(original))?"matched":""}" data-side="right" data-index="${original}" ${gameSaved.has(String(original))?"disabled":""}>${escapeHtml(pair[1])}</button>`;}).join("")}</div></div><div class="game-feedback" aria-live="polite">${matchedCount===lesson.game.pairs.length?"Harika! Tüm eşleşmeleri tamamladın.":"Önce soldan bir kelime, sonra sağdan anlamını seç."}</div></div></section>
      <hr class="section-rule"><a class="home-start" href="${lesson.number<5?paths[lessons[lesson.number].id]:"../"}">${lesson.number<5?"Sonraki üniteye geç":"Kurs ana sayfasına dön"}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7"/></svg></a>`;
    attachForms(lesson);
    attachGame(lesson);
    attachWordSprint(lesson);
    renderNotes(lesson.id, lesson.title);
    updateProgressUI();
  }
  function normalizeAnswer(text) { return text.trim().toLocaleLowerCase("tr-TR").replace(/[.!?]$/g, ""); }
  function attachForms(lesson) {
    document.querySelectorAll(".assessment-form").forEach(form => form.addEventListener("submit", event => {
      event.preventDefault();
      const kind = form.dataset.kind;
      const items = kind === "quiz" ? lesson.quiz : kind === "lgs" ? lesson.lgsQuestions : kind === "vocabulary" ? lesson.vocabularyPractice : kind === "reading-extra" ? lesson.extraReadings[Number(form.dataset.index)].questions : kind === "reading" ? lesson.readQuestions : lesson.practiceB;
      let score=0;
      items.forEach((item,i) => {
        const selected=form.querySelector(`input[name="${lesson.id}-${i}"]:checked`);
        const correct=selected && Number(selected.value)===item[2];
        if(correct) score++;
        const row=form.querySelectorAll(".question-row")[i];
        row.querySelectorAll("input").forEach(input=>input.disabled=true);
        const note=document.createElement("span"); note.className=`answer-note ${correct?"good":"bad"}`;
        note.textContent=correct?`✓ Doğru. ${item[3]||""}`:`Doğru cevap: ${item[1][item[2]]}. ${item[3]||""}`;
        row.append(note);
      });
      const feedback=form.querySelector(".feedback");
      feedback.textContent=`${score} / ${items.length} doğru`;
      feedback.classList.add(score >= Math.ceil(items.length*.7)?"good":"bad");
      form.querySelector("button[type=submit]").disabled=true;
      form.querySelector(".result-slot").innerHTML=`<div class="quiz-result"><strong>${score} / ${items.length}</strong><p>${kind==="quiz"?(score>=7?"Tebrikler, bu üniteyi tamamladın!":"İpuçlarını gözden geçirip testi yeniden çözebilirsin."):"Yanıtlarını açıklamalarla birlikte gözden geçir."}</p></div>`;
      if(kind==="quiz") setQuizBest(lesson,score);
      else if(kind==="lgs") setLgsBest(lesson,score);
      else if(kind==="vocabulary") setVocabBest(lesson,score);
      else if(kind==="reading-extra"&&score===items.length) reward(lesson.id,`reading-extra-${form.dataset.index}-perfect`,5,"Okuma alıştırması tamamlandı! +5 puan");
      else if(score===items.length) reward(lesson.id,`${kind}-perfect`,5,"Kusursuz çalışma! +5 puan");
      updateProgressUI();
    }));
    document.querySelectorAll(".fill-form").forEach(form => form.addEventListener("submit", event => {
      event.preventDefault(); let score=0;
      form.querySelectorAll("[data-answer]").forEach(input=>{
        const correct=normalizeAnswer(input.value)===normalizeAnswer(input.dataset.answer);
        if(correct) score++;
        input.disabled=true;
        input.insertAdjacentHTML("afterend",`<span class="answer-note ${correct?"good":"bad"}">${correct?"✓ Doğru":`Cevap: ${escapeHtml(input.dataset.answer)}`}</span>`);
      });
      const feedback=form.querySelector(".feedback"); feedback.textContent=`${score} / ${form.querySelectorAll("[data-answer]").length} doğru`; feedback.classList.add(score===form.querySelectorAll("[data-answer]").length?"good":"bad");
      form.querySelector("button[type=submit]").disabled=true;
      if(score===form.querySelectorAll("[data-answer]").length) reward(lesson.id,"fill-perfect",5,"Harika, tüm boşluklar doğru! +5 puan");
    }));
  }
  function attachGame(lesson) {
    const board=document.querySelector("[data-match-board]"); if(!board)return;
    let selectedLeft=null; const feedback=board.parentElement.querySelector(".game-feedback");
    const matched=new Set((unitProgress(lesson.id).matched||[]).map(String));
    board.addEventListener("click",event=>{
      const button=event.target.closest(".match-button"); if(!button||button.disabled)return;
      if(button.dataset.side==="left"){
        board.querySelectorAll('[data-side="left"]').forEach(item=>item.classList.remove("selected"));
        selectedLeft=button.dataset.index;button.classList.add("selected");feedback.textContent="Şimdi sağdaki anlamlardan birini seç.";return;
      }
      if(selectedLeft===null){feedback.textContent="Önce soldan bir kelime seç.";return;}
      const left=board.querySelector(`[data-side="left"][data-index="${selectedLeft}"]`);
      if(button.dataset.index===selectedLeft){
        left.classList.remove("selected");left.classList.add("matched");button.classList.add("matched");left.disabled=true;button.disabled=true;
        matched.add(selectedLeft);const all=readProgress();all.units ||= {};const state=all.units[lesson.id]||{points:0,rewards:[],quizBest:0,mastered:false,matched:[]};state.matched=[...matched];all.units[lesson.id]=state;writeProgress(all);
        reward(lesson.id,`match-${selectedLeft}`,4,"Eşleşme doğru! +4 puan");
        board.parentElement.querySelector(".game-panel>p strong").textContent=`${matched.size}/${lesson.game.pairs.length}`;
        feedback.textContent=matched.size===lesson.game.pairs.length?"Harika! Tüm eşleşmeleri tamamladın.":"Doğru eşleşme. Bir sonrakine geç!";
      }else{button.classList.add("selected");feedback.textContent="Bu eşleşme olmadı. Başka bir anlam dene.";window.setTimeout(()=>button.classList.remove("selected"),650);}
      selectedLeft=null;
    });
  }
  function attachWordSprint(lesson) {
    const panel = document.querySelector("[data-word-sprint]"); if (!panel) return;
    const content = panel.querySelector("[data-sprint-content]"), progress = panel.querySelector("[data-sprint-progress]");
    let questions = [], round = 0, score = 0, streak = 0, bestStreak = 0, xp = 0, answered = false;
    const shuffle = list => {
      const copy = [...list];
      for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
      return copy;
    };
    const start = () => {
      questions = shuffle(lesson.vocab).slice(0, 30).map(([word,meaning]) => {
        const distractors = [...new Set(lesson.vocab.filter(item => item[0] !== word).map(item => item[1]).filter(value => value !== meaning))];
        return { word, meaning, choices: shuffle([meaning, ...shuffle(distractors).slice(0, 3)]) };
      });
      round = 0; score = 0; streak = 0; bestStreak = 0; xp = 0; answered = false; showRound();
    };
    const showRound = () => {
      const question = questions[round];
      progress.style.width = `${round / questions.length * 100}%`;
      content.innerHTML = `<div class="sprint-status"><span>ROUND ${round + 1} / ${questions.length}</span><span>🔥 Seri: ${streak}</span><span>⭐ ${xp} XP</span></div><h4>What does “${escapeHtml(question.word)}” mean?</h4><div class="sprint-choices">${question.choices.map((choice,index) => `<button class="sprint-choice" type="button" data-sprint-choice="${index}">${escapeHtml(choice)}</button>`).join("")}</div><p class="sprint-feedback" data-sprint-feedback aria-live="polite">Doğru anlamı seç.</p><button class="primary-button sprint-next" type="button" data-sprint-next hidden>Sonraki kelime →</button>`;
      answered = false;
    };
    const finish = () => {
      progress.style.width = "100%";
      setSprintBest(lesson, score);
      let rank = "Tekrar turu · Bir kez daha dene!";
      if (score >= 18) { rank = "🥉 Bronz rozet · Güzel seri!"; reward(lesson.id,"word-sprint-bronze",5,"Bronz kelime rozeti! +5 puan"); }
      if (score >= 24) { rank = "🥈 Gümüş rozet · Harika gidiyorsun!"; reward(lesson.id,"word-sprint-silver",8,"Gümüş kelime rozeti! +8 puan"); }
      if (score === 30) { rank = "🏆 Altın rozet · Word Wizard!"; reward(lesson.id,"word-sprint-gold",12,"Altın kelime rozeti! +12 puan"); }
      content.innerHTML = `<div class="sprint-finish"><div class="sprint-trophy" aria-hidden="true">${score===30?"🏆":score>=24?"🥈":score>=18?"🥉":"🌱"}</div><h4>${rank}</h4><p><strong>${score} / 30</strong> doğru · <strong>${xp} XP</strong> kazandın · En uzun seri: <strong>${bestStreak}</strong></p><p>${score===30?"Otuz kelimenin hepsini bildin!":score>=18?"Rozetini kazandın; rekorunu geliştirmek için yeniden oyna.":"Yanlış yaptığın kelimeleri kelime tablosundan tekrar incele."}</p><button class="primary-button" type="button" data-sprint-start>Yeniden oyna</button></div>`;
    };
    panel.addEventListener("click", event => {
      if (event.target.closest("[data-sprint-start]")) { start(); return; }
      const choice = event.target.closest("[data-sprint-choice]");
      if (choice && !answered) {
        answered = true;
        const question = questions[round], correct = Number(choice.dataset.sprintChoice) === question.choices.indexOf(question.meaning);
        if (correct) { score++; streak++; bestStreak = Math.max(bestStreak, streak); xp += 10 + (streak % 3 === 0 ? 5 : 0); }
        else streak = 0;
        panel.querySelectorAll("[data-sprint-choice]").forEach(button => {
          button.disabled = true;
          if (question.choices[Number(button.dataset.sprintChoice)] === question.meaning) button.classList.add("correct");
        });
        const feedback = panel.querySelector("[data-sprint-feedback]");
        feedback.textContent = correct ? (streak && streak % 3 === 0 ? "Doğru! Üçlü seri bonusu: +5 XP 🔥" : `Doğru! +10 XP · Seri ${streak}`) : `Bu kez olmadı. Doğru anlam: ${question.meaning}.`;
        feedback.classList.add(correct ? "good" : "bad");
        const next = panel.querySelector("[data-sprint-next]"); next.hidden = false; next.textContent = round === questions.length - 1 ? "Sonucu gör" : "Sonraki kelime →";
        return;
      }
      if (event.target.closest("[data-sprint-next]") && answered) { round++; if (round < questions.length) showRound(); else finish(); }
    });
  }
  function init() {
    renderNav(document.body.dataset.unit || "");
    const activeId=document.body.dataset.unit;
    const lesson=lessons.find(item=>item.id===activeId);
    if(activeId && lesson) renderLesson(lesson); else renderHome();
    updateProgressUI();
    const toggle=document.querySelector(".menu-toggle"), sidebar=document.querySelector(".sidebar");
    if(toggle&&sidebar)toggle.addEventListener("click",()=>{const open=sidebar.classList.toggle("open");toggle.setAttribute("aria-expanded",String(open));});
    document.addEventListener("click",event=>{if(sidebar?.classList.contains("open")&&!sidebar.contains(event.target)&&!toggle.contains(event.target)){sidebar.classList.remove("open");toggle.setAttribute("aria-expanded","false");}});
    document.querySelectorAll(".unit-link").forEach(link=>link.addEventListener("click",()=>{if(sidebar?.classList.contains("open")){sidebar.classList.remove("open");toggle.setAttribute("aria-expanded","false");}}));
  }
  document.addEventListener("DOMContentLoaded",init);
})();
