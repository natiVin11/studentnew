document.addEventListener("DOMContentLoaded", function () {
    loadStudents();
    loadUpdates();
});

// שליפת הסטודנטים מהשרת
async function loadStudents() {
    try {
        const response = await fetch("data/students.json"); // נתיב לקובץ ה-JSON של הסטודנטים
        if (!response.ok) throw new Error("שגיאה בטעינת קובץ הסטודנטים");

        const studentsData = await response.json();
        const studentsList = document.getElementById("students");

        studentsList.innerHTML = ""; // איפוס הרשימה לפני טעינה חדשה

        studentsData.forEach(student => {
            const li = document.createElement("li");
            li.textContent = student.name;
            li.style.cursor = "pointer";
            li.onclick = () => showStudentCard(student); // קריאה לפונקציה עם אובייקט הסטודנט
            studentsList.appendChild(li);
        });
    } catch (error) {
        console.error("שגיאה בטעינת הסטודנטים:", error);
    }
}

// שליפת העדכונים מהשרת והפעלת אנימציה
async function loadUpdates() {
    try {
        const response = await fetch("data/updates.json"); // נתיב לקובץ ה-JSON של העדכונים
        if (!response.ok) throw new Error("שגיאה בטעינת קובץ העדכונים");

        const updates = await response.json();
        const updateList = document.getElementById("update-list");

        updateList.innerHTML = ""; // איפוס הרשימה לפני טעינה חדשה

        updates.forEach(update => {
            const div = document.createElement("div");
            div.classList.add("update-item");
            div.innerHTML = `<h3>${update.title}</h3><p>${update.text}</p>`;
            updateList.appendChild(div);
        });

        startUpdatesScroll(); // הפעלת האנימציה לאחר טעינת העדכונים
    } catch (error) {
        console.error("שגיאה בטעינת העדכונים:", error);
    }
}

// פונקציה להצגת כרטיסיית הסטודנט עם כפתור סגירה
function showStudentCard(student) {
    // אם כבר קיימת מודאל קודמת, מוחקים אותה
    closeStudentCard();

    // יצירת תיבת פרטי סטודנט
    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h2>${student.name}</h2>
            <p><strong>טלפון:</strong> ${student.phone}</p>
            <p><strong>אימייל:</strong> <a href="mailto:${student.mail}">${student.mail}</a></p>
        </div>
    `;

    document.body.appendChild(modal);

    // הוספת אירוע לסגירה כאשר לוחצים על הכפתור "איקס"
    document.querySelector(".close-btn").addEventListener("click", closeStudentCard);
}

// פונקציה לסגירת הכרטיסייה
function closeStudentCard() {
    const modal = document.querySelector(".modal");
    if (modal) {
        modal.remove();
    }
}

// פונקציה להפעלת אנימציה של עדכונים מלמטה למעלה
function startUpdatesScroll() {
    const updateList = document.getElementById("update-list");
    let scrollAmount = 0;

    setInterval(() => {
        if (updateList.scrollHeight > updateList.clientHeight) {
            scrollAmount += 1;
            updateList.scrollTop = scrollAmount;

            if (scrollAmount >= updateList.scrollHeight - updateList.clientHeight) {
                scrollAmount = 0;
            }
        }
    }, 50); // קצב הגלילה
}
