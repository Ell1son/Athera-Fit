// ========================================
// КОНФИГ
// ========================================

const STORAGE_KEY = "kbjuAppStateV1";

const GOAL_PRESETS = {
    cut:      { split: [0.35, 0.25, 0.40], label: "Похудение" },
    maintain: { split: [0.25, 0.30, 0.45], label: "Поддержание" },
    bulk:     { split: [0.25, 0.25, 0.50], label: "Набор" }
};

const ACTIVITY_MULTIPLIER = { sedentary: 1.2, light: 1.3, moderate: 1.45, active: 1.6 };
const WORKTYPE_MET = { cardio: 8, strength: 5, mixed: 6.5, light: 3 };
const PACE_WEEKLY_KG = { slow: 0.25, medium: 0.5, fast: 0.75 };

// база продуктов: [название, ккал, белки, жиры, углеводы] на 100г
const DB = [
["Гречка (вареная)",92,3.2,0.6,19.9],["Рис белый (вареный)",116,2.2,0.5,25],
["Рис бурый (вареный)",111,2.6,0.9,23],["Овсянка на воде",88,3,1.7,15],
["Макароны (вареные)",131,5.1,1.1,25],["Хлеб белый",265,7.9,3.2,49.4],
["Хлеб ржаной",214,6.6,1.2,40.7],["Хлеб цельнозерновой",247,9,3.5,46],
["Курица грудка (варёная)",137,29.8,1.8,0.5],["Курица бедро (жареное)",211,20.5,13.4,0],
["Говядина (варёная)",254,25.8,16.8,0],["Свинина (варёная)",257,23.4,17.8,0],
["Индейка грудка (варёная)",130,25,3.5,0],["Яйцо куриное (варёное)",155,12.6,10.6,1.1],
["Творог 5%",121,17.2,5,1.8],["Творог обезжиренный",71,18,0.6,1.5],
["Йогурт натуральный",66,5,3.2,4.7],["Кефир 1%",40,2.8,1,4],
["Молоко 2.5%",52,2.8,2.5,4.7],["Сыр твёрдый (среднее)",363,25,29,0.3],
["Лосось (запечённый)",208,22,13,0],["Тунец консерв. в собств.соку",96,23,1,0],
["Треска (варёная)",78,17.8,0.7,0],["Креветки (варёные)",95,19,1.4,0],
["Картофель (варёный)",82,2,0.4,16.7],["Картофель фри",312,3.4,15,41.2],
["Морковь (сырая)",41,0.9,0.2,9.6],["Капуста белокочанная",25,1.3,0.1,4.7],
["Брокколи (варёная)",35,2.4,0.4,7.2],["Огурец",15,0.7,0.1,3.6],
["Помидор",20,1.1,0.2,3.9],["Перец болгарский",27,1.3,0.1,5.3],
["Авокадо",160,2,14.7,8.5],["Банан",96,1.5,0.5,21],
["Яблоко",47,0.4,0.4,9.8],["Апельсин",43,0.9,0.2,8.1],
["Груша",42,0.4,0.3,10.3],["Виноград",65,0.6,0.6,16.8],
["Клубника",30,0.7,0.4,6.3],["Орехи грецкие",654,15.2,65.2,13.7],
["Миндаль",579,21.2,49.9,21.6],["Арахис (жареный)",567,26,49,16],
["Масло сливочное",748,0.5,82.5,0.8],["Масло оливковое",898,0,99.8,0],
["Сметана 20%",206,2.8,20,3.2],["Мёд",304,0.8,0,81.5],
["Шоколад тёмный 70%",546,7.8,42.6,24.4],["Фасоль (варёная)",123,8.4,0.5,21.4],
["Чечевица (варёная)",116,9,0.4,20.1],["Тофу",76,8.1,4.2,1.9],
["Пельмени (варёные)",275,11.5,12.3,29.5],["Борщ со сметаной",49,2,2.3,5.3],
["Плов с курицей",190,8.5,7.5,22],["Пицца Маргарита",266,11,10,33],
["Шаурма",235,12,13,18],["Бургер классический",295,17,14,25],
["Куриный бульон",30,3,1.5,1.5],["Протеиновый батончик",380,30,12,35]
];

// ========================================
// СОСТОЯНИЕ
// ========================================

// premium передаётся ботом в URL при открытии Web App: ?premium=1
// а также сохраняется локально, чтобы не терять статус между сессиями
const urlParams = new URLSearchParams(window.location.search);
const premiumFromUrl = urlParams.get("premium");
if (premiumFromUrl !== null) {
    localStorage.setItem("kbju_premium", premiumFromUrl === "1" ? "1" : "0");
}
const isPremium = () => localStorage.getItem("kbju_premium") === "1";

