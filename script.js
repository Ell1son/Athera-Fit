// ---------- КОНСТАНТЫ ----------

const LIFTS = {
    bench: {
        key: "bench",
        label: "Жим лёжа",
        icon: "🏋️",
        increment: 2.5
    },

    squat: {
        key: "squat",
        label: "Присед",
        icon: "🦵",
        increment: 5
    },

    deadlift: {
        key: "deadlift",
        label: "Становая тяга",
        icon: "🏆",
        increment: 5
    }
};

const WEIGHT_STEP = 2.5;
const BLOCK_SESSIONS = 6;
const STORAGE_KEY = "liftPathAppStateV2";

// Один прогресс-блок.
// 1 раз/неделю -> блок проходит примерно за 6 недель.
// 2 раза/неделю -> тот же блок проходит примерно за 3 недели.
//
// Это не обещание, что сила физиологически растёт в 2 раза быстрее:
// просто пользователь получает больше практики и быстрее проходит этапы
// при успешном выполнении.

const BLOCK_TEMPLATE = [
    {
        key: "volume",
        label: "Объём",

        sets: [
            {
                percent: 0.70,
                reps: 6,
                type: "normal",
                label: "рабочий"
            },
            {
                percent: 0.70,
                reps: 6,
                type: "normal",
                label: "рабочий"
            },
            {
                percent: 0.70,
                reps: 6,
                type: "normal",
                label: "рабочий"
            },
            {
                percent: 0.70,
                reps: 6,
                type: "normal",
                label: "рабочий"
            }
        ],

        note: "Контроль техники · оставь примерно 2–3 повтора в запасе"
    },

    {
        key: "base",
        label: "База",

        sets: [
            {
                percent: 0.75,
                reps: 5,
                type: "normal",
                label: "рабочий"
            },
            {
                percent: 0.75,
                reps: 5,
                type: "normal",
                label: "рабочий"
            },
            {
                percent: 0.75,
                reps: 5,
                type: "normal",
                label: "рабочий"
            },
            {
                percent: 0.75,
                reps: 5,
                type: "normal",
                label: "рабочий"
            }
        ],

        note: "Умеренно тяжёлая работа · примерно 2 повтора в запасе"
    },

    {
        key: "strength",
        label: "Сила",

        sets: [
            {
                percent: 0.80,
                reps: 4,
                type: "normal",
                label: "рабочий"
            },
            {
                percent: 0.80,
                reps: 4,
                type: "normal",
                label: "рабочий"
            },
            {
                percent: 0.80,
                reps: 4,
                type: "normal",
                label: "рабочий"
            },
            {
                percent: 0.80,
                reps: 4,
                type: "normal",
                label: "рабочий"
            }
        ],

        note: "Сильные, но чистые повторы · без отказа"
    },

    {
        key: "intensity",
        label: "Интенсивность",

        sets: [
            {
                percent: 0.85,
                reps: 3,
                type: "normal",
                label: "тяжёлый"
            },
            {
                percent: 0.85,
                reps: 3,
                type: "normal",
                label: "тяжёлый"
            },
            {
                percent: 0.85,
                reps: 3,
                type: "normal",
                label: "тяжёлый"
            },
            {
                percent: 0.85,
                reps: 3,
                type: "normal",
                label: "тяжёлый"
            }
        ],

        note: "Тяжёлый день · ориентир RPE 8, без отказа"
    },

    {
        key: "peak",
        label: "Пик",

        sets: [
            {
                percent: 0.90,
                reps: 1,
                type: "top",
                label: "тяжёлый одиночный"
            },
            {
                percent: 0.825,
                reps: 2,
                type: "backoff",
                label: "откат"
            },
            {
                percent: 0.825,
                reps: 2,
                type: "backoff",
                label: "откат"
            },
            {
                percent: 0.825,
                reps: 2,
                type: "backoff",
                label: "откат"
            }
        ],

        note: "Одиночный повтор только технически чистый · не максимальная попытка"
    },

    {
        key: "deload",
        label: "Разгрузка",

        sets: [
            {
                percent: 0.65,
                reps: 5,
                type: "deload",
                label: "лёгкий"
            },
            {
                percent: 0.65,
                reps: 5,
                type: "deload",
                label: "лёгкий"
            },
            {
                percent: 0.65,
                reps: 5,
                type: "deload",
                label: "лёгкий"
            }
        ],

        note: "Снизь усталость и сохрани технику"
    }
];


// ---------- СОСТОЯНИЕ ----------

let unlockedLiftCount = 1;

let appState =
    "onboarding-lift-select";

let selectedLifts = [];

let onboardingLiftFlow = [];

let onboardingStepIndex = 0;

let tempAnswers = {};

let userProgress = {};

let activeLift = null;

let activeTab = "path";

let viewingNodeIndex = null;

let showUpsellBanner = false;


// ---------- ХРАНЕНИЕ ПРОГРЕССА ----------

