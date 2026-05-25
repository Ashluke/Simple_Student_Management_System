import {
    getStudents,
    getAssessments,
    createAssessment,
    updateAssessment,
    getAssessmentConfig,
    createAssessmentConfig,   // ← NEW: needed to persist config on first save
    updateAssessmentConfig
} from "./api.js";

// Param
const classId = Number(new URLSearchParams(window.location.search).get("classId"));

// DOM
const studentRow = document.getElementById("student-row") as HTMLElement;
const excelGrid = document.getElementById("excel-grid") as HTMLElement;
const maxRow = document.getElementById("max-row") as HTMLElement;
const assessmentBtn = document.getElementById("assessment") as HTMLButtonElement;
const assessmentTitle = document.getElementById("assessment-title") as HTMLElement;

// Columns
const COLUMN_CONFIG = {
    score: 15,
    attendance: 20,
    exam: 2,
    grade: 4
} as const;

type Mode = keyof typeof COLUMN_CONFIG;

const ASSESSMENT_TITLES: Record<Mode, string> = {
    score: "Test Scores",
    attendance: "Attendance",
    exam: "Exam Scores",
    grade: "Grades"
};

let assessmentMode: Mode = "score";
let maxScores: (number | null)[] = [];
let isLoading = false;

let scoreConfig: any = null;
let examConfig: any = null;

// INIT
document.addEventListener("DOMContentLoaded", loadAssessment);
window.addEventListener("studentsChanged", loadAssessment);

// Mode switch
assessmentBtn.addEventListener("click", async () => {
    const order: Mode[] = ["score", "attendance", "exam", "grade"];
    const idx = order.indexOf(assessmentMode);
    assessmentMode = order[(idx + 1) % order.length];

    updateAssessmentTitle();
    await loadAssessment();
});

// Title
function updateAssessmentTitle() {
    assessmentTitle.textContent = ASSESSMENT_TITLES[assessmentMode];
}

// Load max scores
async function loadMaxScores() {
    const configs = await getAssessmentConfig(classId);

    scoreConfig = configs.find((c: any) => c.data?.type === "score") || null;  // ← c.data.type
    examConfig  = configs.find((c: any) => c.data?.type === "exam")  || null;  // ← c.data.type

    if (assessmentMode === "score") {
        maxScores = scoreConfig?.data?.max_scores ?? [];
    }

    if (assessmentMode === "exam") {
        maxScores = [
            examConfig?.data?.maxMidtermScore ?? null,
            examConfig?.data?.maxEndtermScore ?? null
        ];
    }

    renderMaxRow();
}

// Load attendance dates
async function loadAttendanceDates() {
    const configs = await getAssessmentConfig(classId);
    const attendanceConfig = configs.find((c: any) => c.data?.type === "attendance") || null;  // ← c.data.type
    const savedDates: string[] = attendanceConfig?.data?.dates ?? [];

    renderMaxRow();

    const allDateInputs = maxRow.querySelectorAll<HTMLInputElement>(".attendance-date");
    allDateInputs.forEach((input, i) => {
        input.value = savedDates[i] ?? "";
    });
}

// Save config
async function saveScoreConfig() {
    const data = { type: "score", max_scores: maxScores };
     console.log("saveScoreConfig called", { scoreConfig, data });

    if (scoreConfig) {
        const res = await updateAssessmentConfig(scoreConfig.id, classId, { data });
        console.log("update response:", res);
    } else {
        scoreConfig = await createAssessmentConfig(classId, data);
        console.log("create response:", scoreConfig);
    }
}

async function saveExamConfig() {
    const data = { type: "exam", maxMidtermScore: maxScores[0], maxEndtermScore: maxScores[1] };

    if (examConfig) {
        await updateAssessmentConfig(examConfig.id, classId, { data });
    } else {
        examConfig = await createAssessmentConfig(classId, data);
    }
}

async function saveAttendanceConfig(dates: string[]) {
    const data = { type: "attendance", dates };
    const configs = await getAssessmentConfig(classId);
    const attendanceConfig = configs.find((c: any) => c.data?.type === "attendance") || null;  // ← c.data.type

    if (attendanceConfig) {
        await updateAssessmentConfig(attendanceConfig.id, classId, { data });
    } else {
        await createAssessmentConfig(classId, data);
    }
}

// Render max rows
function renderMaxRow() {
    maxRow.innerHTML = "";

    // SCORE
    if (assessmentMode === "score") {
        for (let i = 0; i < COLUMN_CONFIG.score; i++) {
            const input = document.createElement("input");
            input.type = "number";
            input.classList.add("score-box");
            input.placeholder = `Max ${i + 1}`;
            input.value = maxScores[i]?.toString() ?? "";

            input.addEventListener("change", async () => {
                maxScores[i] = input.value === "" ? null : Number(input.value);
                await saveScoreConfig();
            });

            maxRow.appendChild(input);
        }
        return;
    }

    // EXAM
    if (assessmentMode === "exam") {
        const labels = ["Max Mid", "Max End"];

        for (let i = 0; i < 2; i++) {
            const input = document.createElement("input");
            input.type = "number";
            input.classList.add("score-box");
            input.placeholder = labels[i];
            input.value = maxScores[i]?.toString() ?? "";

            input.addEventListener("change", async () => {
                maxScores[i] = input.value === "" ? null : Number(input.value);
                await saveExamConfig();
            });

            maxRow.appendChild(input);
        }
        return;
    }

    // GRADE headers
    if (assessmentMode === "grade") {
        ["Midterm Grade", "Endterm Grade", "Final Grade", "GWA"].forEach(label => {
            const div = document.createElement("div");
            div.classList.add("score-box");
            div.textContent = label;
            maxRow.appendChild(div);
        });
        return;
    }

    // ATTENDANCE date headers
    // ATTENDANCE date headers
    for (let i = 0; i < COLUMN_CONFIG.attendance; i++) {
        const cell = document.createElement("input");
        cell.type = "text";
        cell.placeholder = "MM/DD";
        cell.classList.add("attendance-date");

        cell.addEventListener("change", async () => {               // ← NEW
            const allDateInputs = maxRow.querySelectorAll<HTMLInputElement>(".attendance-date");
            const dates = Array.from(allDateInputs).map(x => x.value);
            await saveAttendanceConfig(dates);
        });

        maxRow.appendChild(cell);
    }
}