const todayKey = new Date().toISOString().slice(0, 10);

function readNum(key, fallback) {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === "") return fallback;
    const n = Number(raw);
    return Number.isNaN(n) ? fallback : n;
}

let state = {
    gender: localStorage.getItem("kbju_gender") || "male",
    age: readNum("kbju_age", null),
    height: readNum("kbju_height", null),
    weight: readNum("kbju_weight", null),
    steps: readNum("kbju_steps", null),
    activity: localStorage.getItem("kbju_activity") || null,
    workouts: readNum("kbju_workouts", null),
    duration: readNum("kbju_duration", 20),
    worktype: localStorage.getItem("kbju_worktype") || "light",
    goalType: localStorage.getItem("kbju_goal_type") || "maintain",
    pace: localStorage.getItem("kbju_pace") || "medium",
    goal: readNum("kbju_goal", 2000),
    entries: JSON.parse(localStorage.getItem("kbju_entries") || "null") || []
};
if (localStorage.getItem("kbju_day") !== todayKey) {
    state.entries = [];
    localStorage.setItem("kbju_day", todayKey);
}

let appState = localStorage.getItem("kbju_onboarded") === "1" ? "main" : "onboarding";
let activeTab = "diary";
let pendingItem = null;

function saveEntries() {
    try {
        localStorage.setItem("kbju_entries", JSON.stringify(state.entries));
    } catch (e) { console.error("storage error", e); }
}

// ========================================
// РАСЧЁТЫ КАЛОРИЙНОСТИ (Миффлин-Сан Жеор + активность)
// ========================================

function calcBMR(s) {
    const base = 10 * (s.weight || 70) + 6.25 * (s.height || 170) - 5 * (s.age || 25);
    return s.gender === "female" ? base - 161 : base + 5;
}

function calcStepsKcal(s) {
    const extra = Math.max(0, (s.steps || 0) - 3000);
    return extra * (s.weight || 70) * 0.00045;
}

function calcExerciseKcal(s) {
    const workouts = s.workouts || 0;
    if (!workouts) return 0;
    const duration = s.duration || 30;
    const met = WORKTYPE_MET[s.worktype] || 4;
    const kcalPerMin = (met * 3.5 * (s.weight || 70)) / 200;
    return (workouts * duration * kcalPerMin) / 7;
}

function calcTDEE(s) {
    const bmr = calcBMR(s);
    const multiplier = ACTIVITY_MULTIPLIER[s.activity] || 1.2;
    return bmr * multiplier + calcStepsKcal(s) + calcExerciseKcal(s);
}

function calcPaceAdjustment(pace) {
    const weeklyKg = PACE_WEEKLY_KG[pace] || 0.5;
    return Math.round((weeklyKg * 7700) / 7);
}

function calcGoalKcal(s) {
    const tdee = calcTDEE(s);
    const bmr = calcBMR(s);
    let goal = tdee;
    if (s.goalType === "cut") goal = tdee - calcPaceAdjustment(s.pace);
    if (s.goalType === "bulk") goal = tdee + calcPaceAdjustment(s.pace);
    goal = Math.max(bmr * 1.05, goal);
    return Math.round(goal / 10) * 10;
}

function getTotals() {
    return state.entries.reduce((a, e) => ({
        kcal: a.kcal + e.kcal, p: a.p + e.p, f: a.f + e.f, c: a.c + e.c
    }), { kcal: 0, p: 0, f: 0, c: 0 });
}

function getMacroGoals() {
    const split = GOAL_PRESETS[state.goalType].split;
    return {
        p: (state.goal * split[0]) / 4,
        f: (state.goal * split[1]) / 9,
        c: (state.goal * split[2]) / 4
    };
}

function searchDB(q) {
    q = q.trim().toLowerCase();
    if (!q) return [];
    return DB.filter(item => item[0].toLowerCase().includes(q)).slice(0, 8);
}

// ========================================
// РЕНДЕР ПРИЛОЖЕНИЯ
// ========================================

function renderApp() {
    const app = document.getElementById("app");

    if (appState !== "main") {
        app.innerHTML = getOnboardingHtml();
        attachOnboardingEvents();
        return;
    }

    let content = "";
    if (activeTab === "diary") content = getDiaryHtml();
    if (activeTab === "premium") content = getPremiumHtml();
    if (activeTab === "profile") content = getProfileHtml();

    app.innerHTML = `
        <div class="app-shell">
            <div class="screen-inner page-enter">${content}</div>
        </div>
        ${getBottomNavHtml()}
        ${getAddModalHtml()}
        ${getPremiumModalHtml()}
        ${getScannerModalHtml()}
        ${getScannedProductModalHtml()}
    `;
    attachDiaryEvents();
    attachModalEvents();
    if (scannerOpen) startScanner();
}

