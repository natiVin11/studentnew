let issuesData = [];

// טעינת קובץ JSON
fetch('data/Malfunctions.json')
    .then(response => response.json())
    .then(data => {
        issuesData = data;
        displayData(issuesData);
    })
    .catch(error => console.error('Error loading JSON file:', error));

// פונקציה שמציגה את הנתונים
function displayData(filteredData) {
    const container = document.getElementById('issues-container');
    container.innerHTML = '';

    filteredData.forEach(row => {
        const issueCard = document.createElement('div');
        issueCard.classList.add('issue-card');

        const issueHeader = document.createElement('div');
        issueHeader.classList.add('issue-header');
        issueHeader.textContent = row.issue;

        const solution = document.createElement('div');
        solution.classList.add('solution');
        solution.textContent = row.solution;

        issueCard.appendChild(issueHeader);
        issueCard.appendChild(solution);

        issueCard.addEventListener('click', () => {
            solution.style.display = solution.style.display === 'block' ? 'none' : 'block';
        });

        container.appendChild(issueCard);
    });
}

// פונקציה לסינון חיפושים
document.getElementById('search-box').addEventListener('input', function () {
    const searchQuery = this.value.toLowerCase();
    const filteredData = issuesData.filter(row =>
        row.issue.toLowerCase().includes(searchQuery)
    );
    displayData(filteredData);
});

// פונקציות לניהול המודל להוספת תקלה
function openIssueModal() {
    document.getElementById('issue-modal').style.display = 'block';
}

function closeIssueModal() {
    document.getElementById('issue-modal').style.display = 'none';
}

// פונקציה לשליחת תקלה חדשה לשרת
function submitIssue() {
    const newIssue = document.getElementById('new-issue').value.trim();
    const newSolution = document.getElementById('new-solution').value.trim();

    if (newIssue && newSolution) {
        const newIssueData = { issue: newIssue, solution: newSolution };

        // שליחת הנתונים לשרת
        fetch('/api/save-malfunctions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newIssueData)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('שגיאה בשליחת התקלה לשרת');
                }
                return response.json();
            })
            .then(data => {
                issuesData.push(newIssueData);
                displayData(issuesData);
                closeIssueModal();
            })
            .catch(error => {
                console.error('Error saving issue:', error);
                alert('שגיאה בשליחת התקלה, נסה שוב מאוחר יותר.');
            });
    } else {
        alert("נא למלא את כל השדות!");
    }
}
