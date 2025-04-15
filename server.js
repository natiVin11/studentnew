const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const questionsFile = path.join(__dirname, 'public', 'data', 'questions.json');
const resultsFile = path.join(__dirname, 'public', 'data', 'results.json');
const issuesFilePath = path.join(__dirname, 'public', 'data', 'issues.json');
const lessonsFile = path.join(__dirname, 'public', 'data', 'lessons.json');
const updatesFilePath = path.join(__dirname, 'public', 'data', 'updates.json');
const malfunctionsFilePath = path.join(__dirname, 'public', 'data', 'malfunctions.json');
const newStudentFile = path.join(__dirname, 'public', 'data', 'newStudent.json'); // קובץ JSON חדש

const directories = ['data', 'uploads', 'public'].map(dir => path.join(__dirname, dir));
directories.forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const initializeFile = (filePath, defaultValue = '[]') => {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, defaultValue, 'utf8');
};
initializeFile(resultsFile);
initializeFile(questionsFile);
initializeFile(issuesFilePath);
initializeFile(lessonsFile);
initializeFile(updatesFilePath);
initializeFile(malfunctionsFilePath);
initializeFile(newStudentFile); // יצירת הקובץ אם לא קיים

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { name, idNumber } = req.body;
        const studentDir = path.join(__dirname, 'uploads', `${(name || 'unknown').replace(/\s/g, '_')}_${idNumber || 'unknown'}`);
        if (!fs.existsSync(studentDir)) fs.mkdirSync(studentDir, { recursive: true });
        cb(null, studentDir);
    },
    filename: (req, file, cb) => {
        const fileExt = path.extname(file.originalname);
        const fileName = `humanResourcesForm${fileExt}`;
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/questions", (req, res) => {
    try {
        const questions = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));
        res.json(questions);
    } catch (error) {
        console.error("Error reading questions:", error);
        res.status(500).json({ error: "Failed to load questions" });
    }
});

app.post("/api/questions", (req, res) => {
    try {
        const newQuestion = req.body;

        if (!newQuestion || !newQuestion.question || !newQuestion.answer) {
            return res.status(400).json({ error: "Question and answer are required" });
        }

        const questions = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));
        questions.push(newQuestion);
        fs.writeFileSync(questionsFile, JSON.stringify(questions, null, 2));

        res.json({ message: "Question added successfully" });
    } catch (error) {
        console.error("Error adding question:", error);
        res.status(500).json({ error: "Failed to add question" });
    }
});

app.get("/api/answers", (req, res) => {
    try {
        const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
        res.json(results);
    } catch (error) {
        console.error("Error reading results:", error);
        res.status(500).json({ error: "Failed to load results" });
    }
});

app.post("/api/answers", (req, res) => {
    try {
        const { name, score, wrongAnswers } = req.body;

        if (!name || score === undefined) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
        const newResult = {
            name,
            score,
            wrongAnswers,
            date: new Date().toISOString()
        };

        results.push(newResult);
        fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

        res.json({ message: "Results saved successfully" });
    } catch (error) {
        console.error("Error saving results:", error);
        res.status(500).json({ error: "Failed to save results" });
    }
});

app.get("/api/issues", (req, res) => {
    try {
        const issues = JSON.parse(fs.readFileSync(issuesFilePath, 'utf8'));
        res.json(issues);
    } catch (error) {
        console.error("Error reading issues:", error);
        res.status(500).json({ error: "Failed to load issues" });
    }
});

app.post("/api/issues", (req, res) => {
    try {
        const newIssue = req.body;

        if (!newIssue || !newIssue.issue || !newIssue.solution) {
            return res.status(400).json({ error: "Issue and solution are required" });
        }

        const issues = JSON.parse(fs.readFileSync(issuesFilePath, 'utf8'));
        issues.push(newIssue);
        fs.writeFileSync(issuesFilePath, JSON.stringify(issues, null, 2));

        res.json({ message: "Issue added successfully" });
    } catch (error) {
        console.error("Error adding issue:", error);
        res.status(500).json({ error: "Failed to add issue" });
    }
});

app.post("/api/lessons", (req, res) => {
    try {
        const newLesson = req.body;

        if (!newLesson || !newLesson.lessonTitle || !newLesson.lessonContent) {
            return res.status(400).json({ error: "Lesson title and content are required" });
        }

        const lessons = JSON.parse(fs.readFileSync(lessonsFile, 'utf8'));
        lessons.push(newLesson);
        fs.writeFileSync(lessonsFile, JSON.stringify(lessons, null, 2));

        res.json({ message: "Lesson added successfully" });
    } catch (error) {
        console.error("Error adding lesson:", error);
        res.status(500).json({ error: "Failed to add lesson" });
    }
});