function getBottomNavHtml() {
    const tabs = [
        { key: "diary", icon: "🍽️", label: "Дневник" },
        { key: "premium", icon: "✦", label: "Premium" },
        { key: "profile", icon: "◎", label: "Профиль" }
    ];
    return `<nav class="bottom-nav">${tabs.map(t => `
        <button class="nav-item ${activeTab === t.key ? "active" : ""}" onclick="switchTab('${t.key}')">
            <span class="nav-icon">${t.icon}</span>
            <span class="nav-label">${t.label}</span>
        </button>`).join("")}</nav>`;
}

function switchTab(tab) {
    activeTab = tab;
    renderApp();
}

// ========================================
// ОПРОС (ОНБОРДИНГ)
// ========================================

const ONBOARDING_STEPS = [
    {
        key: "gender", type: "select",
        title: "Какой у тебя пол?",
        subtitle: "Нужно для точного расчёта нормы калорий",
        options: [
            { value: "male", label: "Мужской" },
            { value: "female", label: "Женский" }
        ]
    },
    {
        key: "age", type: "number",
        title: "Сколько тебе лет?",
        placeholder: "Возраст", unit: "лет"
    },
    {
        key: "height", type: "number",
        title: "Какой у тебя рост?",
        placeholder: "Рост", unit: "см"
    },
    {
        key: "weight", type: "number",
        title: "Какой у тебя вес?",
        placeholder: "Вес", unit: "кг"
    },
    {
        key: "steps", type: "select",
        title: "Сколько шагов ты проходишь в среднем за день?",
        options: [
            { value: 2000, label: "Меньше 4 000" },
            { value: 6000, label: "4 000 – 8 000" },
            { value: 10000, label: "8 000 – 12 000" },
            { value: 14000, label: "Больше 12 000" }
        ]
    },
    {
        key: "activity", type: "select",
        title: "Какая у тебя повседневная активность?",
        subtitle: "Работа или учёба, без учёта тренировок",
        options: [
            { value: "sedentary", label: "Сидячая", sub: "Офис, учёба за столом" },
            { value: "light", label: "Лёгкая", sub: "Иногда на ногах" },
            { value: "moderate", label: "Средняя", sub: "Много на ногах в течение дня" },
            { value: "active", label: "Высокая", sub: "Физический труд" }
        ]
    },
    {
        key: "workouts", type: "select",
        title: "Сколько тренировок в неделю?",
        options: [
            { value: 0, label: "Не тренируюсь" },
            { value: 2, label: "1–2 раза" },
            { value: 4, label: "3–4 раза" },
            { value: 6, label: "5 и более" }
        ]
    },
    {
        key: "duration", type: "select",
        title: "Сколько длится тренировка?",
        skipIf: d => d.workouts === 0,
        options: [
            { value: 20, label: "До 30 минут" },
            { value: 37, label: "30 – 45 минут" },
            { value: 52, label: "45 – 60 минут" },
            { value: 70, label: "Больше часа" }
        ]
    },
    {
        key: "worktype", type: "select",
        title: "Какой у тебя тип тренировок?",
        skipIf: d => d.workouts === 0,
        options: [
            { value: "cardio", label: "Кардио" },
            { value: "strength", label: "Силовые" },
            { value: "mixed", label: "Смешанные" },
            { value: "light", label: "Лёгкие", sub: "Йога, растяжка, пилатес" }
        ]
    },
    {
        key: "goalType", type: "select",
        title: "Какая у тебя цель?",
        subtitle: "Норма калорий рассчитается автоматически",
        options: [
            { value: "cut", label: "Похудение" },
            { value: "maintain", label: "Поддержание" },
            { value: "bulk", label: "Набор массы" }
        ],
        preview: (value, draft) => {
            if (value === "maintain") {
                return `≈ ${Math.round(calcTDEE(draft) / 10) * 10} ккал`;
            }
            return `≈ ${calcGoalKcal({ ...draft, goalType: value, pace: "medium" })} ккал`;
        }
    },
    {
        key: "pace", type: "select",
        title: "Какой темп тебе нужен?",
        skipIf: d => d.goalType === "maintain",
        options: [
            { value: "slow", label: "Плавный", sub: "≈ 0.25 кг в неделю" },
            { value: "medium", label: "Средний", sub: "≈ 0.5 кг в неделю" },
            { value: "fast", label: "Быстрый", sub: "≈ 0.75 кг в неделю" }
        ],
        preview: (value, draft) => `≈ ${calcGoalKcal({ ...draft, pace: value })} ккал`
    }
];