function saveState() {
    const data = {
        selectedLifts,
        unlockedLiftCount,
        userProgress,
        activeLift
    };

    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );
    } catch (e) {
        console.error(
            "Не удалось сохранить прогресс:",
            e
        );
    }
}


function loadState() {
    const raw =
        localStorage.getItem(
            STORAGE_KEY
        );

    if (!raw) {
        return false;
    }

    try {
        const data =
            JSON.parse(raw);

        const loadedSelectedLifts =
            data.selectedLifts || [];

        const loadedUserProgress =
            data.userProgress || {};

        const loadedActiveLift =
            data.activeLift ||
            loadedSelectedLifts[0] ||
            null;

        if (
            loadedSelectedLifts.length === 0 ||
            loadedActiveLift === null
        ) {
            return false;
        }

        // Старый формат/старые тренировки не используем.
        // V2 должен работать только с новым форматом тренировок.

        const isCompatible =
            loadedSelectedLifts.every(
                lift => {
                    const p =
                        loadedUserProgress[lift];

                    return (
                        p &&
                        Array.isArray(
                            p.workouts
                        ) &&
                        p.workouts.length > 0 &&
                        p.workouts[0].phase &&
                        p.workouts[0].sets &&
                        p.workouts[0].sets[0] &&
                        p.workouts[0].sets[0]
                            .weight !== undefined
                    );
                }
            );

        if (!isCompatible) {
            localStorage.removeItem(
                STORAGE_KEY
            );

            return false;
        }

        selectedLifts =
            loadedSelectedLifts;

        unlockedLiftCount =
            data.unlockedLiftCount || 1;

        userProgress =
            loadedUserProgress;

        activeLift =
            loadedActiveLift;

        return true;

    } catch (e) {
        return false;
    }
}


function resetProgress() {
    if (
        !confirm(
            "Сбросить весь прогресс и пройти заново?"
        )
    ) {
        return;
    }

    localStorage.removeItem(
        STORAGE_KEY
    );

    selectedLifts = [];

    userProgress = {};

    activeLift = null;

    tempAnswers = {};

    onboardingLiftFlow = [];

    onboardingStepIndex = 0;

    viewingNodeIndex = null;

    appState =
        "onboarding-lift-select";

    renderLiftSelect();
}


// ---------- ГЕНЕРАЦИЯ ПУТИ ТРЕНИРОВОК ----------

function roundToStep(
    value,
    step = WEIGHT_STEP
) {
    return Math.max(
        WEIGHT_STEP,
        Math.round(
            value / step
        ) * step
    );
}


function formatKg(value) {
    return Number.isInteger(value)
        ? String(value)
        : value
            .toFixed(1)
            .replace(".", ",");
}


function buildWorkout(
    estMax,
    phase,
    blockIndex,
    sessionInBlock,
    weekNumber,
    sessionInWeek
) {
    const sets =
        phase.sets.map(
            t => ({
                weight:
                    roundToStep(
                        estMax *
                        t.percent
                    ),

                reps: t.reps,

                type: t.type,

                label: t.label
            })
        );

    return {
        estMax,

        phase: phase.key,

        phaseLabel:
            phase.label,

        phaseNote:
            phase.note,

        blockIndex,

        sessionInBlock,

        weekNumber,

        sessionInWeek,

        sets,

        checked:
            sets.map(
                () => false
            ),

        completed: false
    };
}


// Строим путь блоками.
//
// В каждом блоке:
//
// 1. Объём
// 2. База
// 3. Сила
// 4. Интенсивность
// 5. Пик
// 6. Разгрузка
//
// После полного блока расчётный 1ПМ повышается
// на консервативный шаг конкретного упражнения.

function generateWorkouts(
    current,
    goal,
    frequency,
    liftKey
) {
    const increment =
        LIFTS[liftKey].increment;

    const distance =
        Math.max(
            0,
            goal - current
        );

    const blocks =
        Math.max(
            1,
            Math.ceil(
                distance /
                increment
            ) + 1
        );

    const workouts = [];

    for (
        let blockIndex = 0;
        blockIndex < blocks;
        blockIndex++
    ) {
        const estMax =
            Math.min(
                goal,
                roundToStep(
                    current +
                    blockIndex *
                    increment
                )
            );

        for (
            let sessionInBlock = 0;
            sessionInBlock <
            BLOCK_SESSIONS;
            sessionInBlock++
        ) {
            const phase =
                BLOCK_TEMPLATE[
                    sessionInBlock
                ];

            // При 2 тренировках в неделю
            // два соседних занятия образуют одну неделю.
            //
            // При 1 тренировке в неделю
            // каждое занятие — отдельная неделя.

            const absoluteSession =
                blockIndex *
                    BLOCK_SESSIONS +
                sessionInBlock;

            const weekNumber =
                Math.floor(
                    absoluteSession /
                    frequency
                ) + 1;

            const sessionInWeek =
                (
                    absoluteSession %
                    frequency
                ) + 1;

            workouts.push(
                buildWorkout(
                    estMax,
                    phase,
                    blockIndex,
                    sessionInBlock,
                    weekNumber,
                    sessionInWeek
                )
            );
        }
    }

    return workouts;
}


