let draggingTask = null;

function updateCounters() {
    document.querySelectorAll('.column').forEach(column => {
        const counter = column.querySelector('.counter');
        const taskCount = column.querySelectorAll('.task').length;
        counter.textContent = taskCount;
    });
}

function sortColumn(column) {
    const order = column.dataset.sortOrder;
    if (!order || order === 'none') return;

    const taskList = column.querySelector('.task-list');
    const tasks = Array.from(taskList.children);

    tasks.sort((a, b) => {
        const priorityA = a.classList.contains('priority-low') ? 0 : a.classList.contains('priority-medium') ? 1 : 2;
        const priorityB = b.classList.contains('priority-low') ? 0 : b.classList.contains('priority-medium') ? 1 : 2;
        
        return order === 'desc' ? (priorityB - priorityA) : (priorityA - priorityB);
    });

    tasks.forEach(task => taskList.appendChild(task));
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

document.addEventListener('click', () => {
    document.querySelectorAll('.task-dropdown, .column-dropdown').forEach(menu => {
        menu.classList.add('hidden');
    });
});

function addTask(columnId, taskText, initialPriorityIndex = 0) {
    const column = document.getElementById(columnId);
    const taskList = column.querySelector('.task-list');

    const taskElement = createTaskElement(taskText, initialPriorityIndex);
    
    taskList.appendChild(taskElement);
    updateCounters();
    sortColumn(column);
}

function createTaskElement(taskText, priorityIndex) {
    const template = document.getElementById('task-template');
    const taskElement = template.content.firstElementChild.cloneNode(true); 
    
    const taskContent = taskElement.querySelector('.task-content');
    taskContent.textContent = taskText;

    const priorities = [
        { class: 'priority-low', text: 'Приоритет: Низкий' },
        { class: 'priority-medium', text: 'Приоритет: Средний' },
        { class: 'priority-high', text: 'Приоритет: Высокий' }
    ];

    taskElement.classList.remove('priority-low');
    taskElement.classList.add(priorities[priorityIndex].class);
    taskElement.querySelector('.priority-btn').textContent = priorities[priorityIndex].text;

    bindTaskEvents(taskElement, taskContent, priorities, priorityIndex);

    return taskElement;
}

function bindTaskEvents(taskElement, taskContent, priorities, initialPriorityIndex) {
    const menuBtn = taskElement.querySelector('.task-menu-btn');
    const dropdown = taskElement.querySelector('.task-dropdown');

    const priorityBtn = taskElement.querySelector('.priority-btn');
    const editBtn = taskElement.querySelector('.edit-btn');
    const copyBtn = taskElement.querySelector('.copy-btn');
    const deleteBtn = taskElement.querySelector('.delete-btn');

    const startBtn = dropdown.querySelector('.start-btn');
    const postponeBtn = dropdown.querySelector('.postpone-btn');
    const doneBtn = dropdown.querySelector('.done-btn');

    let currentPriorityIndex = initialPriorityIndex;

    priorityBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        taskElement.classList.remove(priorities[currentPriorityIndex].class);
        currentPriorityIndex = (currentPriorityIndex + 1) % priorities.length;
        taskElement.classList.add(priorities[currentPriorityIndex].class);
        priorityBtn.textContent = priorities[currentPriorityIndex].text;
    });

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        document.querySelectorAll('.task-dropdown, .column-dropdown').forEach(menu => {
            if (menu !== dropdown) menu.classList.add('hidden');
        });

        dropdown.classList.toggle('hidden');
    });

    startBtn.addEventListener('click', () => {
        document.getElementById('in-progress').querySelector('.task-list').appendChild(taskElement);
        dropdown.classList.add('hidden');
        updateCounters();
        sortColumn(column);
    });

    postponeBtn.addEventListener('click', () => {
        document.getElementById('do').querySelector('.task-list').appendChild(taskElement);
        dropdown.classList.add('hidden');
        updateCounters();
        sortColumn(column);
    });

    doneBtn.addEventListener('click', () => {
        document.getElementById('done').querySelector('.task-list').appendChild(taskElement);
        dropdown.classList.add('hidden');
        updateCounters();
        sortColumn(column);
    });

    deleteBtn.addEventListener('click', () => {
        if (confirm('Точно удалить эту задачу?')) {
            taskElement.remove();
            
            updateCounters();
        }
    });
    
    editBtn.addEventListener('click', () => {
        taskContent.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        dropdown.classList.add('hidden');
    });

    copyBtn.addEventListener('click', () => {
        const currentColumnId = taskElement.closest('.column').id;
        addTask(currentColumnId, taskContent.textContent + ' (копия)', currentPriorityIndex);
        dropdown.classList.add('hidden');
    });

    taskElement.addEventListener('dragstart', () => {
        draggingTask = taskElement;
        taskElement.classList.add('dragging');
    });

    taskElement.addEventListener('dragend', () => {
        draggingTask = null;
        taskElement.classList.remove('dragging');
        updateCounters();

        const currentColumn = taskElement.closest('.column');
        if (currentColumn) sortColumn(currentColumn);
    });

    taskContent.addEventListener('dblclick', function() {
        this.style.display = 'none';

        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.value = this.textContent;
        editInput.className = 'task-input';

        this.parentNode.insertBefore(editInput, this.nextSibling);
        editInput.focus();

        let isEditing = false;

        const finishEdit = () => {
            if (isEditing) return;
            isEditing = true;

            const newText = editInput.value.trim();

            if (newText !== '') {
                this.textContent = newText;
            }
            
            editInput.remove();
            this.style.display = ''; 
        };

        editInput.addEventListener('blur', () => {
            if (!document.hasFocus()) return;
            finishEdit();
        });

        editInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                finishEdit();
            }
            if (e.key === 'Escape') {
                if (isEditing) return;
                isEditing = true;
                
                editInput.remove();
                this.style.display = '';
            }
        });
    });
}

