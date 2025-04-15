// טיפול בטופס העלאת הקבצים
document.getElementById("uploadForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    if (!file) {
        alert("נא לבחור קובץ.");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    // שליחת הקובץ לשרת
    fetch("http://localhost:3000/api/upload", {
        method: "POST",
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById("status").textContent = `הקובץ ${data.filename} הועלה בהצלחה!`;
            } else {
                document.getElementById("status").textContent = `שגיאה: ${data.error}`;
            }
        })
        .catch(error => {
            document.getElementById("status").textContent = `שגיאה בהעלאת הקובץ: ${error}`;
        });
});