// ---------- ОНБОРДИНГ: ВЫБОР ЛИФТА ----------

function renderLiftSelect() {
    const app =
        document.getElementById(
            "app"
        );

    let optionsHtml = "";

    Object.values(LIFTS)
        .forEach(
            lift => {
                const isSelected =
                    selectedLifts.includes(
                        lift.key
                    );

                optionsHtml += `
                    <div
                        class="option-card ${
                            isSelected
                                ? "selected"
                                : ""
                        }"
                        onclick="toggleLiftSelect('${lift.key}')"
                    >
                        <div class="option-icon">
                            ${lift.icon}
                        </div>

                        <div class="option-text">
                            <div class="option-title">
                                ${lift.label}
                            </div>
                        </div>

                        <div class="option-check"></div>
                    </div>
                `;
            }
        );

    let upsellHtml = "";

    if (showUpsellBanner) {
        upsellHtml = `
            <div class="upsell-banner">

                <div class="upsell-text">
                    В бесплатной версии доступен
                    <b>1 лифт</b>.<br>
                    Открой доступ к нескольким сразу.
                </div>

                <button
                    class="upgrade-btn"
                    onclick="showPricingInfoAlert()"
                >
                    Посмотреть тарифы
                </button>

            </div>
        `;
    }

    app.innerHTML = `
        <div class="screen-inner">

            <h2>
                Какой
                <span class="accent">
                    лифт качаем?
                </span>
            </h2>

            <p class="subtitle">
                Выбери упражнение,
                в котором хочешь вырасти
            </p>

            <div class="content">
                ${optionsHtml}
                ${upsellHtml}
            </div>

            <button
                class="next-btn"
                onclick="proceedToNumbers()"
            >
                Далее &#8594;
            </button>

        </div>
    `;
}


function toggleLiftSelect(key) {
    const idx =
        selectedLifts.indexOf(
            key
        );

    if (idx > -1) {
        selectedLifts.splice(
            idx,
            1
        );

        showUpsellBanner =
            false;

        renderLiftSelect();

        return;
    }

    if (
        selectedLifts.length >=
        unlockedLiftCount
    ) {
        showUpsellBanner =
            true;

        renderLiftSelect();

        return;
    }

    selectedLifts.push(
        key
    );

    showUpsellBanner =
        false;

    renderLiftSelect();
}


function showPricingInfoAlert() {
    alert(
        "+1€ — открыть 2 лифта\n" +
        "+2€ — открыть все 3 лифта\n\n" +
        "Оплата будет подключена " +
        "в ближайшем обновлении."
    );
}


function proceedToNumbers() {
    if (
        selectedLifts.length === 0
    ) {
        alert(
            "Выбери хотя бы один лифт"
        );

        return;
    }

    onboardingLiftFlow = [];

    selectedLifts.forEach(
        lift => {
            onboardingLiftFlow.push({
                lift,
                type: "current"
            });

            onboardingLiftFlow.push({
                lift,
                type: "goal"
            });

            onboardingLiftFlow.push({
                lift,
                type: "frequency"
            });
        }
    );

    onboardingStepIndex = 0;

    tempAnswers = {};

    appState =
        "onboarding-numbers";

    renderOnboardingStep();
}


// ---------- ОНБОРДИНГ: ДИСПЕТЧЕР ШАГОВ ----------

function renderOnboardingStep() {
    const step =
        onboardingLiftFlow[
            onboardingStepIndex
        ];

    if (
        step.type ===
        "frequency"
    ) {
        renderFrequencyStep();
    } else {
        renderNumberStep();
    }
}


function prevOnboardingStep() {
    if (
        onboardingStepIndex > 0
    ) {
        onboardingStepIndex--;

        renderOnboardingStep();

    } else {
        appState =
            "onboarding-lift-select";

        renderLiftSelect();
    }
}


function nextOnboardingStep() {
    const step =
        onboardingLiftFlow[
            onboardingStepIndex
        ];

    if (
        step.type ===
        "frequency"
    ) {
        if (
            !tempAnswers[
                `${step.lift}_frequency`
            ]
        ) {
            alert(
                "Выбери частоту тренировок"
            );

            return;
        }

    } else {
        const key =
            `${step.lift}_${step.type}`;

        if (
            tempAnswers[key] ===
            undefined
        ) {
            alert(
                "Выбери значение"
            );

            return;
        }

        if (
            step.type ===
            "goal"
        ) {
            const current =
                tempAnswers[
                    `${step.lift}_current`
                ];

            if (
                tempAnswers[key] <=
                current
            ) {
                alert(
                    "Цель должна быть больше " +
                    "текущего максимума"
                );

                return;
            }
        }
    }

    onboardingStepIndex++;

    if (
        onboardingStepIndex <
        onboardingLiftFlow.length
    ) {
        renderOnboardingStep();
    } else {
        finalizeOnboarding();
    }
}