function makeOnboardingDraft() {
    return {
        gender: state.gender || "male",
        age: state.age || null,
        height: state.height || null,
        weight: state.weight || null,
        steps: state.steps || null,
        activity: state.activity || null,
        workouts: state.workouts ?? null,
        duration: state.duration || 20,
        worktype: state.worktype || "light",
        goalType: state.goalType || null,
        pace: state.pace || "medium"
    };
}

let onboardingDraft = makeOnboardingDraft();
let onboardingStepIndex = 0;

function getVisibleSteps(draft) {
    return ONBOARDING_STEPS.filter(st => !st.skipIf || !st.skipIf(draft));
}

function getOnboardingHtml() {
    const steps = getVisibleSteps(onboardingDraft);
    const step = steps[Math.min(onboardingStepIndex, steps.length - 1)];
    const total = steps.length;
    const pct = Math.min(100, Math.round((onboardingStepIndex / total) * 100));

    let body;
    if (step.type === "number") {
        const val = onboardingDraft[step.key] ?? "";
        body = `
            <h2>${step.title}</h2>
            ${step.subtitle ? `<p class="subtitle">${step.subtitle}</p>` : ""}
            <div class="onb-unit-wrap">
                <input type="number" inputmode="decimal" id="onbInput" placeholder="${step.placeholder}" value="${val}">
                ${step.unit ? `<span class="onb-unit-suffix">${step.unit}</span>` : ""}
            </div>
            <div class="onb-actions">
                ${onboardingStepIndex > 0 ? `<button class="btn-back" onclick="onboardingBack()">←</button>` : ""}
                <button class="btn btn-add btn-next" onclick="onboardingSubmitNumber()">Далее →</button>
            </div>`;
    } else {
        const options = step.options.map(opt => {
            const selected = onboardingDraft[step.key] === opt.value;
            const preview = step.preview ? step.preview(opt.value, onboardingDraft) : null;
            return `
                <button class="onb-option ${selected ? "selected" : ""}" data-value="${opt.value}" data-numeric="${typeof opt.value === "number" ? "1" : "0"}">
                    <span class="onb-option-text">
                        <span class="onb-option-label">${opt.label}</span>
                        ${opt.sub ? `<span class="onb-option-sub">${opt.sub}</span>` : ""}
                    </span>
                    <span class="onb-option-right">
                        ${preview ? `<span class="onb-option-preview">${preview}</span>` : ""}
                        <span class="onb-option-check"></span>
                    </span>
                </button>`;
        }).join("");
        body = `
            <h2>${step.title}</h2>
            ${step.subtitle ? `<p class="subtitle">${step.subtitle}</p>` : ""}
            <div class="onb-options">${options}</div>
            <div class="onb-actions">
                ${onboardingStepIndex > 0 ? `<button class="btn-back" onclick="onboardingBack()">←</button>` : ""}
            </div>`;
    }

    return `
        <div class="onb-shell">
            <div class="onb-top">
                <div class="onb-progress-track"><div class="onb-progress-fill" style="width:${pct}%"></div></div>
                <div class="onb-step-count">Шаг ${onboardingStepIndex + 1} из ${total}</div>
            </div>
            <div class="onb-body page-enter">${body}</div>
        </div>`;
}

function attachOnboardingEvents() {
    document.querySelectorAll(".onb-option").forEach(btn => {
        btn.addEventListener("click", () => {
            const raw = btn.dataset.value;
            const val = btn.dataset.numeric === "1" ? Number(raw) : raw;
            onboardingSelect(val);
        });
    });
    const onbInput = document.getElementById("onbInput");
    if (onbInput) {
        onbInput.addEventListener("keydown", e => {
            if (e.key === "Enter") onboardingSubmitNumber();
        });
    }
}

function onboardingSubmitNumber() {
    const steps = getVisibleSteps(onboardingDraft);
    const step = steps[onboardingStepIndex];
    const val = Number(document.getElementById("onbInput").value);
    if (!val || val <= 0) { alert("Заполни поле, чтобы продолжить"); return; }
    onboardingDraft[step.key] = val;
    onboardingNext();
}

function onboardingSelect(value) {
    const steps = getVisibleSteps(onboardingDraft);
    const step = steps[onboardingStepIndex];
    onboardingDraft[step.key] = value;
    onboardingNext();
}

