$(document).ready(function () {
  let notes = [];

  let editIndex = null;

// Відкриття модалки
$('#noteList').on('click', '.edit-btn', function () {
  editIndex = $(this).closest('li').data('index');
  const note = notes[editIndex];

  $('#editTitle').val(note.title);
  $('#editText').val(note.text);  // note.text - рядок

  $('#editModal, #overlay').show();
});

// Збереження
$('#editSaveBtn').click(function () {
  const newTitle = $('#editTitle').val().trim();
  const newTextRaw = $('#editText').val();
 // Перевірка на порожні значення
  if (!newTitle || !newTextRaw.trim()) {
    alert('Заголовок і текст не можуть бути порожніми!');
    return;
  }

  notes[editIndex].title = newTitle;  // зберігаємо заголовок
  notes[editIndex].text = newTextRaw;  // зберігаємо рядок

  saveNotes();
  renderNotes();
  // Закриття модалки
  $('#editModal, #overlay').hide();
  editIndex = null;
});


  // Завантаження нотаток з localStorage
  function loadNotes() {
    const saved = localStorage.getItem('notes');
    if (saved) {
      notes = JSON.parse(saved);
    }
    renderNotes();
  }

  // Збереження нотаток у localStorage
  function saveNotes() {
    localStorage.setItem('notes', JSON.stringify(notes));
  }

function renderNotes() {
  $('#noteList').empty();
  notes.forEach((note, index) => {
    // Якщо текст — рядок, розбиваємо на масив рядків
    const lines = Array.isArray(note.text) ? note.text : note.text.split('\n');
    // Створюємо HTML для кожної нотатки
    const noteHTML = `
      <li class="note-item ${note.archived ? 'archived' : ''}" data-index="${index}">
        <h3>${note.title}</h3>
        <div class="note-lines">
          ${lines.map((line, lineIndex) => `
            <div class="note-line">
              <input type="checkbox" class="note-line-checkbox" data-note="${index}" data-line="${lineIndex}">
              <span>${line}</span>
            </div>
          `).join('')}
        </div>
        <time>${note.time}</time>
        <div class="note-buttons">
          <button class="edit-btn">
            <img src="images/да.png" alt= "редагувати" width="20" height= "20">
          </button>
          <button class="archive-btn" title="${note.archived ? 'Розархівувати' : 'Архівувати'}">
          <img src="${note.archived ? 'images/archive.png' : 'images/archive.png'}" alt="${note.archived ? 'Розархівувати' : 'Архівувати'}" width="20" height="20">
        </button>
        <button class="delete-btn" title="Видалити">
        <img src="images/dokit.png" alt="Видалити" width="20" height="20">
      </button>
    </div>
  </li>
`;
    

    $('#noteList').append(noteHTML); // Додаємо нотатку до списку
  });
}


  $('#addNoteBtn').click(function () {
    const title = $('#noteTitle').val().trim();
    const text = $('#noteText').val().trim();
    if (!title || !text) return;

    const newNote = {
      title,
      text,
      time: new Date().toLocaleString(),
      archived: false
    };

    notes.push(newNote);
    saveNotes();
    renderNotes();

    $('#noteTitle').val('');
    $('#noteText').val('');
  });

  /*$('#noteList').on('click', '.edit-btn', function () {
    const index = $(this).closest('li').data('index');
    const note = notes[index];

    const newTitle = prompt('Новий заголовок:', note.title);
    const newText = prompt('Новий текст:', note.text);

    if (newTitle !== null && newText !== null) {
      note.title = newTitle.trim() || note.title;
      note.text = newText.trim() || note.text;
      saveNotes();
      renderNotes();
    }
  });*/

  $('#noteList').on('click', '.archive-btn', function () {
    const index = $(this).closest('li').data('index');
    notes[index].archived = !notes[index].archived;
    saveNotes();
    renderNotes();
  });

  $('#noteList').on('click', '.delete-btn', function () {
    const index = $(this).closest('li').data('index');
    notes.splice(index, 1);
    saveNotes();
    renderNotes();
  });

  // Завантаження нотаток при старті
  loadNotes();
  // Завантаження нотаток з файлу
// Завантаження нотаток з файлу
$('#saveNotes').click(function () {
  const fileInput = document.getElementById('loadNotesFile');
  const file = fileInput.files[0];
  if (!file) {
    alert('Оберіть файл для завантаження нотаток.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const text = e.target.result;

      // Розділяємо файл по блокам нотаток
      const noteBlocks = text.split(/-+\n\n/).filter(block => block.trim() !== '');

      const loadedNotes = noteBlocks.map(block => {
        const titleMatch = block.match(/Заголовок:\s*(.*)/);
        const textMatch = block.match(/Текст:\s*(.*)/);
        const timeMatch = block.match(/Дата створення:\s*(.*)/);
        const archivedMatch = block.match(/Архівована:\s*(Так|Ні)/);

        return {
          title: titleMatch ? titleMatch[1].trim() : 'Без назви',
          text: textMatch ? textMatch[1].trim() : '',
          time: timeMatch ? timeMatch[1].trim() : new Date().toLocaleString(),
          archived: archivedMatch ? archivedMatch[1] === 'Так' : false
        };
      });

      notes = notes.concat(loadedNotes);
      saveNotes();
      renderNotes();
      alert('Нотатки з файлу успішно додані!');
      fileInput.value = ''; // очистка
    } catch (error) {
      alert('Помилка при завантаженні нотаток: ' + error.message);
    }
  };

  reader.readAsText(file);
  
});
$('#installNotesBtn').click(function () {
  let textContent = '';

  notes.forEach((note, i) => {
    textContent += `Нотатка ${i + 1}:\n`;
    textContent += `Заголовок: ${note.title}\n`;
    textContent += `Текст: ${note.text}\n`;
    textContent += `Дата створення: ${note.time}\n`;
    textContent += `Архівована: ${note.archived ? 'Так' : 'Ні'}\n`;
    textContent += '\n----------------------\n\n';
  });

  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'усі_нотатки.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

$(document).ready(function() {
  $('#themeToggle').click(function() {
    $('body').toggleClass('dark-theme');
    
    if ($('body').hasClass('dark-theme')) {
      $('#themeToggle').text('☀️ Світла тема');
    } else {
      $('#themeToggle').text('🌙 Темна тема');
    }
  });
});


});