// ---------- ОНБОРДИНГ: ТЕКУЩИЙ МАКСИМУМ И ЦЕЛЬ ----------

function renderNumberStep() {
    const step =
        onboardingLiftFlow[
            onboardingStepIndex
        ];

    const liftInfo =
        LIFTS[step.lift];

    const isGoal =
        step.type === "goal";

    const min = 20;

    const max = 300;

    const key =
        `${step.lift}_${step.type}`;

    const currentValueForThisLift =
        tempAnswers[
            `${step.lift}_current`
        ];

    const defaultValue =
        tempAnswers[key] ||
        (
            isGoal
                ? (
                    currentValueForThisLift
                        ? currentValueForThisLift + 20
                        : 80
                )
                : 60
        );

    const title =
        isGoal
            ? `
                Какой результат хочешь показать
                в
                <span class="accent">
                    ${liftInfo.label}
                </span>?
            `
            : `
                Твой текущий максимум
                на 1 повтор в
                <span class="accent">
                    ${liftInfo.label}
                </span>?
            `;

    let itemsHtml = "";

    for (
        let v = min;
        v <= max;
        v += WEIGHT_STEP
    ) {
        itemsHtml += `
            <div
                class="picker-item"
                data-value="${v}"
            >
                ${formatKg(v)} кг
            </div>
        `;
    }

    const app =
        document.getElementById(
            "app"
        );

    app.innerHTML = `
        <div class="screen-inner">

            <div class="top-bar">

                <button
                    class="back-btn"
                    onclick="prevOnboardingStep()"
                    style="${
                        onboardingStepIndex === 0
                            ? "visibility:hidden"
                            : ""
                    }"
                >
                    &#8592;
                </button>

                <div class="step-counter">
                    ${onboardingStepIndex + 1}
                    из
                    ${onboardingLiftFlow.length}
                </div>

            </div>

            <h2>
                ${title}
            </h2>

            <p class="subtitle">
                Это нужно, чтобы построить
                твой путь прогресса
            </p>

            <div class="picker-wrapper">

                <div
                    class="picker-highlight"
                ></div>

                <div
                    class="picker-list"
                    id="pickerList"
                >
                    ${itemsHtml}
                </div>

            </div>

            <button
                class="next-btn"
                onclick="nextOnboardingStep()"
            >
                Далее &#8594;
            </button>

        </div>
    `;

    setupNumberPicker(
        key,
        min,
        defaultValue
    );
}


function setupNumberPicker(
    key,
    min,
    defaultValue
) {
    const list =
        document.getElementById(
            "pickerList"
        );

    const itemHeight = 56;

    const index =
        Math.round(
            (
                defaultValue -
                min
            ) /
            WEIGHT_STEP
        );

    list.scrollTop =
        index *
        itemHeight;

    updateNumberPickerSelection(
        key,
        min,
        list,
        itemHeight
    );

    list.addEventListener(
        "scroll",
        () => {
            clearTimeout(
                window.numberPickerScrollTimeout
            );

            window.numberPickerScrollTimeout =
                setTimeout(
                    () => {
                        updateNumberPickerSelection(
                            key,
                            min,
                            list,
                            itemHeight
                        );
                    },
                    100
                );
        }
    );
}


function updateNumberPickerSelection(
    key,
    min,
    list,
    itemHeight
) {
    const index =
        Math.round(
            list.scrollTop /
            itemHeight
        );

    const value =
        min +
        index *
        WEIGHT_STEP;

    tempAnswers[key] =
        value;

    const items =
        document.querySelectorAll(
            ".picker-item"
        );

    items.forEach(
        item => {
            item.classList.remove(
                "active"
            );
        }
    );

    if (items[index]) {
        items[index].classList.add(
            "active"
        );
    }
}


// ---------- ОНБОРДИНГ: ЧАСТОТА ТРЕНИРОВОК ----------