function onboardingNext() {
    onboardingStepIndex++;
    const steps = getVisibleSteps(onboardingDraft);
    if (onboardingStepIndex >= steps.length) { finishOnboarding(); return; }
    renderApp();
}

function onboardingBack() {
    if (onboardingStepIndex === 0) return;
    onboardingStepIndex--;
    renderApp();
}

function finishOnboarding() {
    const d = onboardingDraft;
    state.gender = d.gender;
    state.age = d.age;
    state.height = d.height;
    state.weight = d.weight;
    state.steps = d.steps;
    state.activity = d.activity;
    state.workouts = d.workouts;
    state.duration = d.duration;
    state.worktype = d.worktype;
    state.goalType = d.goalType;
    state.pace = d.pace;
    state.goal = calcGoalKcal(state);

    localStorage.setItem("kbju_gender", state.gender);
    localStorage.setItem("kbju_age", state.age);
    localStorage.setItem("kbju_height", state.height);
    localStorage.setItem("kbju_weight", state.weight);
    localStorage.setItem("kbju_steps", state.steps);
    localStorage.setItem("kbju_activity", state.activity);
    localStorage.setItem("kbju_workouts", state.workouts);
    localStorage.setItem("kbju_duration", state.duration);
    localStorage.setItem("kbju_worktype", state.worktype);
    localStorage.setItem("kbju_goal_type", state.goalType);
    localStorage.setItem("kbju_pace", state.pace);
    localStorage.setItem("kbju_goal", state.goal);
    localStorage.setItem("kbju_onboarded", "1");

    appState = "main";
    activeTab = "diary";
    renderApp();
}

function restartOnboarding() {
    onboardingDraft = makeOnboardingDraft();
    onboardingStepIndex = 0;
    appState = "onboarding";
    renderApp();
}

// ========================================
// ВКЛАДКА "ДНЕВНИК"
// ========================================

function getDiaryHtml() {
    const totals = getTotals();
    const mGoals = getMacroGoals();
    const goals = ["cut", "maintain", "bulk"];

    return `
        <h2>Дневник <span class="accent">питания</span></h2>
        <p class="subtitle">${new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}</p>

        <div class="goal-tabs">
            ${goals.map(g => `
                <button class="goal-btn ${state.goalType === g ? "active" : ""}" onclick="setGoalType('${g}')">
                    ${GOAL_PRESETS[g].label}
                </button>`).join("")}
        </div>

        <div class="totals-card">
            <div class="kcal-row">
                <div class="kcal-num">${Math.round(totals.kcal)}</div>
                <div class="kcal-of">ккал из <input class="goal-input" type="number" id="goalInput" value="${state.goal}"></div>
            </div>
            <div class="macros">
                <div class="macro">
                    <div class="macro-top"><span>Белки</span><span>${Math.round(totals.p)}г</span></div>
                    <div class="macro-bar"><div class="macro-fill" style="background:var(--green);width:${Math.min(100, totals.p / mGoals.p * 100)}%"></div></div>
                </div>
                <div class="macro">
                    <div class="macro-top"><span>Жиры</span><span>${Math.round(totals.f)}г</span></div>
                    <div class="macro-bar"><div class="macro-fill" style="background:var(--red);width:${Math.min(100, totals.f / mGoals.f * 100)}%"></div></div>
                </div>
                <div class="macro">
                    <div class="macro-top"><span>Углеводы</span><span>${Math.round(totals.c)}г</span></div>
                    <div class="macro-bar"><div class="macro-fill" style="background:var(--blue);width:${Math.min(100, totals.c / mGoals.c * 100)}%"></div></div>
                </div>
            </div>
        </div>

        <div class="premium-row">
            <div class="premium-card" onclick="${isPremium() ? "openBarcodeScanner()" : "openPremiumModal()"}">
                ${!isPremium() ? '<span class="pc-badge">Premium</span>' : ""}
                <div class="pc-title">📷 Скан штрихкода</div>
                <div class="pc-sub">${isPremium() ? "Нажми и наведи камеру" : "Наведи камеру — найдём сам"}</div>
            </div>
            <div class="premium-card" onclick="${isPremium() ? "" : "openPremiumModal()"}">
                ${!isPremium() ? '<span class="pc-badge">Premium</span>' : ""}
                <div class="pc-title">🧪 Микроэлементы</div>
                <div class="pc-sub">${isPremium() ? "Клетчатка, сахар, натрий" : "Расширенные данные"}</div>
            </div>
        </div>

        <input type="text" id="searchInput" placeholder="Найти продукт: гречка, курица, яблоко…">
        <div class="results" id="results" style="display:none"></div>

        <div class="section-title">Сегодня съедено</div>
        <div class="log" id="log">${getLogHtml()}</div>
    `;
}

