document.addEventListener("DOMContentLoaded", () => {
    const categoriesContainer = document.getElementById("category-buttons");
    const learningListContainer = document.getElementById("learning-list");
    const learningContentContainer = document.getElementById("learning-content");

    // שליפת הנתונים מה-JSON החיצוני
    fetch("./data/lessons.json")
        .then(response => response.json())
        .then(jsonData => {
            createCategoryButtons(jsonData);
        })
        .catch(error => console.error("שגיאה בטעינת הנתונים:", error));

    function createCategoryButtons(jsonData) {
        categoriesContainer.innerHTML = ""; // ניקוי קטגוריות קודמות
        // שליפת הקטגוריות הייחודיות
        const categories = [...new Set(jsonData.map(item => item["category"]))];

        categories.forEach(category => {
            const button = document.createElement("button");
            button.textContent = category;
            button.onclick = () => displayLearningList(jsonData, category);
            categoriesContainer.appendChild(button);
        });
    }

    function displayLearningList(jsonData, category) {
        learningListContainer.innerHTML = ""; // ניקוי הרשימה הקודמת
        learningContentContainer.innerHTML = ""; // ניקוי התוכן הקודם

        // סינון הלומדות לפי הקטגוריה
        const filteredLessons = jsonData.filter(item => item["category"] === category);

        filteredLessons.forEach(lesson => {
            const lessonButton = document.createElement("button");
            lessonButton.textContent = lesson["lomdaName"];
            lessonButton.onclick = () => displayLessonContent(lesson);
            learningListContainer.appendChild(lessonButton);
        });
    }

    function displayLessonContent(lesson) {
        learningContentContainer.innerHTML = `
            <h2>${lesson["lomdaName"]}</h2>
            <p>${lesson["lomdaText"]}</p>
        `;
    }
});