function renderFrequencyStep() {
    const step =
        onboardingLiftFlow[
            onboardingStepIndex
        ];

    const liftInfo =
        LIFTS[step.lift];

    const key =
        `${step.lift}_frequency`;

    const selected =
        tempAnswers[key];

    const options = [
        {
            value: 1,
            icon: "📅",
            title: "1 раз в неделю",
            desc:
                "Больше восстановления, " +
                "но путь по этапам будет длиннее"
        },

        {
            value: 2,
            icon: "🔁",
            title: "2 раза в неделю",
            desc:
                "Больше практики и объёма — " +
                "этапы проходятся быстрее " +
                "при хорошем восстановлении"
        }
    ];

    const optionsHtml =
        options
            .map(
                o => `
                    <div
                        class="option-card ${
                            selected === o.value
                                ? "selected"
                                : ""
                        }"
                        onclick="selectFrequency(${o.value})"
                    >

                        <div class="option-icon">
                            ${o.icon}
                        </div>

                        <div class="option-text">

                            <div class="option-title">
                                ${o.title}
                            </div>

                            <div class="option-desc">
                                ${o.desc}
                            </div>

                        </div>

                        <div class="option-check"></div>

                    </div>
                `
            )
            .join("");

    const app =
        document.getElementById(
            "app"
        );

    app.innerHTML = `
        <div class="screen-inner">

            <div class="top-bar">

                <button
                    class="back-btn"
                    onclick="prevOnboardingStep()"
                >
                    &#8592;
                </button>

                <div class="step-counter">
                    ${onboardingStepIndex + 1}
                    из
                    ${onboardingLiftFlow.length}
                </div>

            </div>

            <h2>
                Как часто тренируешь
                <span class="accent">
                    ${liftInfo.label}
                </span>?
            </h2>

            <p class="subtitle">
                От этого зависит объём практики
                и длина этапов прогрессии
            </p>

            <div class="content">
                ${optionsHtml}
            </div>

            <button
                class="next-btn"
                onclick="nextOnboardingStep()"
            >
                Далее &#8594;
            </button>

        </div>
    `;
}


function selectFrequency(
    value
) {
    const step =
        onboardingLiftFlow[
            onboardingStepIndex
        ];

    tempAnswers[
        `${step.lift}_frequency`
    ] = value;

    renderFrequencyStep();
}


function finalizeOnboarding() {
    selectedLifts.forEach(
        lift => {
            const current =
                tempAnswers[
                    `${lift}_current`
                ];

            const goal =
                tempAnswers[
                    `${lift}_goal`
                ];

            const frequency =
                tempAnswers[
                    `${lift}_frequency`
                ] || 1;

            const workouts =
                generateWorkouts(
                    current,
                    goal,
                    frequency,
                    lift
                );

            userProgress[lift] = {
                current,
                goal,
                frequency,
                workouts,
                completedCount: 0
            };
        }
    );

    activeLift =
        selectedLifts[0];

    appState =
        "main";

    activeTab =
        "path";

    saveState();

    renderApp();
}


// ---------- ОСНОВНОЕ ПРИЛОЖЕНИЕ ----------

function renderApp() {
    const app =
        document.getElementById(
            "app"
        );

    let tabContentHtml =
        "";

    if (
        activeTab === "path"
    ) {
        tabContentHtml =
            getPathTabHtml();

    } else if (
        activeTab === "premium"
    ) {
        tabContentHtml =
            getPremiumTabHtml();

    } else if (
        activeTab === "profile"
    ) {
        tabContentHtml =
            getProfileTabHtml();
    }

    app.innerHTML = `
        <div class="screen-inner main-screen">

            <div class="tab-content">
                ${tabContentHtml}
            </div>

        </div>

        <div class="bottom-nav">

            <button
                class="nav-item ${
                    activeTab === "path"
                        ? "active"
                        : ""
                }"
                onclick="switchTab('path')"
            >
                <div class="nav-icon">
                    ⛰️
                </div>

                <div class="nav-label">
                    Путь
                </div>
            </button>

            <button
                class="nav-item ${
                    activeTab === "premium"
                        ? "active"
                        : ""
                }"
                onclick="switchTab('premium')"
            >
                <div class="nav-icon">
                    ⭐
                </div>

                <div class="nav-label">
                    Премиум
                </div>
            </button>

            <button
                class="nav-item ${
                    activeTab === "profile"
                        ? "active"
                        : ""
                }"
                onclick="switchTab('profile')"
            >
                <div class="nav-icon">
                    👤
                </div>

                <div class="nav-label">
                    Профиль
                </div>
            </button>

        </div>
    `;
}


function switchTab(
    tab
) {
    activeTab = tab;

    viewingNodeIndex =
        null;

    renderApp();
}


// ---------- ВКЛАДКА "ПУТЬ" ----------