function getLogHtml() {
    if (state.entries.length === 0) {
        return `<div class="log-empty">Пока пусто — найди продукт выше и добавь запись</div>`;
    }
    return state.entries.map(e => `
        <div class="log-item">
            <div style="flex:1">
                <div class="log-name">${e.name}</div>
                <div class="log-meta">${e.grams} г</div>
            </div>
            <div class="log-kcal">${Math.round(e.kcal)}</div>
            <button class="del-btn" data-id="${e.id}" aria-label="Удалить">✕</button>
        </div>`).join("");
}

function setGoalType(type) {
    state.goalType = type;
    state.goal = calcGoalKcal(state);
    localStorage.setItem("kbju_goal_type", type);
    localStorage.setItem("kbju_goal", state.goal);
    renderApp();
}

function attachDiaryEvents() {
    const searchInput = document.getElementById("searchInput");
    const resultsEl = document.getElementById("results");
    const goalInput = document.getElementById("goalInput");
    const logEl = document.getElementById("log");
    if (!searchInput) return;

    searchInput.addEventListener("input", () => {
        const items = searchDB(searchInput.value);
        if (!searchInput.value.trim()) { resultsEl.style.display = "none"; return; }
        resultsEl.style.display = "block";
        resultsEl.innerHTML = items.length === 0
            ? `<div class="empty-note">Ничего не найдено</div>`
            : items.map(it => `
                <div class="result-item" data-idx="${DB.indexOf(it)}">
                    <span>${it[0]}</span>
                    <span class="result-kcal">${it[1]} ккал/100г</span>
                </div>`).join("");
    });

    resultsEl.addEventListener("click", e => {
        const row = e.target.closest(".result-item");
        if (!row) return;
        openAddModal(DB[Number(row.dataset.idx)]);
    });

    goalInput.addEventListener("change", () => {
        state.goal = Number(goalInput.value) || 2000;
        localStorage.setItem("kbju_goal", state.goal);
        renderApp();
    });

    logEl.addEventListener("click", e => {
        const btn = e.target.closest(".del-btn");
        if (!btn) return;
        state.entries = state.entries.filter(en => en.id !== Number(btn.dataset.id));
        saveEntries();
        renderApp();
    });
}

// ========================================
// МОДАЛКА ДОБАВЛЕНИЯ ПРОДУКТА
// ========================================

function getAddModalHtml() {
    if (!pendingItem) return `<div class="modal-overlay" id="overlay"></div>`;
    const [name, kcal, p, f, c] = pendingItem;
    return `
        <div class="modal-overlay open" id="overlay">
            <div class="modal">
                <h3>${name}</h3>
                <div class="sub">${kcal} ккал · Б${p} Ж${f} У${c} на 100г</div>
                <input type="text" inputmode="numeric" id="gramInput" placeholder="Граммы" value="100">
                <div class="modal-actions">
                    <button class="btn btn-cancel" onclick="closeAddModal()">Отмена</button>
                    <button class="btn btn-add" onclick="confirmAdd()">Добавить</button>
                </div>
            </div>
        </div>`;
}

function openAddModal(item) { pendingItem = item; renderApp(); }
function closeAddModal() { pendingItem = null; renderApp(); }

function confirmAdd() {
    const grams = Number(document.getElementById("gramInput").value) || 0;
    if (grams <= 0 || !pendingItem) return;
    const factor = grams / 100;
    state.entries.push({
        name: pendingItem[0], grams,
        kcal: pendingItem[1] * factor, p: pendingItem[2] * factor,
        f: pendingItem[3] * factor, c: pendingItem[4] * factor,
        id: Date.now()
    });
    saveEntries();
    pendingItem = null;
    renderApp();
}

// ========================================
// ВКЛАДКА PREMIUM
// ========================================

let premiumModalOpen = false;