function initAddButtons() {
    const addTaskButtons = document.querySelectorAll('.add-task-btn');

    addTaskButtons.forEach(button => {
        button.addEventListener('click', function() {
            const column = this.closest('.column');
            
            this.style.display = 'none';

            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Что нужно сделать?';
            input.className = 'task-input';

            this.parentNode.insertBefore(input, this.nextSibling);
            input.focus();

            let isFinished = false; 

            const saveTask = () => {
                if (isFinished) return;
                isFinished = true;

                const taskText = input.value.trim();

                if (taskText !== '') {
                    addTask(column.id, taskText);
                }
                
                input.remove();
                button.style.display = '';
            };

            input.addEventListener('blur', () => {
                if (!document.hasFocus()) return;
                saveTask();
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    saveTask();
                }
                if (e.key === 'Escape') {
                    if (isFinished) return;
                    isFinished = true;

                    input.remove();
                    button.style.display = '';
                }
            });
        });
    });
}

function initDragAndDropZones() {
    const lists = document.querySelectorAll('.task-list');

    lists.forEach(list => {
        list.addEventListener('dragover', (e) => {
            e.preventDefault();
            
            const afterElement = getDragAfterElement(list, e.clientY);
            if (afterElement == null) {
                list.appendChild(draggingTask);
            } else {
                list.insertBefore(draggingTask, afterElement);
            }
        });
    });
}

function initColumnMenus() {
    const columnOptionsBtns = document.querySelectorAll('.more-options');
    
    columnOptionsBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = btn.nextElementSibling;
            
            document.querySelectorAll('.column-dropdown, .task-dropdown').forEach(menu => {
                if (menu !== dropdown) {
                    menu.classList.add('hidden');
                }
            });
            
            dropdown.classList.toggle('hidden');
        });
    });

    const clearColumnBtns = document.querySelectorAll('.clear-column-btn');
    
    clearColumnBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const column = this.closest('.column');
            const taskList = column.querySelector('.task-list');
            
            if (taskList.children.length > 0) {
                if (confirm(`Точно удалить все задачи из колонки "${column.querySelector('h2').childNodes[0].textContent.trim()}"?`)) {
                    taskList.innerHTML = '';
                    updateCounters();
                }
            }
            
            this.closest('.column-dropdown').classList.add('hidden');
        });
    });
}

function initSortButtons() {
    const sortButtons = document.querySelectorAll('.sort-btn');
    
    sortButtons.forEach(btn => {
        const column = btn.closest('.column');
        column.dataset.sortOrder = 'none';

        btn.addEventListener('click', function(e) {
            e.stopPropagation();

            if (column.dataset.sortOrder === 'none' || column.dataset.sortOrder === 'asc') {
                column.dataset.sortOrder = 'desc';
                this.textContent = 'Сортировка: сначала неважные';
            } else {
                column.dataset.sortOrder = 'asc';
                this.textContent = 'Сортировка: сначала важные';
            }

            sortColumn(column);
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    initAddButtons();
    initDragAndDropZones();
    initColumnMenus();
    initSortButtons();
});