function getPathTabHtml() {
    if (
        viewingNodeIndex !==
        null
    ) {
        return getNodeDetailHtml();
    }

    const progress =
        userProgress[activeLift];

    const liftInfo =
        LIFTS[activeLift];

    let switcherHtml =
        "";

    if (
        selectedLifts.length > 1
    ) {
        switcherHtml =
            `<div class="lift-switcher">`;

        selectedLifts.forEach(
            key => {
                switcherHtml += `
                    <button
                        class="lift-pill ${
                            key === activeLift
                                ? "active"
                                : ""
                        }"
                        onclick="switchActiveLift('${key}')"
                    >
                        ${LIFTS[key].icon}
                        ${LIFTS[key].label}
                    </button>
                `;
            }
        );

        switcherHtml +=
            `</div>`;
    }

    let goalBannerHtml =
        "";

    if (
        progress.completedCount >=
        progress.workouts.length
    ) {
        goalBannerHtml = `
            <div class="upsell-banner">

                <div class="upsell-text">
                    🎉 Цель
                    ${formatKg(progress.goal)}
                    кг достигнута!
                </div>

                <button
                    class="upgrade-btn"
                    onclick="extendGoal()"
                >
                    Поставить новую цель
                </button>

            </div>
        `;
    }

    const frequency =
        progress.frequency || 1;

    const nodeCount =
        progress.workouts.length;

    const verticalSpacing =
        90;

    const weekLabelHeight =
        50;

    const amplitude =
        55;

    const centerX =
        160;

    const topPadding =
        30;

    // Идём сверху вниз:
    // первая тренировка — вверху,
    // цель — внизу.

    let cursorY =
        topPadding;

    let lastWeekIdx =
        -1;

    const nodeY = [];

    const weekLabels = [];

    const points = [];

    for (
        let i = 0;
        i < nodeCount;
        i++
    ) {
        const weekIdx =
            Math.floor(
                i / frequency
            );

        if (
            weekIdx !==
            lastWeekIdx
        ) {
            weekLabels.push({
                weekNumber:
                    weekIdx + 1,

                y:
                    cursorY
            });

            cursorY +=
                weekLabelHeight;

            lastWeekIdx =
                weekIdx;
        }

        nodeY.push(
            cursorY
        );

        const x =
            centerX +
            amplitude *
                Math.sin(
                    i * 0.9
                );

        points.push(
            `${x},${cursorY}`
        );

        cursorY +=
            verticalSpacing;
    }

    const totalHeight =
        cursorY -
        verticalSpacing +
        topPadding;

    let nodesHtml =
        "";

    for (
        let i = 0;
        i < nodeCount;
        i++
    ) {
        const x =
            centerX +
            amplitude *
                Math.sin(
                    i * 0.9
                );

        const y =
            nodeY[i];

        let stateClass =
            "locked";

        let content =
            i + 1;

        let clickAttr =
            `onclick="lockedNodeClick()"`;

        if (
            i <
            progress.completedCount
        ) {
            stateClass =
                "completed";

            content =
                "&#10003;";

            clickAttr =
                `onclick="openNode(${i})"`;

        } else if (
            i ===
            progress.completedCount
        ) {
            stateClass =
                "current";

            clickAttr =
                `onclick="openNode(${i})"`;
        }

        nodesHtml += `
            <div
                class="path-node ${stateClass}"
                style="
                    left:${x}px;
                    top:${y}px;
                "
                ${clickAttr}
            >

                <div class="path-node-inner">
                    ${content}
                </div>

                <div class="path-node-weight">
                    ${formatKg(
                        progress.workouts[i]
                            .estMax
                    )} кг
                </div>

                <div class="path-node-phase">
                    ${progress.workouts[i]
                        .phaseLabel}
                </div>

            </div>
        `;
    }

    const weekLabelsHtml =
        weekLabels
            .map(
                w => `
                    <div
                        class="week-label"
                        style="top:${w.y}px;"
                    >
                        Неделя
                        ${w.weekNumber}
                    </div>
                `
            )
            .join("");

    const pointsStr =
        points.join(" ");

    const freqLabel =
        progress.frequency === 2
            ? "2 раза в неделю"
            : "1 раз в неделю";

    return `
        <h2>
            ${liftInfo.icon}

            <span class="accent">
                ${liftInfo.label}
            </span>
        </h2>

        <p class="subtitle">
            Старт:
            ${formatKg(progress.current)}
            кг
            ·
            Цель:
            ${formatKg(progress.goal)}
            кг
            ·
            ${freqLabel}
            ·
            шаг:
            +${formatKg(
                LIFTS[activeLift]
                    .increment
            )} кг
        </p>

        ${goalBannerHtml}

        ${switcherHtml}

        <div
            class="path-container"
            style="
                height:${totalHeight}px;
            "
        >

            <svg
                class="path-svg"
                viewBox="
                    0 0 320 ${totalHeight}
                "
                preserveAspectRatio="none"
            >

                <polyline
                    points="${pointsStr}"
                    fill="none"
                    stroke="#2a2a38"
                    stroke-width="4"
                    stroke-dasharray="2 12"
                    stroke-linecap="round"
                />

            </svg>

            ${weekLabelsHtml}

            ${nodesHtml}

        </div>
    `;
}


function switchActiveLift(
    key
) {
    activeLift =
        key;

    viewingNodeIndex =
        null;

    saveState();

    renderApp();
}


function lockedNodeClick() {
    alert(
        "Сначала пройди предыдущие тренировки по порядку 💪"
    );
}


function openNode(i) {
    viewingNodeIndex =
        i;

    renderApp();
}


function closeNode() {
    viewingNodeIndex =
        null;

    renderApp();
}


// ---------- ЭКРАН ТРЕНИРОВКИ ----------