function getPremiumHtml() {
    if (isPremium()) {
        return `
            <h2>Твой <span class="accent">Premium</span></h2>
            <p class="subtitle">Все функции разблокированы</p>
            <div class="plan-card">
                <div class="pc-title" style="font-size:16px">📷 Скан штрихкода</div>
                <p class="subtitle" style="margin-top:6px">Наведи камеру на упаковку — продукт добавится автоматически</p>
            </div>
            <div class="plan-card">
                <div class="pc-title" style="font-size:16px">🧪 Микроэлементы</div>
                <p class="subtitle" style="margin-top:6px">Клетчатка, сахар, натрий и витамины по каждому продукту</p>
            </div>
        `;
    }
    return `
        <h2>Открой <span class="accent">Premium</span></h2>
        <p class="subtitle">Разблокируй за Telegram Stars прямо в боте</p>
        <div class="plan-card">
            <div class="pc-title" style="font-size:17px">Premium доступ</div>
            <div class="plan-price">⭐ 50</div>
            <ul class="premium-list">
                <li>Скан штрихкода товара</li>
                <li>Микроэлементы: клетчатка, сахар, натрий</li>
                <li>Расширенная база продуктов</li>
            </ul>
            <button class="btn btn-gold" style="width:100%" onclick="openPremiumModal()">Оформить</button>
        </div>
    `;
}

function getPremiumModalHtml() {
    return `
        <div class="modal-overlay ${premiumModalOpen ? "open" : ""}" id="premiumOverlay">
            <div class="modal">
                <h3>Premium ⭐</h3>
                <div class="sub">Оплата проходит в самом Telegram-боте</div>
                <p class="subtitle" style="margin-bottom:0">Вернись в чат с ботом и нажми «Оформить Premium» — оплата в Telegram Stars займёт пару секунд, доступ откроется сразу.</p>
                <div class="modal-actions">
                    <button class="btn btn-cancel" onclick="closePremiumModal()">Понятно</button>
                </div>
            </div>
        </div>`;
}

function openPremiumModal() { premiumModalOpen = true; renderApp(); }
function closePremiumModal() { premiumModalOpen = false; renderApp(); }

function attachModalEvents() {
    document.getElementById("overlay")?.addEventListener("click", e => {
        if (e.target.id === "overlay") closeAddModal();
    });
    document.getElementById("premiumOverlay")?.addEventListener("click", e => {
        if (e.target.id === "premiumOverlay") closePremiumModal();
    });
    document.getElementById("scannedOverlay")?.addEventListener("click", e => {
        if (e.target.id === "scannedOverlay") closeScannedModal();
    });
}

// ========================================
// ВКЛАДКА ПРОФИЛЬ
// ========================================

const ACTIVITY_LABEL = { sedentary: "Сидячая", light: "Лёгкая", moderate: "Средняя", active: "Высокая" };

function getProfileHtml() {
    return `
        <h2>Твой <span class="accent">профиль</span></h2>
        <p class="subtitle">${GOAL_PRESETS[state.goalType].label} · ${state.goal} ккал/день</p>

        <div class="stat-grid">
            <div class="stat-box"><div class="stat-label">Вес</div><div class="stat-value">${state.weight || "—"} кг</div></div>
            <div class="stat-box"><div class="stat-label">Рост</div><div class="stat-value">${state.height || "—"} см</div></div>
            <div class="stat-box"><div class="stat-label">Возраст</div><div class="stat-value">${state.age || "—"} лет</div></div>
            <div class="stat-box"><div class="stat-label">Активность</div><div class="stat-value">${ACTIVITY_LABEL[state.activity] || "—"}</div></div>
        </div>

        <div class="plan-card">
            <div class="pc-title" style="font-size:16px">Тариф</div>
            <div class="plan-price" style="color:${isPremium() ? "var(--green)" : "var(--muted)"}">${isPremium() ? "Premium" : "Бесплатный"}</div>
            ${isPremium()
                ? `<div class="plan-unlocked">✓ Все функции открыты</div>`
                : `<button class="btn btn-gold" style="width:100%" onclick="switchTab('premium')">Открыть Premium</button>`}
        </div>
        <button class="secondary-btn" onclick="restartOnboarding()">Пройти опрос заново</button>
        <button class="secondary-btn" onclick="resetProgress()">Очистить дневник за сегодня</button>
    `;
}

function resetProgress() {
    if (!confirm("Удалить все записи за сегодня?")) return;
    state.entries = [];
    saveEntries();
    renderApp();
}

// ========================================
// СКАНЕР ШТРИХКОДА (только Premium)
// ========================================

let scannerOpen = false;
let scannedProduct = null;   // данные продукта с Open Food Facts
let scanStatus = "Наведи камеру на штрихкод";
let scanError = "";
let html5QrInstance = null;

function openBarcodeScanner() {
    scannerOpen = true;
    scanStatus = "Наведи камеру на штрихкод";
    scanError = "";
    renderApp();
}

function closeScanner() {
    scannerOpen = false;
    if (html5QrInstance) {
        html5QrInstance.stop().catch(() => {});
        html5QrInstance = null;
    }
    renderApp();
}

