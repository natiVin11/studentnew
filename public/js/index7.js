document.addEventListener('DOMContentLoaded', function() {
    loadIdeas();
});

document.getElementById('new-idea-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const title = document.getElementById('idea-title').value;
    const description = document.getElementById('idea-description').value;

    if (title && description) {
        const newIdea = {
            title: title,
            description: description,
            date: new Date().toLocaleString()
        };

        // שולח את הרעיון לשרת
        fetch('http://localhost:3000/ideas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newIdea)
        })
            .then(response => response.json())
            .then(data => {
                // נטען מחדש את הרעיונות
                loadIdeas();
                document.getElementById('new-idea-form').reset();
            })
            .catch(error => console.error('שגיאה בהוספת רעיון:', error));
    }
});

function loadIdeas() {
    const ideasContainer = document.getElementById('ideas-container');
    ideasContainer.innerHTML = ''; // ניקוי התצוגה

    // מבצע קריאה לשרת כדי לקבל את כל הרעיונות
    fetch('http://localhost:3000/ideas')
        .then(response => response.json())
        .then(ideas => {
            if (ideas.length === 0) {
                ideasContainer.innerHTML = '<p>אין רעיונות עדיין.</p>';
            } else {
                ideas.forEach(function(idea) {
                    const ideaElement = document.createElement('div');
                    ideaElement.classList.add('idea-item');
                    ideaElement.innerHTML = `
                        <h3>${idea.title}</h3>
                        <p>${idea.description}</p>
                        <small>נוסף ב: ${idea.date}</small>
                    `;
                    ideasContainer.appendChild(ideaElement);
                });
            }
        })
        .catch(error => console.error('שגיאה בהבאת הרעיונות:', error));
}