// Main load
async function loadAssessment() {
    if (isLoading) return;
    isLoading = true;

    try {
        updateAssessmentTitle();

        studentRow.innerHTML = "";
        excelGrid.innerHTML = "";
        maxRow.innerHTML = "";

        if (assessmentMode === "score" || assessmentMode === "exam") {
            await loadMaxScores();
        } else if (assessmentMode === "attendance") {
            await loadAttendanceDates();   // ← load saved dates before rendering
        } else {
            renderMaxRow();
        }

        const students = await getStudents(classId);
        const assessments = await getAssessments(classId);

        const map = new Map<string, any>();
        assessments.forEach((a: any) => {
            map.set(`${a.student_id}-${a.type}`, { id: a.id, data: a.data });
        });

        students.forEach((s: any) => {

            // STUDENT ROW
            const studentDiv = document.createElement("div");
            studentDiv.classList.add("student");
            studentDiv.setAttribute("data-id", s.id);
            studentDiv.innerHTML = `
                <button>🗑</button>
                <p class="student-name">${s.name}</p>
            `;
            studentRow.appendChild(studentDiv);

            // GRID
            const excelDiv = document.createElement("div");
            excelDiv.classList.add("excel");
            excelDiv.setAttribute("data-id", s.id);

            const record = map.get(`${s.id}-${assessmentMode}`);
            const data = record?.data;

            const total =
                assessmentMode === "exam"       ? 2 :
                assessmentMode === "attendance" ? COLUMN_CONFIG.attendance :
                assessmentMode === "grade"      ? 4 :
                COLUMN_CONFIG.score;

            for (let i = 0; i < total; i++) {
                const input = document.createElement("input");

                if (assessmentMode === "attendance") {
                    input.type = "checkbox";
                    input.classList.add("attendance-box");
                    (input as HTMLInputElement).checked = data?.present?.[i] ?? false;
                }
                else if (assessmentMode === "score") {
                    input.type = "number";
                    input.classList.add("score-box");
                    input.value = data?.scores?.[i] ?? "";
                }
                else if (assessmentMode === "exam") {
                    input.type = "number";
                    input.classList.add("score-box");
                    input.value = i === 0 ? data?.midtermScore ?? "" : data?.endtermScore ?? "";
                }
                else if (assessmentMode === "grade") {
                    input.type = "number";
                    input.classList.add("score-box");
                    input.value =
                        i === 0 ? data?.midtermGrade ?? "" :
                        i === 1 ? data?.endtermGrade ?? "" :
                        i === 2 ? data?.finalGrade ?? "" :
                        data?.gwa ?? "";
                }

                input.addEventListener("change", async () => {
                    const inputs = excelDiv.querySelectorAll("input");
                    let payload: any;

                    if (assessmentMode === "attendance") {
                        const present = Array.from(inputs).map(
                            (x) => (x as HTMLInputElement).checked
                        );
                        payload = {
                            class_id: classId,
                            student_id: s.id,
                            data: {
                                type: "attendance",
                                present    
                            }
                        };
                    }
                    else if (assessmentMode === "score") {
                        const scores = Array.from(inputs).map(
                            (x) => (x as HTMLInputElement).value === "" ? null : Number((x as HTMLInputElement).value)
                        );
                        payload = {
                            class_id: classId,
                            student_id: s.id,
                            data: {
                                type: "score",
                                scores       
                            }
                        };
                    }
                    else if (assessmentMode === "exam") {
                        const midterm = (inputs[0] as HTMLInputElement).value === ""
                            ? null : Number((inputs[0] as HTMLInputElement).value);
                        const endterm = (inputs[1] as HTMLInputElement).value === ""
                            ? null : Number((inputs[1] as HTMLInputElement).value);

                        payload = {
                            class_id: classId,
                            student_id: s.id,
                            data: {
                                type: "exam",
                                midtermScore: midterm,
                                endtermScore: endterm
                            }
                        };
                    }
                    else if (assessmentMode === "grade") {
                        const values = Array.from(inputs).map(
                            (x) => (x as HTMLInputElement).value === "" ? null : Number((x as HTMLInputElement).value)
                        );
                        payload = {
                            class_id: classId,
                            student_id: s.id,
                            data: {
                                type: "grade",
                                midtermGrade: values[0],
                                endtermGrade: values[1],
                                finalGrade:   values[2],
                                gwa:          values[3]
                            }
                        };
                    }

                    if (record?.id) {
                        await updateAssessment(record.id, classId, payload);
                    } else {
                        await createAssessment(payload);
                        window.dispatchEvent(new Event("studentsChanged"));
                    }
                });

                excelDiv.appendChild(input);
            }

            excelGrid.appendChild(excelDiv);
        });

    } finally {
        isLoading = false;
    }
}