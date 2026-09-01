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

const STORAGE_KEY =
    "liftPathAppStateV3";

const PAYPAL_CLIENT_ID =
    "YOUR_PAYPAL_CLIENT_ID";


// Один прогресс-блок.

// 1 раз/неделю → блок проходит
// примерно за 6 недель.

// 2 раза/неделю → тот же блок
// проходит примерно за 3 недели.

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

        note:
            "Контроль техники · оставь примерно 2–3 повтора в запасе"
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

        note:
            "Умеренно тяжёлая работа · примерно 2 повтора в запасе"
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

        note:
            "Сильные, но чистые повторы · без отказа"
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

        note:
            "Тяжёлый день · ориентир RPE 8, без отказа"
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

        note:
            "Одиночный повтор только технически чистый · не максимальная попытка"
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

        note:
            "Снизь усталость и сохрани технику"
    }

];


//СОСТОЯНИЕ 

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

let paymentModalOpen = false;


//ХРАНЕНИЕ ПРОГРЕССА 

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
                        p.workouts[0]
                            .sets[0]
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

        console.error(
            "Ошибка загрузки:",
            e
        );

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

    unlockedLiftCount = 1;

    appState =
        "onboarding-lift-select";

    renderLiftSelect();

}


//ГЕНЕРАЦИЯ ПУТИ ТРЕНИРОВОК

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

                reps:
                    t.reps,

                type:
                    t.type,

                label:
                    t.label

            })
        );


    return {

        estMax,

        phase:
            phase.key,

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
// Каждый блок:
//
// 1. Объём
// 2. База
// 3. Сила
// 4. Интенсивность
// 5. Пик
// 6. Разгрузка

function generateWorkouts(
    current,
    goal,
    frequency,
    liftKey
) {

    const increment =
        LIFTS[liftKey]
            .increment;


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


//ОНБОРДИНГ: ВЫБОР ЛИФТА

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


                const isLocked =
                    !isSelected &&
                    selectedLifts.length >=
                    unlockedLiftCount;


                optionsHtml += `

                    <div
                        class="
                            option-card
                            ${
                                isSelected
                                    ? "selected"
                                    : ""
                            }
                            ${
                                isLocked
                                    ? "locked-option"
                                    : ""
                            }
                        "
                        onclick="
                            toggleLiftSelect(
                                '${lift.key}'
                            )
                        "
                    >

                        <div class="option-icon">
                            ${lift.icon}
                        </div>

                        <div class="option-text">

                            <div class="option-title">
                                ${lift.label}
                            </div>

                            ${
                                isLocked
                                    ? `
                                        <div class="option-desc">
                                            🔒 Открой
                                            Premium
                                        </div>
                                    `
                                    : ""
                            }

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

                    В бесплатной версии
                    доступен

                    <b>
                        1 лифт
                    </b>.

                    <br>

                    Открой доступ
                    к нескольким сразу.

                </div>

                <button
                    class="upgrade-btn"
                    onclick="openPremiumFromOnboarding()"
                >

                    Открыть лифты

                </button>

            </div>

        `;

    }


    app.innerHTML = `

        <div class="screen-inner page-enter">

            <h2>

                Выбери

                <span class="accent">
                    лифт
                </span>

            </h2>


            <p class="subtitle">

                ${
                    unlockedLiftCount === 1
                        ? `
                            В бесплатной версии
                            доступен один лифт
                        `
                        : `
                            Выбери до
                            ${unlockedLiftCount}
                            лифтов
                        `
                }

            </p>


            <div class="content">

                ${optionsHtml}

            </div>


            ${upsellHtml}


            <button
                class="next-btn"
                onclick="startOnboarding()"
            >

                Далее
                &#8594;

            </button>

        </div>

    `;

}


function toggleLiftSelect(
    liftKey
) {

    const index =
        selectedLifts.indexOf(
            liftKey
        );


    if (index !== -1) {

        selectedLifts.splice(
            index,
            1
        );

        showUpsellBanner = false;

        renderLiftSelect();

        return;

    }


    if (
        selectedLifts.length >=
        unlockedLiftCount
    ) {

        showUpsellBanner = true;

        renderLiftSelect();

        return;

    }


    selectedLifts.push(
        liftKey
    );

    showUpsellBanner = false;

    renderLiftSelect();

}


function openPremiumFromOnboarding() {

    activeTab = "premium";

    appState = "premium-preview";

    renderPremiumStandalone();

}


