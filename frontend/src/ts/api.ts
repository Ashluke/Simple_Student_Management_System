// Classes
export async function getClasses() {
    const res = await fetch("/classes/");
    if (!res.ok) throw new Error("Failed to load classes");
    return res.json();
}

export async function createClass(data: any) {
    const res = await fetch("/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error("Failed to create class");
    return res.json();
}

export async function deleteClass(id: number) {
    const res = await fetch(`/classes/${id}`, {
        method: "DELETE"
    });

    if (!res.ok) throw new Error("Failed to delete class");
    return res.json().catch(() => ({}));
}

export async function getClass(classId: number) {
    const res = await fetch(`/classes/${classId}`);
    if (!res.ok) throw new Error("Failed to load class");
    return res.json();
}


// Students
export async function getStudents(classId: number) {
    const res = await fetch(`/classes/${classId}/students`);
    if (!res.ok) throw new Error("Failed to load students");
    return res.json();
}

export async function createStudent(data: any) {
    const res = await fetch(`/classes/${data.class_id}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error("Failed to create student");
    return res.json();
}

export async function deleteStudent(classId: number, studentId: number) {
    const res = await fetch(`/classes/${classId}/students/${studentId}`, {
        method: "DELETE"
    });

    if (!res.ok) throw new Error("Failed to delete student");
    return res.json().catch(() => ({}));
}


// Assessments
export async function getAssessments(classId: number) {
    const res = await fetch(`/classes/${classId}/assessments`);
    if (!res.ok) throw new Error("Failed to load assessments");
    return res.json();
}

export async function createAssessment(data: any) {
    const res = await fetch(`/classes/${data.class_id}/assessments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error("Failed to create assessment");
    return res.json();
}

export async function updateAssessment(classId: number, assessmentId: number, data: any) {
    const res = await fetch(`/classes/${classId}/assessments/${assessmentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error("Failed to update assessment");
    return res.json();
}

export async function deleteAssessment(classId: number, assessmentId: number) {
    const res = await fetch(`/classes/${classId}/assessments/${assessmentId}`, {
        method: "DELETE"
    });

    if (!res.ok) throw new Error("Failed to delete assessment");
    return res.json().catch(() => ({}));
}


// Config
export async function getAssessmentConfig(classId: number) {
    const res = await fetch(`/classes/${classId}/configs`);
    if (!res.ok) throw new Error("Failed to load config");
    return res.json();
}

export async function createAssessmentConfig(classId: number, data: any) {
    const res = await fetch(`/classes/${classId}/configs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_id: classId, data })  // class_id in body too
    });

    if (!res.ok) throw new Error("Failed to create config");
    return res.json();
}

export async function updateAssessmentConfig(configId: number, classId: number, data: any) {
    const res = await fetch(`/classes/${classId}/configs/${configId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error("Failed to update config");
    return res.json();
}