// ========================================
// КОНФИГ
// ========================================

const STORAGE_KEY = "kbjuAppStateV1";

const GOAL_PRESETS = {
    cut:      { kcal: 1600, split: [0.35, 0.25, 0.40], label: "Похудение" },
    maintain: { kcal: 2000, split: [0.25, 0.30, 0.45], label: "Поддержание" },
    bulk:     { kcal: 2600, split: [0.25, 0.25, 0.50], label: "Набор" }
};

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

let state = {
    goalType: localStorage.getItem("kbju_goal_type") || "maintain",
    goal: Number(localStorage.getItem("kbju_goal")) || 2000,
    entries: JSON.parse(localStorage.getItem("kbju_entries") || "null") || []
};
if (localStorage.getItem("kbju_day") !== todayKey) {
    state.entries = [];
    localStorage.setItem("kbju_day", todayKey);
}

let activeTab = "diary";
let pendingItem = null;

function saveEntries() {
    try {
        localStorage.setItem("kbju_entries", JSON.stringify(state.entries));
    } catch (e) { console.error("storage error", e); }
}

// ========================================
// РАСЧЁТЫ
// ========================================

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
    `;
    attachDiaryEvents();
    attachModalEvents();
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
            <div class="premium-card" onclick="${isPremium() ? "alert('Скан штрихкода: наведи камеру (реализуется в боевом Mini App)')" : "openPremiumModal()"}">
                ${!isPremium() ? '<span class="pc-badge">Premium</span>' : ""}
                <div class="pc-title">📷 Скан штрихкода</div>
                <div class="pc-sub">${isPremium() ? "Доступно" : "Наведи камеру — найдём сам"}</div>
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
    state.goal = GOAL_PRESETS[type].kcal;
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

function openAddModal(item) { pendingItem = item; renderApp(); document.getElementById("gramInput")?.focus(); }
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
}

// ========================================
// ВКЛАДКА ПРОФИЛЬ
// ========================================

function getProfileHtml() {
    return `
        <h2>Твой <span class="accent">профиль</span></h2>
        <p class="subtitle">Цель: ${GOAL_PRESETS[state.goalType].label} · ${state.goal} ккал/день</p>
        <div class="plan-card">
            <div class="pc-title" style="font-size:16px">Тариф</div>
            <div class="plan-price" style="color:${isPremium() ? "var(--green)" : "var(--muted)"}">${isPremium() ? "Premium" : "Бесплатный"}</div>
            ${isPremium()
                ? `<div class="plan-unlocked">✓ Все функции открыты</div>`
                : `<button class="btn btn-gold" style="width:100%" onclick="switchTab('premium')">Открыть Premium</button>`}
        </div>
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
// ЗАПУСК
// ========================================

if (window.Telegram?.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
}

renderApp();