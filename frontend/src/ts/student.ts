import { createStudent, deleteStudent } from "./api.js";
import { openModal, closeModal } from "./utils.js";
import "./assessment.js";

// Param
const classId = Number(new URLSearchParams(window.location.search).get("classId"));

if (!classId || isNaN(classId)) {
    throw new Error("Invalid classId");
}

// DOM
const addStudentBtn = document.getElementById("add-student") as HTMLButtonElement;
const backButton = document.getElementById("back-button") as HTMLButtonElement;

const classNameEl = document.getElementById("class-name") as HTMLElement;

const addStudentModal = document.getElementById("addStudentModal") as HTMLElement;
const studentNameInput = document.getElementById("studentName") as HTMLInputElement;
const createStudentBtn = document.getElementById("createStudentBtn") as HTMLButtonElement;
const closeStudentModal = document.getElementById("closeStudentModal") as HTMLButtonElement;

const deleteStudentModal = document.getElementById("deleteStudentModal") as HTMLElement;
const deleteStudentText = document.getElementById("deleteStudentText") as HTMLElement;
const overlay = document.getElementById("overlay") as HTMLElement;

const confirmDeleteBtn = document.getElementById("confirmDeleteStudent") as HTMLButtonElement;
const cancelDeleteBtn = document.getElementById("cancelDeleteStudent") as HTMLButtonElement;

// State
let studentToDelete: number | null = null;

// Back button
backButton.addEventListener("click", () => {
    window.location.href = "/";
});

// Load class async function
async function loadClassName() {
    try {
        const res = await fetch(`/classes/${classId}`);

        if (!res.ok) throw new Error("Failed to load class");

        const data = await res.json();

        classNameEl.innerHTML = `
            <div class="class-container">
                <h2>${data.name}</h2>
            </div>
        `;
    } catch (err) {
        console.error("Class load error:", err);
        classNameEl.textContent = "Class not found";
    }
}

// Create student
createStudentBtn.addEventListener("click", async () => {
    const name = studentNameInput.value.trim();
    if (!name) return;

    try {
        const res = await createStudent({
            name,
            class_id: classId
        });

        if (!res) throw new Error("Create failed");

        studentNameInput.value = "";
        closeModal(addStudentModal, overlay);

        window.dispatchEvent(new Event("studentsChanged"));

    } catch (err) {
        console.error("Create student failed:", err);
    }
});

// Delete student
document.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest(".student button");
    if (!btn) return;

    const row = btn.closest(".student") as HTMLElement;
    if (!row) return;

    const id = Number(row.getAttribute("data-id"));
    const name = row.querySelector(".student-name")?.textContent ?? "";

    studentToDelete = id;

    deleteStudentText.textContent = `Delete ${name}?`;
    openModal(deleteStudentModal, overlay);
});

// Confirm delete
confirmDeleteBtn.addEventListener("click", async () => {
    if (!studentToDelete) return;

    try {
        await deleteStudent(classId, studentToDelete);

        studentToDelete = null;
        closeModal(deleteStudentModal, overlay);

        window.dispatchEvent(new Event("studentsChanged"));

    } catch (err) {
        console.error("Delete student failed:", err);
    }
});

// Cancel delete
cancelDeleteBtn.addEventListener("click", () => {
    studentToDelete = null;
    closeModal(deleteStudentModal, overlay);
});

// Modal
addStudentBtn.addEventListener("click", () => {
    openModal(addStudentModal, overlay);
});

closeStudentModal.addEventListener("click", () => {
    closeModal(addStudentModal, overlay);
});

overlay.addEventListener("click", () => {
    closeModal(addStudentModal, overlay);
    closeModal(deleteStudentModal, overlay);
    studentToDelete = null;
});

// INIT
loadClassName();