function getScannerModalHtml() {
    return `
        <div class="modal-overlay ${scannerOpen ? "open" : ""}" id="scannerOverlay">
            <div class="modal">
                <h3>Скан штрихкода</h3>
                <div id="reader"></div>
                ${scanError ? `<div class="scan-error">${scanError}</div>` : `<div class="scan-status">${scanStatus}</div>`}
                <div class="modal-actions">
                    <button class="btn btn-cancel" onclick="closeScanner()">Закрыть</button>
                </div>
            </div>
        </div>`;
}

function startScanner() {
    // библиотека html5-qrcode должна быть подключена в index.html
    if (typeof Html5Qrcode === "undefined") {
        scanError = "Библиотека сканера не загрузилась. Проверь подключение html5-qrcode.js";
        renderApp();
        return;
    }
    html5QrInstance = new Html5Qrcode("reader");
    html5QrInstance.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 140 } },
        (decodedText) => {
            // штрихкод найден — останавливаем камеру и ищем продукт
            html5QrInstance.stop().catch(() => {});
            html5QrInstance = null;
            scannerOpen = false;
            lookupBarcode(decodedText);
        },
        () => { /* кадр без штрихкода — молча пропускаем */ }
    ).catch(err => {
        scanError = "Нет доступа к камере. Разреши доступ в настройках браузера.";
        console.error(err);
        renderApp();
    });
}

async function lookupBarcode(code) {
    scanStatus = "Ищу продукт…";
    renderApp();
    try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`);
        const data = await res.json();

        if (data.status !== 1 || !data.product) {
            alert("Продукт не найден в базе Open Food Facts по этому штрихкоду.");
            return;
        }

        const p = data.product;
        const n = p.nutriments || {};

        scannedProduct = {
            name: p.product_name_ru || p.product_name || "Без названия",
            kcal: n["energy-kcal_100g"] ?? 0,
            p: n["proteins_100g"] ?? 0,
            f: n["fat_100g"] ?? 0,
            c: n["carbohydrates_100g"] ?? 0,
            fiber: n["fiber_100g"],
            sugar: n["sugars_100g"],
            sodium: n["sodium_100g"],
            satFat: n["saturated-fat_100g"],
            salt: n["salt_100g"]
        };

        renderApp();
    } catch (e) {
        console.error(e);
        alert("Не удалось связаться с Open Food Facts. Проверь интернет-соединение.");
    }
}

function getScannedProductModalHtml() {
    if (!scannedProduct) return "";
    const sp = scannedProduct;

    const microRows = [
        ["Клетчатка", sp.fiber, "г"],
        ["Сахар", sp.sugar, "г"],
        ["Насыщенные жиры", sp.satFat, "г"],
        ["Соль", sp.salt, "г"],
        ["Натрий", sp.sodium, "г"]
    ].filter(row => row[1] !== undefined && row[1] !== null);

    return `
        <div class="modal-overlay open" id="scannedOverlay">
            <div class="modal">
                <h3>${sp.name}</h3>
                <div class="sub">${Math.round(sp.kcal)} ккал · Б${sp.p} Ж${sp.f} У${sp.c} на 100г</div>

                ${microRows.length ? `
                    <div class="micro-list">
                        ${microRows.map(([label, val, unit]) => `
                            <div class="micro-row"><span>${label}</span><span>${val}${unit}/100г</span></div>
                        `).join("")}
                    </div>` : `<p class="subtitle">Микроэлементы для этого продукта не указаны производителем</p>`}

                <input type="text" inputmode="numeric" id="scanGramInput" placeholder="Граммы" value="100">
                <div class="modal-actions">
                    <button class="btn btn-cancel" onclick="closeScannedModal()">Отмена</button>
                    <button class="btn btn-add" onclick="confirmAddScanned()">Добавить</button>
                </div>
            </div>
        </div>`;
}

function closeScannedModal() { scannedProduct = null; renderApp(); }

function confirmAddScanned() {
    const grams = Number(document.getElementById("scanGramInput").value) || 0;
    if (grams <= 0 || !scannedProduct) return;
    const factor = grams / 100;
    const sp = scannedProduct;
    state.entries.push({
        name: sp.name, grams,
        kcal: sp.kcal * factor, p: sp.p * factor, f: sp.f * factor, c: sp.c * factor,
        id: Date.now()
    });
    saveEntries();
    scannedProduct = null;
    renderApp();
}

// ========================================
// ЗАПУСК
// ========================================

if (window.Telegram?.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
}

renderApp();