app.post("/api/save-malfunctions", (req, res) => {
    try {
        const { issue, solution } = req.body;

        if (!issue || !solution) {
            return res.status(400).json({ error: "Both issue and solution are required" });
        }

        const malfunctions = JSON.parse(fs.readFileSync(malfunctionsFilePath, 'utf8'));
        const newMalfunction = {
            issue,
            solution,
            date: new Date().toISOString()
        };

        malfunctions.push(newMalfunction);
        fs.writeFileSync(malfunctionsFilePath, JSON.stringify(malfunctions, null, 2));

        res.json({ message: "Malfunction saved successfully" });
    } catch (error) {
        console.error("Error saving malfunction:", error);
        res.status(500).json({ error: "Failed to save malfunction" });
    }
});

app.post("/api/updates", (req, res) => {
    try {
        const { title, text } = req.body;

        if (!title || !text) {
            return res.status(400).json({ error: "Title and text are required" });
        }

        const updates = JSON.parse(fs.readFileSync(updatesFilePath, 'utf8'));

        const newUpdate = {
            title,
            text,
            date: new Date().toISOString()
        };

        updates.push(newUpdate);
        fs.writeFileSync(updatesFilePath, JSON.stringify(updates, null, 2));

        res.json({ message: "Update added successfully" });
    } catch (error) {
        console.error("Error adding update:", error);
        res.status(500).json({ error: "Failed to add update" });
    }
});

app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { name, idNumber } = req.body;
        if (!name || !idNumber) {
            return res.status(400).json({ error: "Missing name or ID number for file upload" });
        }

        const filePath = path.join('uploads', `${name.replace(/\s/g, '_')}_${idNumber}`, req.file.filename).replace(/\\/g, '/');

        res.json({
            message: "File uploaded successfully",
            filePath: filePath
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ error: "Failed to upload file" });
    }
});

app.post("/api/save-student", async (req, res) => {
    const studentData = req.body;

    if (!studentData || !studentData.name || !studentData.idNumber) {
        return res.status(400).json({ error: "Name and ID number are required" });
    }

    try {
        const studentsRaw = fs.readFileSync(newStudentFile, 'utf8');
        const students = JSON.parse(studentsRaw);

        const existingStudentIndex = students.findIndex(student => student.idNumber === studentData.idNumber);

        if (existingStudentIndex !== -1) {
            // עדכון פרטים קיימים
            students[existingStudentIndex] = { ...students[existingStudentIndex], ...studentData, step: 1, progressDate: new Date().toLocaleString('he-IL') };
            fs.writeFileSync(newStudentFile, JSON.stringify(students, null, 2));
            return res.json({ message: "Student data updated successfully", step: students[existingStudentIndex].step });
        } else {
            // הוספת סטודנט חדש
            studentData.step = 1;
            studentData.progressDate = new Date().toLocaleString('he-IL');
            students.push(studentData);
            fs.writeFileSync(newStudentFile, JSON.stringify(students, null, 2));
            return res.json({ message: "Student data saved successfully (new student)", step: 1 });
        }
    } catch (error) {
        console.error("Error saving/updating student data:", error);
        res.status(500).json({ error: "Failed to save/update student data" });
    }
});

app.post("/api/update-student-progress", async (req, res) => {
    const { idNumber, step } = req.body;

    if (!idNumber || !step) {
        return res.status(400).json({ error: "ID number and step are required" });
    }

    try {
        const studentsRaw = fs.readFileSync(newStudentFile, 'utf8');
        const students = JSON.parse(studentsRaw);

        const existingStudentIndex = students.findIndex(student => student.idNumber === idNumber);

        if (existingStudentIndex !== -1) {
            students[existingStudentIndex].step = parseInt(step);
            students[existingStudentIndex].progressDate = new Date().toLocaleString('he-IL');
            fs.writeFileSync(newStudentFile, JSON.stringify(students, null, 2));
            return res.json({ message: `Student progress updated to step ${step}` });
        } else {
            return res.status(404).json({ error: "Student not found" });
        }
    } catch (error) {
        console.error("Error updating student progress:", error);
        res.status(500).json({ error: "Failed to update student progress" });
    }
});

app.get("/api/find-student", async (req, res) => {
    const { searchTerm } = req.query;

    if (!searchTerm) {
        return res.status(400).json({ error: "Search term is required" });
    }

    try {
        const studentsRaw = fs.readFileSync(newStudentFile, 'utf8');
        const students = JSON.parse(studentsRaw);

        const foundStudent = students.find(student =>
            student.name.includes(searchTerm) || student.idNumber === searchTerm
        );

        if (foundStudent) {
            return res.json({ found: true, student: foundStudent });
        } else {
            return res.json({ found: false });
        }
    } catch (error) {
        console.error("Error reading student data for search:", error);
        return res.status(500).json({ error: "Failed to search for student" });
    }
});

app.get('/favicon.ico', (req, res) => res.status(204));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