function startOnboarding() {

    if (
        selectedLifts.length === 0
    ) {

        alert(
            "Выбери хотя бы один лифт 💪"
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

    renderOnboardingStep();

}

//ОНБОРДИНГ 

function renderOnboardingStep() {

    const step =
        onboardingLiftFlow[
            onboardingStepIndex
        ];

    if (!step) {

        finalizeOnboarding();

        return;

    }


    if (
        step.type === "current"
    ) {

        renderWeightStep(
            "current"
        );

        return;

    }


    if (
        step.type === "goal"
    ) {

        renderWeightStep(
            "goal"
        );

        return;

    }


    if (
        step.type === "frequency"
    ) {

        renderFrequencyStep();

    }

}


// ---------- НАЗАД В ОНБОРДИНГЕ ----------

function prevOnboardingStep() {

    if (
        onboardingStepIndex <= 0
    ) {

        appState =
            "onboarding-lift-select";

        renderLiftSelect();

        return;

    }


    onboardingStepIndex--;

    renderOnboardingStep();

}


//ВПЕРЁД В ОНБОРДИНГЕ
function nextOnboardingStep() {

    const step =
        onboardingLiftFlow[
            onboardingStepIndex
        ];


    if (
        !step
    ) {
        return;
    }


    const key =
        `${step.lift}_${step.type}`;


    if (
        step.type === "current" &&
        (
            tempAnswers[key] === undefined ||
            tempAnswers[key] === null
        )
    ) {

        alert(
            "Выбери свой текущий вес"
        );

        return;

    }


    if (
        step.type === "goal"
    ) {

        const current =
            tempAnswers[
                `${step.lift}_current`
            ];

        const goal =
            tempAnswers[
                `${step.lift}_goal`
            ];


        if (
            goal === undefined ||
            goal === null
        ) {

            alert(
                "Выбери свою цель"
            );

            return;

        }


        if (
            goal <= current
        ) {

            alert(
                "Цель должна быть больше текущего результата"
            );

            return;

        }

    }


    if (
        step.type === "frequency" &&
        !tempAnswers[key]
    ) {

        alert(
            "Выбери частоту тренировок"
        );

        return;

    }


    onboardingStepIndex++;


    if (
        onboardingStepIndex >=
        onboardingLiftFlow.length
    ) {

        finalizeOnboarding();

        return;

    }


    renderOnboardingStep();

}


// ---------- ВЫБОР ВЕСА ----------

function renderWeightStep(
    type
) {

    const step =
        onboardingLiftFlow[
            onboardingStepIndex
        ];


    const liftInfo =
        LIFTS[step.lift];


    const key =
        `${step.lift}_${type}`;


    const current =
        tempAnswers[
            `${step.lift}_current`
        ];


    let min = 20;

    let max = 400;

    let defaultValue = 60;


    if (
        step.lift === "bench"
    ) {

        min = 20;

        max = 300;

        defaultValue =
            type === "current"
                ? 60
                : 80;

    }


    if (
        step.lift === "squat"
    ) {

        min = 20;

        max = 400;

        defaultValue =
            type === "current"
                ? 80
                : 100;

    }


    if (
        step.lift === "deadlift"
    ) {

        min = 20;

        max = 400;

        defaultValue =
            type === "current"
                ? 100
                : 120;

    }


    if (
        type === "goal" &&
        current !== undefined
    ) {

        min =
            current +
            WEIGHT_STEP;


        defaultValue =
            current +
            LIFTS[
                step.lift
            ].increment *
            4;

    }


    const selectedValue =
        tempAnswers[key] !== undefined
            ? tempAnswers[key]
            : defaultValue;


    if (
        tempAnswers[key] === undefined
    ) {

        tempAnswers[key] =
            selectedValue;

    }


    const values = [];


    for (
        let value = min;
        value <= max;
        value += WEIGHT_STEP
    ) {

        values.push(
            Number(
                value.toFixed(1)
            )
        );

    }


    const itemsHtml =
        values
            .map(
                value => `

                    <div
                        class="
                            picker-item
                            ${
                                value ===
                                selectedValue
                                    ? "active"
                                    : ""
                            }
                        "
                    >

                        ${formatKg(value)}
                        кг

                    </div>

                `
            )
            .join("");


    const app =
        document.getElementById(
            "app"
        );


    const title =
        type === "current"
            ? "Какой твой текущий максимум?"
            : "Какую цель хочешь достичь?";


    const subtitle =
        type === "current"
            ? `
                Укажи свой текущий
                одноповторный максимум
            `
            : `
                Выбери вес, к которому
                хочешь прийти
            `;


    app.innerHTML = `

        <div class="screen-inner page-enter">

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

                ${title}

                <span class="accent">

                    ${liftInfo.label}

                </span>

            </h2>


            <p class="subtitle">

                ${subtitle}

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

                Далее
                &#8594;

            </button>

        </div>

    `;


    setupNumberPicker(
        key,
        min,
        selectedValue
    );

}


// ---------- НАСТРОЙКА ВЫБОРА ВЕСА ----------

function setupNumberPicker(
    key,
    min,
    defaultValue
) {

    const list =
        document.getElementById(
            "pickerList"
        );


    if (!list) {
        return;
    }


    const itemHeight = 56;


    const index =
        Math.round(
            (
                defaultValue -
                min
            ) /
            WEIGHT_STEP
        );


    requestAnimationFrame(
        () => {

            list.scrollTop =
                index *
                itemHeight;


            updateNumberPickerSelection(
                key,
                min,
                list,
                itemHeight
            );

        }
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
                    80
                );

        }
    );

}


// ---------- ОБНОВЛЕНИЕ ВЫБРАННОГО ВЕСА ----------

function updateNumberPickerSelection(
    key,
    min,
    list,
    itemHeight
) {

    if (
        !list
    ) {
        return;
    }


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
        Number(
            value.toFixed(1)
        );


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


    if (
        items[index]
    ) {

        items[index].classList.add(
            "active"
        );

    }

}


