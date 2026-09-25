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

// база упражнений: [id, название, группа мышц]
const GROUP_LABELS = {
    chest: "Грудь", back: "Спина", legs: "Ноги",
    shoulders: "Плечи", arms: "Руки", core: "Пресс", cardio: "Кардио"
};
const GROUP_ICON = {
    chest: "🏋️", back: "🧗", legs: "🦵",
    shoulders: "🤸", arms: "💪", core: "🔥", cardio: "🏃"
};

const EXERCISES = [
    ["bench_press","Жим штанги лёжа","chest"],["db_bench_press","Жим гантелей лёжа","chest"],
    ["incline_bench","Жим штанги на наклонной скамье","chest"],["incline_db_press","Жим гантелей на наклонной скамье","chest"],
    ["db_fly","Разводка гантелей лёжа","chest"],["dips","Отжимания на брусьях","chest"],
    ["pushups","Отжимания от пола","chest"],["cable_crossover","Кроссовер на блоках","chest"],
    ["db_pullover","Пуловер с гантелей","chest"],["smith_bench","Жим в машине Смита","chest"],

    ["deadlift","Становая тяга","back"],["barbell_row","Тяга штанги в наклоне","back"],
    ["db_row","Тяга гантели одной рукой","back"],["pullup_wide","Подтягивания широким хватом","back"],
    ["pullup_narrow","Подтягивания узким хватом","back"],["lat_pulldown","Тяга верхнего блока","back"],
    ["seated_row","Тяга нижнего блока (гребля)","back"],["hyperextension","Гиперэкстензия","back"],
    ["barbell_shrug","Шраги со штангой","back"],["t_bar_row","Тяга Т-грифа","back"],

    ["barbell_squat","Приседания со штангой","legs"],["leg_press","Жим ногами","legs"],
    ["db_lunge","Выпады с гантелями","legs"],["romanian_deadlift","Румынская тяга","legs"],
    ["leg_extension","Разгибание ног в тренажёре","legs"],["leg_curl","Сгибание ног лёжа","legs"],
    ["calf_raise_standing","Подъём на носки стоя","legs"],["calf_raise_seated","Подъём на носки сидя","legs"],
    ["smith_squat","Приседания в Смите","legs"],["bulgarian_split_squat","Болгарские выпады","legs"],

    ["ohp","Жим штанги стоя","shoulders"],["db_shoulder_press","Жим гантелей сидя","shoulders"],
    ["lateral_raise","Махи гантелями в стороны","shoulders"],["bent_over_raise","Махи гантелями в наклоне","shoulders"],
    ["upright_row","Тяга штанги к подбородку","shoulders"],["arnold_press","Жим Арнольда","shoulders"],
    ["reverse_fly_machine","Обратные разводки в тренажёре","shoulders"],["front_raise","Подъём штанги перед собой","shoulders"],

    ["barbell_curl","Подъём штанги на бицепс","arms"],["db_curl","Подъём гантелей на бицепс","arms"],
    ["hammer_curl","Молотки с гантелями","arms"],["skull_crusher","Французский жим лёжа","arms"],
    ["cable_pushdown","Разгибание рук на блоке","arms"],["close_grip_bench","Жим узким хватом","arms"],
    ["concentration_curl","Концентрированный подъём на бицепс","arms"],["db_overhead_extension","Разгибание руки с гантелей из-за головы","arms"],

    ["crunches","Скручивания","core"],["leg_raise_hanging","Подъём ног в висе","core"],
    ["plank","Планка","core"],["cable_crunch","Скручивания на блоке","core"],
    ["russian_twist","Русские скручивания","core"],["bicycle_crunch","Велосипед","core"],
    ["knee_raise","Подъём коленей в упоре","core"],

    ["treadmill","Бег на дорожке","cardio"],["bike","Велотренажёр","cardio"],
    ["rowing_machine","Гребной тренажёр","cardio"],["jump_rope","Скакалка","cardio"],
    ["elliptical","Эллипсоид","cardio"],["burpees","Бёрпи","cardio"]
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
function readJSON(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
}
function saveJSON(key, obj) {
    try { localStorage.setItem(key, JSON.stringify(obj)); }
    catch (e) { console.error("storage error", e); }
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
    entries: JSON.parse(localStorage.getItem("kbju_entries") || "null") || [],
    programs: readJSON("kbju_programs", []),
    exerciseHistory: readJSON("kbju_exercise_history", {}),
    exerciseIcons: readJSON("kbju_exercise_icons", {})
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
    if (activeTab === "workouts") content = getWorkoutsHtml();
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
    attachWorkoutsEvents();
    if (scannerOpen) startScanner();
}

function getBottomNavHtml() {
    const tabs = [
        { key: "diary", icon: "🍽️", label: "Дневник" },
        { key: "workouts", icon: "🏋️", label: "Тренировки" },
        { key: "premium", icon: "✦", label: "Premium" },
        { key: "profile", icon: "◎", label: "Профиль" }
    ];
    return `<nav class="bottom-nav">${tabs.map(t => `
        <button class="nav-item ${activeTab === t.key ? "active" : ""}" data-key="${t.key}" onclick="switchTab('${t.key}')">
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
// ВКЛАДКА "ТРЕНИРОВКИ" — программы и подходы
// ========================================

let workoutsView = "list";      // "list" | "detail" | "picker"
let activeProgramId = null;
let workoutSearch = "";

function getExerciseById(id) {
    const row = EXERCISES.find(e => e[0] === id);
    return row ? { id: row[0], name: row[1], group: row[2] } : null;
}

function renderExerciseIcon(ex) {
    const customUrl = state.exerciseIcons[ex.id];
    if (customUrl) return `<img src="${customUrl}" class="ex-icon-img" alt="">`;
    return `<span class="ex-icon-emoji">${GROUP_ICON[ex.group]}</span>`;
}

function promptSetIcon(id, ev) {
    if (ev) ev.stopPropagation();
    const current = state.exerciseIcons[id] || "";
    const url = prompt("Ссылка на картинку или GIF для упражнения (оставь пустым, чтобы убрать):", current);
    if (url === null) return;
    if (url.trim() === "") delete state.exerciseIcons[id];
    else state.exerciseIcons[id] = url.trim();
    saveJSON("kbju_exercise_icons", state.exerciseIcons);
    renderApp();
}

function findProgram(id) { return state.programs.find(p => p.id === id); }

function bestSet(sets) {
    if (!sets || sets.length === 0) return null;
    return sets.reduce((b, s) => (!b || s.kg > b.kg || (s.kg === b.kg && s.reps > b.reps)) ? s : b, null);
}

// сравниваем лучший подход текущей сессии с лучшим за всю предыдущую историю
function getProgressInfo(exerciseId, currentSets) {
    const history = state.exerciseHistory[exerciseId] || [];
    if (history.length === 0) return { hasHistory: false, progressed: false, prevBest: null };
    const prevBest = history.reduce((b, h) => (!b || h.best.kg > b.kg || (h.best.kg === b.kg && h.best.reps > b.reps)) ? h.best : b, null);
    const curBest = bestSet(currentSets);
    const progressed = curBest && prevBest && (curBest.kg > prevBest.kg || (curBest.kg === prevBest.kg && curBest.reps > prevBest.reps));
    return { hasHistory: true, progressed, prevBest };
}

// строим компактный SVG-график прогрессии веса по сохранённым тренировкам
function renderProgressChart(exerciseId) {
    const history = state.exerciseHistory[exerciseId] || [];
    if (history.length === 0) return "";

    const points = history.slice(-8).map(h => h.best.kg);
    const n = points.length;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    const w = 100, h = 30, pad = 3;
    const step = n > 1 ? (w - pad * 2) / (n - 1) : 0;

    const coords = points.map((v, i) => {
        const x = n > 1 ? pad + i * step : w / 2;
        const y = pad + (h - pad * 2) * (1 - (v - min) / range);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const dots = points.map((v, i) => {
        const [x, y] = coords[i].split(",");
        const isLast = i === n - 1;
        return `<circle cx="${x}" cy="${y}" r="${isLast ? 2.6 : 1.6}" fill="${isLast ? "var(--accent)" : "var(--muted)"}" />`;
    }).join("");

    const polyline = n > 1
        ? `<polyline points="${coords.join(" ")}" fill="none" stroke="var(--accent)" stroke-width="1.6" vector-effect="non-scaling-stroke" />`
        : "";

    return `
        <div class="ex-chart">
            <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
                ${polyline}
                ${dots}
            </svg>
            <div class="ex-chart-labels"><span>${min}кг</span><span class="ex-chart-hint">${n} трен.</span><span>${max}кг</span></div>
        </div>`;
}

// ---------- Экран: список программ ----------

function getWorkoutsHtml() {
    if (workoutsView === "detail") return getProgramDetailHtml();
    if (workoutsView === "picker") return getPickerHtml();
    return getProgramListHtml();
}

function getProgramListHtml() {
    if (state.programs.length === 0) {
        return `
            <h2>Твои <span class="accent">программы</span></h2>
            <p class="subtitle">Собери тренировки под свои дни — например «Ноги», «Спина + бицепс»</p>
            <div class="log-empty" style="padding:34px 20px">Пока нет ни одной программы</div>
            <button class="btn btn-add" style="width:100%;margin-top:16px" onclick="createProgram()">+ Новая программа</button>
        `;
    }

    return `
        <h2>Твои <span class="accent">программы</span></h2>
        <p class="subtitle">${state.programs.length} программ${state.programs.length === 1 ? "а" : ""}</p>
        <div class="prog-list">
            ${state.programs.map(p => `
                <div class="prog-card" onclick="openProgram('${p.id}')">
                    <div class="prog-card-name">${p.name}</div>
                    <div class="prog-card-exercises">${
                        p.exercises.length === 0
                            ? "Пока нет упражнений"
                            : p.exercises.map(e => getExerciseById(e.exerciseId)?.name || "?").join(", ")
                    }</div>
                    <div class="prog-card-meta">${p.exercises.length} упражнени${p.exercises.length === 1 ? "е" : p.exercises.length < 5 ? "я" : "й"}</div>
                </div>`).join("")}
        </div>
        <button class="btn btn-add" style="width:100%;margin-top:16px" onclick="createProgram()">+ Новая программа</button>
    `;
}

function createProgram() {
    const name = prompt("Название программы (например «Ноги» или «Понедельник»):");
    if (!name || !name.trim()) return;
    const program = { id: "p" + Date.now(), name: name.trim(), exercises: [] };
    state.programs.push(program);
    saveJSON("kbju_programs", state.programs);
    activeProgramId = program.id;
    workoutsView = "detail";
    renderApp();
}

function openProgram(id) {
    activeProgramId = id;
    workoutsView = "detail";
    renderApp();
}

function backToProgramList() {
    commitActiveProgramInputs();
    workoutsView = "list";
    activeProgramId = null;
    renderApp();
}

function renameProgram() {
    const program = findProgram(activeProgramId);
    if (!program) return;
    const name = prompt("Новое название программы:", program.name);
    if (!name || !name.trim()) return;
    program.name = name.trim();
    saveJSON("kbju_programs", state.programs);
    renderApp();
}

function deleteProgram() {
    if (!confirm("Удалить эту программу? Действие необратимо.")) return;
    state.programs = state.programs.filter(p => p.id !== activeProgramId);
    saveJSON("kbju_programs", state.programs);
    workoutsView = "list";
    activeProgramId = null;
    renderApp();
}

// ---------- Экран: детали программы (таблица подходов) ----------

// считываем текущие значения инпутов из DOM и записываем в state,
// чтобы структурные изменения (добавление упражнения, переход назад) не стирали ввод
function commitActiveProgramInputs() {
    const program = findProgram(activeProgramId);
    if (!program) return;
    program.exercises.forEach(ex => {
        ex.sets.forEach((set, i) => {
            const kgEl = document.querySelector(`[data-ex="${ex.exerciseId}"][data-set="${i}"][data-field="kg"]`);
            const repsEl = document.querySelector(`[data-ex="${ex.exerciseId}"][data-set="${i}"][data-field="reps"]`);
            if (kgEl) set.kg = Number(kgEl.value) || 0;
            if (repsEl) set.reps = Number(repsEl.value) || 0;
        });
    });
    saveJSON("kbju_programs", state.programs);
}

function getProgramDetailHtml() {
    const program = findProgram(activeProgramId);
    if (!program) { workoutsView = "list"; return getProgramListHtml(); }

    return `
        <div class="detail-top">
            <button class="back-btn" onclick="backToProgramList()">←</button>
            <div class="detail-title">${program.name}</div>
            <button class="icon-btn" onclick="renameProgram()">✏️</button>
        </div>

        <div class="ex-list">
            ${program.exercises.length === 0
                ? `<div class="log-empty" style="padding:28px 16px">Добавь первое упражнение в программу</div>`
                : program.exercises.map(ex => getExerciseRowHtml(ex)).join("")}
        </div>

        <button class="btn btn-add" style="width:100%;margin-top:14px" onclick="openPicker()">+ Добавить упражнение</button>
        ${program.exercises.length > 0 ? `<button class="btn btn-add" style="width:100%;margin-top:10px" onclick="saveWorkoutSession()">✓ Сохранить тренировку</button>` : ""}
        <button class="secondary-btn" onclick="deleteProgram()">Удалить программу</button>
    `;
}

function getExerciseRowHtml(ex) {
    const info = getExerciseById(ex.exerciseId);
    if (!info) return "";
    const progress = getProgressInfo(ex.exerciseId, ex.sets);
    const doneCount = ex.sets.filter(s => s.done).length;

    return `
        <div class="ex-card">
            <div class="ex-card-top">
                <button class="ex-icon-btn" onclick="promptSetIcon('${ex.exerciseId}', event)">${renderExerciseIcon(info)}</button>
                <div class="ex-card-info">
                    <div class="ex-card-name">${info.name}</div>
                    <div class="ex-card-group">${GROUP_LABELS[info.group]}${doneCount > 0 ? ` · ${doneCount}/${ex.sets.length} выполнено` : ""}</div>
                </div>
                ${progress.hasHistory
                    ? (progress.progressed ? `<span class="progress-badge">📈 Прогресс</span>` : `<span class="progress-badge muted">Лучшее: ${progress.prevBest.kg}×${progress.prevBest.reps}</span>`)
                    : ""}
                <button class="ex-remove-btn" onclick="removeExerciseFromProgram('${ex.exerciseId}')" aria-label="Убрать">✕</button>
            </div>

            ${renderProgressChart(ex.exerciseId)}

            <div class="sets-table">
                <div class="sets-row sets-head"><span>Сет</span><span>Кг</span><span>Повт.</span><span></span><span></span></div>
                ${ex.sets.map((s, i) => `
                    <div class="sets-row ${s.done ? "set-done" : ""}">
                        <span class="set-num">${i + 1}</span>
                        <input type="text" inputmode="decimal" data-ex="${ex.exerciseId}" data-set="${i}" data-field="kg" value="${s.kg || ""}">
                        <input type="text" inputmode="numeric" data-ex="${ex.exerciseId}" data-set="${i}" data-field="reps" value="${s.reps || ""}">
                        <button class="set-check ${s.done ? "checked" : ""}" onclick="toggleSetDone('${ex.exerciseId}', ${i})" aria-label="Отметить подход выполненным"></button>
                        <button class="set-del-btn" onclick="removeSetRow('${ex.exerciseId}', ${i})">✕</button>
                    </div>`).join("")}
            </div>
            <button class="add-set-btn" onclick="addSetRow('${ex.exerciseId}')">+ Подход</button>
        </div>`;
}

function toggleSetDone(exerciseId, index) {
    commitActiveProgramInputs();
    const program = findProgram(activeProgramId);
    const ex = program.exercises.find(e => e.exerciseId === exerciseId);
    ex.sets[index].done = !ex.sets[index].done;
    saveJSON("kbju_programs", state.programs);
    renderApp();
}

function addSetRow(exerciseId) {
    commitActiveProgramInputs();
    const program = findProgram(activeProgramId);
    const ex = program.exercises.find(e => e.exerciseId === exerciseId);
    const last = ex.sets[ex.sets.length - 1];
    ex.sets.push({ kg: last ? last.kg : 0, reps: last ? last.reps : 0, done: false });
    saveJSON("kbju_programs", state.programs);
    renderApp();
}

function removeSetRow(exerciseId, index) {
    commitActiveProgramInputs();
    const program = findProgram(activeProgramId);
    const ex = program.exercises.find(e => e.exerciseId === exerciseId);
    if (ex.sets.length <= 1) { alert("В упражнении должен остаться хотя бы один подход"); return; }
    ex.sets.splice(index, 1);
    saveJSON("kbju_programs", state.programs);
    renderApp();
}

function removeExerciseFromProgram(exerciseId) {
    if (!confirm("Убрать упражнение из программы?")) return;
    commitActiveProgramInputs();
    const program = findProgram(activeProgramId);
    program.exercises = program.exercises.filter(e => e.exerciseId !== exerciseId);
    saveJSON("kbju_programs", state.programs);
    renderApp();
}

// сохранить сегодняшние значения подходов в историю — от этого считается прогресс в следующий раз
function saveWorkoutSession() {
    commitActiveProgramInputs();
    const program = findProgram(activeProgramId);
    if (!program || program.exercises.length === 0) return;

    program.exercises.forEach(ex => {
        const best = bestSet(ex.sets);
        if (!best || best.kg <= 0) return;
        if (!state.exerciseHistory[ex.exerciseId]) state.exerciseHistory[ex.exerciseId] = [];
        state.exerciseHistory[ex.exerciseId].push({ date: new Date().toISOString(), best, sets: ex.sets.map(s => ({ ...s })) });
        // после сохранения тренировки сбрасываем отметки "выполнено" для следующего раза
        ex.sets.forEach(s => { s.done = false; });
    });
    saveJSON("kbju_exercise_history", state.exerciseHistory);
    saveJSON("kbju_programs", state.programs);
    renderApp();
}

// ---------- Экран: поиск и добавление упражнения ----------

function openPicker() {
    commitActiveProgramInputs();
    workoutSearch = "";
    workoutsView = "picker";
    renderApp();
}

function closePicker() {
    workoutsView = "detail";
    renderApp();
}

function getPickerHtml() {
    return `
        <div class="detail-top">
            <button class="back-btn" onclick="closePicker()">←</button>
            <div class="detail-title">Добавить упражнение</div>
            <span></span>
        </div>
        <input type="text" id="librarySearch" placeholder="Найти упражнение…" value="${workoutSearch}">
        <div id="libraryResults">${renderLibraryList()}</div>
    `;
}

function renderLibraryList() {
    const q = workoutSearch.trim().toLowerCase();
    const program = findProgram(activeProgramId);
    const addedIds = program ? program.exercises.map(e => e.exerciseId) : [];
    let html = "";

    Object.keys(GROUP_LABELS).forEach(group => {
        const items = EXERCISES.filter(([id, name, g]) => g === group && (!q || name.toLowerCase().includes(q)));
        if (items.length === 0) return;
        html += `<div class="section-title" style="margin:18px 0 10px">${GROUP_ICON[group]} ${GROUP_LABELS[group]}</div><div class="ex-lib-list">`;
        items.forEach(([id, name]) => {
            const added = addedIds.includes(id);
            html += `
                <div class="ex-lib-row">
                    <span>${name}</span>
                    <button class="ex-add-btn ${added ? "added" : ""}" onclick="${added ? "" : `addExerciseToProgram('${id}')`}">
                        ${added ? "✓ Добавлено" : "+ Добавить"}
                    </button>
                </div>`;
        });
        html += `</div>`;
    });

    return html || `<div class="empty-note">Ничего не найдено</div>`;
}

function attachWorkoutsEvents() {
    const searchInput = document.getElementById("librarySearch");
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            workoutSearch = searchInput.value;
            document.getElementById("libraryResults").innerHTML = renderLibraryList();
        });
    }
}

function addExerciseToProgram(exerciseId) {
    const program = findProgram(activeProgramId);
    if (!program) return;
    if (program.exercises.some(e => e.exerciseId === exerciseId)) return;
    program.exercises.push({ exerciseId, sets: [{ kg: 0, reps: 0, done: false }] });
    saveJSON("kbju_programs", state.programs);
    workoutsView = "detail";
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