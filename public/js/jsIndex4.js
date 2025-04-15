document.addEventListener("DOMContentLoaded", () => {
    fetch("data/issues.json")
        .then(response => response.json())
        .then(data => {
            window.issuesData = data; // שומרים את התקלות בזיכרון
            populateCategories();
        })
        .catch(error => console.error("שגיאה בטעינת התקלות:", error));
});

function startChecklist() {
    let username = document.getElementById("username").value.trim();
    let department = document.getElementById("department").value.trim();
    let computerName = document.getElementById("computer-name").value.trim();

    if (!username || !department || !computerName) {
        alert("אנא מלא את כל השדות.");
        return;
    }

    document.getElementById("issues-section").style.display = "block";
}

function populateCategories() {
    let categorySelect = document.getElementById("category-select");
    categorySelect.innerHTML = "<option value=''>בחר קטגוריה</option>";

    let categories = [...new Set(window.issuesData.map(item => item.category))];
    categories.forEach(category => {
        let option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

function loadIssues() {
    let category = document.getElementById("category-select").value;
    let issueSelect = document.getElementById("issue-select");
    issueSelect.innerHTML = "<option value=''>בחר תקלה</option>";

    if (category) {
        let issues = window.issuesData.filter(item => item.category === category);
        issues.forEach(issue => {
            let option = document.createElement("option");
            option.value = issue.problem;
            option.textContent = issue.problem;
            issueSelect.appendChild(option);
        });
    }
}

function showSolution() {
    let category = document.getElementById("category-select").value;
    let problem = document.getElementById("issue-select").value;

    if (!category || !problem) return;

    let issue = window.issuesData.find(item => item.category === category && item.problem === problem);

    if (issue) {
        document.getElementById("solution-text").textContent = issue.solution;
        document.getElementById("solution-section").style.display = "block";
    }
}

function markAsSolved(solved) {
    let category = document.getElementById("category-select").value;
    let problem = document.getElementById("issue-select").value;
    let issue = window.issuesData.find(item => item.category === category && item.problem === problem);

    if (solved) {
        alert("הבעיה נפתרה! ✅");
        resetForm();
    } else {
        if (issue && issue.alternativeSolution) {
            document.getElementById("solution-text").textContent = issue.alternativeSolution;
        } else if (issue && issue.technician) {
            // אם אין פתרון נוסף, מופיעה הודעה לפנות לכונן המתאים
            document.getElementById("solution-text").textContent = `לא נמצא פתרון נוסף. יש לפנות לכונן: ${issue.technician}`;
        } else {
            document.getElementById("issues-section").style.display = "none";
            document.getElementById("technician-message").style.display = "block";
        }
    }
}

function resetForm() {
    document.getElementById("solution-section").style.display = "none";
    document.getElementById("category-select").value = "";
    document.getElementById("issue-select").innerHTML = "<option value=''>בחר תקלה</option>";
}