// ---------- ВЫБОР ЧАСТОТЫ ТРЕНИРОВОК ----------

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

            title:
                "1 раз в неделю",

            desc:
                "Больше времени на восстановление, " +
                "но путь прогрессии будет длиннее"

        },


        {
            value: 2,

            icon: "🔁",

            title:
                "2 раза в неделю",

            desc:
                "Больше практики и объёма — " +
                "этапы проходятся быстрее " +
                "при хорошем восстановлении"

        }

    ];


    const optionsHtml =
        options
            .map(
                option => `

                    <div
                        class="
                            option-card
                            ${
                                selected ===
                                option.value
                                    ? "selected"
                                    : ""
                            }
                        "
                        onclick="
                            selectFrequency(
                                ${option.value}
                            )
                        "
                    >

                        <div class="option-icon">

                            ${option.icon}

                        </div>


                        <div class="option-text">

                            <div class="option-title">

                                ${option.title}

                            </div>


                            <div class="option-desc">

                                ${option.desc}

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

        <div class="screen-inner page-enter">

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

                </span>

                ?

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

                Далее
                &#8594;

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


// ---------- ЗАВЕРШЕНИЕ ОНБОРДИНГА ----------

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


    viewingNodeIndex =
        null;


    appState =
        "main";


    activeTab =
        "path";


    saveState();

    renderApp();

}

// =========================================
// ОСНОВНОЕ ПРИЛОЖЕНИЕ
// =========================================

function renderApp() {

    const app =
        document.getElementById(
            "app"
        );

    if (!app) {
        return;
    }


    if (
        appState ===
        "premium-preview"
    ) {

        renderPremiumStandalone();

        return;

    }


    if (
        appState !==
        "main"
    ) {

        renderLiftSelect();

        return;

    }


    let contentHtml = "";


    if (
        activeTab === "path"
    ) {

        contentHtml =
            getPathTabHtml();

    }


    if (
        activeTab === "premium"
    ) {

        contentHtml =
            getPremiumTabHtml();

    }


    if (
        activeTab === "profile"
    ) {

        contentHtml =
            getProfileTabHtml();

    }


    if (
        viewingNodeIndex !== null
    ) {

        contentHtml =
            getWorkoutDetailHtml();

    }


    app.innerHTML = `

        <div class="app-shell">

            <main class="main-content">

                <div class="screen-inner page-enter">

                    ${contentHtml}

                </div>

            </main>


            ${
                viewingNodeIndex === null
                    ? getBottomNavHtml()
                    : ""
            }

        </div>

    `;

}


// =========================================
// НИЖНЯЯ НАВИГАЦИЯ
// =========================================

function getBottomNavHtml() {

    return `

        <nav class="bottom-nav">


            <button
                class="
                    nav-item
                    ${
                        activeTab === "path"
                            ? "active"
                            : ""
                    }
                "
                onclick="
                    switchTab('path')
                "
            >

                <span class="nav-icon">

                    ◉

                </span>

                <span class="nav-label">

                    Путь

                </span>

            </button>


            <button
                class="
                    nav-item
                    ${
                        activeTab === "premium"
                            ? "active"
                            : ""
                    }
                "
                onclick="
                    switchTab('premium')
                "
            >

                <span class="nav-icon">

                    ✦

                </span>

                <span class="nav-label">

                    Premium

                </span>

            </button>


            <button
                class="
                    nav-item
                    ${
                        activeTab === "profile"
                            ? "active"
                            : ""
                    }
                "
                onclick="
                    switchTab('profile')
                "
            >

                <span class="nav-icon">

                    ◎

                </span>

                <span class="nav-label">

                    Профиль

                </span>

            </button>


        </nav>

    `;

}


// =========================================
// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
// =========================================

function switchTab(
    tab
) {

    viewingNodeIndex =
        null;

    activeTab =
        tab;

    renderApp();

}


// =========================================
// ПЕРЕКЛЮЧЕНИЕ ЛИФТА
// =========================================

function setActiveLift(
    lift
) {

    if (
        !selectedLifts.includes(
            lift
        )
    ) {
        return;
    }


    activeLift =
        lift;

    viewingNodeIndex =
        null;

    saveState();

    renderApp();

}


// =========================================
// ВКЛАДКА "ПУТЬ"
// =========================================

function getPathTabHtml() {

    if (
        !activeLift ||
        !userProgress[
            activeLift
        ]
    ) {

        return `

            <h2>

                Пока нет

                <span class="accent">
                    тренировок
                </span>

            </h2>


            <p class="subtitle">

                Пройди настройку,
                чтобы создать программу

            </p>

        `;

    }


    const progress =
        userProgress[
            activeLift
        ];


    const liftInfo =
        LIFTS[
            activeLift
        ];


    const completed =
        progress.completedCount;


    const total =
        progress.workouts.length;


    const percentage =
        total > 0

            ? Math.round(
                completed /
                total *
                100
            )

            : 0;


    const liftTabs =
        getLiftTabsHtml();


    const pathHtml =
        getTrainingPathHtml(
            progress
        );


    return `

        <div class="path-page">


            <div class="path-header">

                <div>

                    <h2>

                        Твой

                        <span class="accent">

                            путь

                        </span>

                    </h2>


                    <p class="subtitle">

                        ${liftInfo.icon}
                        ${liftInfo.label}

                    </p>

                </div>


                <div class="path-percent">

                    ${percentage}%

                </div>

            </div>


            ${liftTabs}


            <div class="progress-summary">

                <div class="summary-top">

                    <span>

                        Пройдено

                    </span>


                    <strong>

                        ${completed}
                        /
                        ${total}

                    </strong>

                </div>


                <div class="summary-progress">

                    <div
                        class="summary-progress-fill"
                        style="
                            width:
                            ${percentage}%
                        "
                    ></div>

                </div>

            </div>


            <div class="current-goal-row">


                <div class="weight-stat">

                    <span>

                        Сейчас

                    </span>


                    <strong>

                        ${formatKg(
                            progress.current
                        )}
                        кг

                    </strong>

                </div>


                <div class="weight-arrow">

                    →

                </div>


                <div class="weight-stat goal">

                    <span>

                        Цель

                    </span>


                    <strong>

                        ${formatKg(
                            progress.goal
                        )}
                        кг

                    </strong>

                </div>


            </div>


            <div class="path-section-title">

                Тренировочный путь

            </div>


            <div class="training-path">

                ${pathHtml}

            </div>


        </div>

    `;

}


// =========================================
// ПЕРЕКЛЮЧАТЕЛЬ ЛИФТОВ
// =========================================

function getLiftTabsHtml() {

    let html =
        `
            <div class="lift-tabs">
        `;


    selectedLifts.forEach(
        lift => {

            const info =
                LIFTS[lift];


            const progress =
                userProgress[lift];


            const isActive =
                lift ===
                activeLift;


            const completed =
                progress
                    ? progress.completedCount
                    : 0;


            html += `

                <button
                    class="
                        lift-pill
                        ${
                            isActive
                                ? "active"
                                : ""
                        }
                    "
                    onclick="
                        setActiveLift(
                            '${lift}'
                        )
                    "
                >

                    <span>

                        ${info.icon}

                    </span>


                    <span>

                        ${info.label}

                    </span>


                    <small>

                        ${completed}

                    </small>

                </button>

            `;

        }
    );


    if (
        selectedLifts.length <
        unlockedLiftCount
    ) {

        html += `

            <button
                class="lift-pill add-lift"
                onclick="
                    addNewLift()
                "
            >

                +

            </button>

        `;

    }


    html += `

        </div>

    `;


    return html;

}


// =========================================
// ДОБАВЛЕНИЕ НОВОГО ЛИФТА
// =========================================

function addNewLift() {

    appState =
        "adding-lift";

    showUpsellBanner =
        false;

    renderAddLiftScreen();

}


function renderAddLiftScreen() {

    const app =
        document.getElementById(
            "app"
        );


    const availableLifts =
        Object.values(
            LIFTS
        ).filter(
            lift =>
                !selectedLifts.includes(
                    lift.key
                )
        );


    const optionsHtml =
        availableLifts
            .map(
                lift => `

                    <div
                        class="option-card"
                        onclick="
                            startNewLiftSetup(
                                '${lift.key}'
                            )
                        "
                    >

                        <div class="option-icon">

                            ${lift.icon}

                        </div>


                        <div class="option-text">

                            <div class="option-title">

                                ${lift.label}

                            </div>


                            <div class="option-desc">

                                Добавить
                                тренировочную программу

                            </div>

                        </div>


                        <div class="option-check"></div>

                    </div>

                `
            )
            .join("");


    app.innerHTML = `

        <div class="screen-inner page-enter">

            <div class="top-bar">

                <button
                    class="back-btn"
                    onclick="
                        cancelAddLift()
                    "
                >

                    ←

                </button>

            </div>


            <h2>

                Добавить

                <span class="accent">

                    лифт

                </span>

            </h2>


            <p class="subtitle">

                Выбери упражнение,
                для которого хочешь
                создать новый путь

            </p>


            <div class="content">

                ${optionsHtml}

            </div>

        </div>

    `;

}


function cancelAddLift() {

    appState =
        "main";

    activeTab =
        "path";

    renderApp();

}


// =========================================
// НАСТРОЙКА НОВОГО ЛИФТА
// =========================================

function startNewLiftSetup(
    lift
) {

    selectedLifts.push(
        lift
    );


    onboardingLiftFlow = [

        {
            lift,
            type: "current"
        },

        {
            lift,
            type: "goal"
        },

        {
            lift,
            type: "frequency"
        }

    ];


    onboardingStepIndex =
        0;


    tempAnswers = {};


    appState =
        "adding-lift-setup";


    renderOnboardingStep();

}


// =========================================
// СОЗДАНИЕ ПУТИ ТРЕНИРОВОК
// =========================================

function getTrainingPathHtml(
    progress
) {

    let html = "";


    progress.workouts.forEach(
        (
            workout,
            index
        ) => {

            const isCompleted =
                index <
                progress.completedCount;


            const isCurrent =
                index ===
                progress.completedCount;


            const isLocked =
                index >
                progress.completedCount;


            const stateClass =
                isCompleted
                    ? "completed"
                    : isCurrent
                        ? "current"
                        : "locked";


            let nodeIcon =
                index + 1;


            if (
                isCompleted
            ) {

                nodeIcon =
                    "✓";

            }


            html += `

                <div
                    class="
                        path-node-wrapper
                        ${stateClass}
                    "
                >


                    ${
                        index > 0

                            ? `
                                <div
                                    class="
                                        path-connector
                                        ${
                                            isCompleted
                                                ? "completed"
                                                : ""
                                        }
                                    "
                                ></div>
                            `

                            : ""

                    }


                    <button
                        class="
                            path-node
                            ${stateClass}
                        "
                        onclick="
                            openNode(
                                ${index}
                            )
                        "
                    >

                        ${nodeIcon}

                    </button>


                    <div
                        class="path-node-content"
                    >

                        <div
                            class="path-node-title"
                        >

                            Тренировка
                            ${index + 1}

                        </div>


                        <div
                            class="path-node-subtitle"
                        >

                            ${workout.phaseLabel}

                            ·

                            ${formatKg(
                                workout.estMax
                            )}
                            кг

                        </div>


                        ${
                            isCurrent

                                ? `
                                    <div
                                        class="
                                            current-workout-label
                                        "
                                    >

                                        Следующая
                                        тренировка

                                    </div>
                                `

                                : ""

                        }


                        ${
                            isCompleted

                                ? `
                                    <div
                                        class="
                                            completed-workout-label
                                        "
                                    >

                                        Выполнено

                                    </div>
                                `

                                : ""

                        }

                    </div>


                    <div
                        class="
                            path-node-arrow
                            ${
                                isLocked
                                    ? "locked"
                                    : ""
                            }
                        "
                    >

                        ›

                    </div>


                </div>

            `;

        }
    );


    if (
        progress.completedCount >=
        progress.workouts.length
    ) {

        html += `

            <div
                class="path-finished-card"
            >

                <div
                    class="finished-icon"
                >

                    🎉

                </div>


                <h3>

                    Путь завершён!

                </h3>


                <p>

                    Ты прошёл весь
                    тренировочный план

                </p>


                <button
                    class="next-btn"
                    onclick="
                        extendGoal()
                    "
                >

                    Поставить
                    новую цель

                </button>

            </div>

        `;

    }


    return html;

}


// =========================================
// ОТКРЫТИЕ ТРЕНИРОВКИ
// =========================================

function openNode(
    index
) {

    const progress =
        userProgress[
            activeLift
        ];


    if (
        !progress
    ) {
        return;
    }


    if (
        index >
        progress.completedCount
    ) {

        alert(
            "Сначала пройди предыдущие тренировки 💪"
        );

        return;

    }


    viewingNodeIndex =
        index;


    renderApp();

}


// =========================================
// ЗАКРЫТИЕ ТРЕНИРОВКИ
// =========================================

function closeNode() {

    viewingNodeIndex =
        null;

    renderApp();

}

// =========================================
// ДЕТАЛЬНАЯ СТРАНИЦА ТРЕНИРОВКИ
// =========================================

function getWorkoutDetailHtml() {

    const progress =
        userProgress[
            activeLift
        ];

    if (!progress) {
        return "";
    }


    const workout =
        progress.workouts[
            viewingNodeIndex
        ];

    if (!workout) {
        return "";
    }


    const liftInfo =
        LIFTS[
            activeLift
        ];


    const isCurrent =
        viewingNodeIndex ===
        progress.completedCount;


    const isCompleted =
        viewingNodeIndex <
        progress.completedCount;


    let setsHtml = "";


    workout.sets.forEach(
        (
            set,
            index
        ) => {

            const isChecked =
                workout.checked[index];


            setsHtml += `

                <div
                    class="
                        set-row
                        ${
                            isChecked
                                ? "checked"
                                : ""
                        }
                    "
                >

                    <div
                        class="set-number"
                    >

                        ${index + 1}

                    </div>


                    <div
                        class="set-main"
                    >

                        <div
                            class="set-weight"
                        >

                            ${formatKg(
                                set.weight
                            )}
                            кг

                        </div>


                        <div
                            class="set-reps"
                        >

                            ${set.reps}
                            повторов

                        </div>

                    </div>


                    <div
                        class="
                            set-type
                            ${set.type}
                        "
                    >

                        ${set.label}

                    </div>


                    ${
                        isCurrent

                            ? `

                                <button
                                    class="
                                        set-check
                                        ${
                                            isChecked
                                                ? "active"
                                                : ""
                                        }
                                    "
                                    onclick="
                                        toggleSetCheck(
                                            ${index}
                                        )
                                    "
                                >

                                    ${
                                        isChecked
                                            ? "✓"
                                            : ""
                                    }

                                </button>

                            `

                            : isCompleted

                                ? `

                                    <div
                                        class="
                                            set-completed
                                        "
                                    >

                                        ✓

                                    </div>

                                `

                                : ""

                    }

                </div>

            `;

        }
    );


    let actionHtml = "";


    if (
        isCurrent
    ) {

        const allChecked =
            workout.checked.every(
                checked => checked
            );


        actionHtml = `

            <button
                class="
                    next-btn
                    ${
                        !allChecked
                            ? "disabled"
                            : ""
                    }
                "
                onclick="
                    completeNode()
                "
            >

                Завершить
                тренировку

                ✓

            </button>

        `;

    } else if (
        isCompleted
    ) {

        actionHtml = `

            <div
                class="completed-badge"
            >

                ✓ Тренировка выполнена

            </div>

        `;

    } else {

        actionHtml = `

            <div
                class="completed-badge"
            >

                Сначала пройди предыдущие
                тренировки

            </div>

        `;

    }


    return `

        <div class="workout-detail">


            <div class="top-bar">

                <button
                    class="back-btn"
                    onclick="
                        closeNode()
                    "
                >

                    ←

                </button>


                <h2
                    class="top-bar-title"
                >

                    ${liftInfo.label}

                </h2>

            </div>


            <div
                class="workout-header-row"
            >

                <div>

                    <h2>

                        Тренировка
                        ${viewingNodeIndex + 1}

                    </h2>


                    <div
                        class="workout-subtitle"
                    >

                        ${liftInfo.icon}
                        ${liftInfo.label}

                    </div>

                </div>


                <div
                    class="max-badge"
                >

                    1ПМ =

                    ${formatKg(
                        workout.estMax
                    )}

                    кг

                </div>

            </div>


            <div
                class="workout-meta"
            >

                <div
                    class="workout-meta-top"
                >

                    <div
                        class="phase-chip"
                    >

                        ${workout.phaseLabel}

                    </div>


                    <div
                        class="stage-chip"
                    >

                        Этап
                        ${workout.blockIndex + 1}

                    </div>

                </div>


                <div
                    class="phase-note"
                >

                    ${workout.phaseNote}

                </div>

            </div>


            <div
                class="sets-list"
            >

                ${setsHtml}

            </div>


            ${actionHtml}


        </div>

    `;

}


// =========================================
// ОТМЕТКА ПОДХОДА
// =========================================

function toggleSetCheck(
    setIndex
) {

    const progress =
        userProgress[
            activeLift
        ];


    if (!progress) {
        return;
    }


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


    workout.checked[
        setIndex
    ] =
        !workout.checked[
            setIndex
        ];


    saveState();

    renderApp();

}


// =========================================
// ЗАВЕРШЕНИЕ ТРЕНИРОВКИ
// =========================================

function completeNode() {

    const progress =
        userProgress[
            activeLift
        ];


    if (!progress) {
        return;
    }


    const workout =
        progress.workouts[
            progress.completedCount
        ];


    if (!workout) {
        return;
    }


    const allChecked =
        workout.checked.every(
            checked => checked
        );


    if (
        !allChecked
    ) {

        alert(
            "Сначала отметь все подходы"
        );

        return;

    }


    workout.completed =
        true;


    progress.completedCount++;


    // После завершения тренировки
    // сохраняем текущий предполагаемый
    // максимум для графика прогресса.

    if (
        !progress.history
    ) {

        progress.history = [];

    }


    progress.history.push({

        workout:
            progress.completedCount,

        estMax:
            workout.estMax,

        date:
            new Date().toISOString()

    });


    saveState();


    viewingNodeIndex =
        null;


    renderApp();

}


// =========================================
// ДОБАВЛЕНИЕ НОВОЙ ЦЕЛИ
// =========================================

function extendGoal() {

    const progress =
        userProgress[
            activeLift
        ];


    if (!progress) {
        return;
    }


    const input =
        window.prompt(

            `Текущая цель: ` +
            `${formatKg(
                progress.goal
            )} кг.\n\n` +

            `Какую новую цель хочешь поставить?`

        );


    if (
        input === null
    ) {
        return;
    }


    const newGoal =
        parseFloat(input);


    if (
        isNaN(newGoal)
    ) {

        alert(
            "Введите корректный вес"
        );

        return;

    }


    if (
        newGoal <=
        progress.goal
    ) {

        alert(
            "Новая цель должна быть больше текущей"
        );

        return;

    }


    const roundedGoal =
        roundToStep(
            newGoal
        );


    const liftInfo =
        LIFTS[
            activeLift
        ];


    const nextStart =
        progress.goal +
        liftInfo.increment;


    const extraWorkouts =
        generateWorkouts(
            nextStart,
            roundedGoal,
            progress.frequency,
            activeLift
        );


    progress.workouts =
        progress.workouts.concat(
            extraWorkouts
        );


    progress.goal =
        roundedGoal;


    saveState();

    renderApp();

}


// =========================================
// ДОРАБОТАННОЕ ЗАВЕРШЕНИЕ ОНБОРДИНГА
// =========================================
//
// Эта версия заменяет функцию
// finalizeOnboarding из части 2.
//
// Она умеет работать как при первом
// запуске, так и при добавлении
// нового лифта.

function finalizeOnboarding() {

    onboardingLiftFlow
        .filter(
            step =>
                step.type ===
                "frequency"
        )
        .forEach(
            step => {

                const lift =
                    step.lift;


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


                if (
                    !current ||
                    !goal
                ) {
                    return;
                }


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

                    completedCount: 0,

                    history: []

                };

            }
        );


    // Если добавлялся новый лифт,
    // делаем его активным.

    if (
        onboardingLiftFlow.length === 3
    ) {

        activeLift =
            onboardingLiftFlow[0]
                .lift;

    }


    if (
        !activeLift
    ) {

        activeLift =
            selectedLifts[0];

    }


    viewingNodeIndex =
        null;


    onboardingLiftFlow = [];

    onboardingStepIndex = 0;

    tempAnswers = {};


    appState =
        "main";


    activeTab =
        "path";


    saveState();

    renderApp();

}


// =========================================
// ГРАФИК ПРОГРЕССА
// =========================================

function getProgressChartHtml() {

    if (
        !activeLift ||
        !userProgress[
            activeLift
        ]
    ) {

        return "";

    }


    const progress =
        userProgress[
            activeLift
        ];


    const liftInfo =
        LIFTS[
            activeLift
        ];


    const history =
        progress.history || [];


    const total =
        progress.workouts.length;


    const completed =
        progress.completedCount;


    const percentage =
        total > 0

            ? Math.min(
                100,
                Math.round(
                    completed /
                    total *
                    100
                )
            )

            : 0;


    const currentValue =
        history.length > 0

            ? history[
                history.length - 1
            ].estMax

            : progress.current;


    const goalValue =
        progress.goal;


    const points =
        buildChartPoints(
            progress
        );


    return `

        <div
            class="progress-chart-card"
        >


            <div
                class="chart-header"
            >

                <div>

                    <div
                        class="chart-title"
                    >

                        Твой прогресс

                    </div>


                    <div
                        class="chart-subtitle"
                    >

                        ${liftInfo.icon}

                        ${liftInfo.label}

                    </div>

                </div>


                <div
                    class="chart-percent"
                >

                    ${percentage}%

                </div>

            </div>


            <div
                class="chart-visual"
            >

                <svg
                    class="progress-svg"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >

                    <polyline
                        class="chart-line-svg"
                        points="${points}"
                    />

                </svg>

            </div>


            <div
                class="chart-labels"
            >


                <div>

                    <span>

                        Сейчас

                    </span>


                    <b>

                        ${formatKg(
                            currentValue
                        )}
                        кг

                    </b>

                </div>


                <div
                    class="chart-center-label"
                >

                    <span>

                        Тренировок

                    </span>


                    <b>

                        ${completed}
                        /
                        ${total}

                    </b>

                </div>


                <div
                    class="chart-goal-label"
                >

                    <span>

                        Цель

                    </span>


                    <b>

                        ${formatKg(
                            goalValue
                        )}
                        кг

                    </b>

                </div>


            </div>


        </div>

    `;

}


// =========================================
// ТОЧКИ ДЛЯ SVG ГРАФИКА
// =========================================

function buildChartPoints(
    progress
) {

    const history =
        progress.history || [];


    let values = [

        progress.current

    ];


    history.forEach(
        item => {

            values.push(
                item.estMax
            );

        }
    );


    if (
        values.length === 1
    ) {

        values.push(
            progress.current
        );

    }


    const goal =
        progress.goal;


    const min =
        Math.min(
            ...values
        );


    const max =
        Math.max(
            goal,
            ...values
        );


    const range =
        max - min || 1;


    return values
        .map(
            (
                value,
                index
            ) => {

                const x =
                    values.length === 1

                        ? 0

                        : (
                            index /
                            (
                                values.length - 1
                            )
                        ) *
                        100;


                const y =
                    90 -
                    (
                        (
                            value -
                            min
                        ) /
                        range
                    ) *
                    75;


                return `${x},${y}`;

            }
        )
        .join(" ");

}


// =========================================
// ВКЛАДКА "ПРОФИЛЬ"
// =========================================

function getProfileTabHtml() {

    const planName =
        unlockedLiftCount === 1

            ? "Free"

            : unlockedLiftCount === 2

                ? "2 лифта"

                : "Premium";


    return `

        <div class="page-enter">


            <h2>

                Твой

                <span class="accent">

                    профиль

                </span>

            </h2>


            <p class="subtitle">

                Следи за своим
                результатом и прогрессом

            </p>


            ${getProgressChartHtml()}


            <div
                class="profile-plan-card"
            >


                <div
                    class="profile-plan-icon"
                >

                    ⭐

                </div>


                <div
                    class="profile-plan-info"
                >

                    <div
                        class="profile-plan-title"
                    >

                        Твой тариф

                    </div>


                    <div
                        class="profile-plan-name"
                    >

                        ${planName}

                    </div>

                </div>


                <div
                    class="profile-plan-count"
                >

                    ${unlockedLiftCount}
                    /3

                </div>


            </div>


            ${
                unlockedLiftCount < 3

                    ? `

                        <button
                            class="next-btn"
                            onclick="
                                switchTab(
                                    'premium'
                                )
                            "
                        >

                            Открыть
                            больше лифтов

                        </button>

                    `

                    : `

                        <div
                            class="
                                premium-active
                            "
                        >

                            ✓ Все лифты открыты

                        </div>

                    `

            }


            <button
                class="secondary-btn"
                onclick="
                    resetProgress()
                "
            >

                Сбросить весь прогресс

            </button>


        </div>

    `;

}


// =========================================
// PREMIUM
// =========================================

function getPremiumTabHtml() {

    const canBuyTwo =
        unlockedLiftCount < 2;


    const canBuyThree =
        unlockedLiftCount < 3;


    return `

        <div class="page-enter">


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


            <div
                class="plan-card"
            >

                <div
                    class="plan-title"
                >

                    Free

                </div>


                <ul
                    class="plan-list"
                >

                    <li>

                        1 лифт на выбор

                    </li>

                </ul>

            </div>


            <div
                class="plan-card premium"
            >

                <div
                    class="plan-title"
                >

                    2 лифта

                </div>


                <div
                    class="plan-price"
                >

                    €1

                </div>


                <ul
                    class="plan-list"
                >

                    <li>

                        Любые 2 из 3 лифтов

                    </li>


                    <li>

                        Отдельный путь
                        прогрессии для каждого

                    </li>

                </ul>


                ${
                    canBuyTwo

                        ? `

                            <button
                                class="
                                    upgrade-btn
                                "
                                onclick="
                                    goToUpgrade(2)
                                "
                            >

                                Открыть за €1

                            </button>

                        `

                        : `

                            <div
                                class="
                                    plan-unlocked
                                "
                            >

                                ✓ Уже открыто

                            </div>

                        `

                }

            </div>


            <div
                class="plan-card premium"
            >

                <div
                    class="plan-title"
                >

                    Все 3 лифта

                </div>


                <div
                    class="plan-price"
                >

                    €2

                </div>


                <ul
                    class="plan-list"
                >

                    <li>

                        Жим лёжа

                    </li>


                    <li>

                        Присед

                    </li>


                    <li>

                        Становая тяга

                    </li>

                </ul>


                ${
                    canBuyThree

                        ? `

                            <button
                                class="
                                    upgrade-btn
                                "
                                onclick="
                                    goToUpgrade(3)
                                "
                            >

                                Открыть за €2

                            </button>

                        `

                        : `

                            <div
                                class="
                                    plan-unlocked
                                "
                            >

                                ✓ Всё открыто

                            </div>

                        `

                }

            </div>


        </div>

    `;

}


// =========================================
// PREMIUM В ОНБОРДИНГЕ
// =========================================

function renderPremiumStandalone() {

    const app =
        document.getElementById(
            "app"
        );


    app.innerHTML = `

        <div class="screen-inner page-enter">


            <div
                class="top-bar"
            >

                <button
                    class="back-btn"
                    onclick="
                        backToLiftSelection()
                    "
                >

                    ←

                </button>

            </div>


            ${getPremiumTabHtml()}


        </div>

    `;

}


function backToLiftSelection() {

    appState =
        "onboarding-lift-select";

    renderLiftSelect();

}


// =========================================
// PAYPAL
// =========================================

function goToUpgrade(
    tier
) {

    if (
        tier <=
        unlockedLiftCount
    ) {
        return;
    }


    const price =
        tier === 2
            ? "1.00"
            : "2.00";


    const title =
        tier === 2

            ? "Открыть 2 лифта"

            : "Открыть все 3 лифта";


    showPaymentModal(
        tier,
        price,
        title
    );

}

// ОКНО ОПЛАТЫ

function showPaymentModal(
    tier,
    price,
    title
) {

    const oldModal =
        document.querySelector(
            ".payment-modal"
        );


    if (
        oldModal
    ) {

        oldModal.remove();

    }


    const modal =
        document.createElement(
            "div"
        );


    modal.className =
        "payment-modal";


    modal.innerHTML = `

        <div
            class="payment-box"
        >


            <button
                class="payment-close"
                onclick="
                    closePaymentModal()
                "
            >

                ×

            </button>


            <div
                class="payment-icon"
            >

                💳

            </div>


            <h2>

                ${title}

            </h2>


            <p
                class="subtitle"
            >

                После успешной оплаты
                новые лифты будут
                доступны в приложении

            </p>


            <div
                class="payment-price"
            >

                €${price}

            </div>


            <div
                id="
                    paypal-button-container
                "
            ></div>


        </div>

    `;


    document.body.appendChild(
        modal
    );


    paymentModalOpen =
        true;


    // Проверяем,
    // подключён ли PayPal SDK.

    if (
        typeof paypal ===
        "undefined"
    ) {

        document.getElementById(
            "paypal-button-container"
        ).innerHTML = `

            <div
                class="
                    paypal-not-connected
                "
            >

                <strong>

                    PayPal пока
                    не подключён

                </strong>


                <p>

                    Добавь свой
                    PayPal Client ID
                    в index.html

                </p>

            </div>

        `;


        return;

    }


    paypal.Buttons({

        createOrder:
            function(
                data,
                actions
            ) {

                return actions.order.create({

                    purchase_units: [

                        {

                            amount: {

                                value:
                                    price,

                                currency_code:
                                    "EUR"

                            },


                            description:

                                `Athera Fit — ${title}`

                        }

                    ]

                });

            },


        onApprove:
            function(
                data,
                actions
            ) {

                return actions.order.capture()
                    .then(
                        function(
                            details
                        ) {

                            handleSuccessfulPayment(
                                tier,
                                details
                            );

                        }
                    );

            },


        onError:
            function(
                error
            ) {

                console.error(
                    "Ошибка PayPal:",
                    error
                );


                alert(
                    "Не удалось выполнить оплату. Попробуй ещё раз."
                );

            }


    }).render(
        "#paypal-button-container"
    );

}

// УСПЕШНАЯ ОПЛАТА

function handleSuccessfulPayment(
    tier,
    details
) {

    // ВАЖНО:
    //
    // Сейчас это клиентская
    // демонстрационная проверка.
    //
    // Для настоящего коммерческого
    // приложения проверка платежа
    // должна выполняться через сервер.
    //
    // Сервер получает Order ID,
    // проверяет его через PayPal API
    // и только после этого
    // открывает Premium.


    if (
        tier > unlockedLiftCount
    ) {

        unlockedLiftCount =
            tier;

    }


    saveState();


    closePaymentModal();


    alert(
        "Оплата прошла успешно! 🎉\n\n" +
        "Новые лифты теперь доступны."
    );


    appState =
        "main";


    activeTab =
        "path";


    renderApp();

}


// =========================================
// ЗАКРЫТИЕ ОКНА ОПЛАТЫ
// =========================================

function closePaymentModal() {

    const modal =
        document.querySelector(
            ".payment-modal"
        );


    if (
        modal
    ) {

        modal.remove();

    }


    paymentModalOpen =
        false;

}

// ЗАГРУЗКА PAYPAL SDK

function loadPayPalSdk(
    clientId
) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            if (
                typeof paypal !==
                "undefined"
            ) {

                resolve();

                return;

            }


            const script =
                document.createElement(
                    "script"
                );


            script.src =
                `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR`;


            script.onload =
                resolve;


            script.onerror =
                reject;


            document.head.appendChild(
                script
            );

        }
    );

}
// ЗАПУСК ПРИЛОЖЕНИЯ
try {

    const hasSavedState =
        loadState();


    if (
        hasSavedState
    ) {

        appState =
            "main";


        activeTab =
            "path";


        // Для старых сохранений,
        // у которых ещё нет history.

        Object.keys(
            userProgress
        ).forEach(
            lift => {

                if (
                    !userProgress[lift]
                        .history
                ) {

                    userProgress[lift]
                        .history =
                        [];

                }

            }
        );


        renderApp();

    } else {

        appState =
            "onboarding-lift-select";


        renderLiftSelect();

    }

} catch (
    error
) {

    console.error(
        "Ошибка запуска приложения:",
        error
    );


    document.getElementById(
        "app"
    ).innerHTML = `

        <div
            class="screen-inner"
        >

            <h2>

                Что-то пошло не так

            </h2>


            <p
                class="subtitle"
            >

                ${error.message}

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

                Сбросить
                и начать заново

            </button>


        </div>

    `;

}