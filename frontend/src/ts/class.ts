import { getClasses, createClass, deleteClass } from "./api.js";
import { openModal, closeModal } from "./utils.js";

// DOM
const boxContainer = document.getElementById("box-container") as HTMLElement;
const addBox = document.querySelector(".add-box") as HTMLElement;

const modal = document.getElementById("addClassModal") as HTMLElement;
const overlay = document.getElementById("overlay") as HTMLElement;
const createBtn = document.getElementById("createBtn") as HTMLElement;
const closeBtn = document.getElementById("closeBtn") as HTMLElement;

const deleteModal = document.getElementById("deleteModal") as HTMLElement;
const deleteText = document.getElementById("deleteText") as HTMLElement;
const confirmDeleteBtn = document.getElementById("confirmDelete") as HTMLElement;
const cancelDeleteBtn = document.getElementById("cancelDelete") as HTMLElement;

const nameInput = document.getElementById("className") as HTMLInputElement;
const imagePicker = document.getElementById("imagePicker") as HTMLElement;
const imageInput = document.getElementById("imageInput") as HTMLInputElement;
const previewImg = document.getElementById("previewImg") as HTMLImageElement;
const pickerText = document.getElementById("pickerText") as HTMLElement;

// State
let selectedImage: string | null = null;
let classToDelete: HTMLElement | null = null;

// Colors
const palette = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];
let colorIndex = 0;

function getNextColor() {
    const color = palette[colorIndex];
    colorIndex = (colorIndex + 1) % palette.length;
    return color;
}

// Image picker (doesn't cut image text length in db yet)
imagePicker.addEventListener("click", () => {
    imageInput.click();
});

imageInput.addEventListener("change", () => {
    const file = imageInput.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
        selectedImage = reader.result as string;

        previewImg.src = selectedImage;
        previewImg.style.display = "block";
        pickerText.style.display = "none";
    };

    reader.readAsDataURL(file);
});

// Load classes async function
async function loadClasses() {
    try {
        const data = await getClasses();

        boxContainer.innerHTML = "";

        if (!Array.isArray(data)) return;

        data.forEach((c: {
            id: number;
            name: string;
            color?: string;
            image?: string | null;
        }) => {
            createClassBox(c);
        });

        boxContainer.appendChild(addBox);

    } catch (err) {
        console.error("Failed to load classes:", err);
    }
}

// Create class function
function createClassBox(c: {
    id: number;
    name: string;
    color?: string;
    image?: string | null;
}) {
    const box = document.createElement("div");

    box.classList.add("class-box");
    box.setAttribute("data-action", "open");
    box.setAttribute("data-id", String(c.id));

    box.style.borderTop = `5px solid ${c.color ?? getNextColor()}`;

    const imageToUse =
        c.image && c.image.trim() !== ""
            ? c.image
            : getAvatar(c.name);

    box.innerHTML = `
        <img src="${imageToUse}">
        <h2>${c.name}</h2>
        <div class="menu">⋯</div>
    `;

    const menu = box.querySelector(".menu") as HTMLElement;

    menu.addEventListener("click", (e) => {
        e.stopPropagation();

        classToDelete = box;
        deleteText.textContent = `Are you sure you want to delete "${c.name}"?`;

        openModal(deleteModal, overlay);
    });

    boxContainer.appendChild(box);
}

// Fallback image generator function
function getAvatar(name: string) {
    const initials = name
        .split(" ")
        .map(w => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return `https://dummyimage.com/200x200/3b82f6/ffffff&text=${initials}`;
}

// Create class button
createBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();

    if (!name) {
        alert("Enter class name");
        return;
    }

    try {
        const res = await createClass({
            name,
            color: getNextColor(),
            image: selectedImage
        });

        if (!res) throw new Error("Create failed");

        // reset UI
        nameInput.value = "";
        selectedImage = null;
        imageInput.value = "";

        previewImg.src = "";
        previewImg.style.display = "none";
        pickerText.style.display = "block";

        closeModal(modal, overlay);

        await loadClasses();

    } catch (err) {
        console.error("Create class failed:", err);
    }
});

// Delete class with confirmation button
confirmDeleteBtn.addEventListener("click", async () => {
    if (!classToDelete) return;

    const id = Number(classToDelete.getAttribute("data-id"));
    if (!id) return;

    try {
        await deleteClass(id);

        classToDelete.remove();
        classToDelete = null;

        closeModal(deleteModal, overlay);

    } catch (err) {
        console.error("Delete failed:", err);
    }
});

cancelDeleteBtn.addEventListener("click", () => {
    classToDelete = null;
    closeModal(deleteModal, overlay);
});

// Modal
closeBtn.addEventListener("click", () => closeModal(modal, overlay));

overlay.addEventListener("click", () => {
    closeModal(modal, overlay);
    closeModal(deleteModal, overlay);
});

// Open class
document.getElementById("box-container")!.addEventListener("click", (e) => {
    const target = (e.target as HTMLElement).closest(".class-box, .add-box") as HTMLElement;
    if (!target) return;

    const action = target.getAttribute("data-action");
    const id = target.getAttribute("data-id");

    if (action === "open" && id) {
        window.location.href = `/student.html?classId=${id}`;
    }

    if (action === "add") {
        openModal(modal, overlay);
    }
});

// INIT
loadClasses();