function getNodeDetailHtml() {
    const progress =
        userProgress[activeLift];

    const liftInfo =
        LIFTS[activeLift];

    const i =
        viewingNodeIndex;

    const workout =
        progress.workouts[i];

    const isCompleted =
        i <
        progress.completedCount;

    const isCurrent =
        i ===
        progress.completedCount;

    // Быстрая навигация по тренировкам

    let tabsHtml =
        "";

    progress.workouts.forEach(
        (w, idx) => {
            let cls =
                "workout-tab";

            if (
                idx <
                progress.completedCount
            ) {
                cls += " done";
            }

            if (
                idx ===
                progress.completedCount
            ) {
                cls += " current";
            }

            if (
                idx === i
            ) {
                cls += " active";
            }

            const clickable =
                idx <=
                progress.completedCount;

            tabsHtml += `
                <button
                    class="${cls}"
                    ${
                        clickable
                            ? `onclick="openNode(${idx})"`
                            : `onclick="lockedNodeClick()"`
                    }
                >
                    ${idx + 1}
                </button>
            `;
        }
    );

    const allChecked =
        workout.checked.every(
            c => c
        );

    const setsHtml =
        workout.sets
            .map(
                (s, si) => {
                    const checked =
                        workout.checked[
                            si
                        ];

                    const typeLabel =
                        s.label ||
                        "рабочий";

                    const canToggle =
                        isCurrent;

                    return `
                        <div
                            class="
                                set-row
                                ${
                                    checked
                                        ? "checked"
                                        : ""
                                }
                                ${
                                    canToggle
                                        ? ""
                                        : "readonly"
                                }
                            "
                            ${
                                canToggle
                                    ? `onclick="toggleSetCheck(${si})"`
                                    : ""
                            }
                        >

                            <div class="set-index">
                                ${si + 1}
                            </div>

                            <div class="set-info">

                                <div class="set-weight">
                                    ${formatKg(
                                        s.weight
                                    )}
                                    кг ×
                                    ${s.reps}
                                </div>

                            </div>

                            <div
                                class="
                                    set-type-badge
                                    ${s.type}
                                "
                            >
                                ${typeLabel}
                            </div>

                            <div
                                class="
                                    set-checkbox
                                    ${
                                        checked
                                            ? "checked"
                                            : ""
                                    }
                                "
                            ></div>

                        </div>
                    `;
                }
            )
            .join("");

    let actionHtml =
        "";

    if (isCurrent) {
        actionHtml = `
            <button
                class="next-btn"
                ${
                    allChecked
                        ? ""
                        : "disabled"
                }
                onclick="completeNode()"
            >
                Завершить тренировку
            </button>
        `;

        if (!allChecked) {
            actionHtml += `
                <p class="hint-text">
                    Отметь все подходы,
                    чтобы завершить тренировку
                </p>
            `;
        }

    } else if (isCompleted) {
        actionHtml = `
            <div class="completed-badge">
                Пройдено ✅
            </div>
        `;

    } else {
        actionHtml = `
            <div class="completed-badge">
                Сначала пройди предыдущие
                тренировки
            </div>
        `;
    }

    return `
        <div class="top-bar">

            <button
                class="back-btn"
                onclick="closeNode()"
            >
                &#8592;
            </button>

            <h2 class="top-bar-title">
                ${liftInfo.label}
            </h2>

        </div>

        <div class="workout-tabs">
            ${tabsHtml}
        </div>

        <div class="workout-header-row">

            <h2>
                Тренировка
                ${i + 1}
            </h2>

            <div class="max-badge">
                1ПМ =
                ${formatKg(
                    workout.estMax
                )}
                кг
            </div>

        </div>

        <div class="workout-meta">

            <div class="workout-meta-top">

                <div class="phase-chip">
                    ${workout.phaseLabel}
                </div>

                <div class="stage-chip">
                    Этап
                    ${workout.blockIndex + 1}
                </div>

            </div>

            <div class="phase-note">
                ${workout.phaseNote}
            </div>

        </div>

        <div class="sets-list">
            ${setsHtml}
        </div>

        ${actionHtml}
    `;
}


function toggleSetCheck(
    si
) {
    const progress =
        userProgress[activeLift];

    // Менять можно только текущую тренировку.

    if (
        viewingNodeIndex !==
        progress.completedCount
    ) {
        return;
    }

    const workout =
        progress.workouts[
            viewingNodeIndex
        ];

    workout.checked[si] =
        !workout.checked[si];

    saveState();

    renderApp();
}


function completeNode() {
    const progress =
        userProgress[activeLift];

    const workout =
        progress.workouts[
            progress.completedCount
        ];

    if (
        !workout.checked.every(
            c => c
        )
    ) {
        alert(
            "Сначала отметь все подходы"
        );

        return;
    }

    workout.completed =
        true;

    progress.completedCount++;

    saveState();

    viewingNodeIndex =
        null;

    renderApp();
}


// ---------- НОВАЯ ЦЕЛЬ ----------

