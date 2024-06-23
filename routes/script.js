document.addEventListener('DOMContentLoaded', () => {
    const saveNoteBtn = document.getElementById('saveNoteBtn');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const newNoteBtn = document.getElementById('newNoteBtn');
    const noteTitle = document.getElementById('noteTitle');
    const noteText = document.getElementById('noteText');
    const noteList = document.getElementById('noteList');
    let activeNote = {};

    // Fetch and display existing notes
    fetch('/api/notes')
        .then(response => response.json())
        .then(notes => {
            notes.forEach(note => {
                addNoteToList(note);
            });
        });

    const handleNoteSave = () => {
        const newNote = {
            title: noteTitle.value,
            text: noteText.value,
        };

        if (activeNote.title) {
            // Update existing note
            fetch(`/api/notes/${activeNote.title}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newNote),
            })
                .then(() => {
                    getAndRenderNotes();
                    renderActiveNote();
                });
        } else {
            // Save new note
            fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newNote),
            })
                .then(() => {
                    getAndRenderNotes();
                    renderActiveNote();
                });
        }
    };


    const handleNoteView = (e) => {
        e.preventDefault();
        const note = JSON.parse(e.currentTarget.getAttribute('data-note'));
        activeNote = note;
        renderActiveNote();
    };

    const handleNoteDelete = (e) => {
        e.stopPropagation();
        const noteTitle = e.currentTarget.parentElement.getAttribute('data-title');
        if (!noteTitle) return;

        fetch(`/api/notes/${noteTitle}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(({ title }) => {
                const noteItem = document.querySelector(`[data-title='${title}']`);
                if (noteItem) {
                    noteItem.remove();
                }
            })
            .catch(error => {
                console.error('Error deleting note', error);
            });
    };

    const renderActiveNote = () => {
        if (activeNote.title) {
            noteTitle.value = activeNote.title;
            noteText.value = activeNote.text;
        } else {
            noteTitle.value = '';
            noteText.value = '';
        }
        newNoteBtn.style.display = 'block';
    };

    const addNoteToList = (note) => {
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        noteItem.innerText = note.title;
        noteItem.setAttribute('data-note', JSON.stringify(note));
        noteItem.setAttribute('data-title', note.title);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-note';
        deleteBtn.innerHTML = '🗑️';
        deleteBtn.addEventListener('click', handleNoteDelete);

        noteItem.appendChild(deleteBtn);
        noteItem.addEventListener('click', handleNoteView);
        noteList.appendChild(noteItem);
    };

    saveNoteBtn.addEventListener('click', handleNoteSave);

    clearFormBtn.addEventListener('click', () => {
        noteTitle.value = '';
        noteText.value = '';
        saveNoteBtn.style.display = 'none';
        clearFormBtn.style.display = 'none';
    });

    newNoteBtn.addEventListener('click', () => {
        activeNote = {};
        renderActiveNote();
        newNoteBtn.style.display = 'none';
    });

    noteTitle.addEventListener('input', () => {
        saveNoteBtn.style.display = 'block';
        clearFormBtn.style.display = 'block';
    });

    noteText.addEventListener('input', () => {
        saveNoteBtn.style.display = 'block';
        clearFormBtn.style.display = 'block';
    });
});
