const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = 3012;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Paths
const dataDir = path.join(__dirname, "public", "data");
const uploadsDir = path.join(__dirname, "uploads");

const questionsFile = path.join(dataDir, "questions.json");
const resultsFile = path.join(dataDir, "results.json");
const issuesFile = path.join(dataDir, "issues.json");
const lessonsFile = path.join(dataDir, "lessons.json");
const updatesFile = path.join(dataDir, "updates.json");
const malfunctionsFile = path.join(dataDir, "malfunctions.json");
const newStudentFile = path.join(dataDir, "newStudent.json");

// Create required directories
[dataDir, uploadsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Create JSON files if they don't exist
const initializeFile = (filePath, defaultValue = "[]") => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultValue, "utf8");
  }
};
[questionsFile, resultsFile, issuesFile, lessonsFile, updatesFile, malfunctionsFile, newStudentFile].forEach((file) =>
  initializeFile(file)
);

// File upload config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { name, idNumber } = req.body;
    const studentDir = path.join(uploadsDir, `${(name || "unknown").replace(/\s/g, "_")}_${idNumber || "unknown"}`);
    if (!fs.existsSync(studentDir)) fs.mkdirSync(studentDir, { recursive: true });
    cb(null, studentDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `humanResourcesForm${ext}`);
  },
});
const upload = multer({ storage });

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Questions
app.get("/api/questions", (req, res) => {
  try {
    const questions = JSON.parse(fs.readFileSync(questionsFile, "utf8"));
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: "Failed to load questions" });
  }
});

app.post("/api/questions", (req, res) => {
  try {
    const newQuestion = req.body;
    if (!newQuestion?.question || !newQuestion?.answer) {
      return res.status(400).json({ error: "Question and answer are required" });
    }
    const questions = JSON.parse(fs.readFileSync(questionsFile, "utf8"));
    questions.push(newQuestion);
    fs.writeFileSync(questionsFile, JSON.stringify(questions, null, 2));
    res.json({ message: "Question added successfully" });
  } catch {
    res.status(500).json({ error: "Failed to add question" });
  }
});

// Answers
app.get("/api/answers", (req, res) => {
  try {
    const results = JSON.parse(fs.readFileSync(resultsFile, "utf8"));
    res.json(results);
  } catch {
    res.status(500).json({ error: "Failed to load results" });
  }
});

app.post("/api/answers", (req, res) => {
  try {
    const { name, score, wrongAnswers } = req.body;
    if (!name || score === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const results = JSON.parse(fs.readFileSync(resultsFile, "utf8"));
    const newResult = { name, score, wrongAnswers, date: new Date().toISOString() };
    results.push(newResult);
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));

    res.json({ message: "Results saved successfully" });
  } catch {
    res.status(500).json({ error: "Failed to save results" });
  }
});

// Issues
app.get("/api/issues", (req, res) => {
  try {
    const issues = JSON.parse(fs.readFileSync(issuesFile, "utf8"));
    res.json(issues);
  } catch {
    res.status(500).json({ error: "Failed to load issues" });
  }
});

app.post("/api/issues", (req, res) => {
  try {
    const newIssue = req.body;
    if (!newIssue?.issue || !newIssue?.solution) {
      return res.status(400).json({ error: "Issue and solution are required" });
    }
    const issues = JSON.parse(fs.readFileSync(issuesFile, "utf8"));
    issues.push(newIssue);
    fs.writeFileSync(issuesFile, JSON.stringify(issues, null, 2));
    res.json({ message: "Issue added successfully" });
  } catch {
    res.status(500).json({ error: "Failed to add issue" });
  }
});

// Lessons
app.post("/api/lessons", (req, res) => {
  try {
    const { lessonTitle, lessonContent } = req.body;
    if (!lessonTitle || !lessonContent) {
      return res.status(400).json({ error: "Lesson title and content are required" });
    }

    const lessons = JSON.parse(fs.readFileSync(lessonsFile, "utf8"));
    lessons.push({ lessonTitle, lessonContent, date: new Date().toISOString() });
    fs.writeFileSync(lessonsFile, JSON.stringify(lessons, null, 2));

    res.json({ message: "Lesson added successfully" });
  } catch {
    res.status(500).json({ error: "Failed to add lesson" });
  }
});

// Malfunctions
app.post("/api/save-malfunctions", (req, res) => {
  try {
    const { issue, solution } = req.body;
    if (!issue || !solution) {
      return res.status(400).json({ error: "Both issue and solution are required" });
    }

    const malfunctions = JSON.parse(fs.readFileSync(malfunctionsFile, "utf8"));
    malfunctions.push({ issue, solution, date: new Date().toISOString() });
    fs.writeFileSync(malfunctionsFile, JSON.stringify(malfunctions, null, 2));

    res.json({ message: "Malfunction saved successfully" });
  } catch {
    res.status(500).json({ error: "Failed to save malfunction" });
  }
});

// Updates
app.post("/api/updates", (req, res) => {
  try {
    const { title, text } = req.body;
    if (!title || !text) {
      return res.status(400).json({ error: "Title and text are required" });
    }

    const updates = JSON.parse(fs.readFileSync(updatesFile, "utf8"));
    updates.push({ title, text, date: new Date().toISOString() });
    fs.writeFileSync(updatesFile, JSON.stringify(updates, null, 2));

    res.json({ message: "Update added successfully" });
  } catch {
    res.status(500).json({ error: "Failed to add update" });
  }
});

// Upload file
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { name, idNumber } = req.body;
    const filePath = path.join("uploads", `${name.replace(/\s/g, "_")}_${idNumber}`, req.file.filename).replace(/\\/g, "/");

    res.json({ message: "File uploaded successfully", filePath });
  } catch {
    res.status(500).json({ error: "Failed to upload file" });
  }
});

// Save student
app.post("/api/save-student", (req, res) => {
  const student = req.body;

  if (!student?.name || !student?.idNumber) {
    return res.status(400).json({ error: "Name and ID number are required" });
  }

  try {
    const students = JSON.parse(fs.readFileSync(newStudentFile, "utf8"));
    const index = students.findIndex((s) => s.idNumber === student.idNumber);

    if (index !== -1) {
      students[index] = { ...students[index], ...student, step: 1, progressDate: new Date().toLocaleString("he-IL") };
    } else {
      student.step = 1;
      student.progressDate = new Date().toLocaleString("he-IL");
      students.push(student);
    }

    fs.writeFileSync(newStudentFile, JSON.stringify(students, null, 2));
    res.json({ message: "Student saved/updated successfully", step: 1 });
  } catch {
    res.status(500).json({ error: "Failed to save/update student data" });
  }
});

// Update student progress
app.post("/api/update-student-progress", (req, res) => {
  const { idNumber, step } = req.body;

  if (!idNumber || step === undefined) {
    return res.status(400).json({ error: "ID number and step are required" });
  }

  try {
    const students = JSON.parse(fs.readFileSync(newStudentFile, "utf8"));
    const index = students.findIndex((s) => s.idNumber === idNumber);

    if (index !== -1) {
      students[index].step = step;
      students[index].progressDate = new Date().toLocaleString("he-IL");
      fs.writeFileSync(newStudentFile, JSON.stringify(students, null, 2));
      res.json({ message: "Student progress updated", step });
    } else {
      res.status(404).json({ error: "Student not found" });
    }
  } catch {
    res.status(500).json({ error: "Failed to update student progress" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