function extendGoal() {
    const progress =
        userProgress[activeLift];

    const input =
        window.prompt(
            `Текущая цель: ${formatKg(
                progress.goal
            )} кг.\n` +
            `Какой новый максимум хочешь показать?`
        );

    if (
        input === null
    ) {
        return;
    }

    const newGoal =
        parseFloat(input);

    const step =
        WEIGHT_STEP;

    if (
        isNaN(newGoal) ||
        newGoal <=
            progress.goal ||
        Math.abs(
            newGoal / step -
            Math.round(
                newGoal / step
            )
        ) > 0.0001
    ) {
        alert(
            `Новая цель должна быть больше текущей ` +
            `и кратна ${formatKg(
                step
            )} кг`
        );

        return;
    }

    const nextStart =
        progress.goal +
        LIFTS[activeLift]
            .increment;

    const extraWorkouts =
        generateWorkouts(
            nextStart,
            newGoal,
            progress.frequency,
            activeLift
        );

    progress.workouts =
        progress.workouts.concat(
            extraWorkouts
        );

    progress.goal =
        newGoal;

    saveState();

    renderApp();
}


// ---------- ВКЛАДКА "ПРЕМИУМ" ----------

function getPremiumTabHtml() {
    return `
        <h2>
            Открой
            <span class="accent">
                больше лифтов
            </span>
        </h2>

        <p class="subtitle">
            Сейчас доступно:
            ${unlockedLiftCount}
            из 3
        </p>

        <div class="plan-card">

            <div class="plan-title">
                Free
            </div>

            <ul class="plan-list">
                <li>
                    1 лифт на выбор
                </li>
            </ul>

        </div>

        <div class="plan-card premium">

            <div class="plan-title">
                +1€ — 2 лифта
            </div>

            <ul class="plan-list">
                <li>
                    Любые 2 из 3 лифтов
                    одновременно
                </li>
            </ul>

            <button
                class="upgrade-btn"
                onclick="goToUpgrade(2)"
            >
                Открыть за 1€
            </button>

        </div>

        <div class="plan-card premium">

            <div class="plan-title">
                +2€ — все 3 лифта
            </div>

            <ul class="plan-list">
                <li>
                    Жим, присед и становая
                    одновременно
                </li>
            </ul>

            <button
                class="upgrade-btn"
                onclick="goToUpgrade(3)"
            >
                Открыть за 2€
            </button>

        </div>
    `;
}


function goToUpgrade(
    tier
) {
    const price =
        tier === 2
            ? "1€"
            : "2€";

    alert(
        `Оплата ${price} будет подключена ` +
        `в ближайшем обновлении. ` +
        `Пока это демонстрация интерфейса.`
    );
}


// ---------- ВКЛАДКА "ПРОФИЛЬ" ----------

function getProfileTabHtml() {
    return `
        <h2>
            Твой
            <span class="accent">
                профиль
            </span>
        </h2>

        <p class="subtitle">
            Настройки и язык появятся здесь
            в следующих обновлениях
        </p>

        <div class="dev-toggle-card">

            <label class="dev-toggle-label">
                Тестовый режим —
                сколько лифтов открыто:
            </label>

            <select
                class="text-input"
                onchange="setUnlockedLiftCountDebug(this.value)"
            >

                <option
                    value="1"
                    ${
                        unlockedLiftCount === 1
                            ? "selected"
                            : ""
                    }
                >
                    1 (Free)
                </option>

                <option
                    value="2"
                    ${
                        unlockedLiftCount === 2
                            ? "selected"
                            : ""
                    }
                >
                    2 (+1€)
                </option>

                <option
                    value="3"
                    ${
                        unlockedLiftCount === 3
                            ? "selected"
                            : ""
                    }
                >
                    3 (+2€)
                </option>

            </select>

            <p class="dev-toggle-note">
                Временный переключатель
                для тестирования —
                уберём перед публикацией
            </p>

        </div>

        <button
            class="secondary-btn"
            onclick="resetProgress()"
        >
            Сбросить весь прогресс
        </button>
    `;
}


function setUnlockedLiftCountDebug(
    value
) {
    unlockedLiftCount =
        Number(value);

    saveState();

    renderApp();
}


// ---------- СТАРТ ПРИЛОЖЕНИЯ ----------

try {
    const hasSavedState =
        loadState();

    if (hasSavedState) {
        appState =
            "main";

        activeTab =
            "path";

        renderApp();

    } else {
        appState =
            "onboarding-lift-select";

        renderLiftSelect();
    }

} catch (e) {
    console.error(
        "Ошибка запуска приложения:",
        e
    );

    document.getElementById(
        "app"
    ).innerHTML = `

        <div class="screen-inner">

            <h2>
                Что-то пошло не так
            </h2>

            <p class="subtitle">
                ${e.message}
            </p>

            <button
                class="next-btn"
                onclick="
                    localStorage.removeItem(
                        '${STORAGE_KEY}'
                    );
                    location.reload();
                "
            >
                Сбросить и начать заново
            </button>

        </div>

    `;
}