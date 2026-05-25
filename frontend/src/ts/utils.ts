// Modal utils

export function openModal(modal: HTMLElement, overlay: HTMLElement) {
    modal.classList.remove("hidden");
    overlay.classList.remove("hidden");
}

export function closeModal(modal: HTMLElement, overlay: HTMLElement) {
    modal.classList.add("hidden");
    overlay.classList.add("hidden");
}

export function resetInput(input: HTMLInputElement) {
    input.value = "";
}