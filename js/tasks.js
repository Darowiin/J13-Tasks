let draggingTask = null;

function addTask(columnId, taskText) {
    const column = document.getElementById(columnId);
    const taskList = column.querySelector('.task-list');

    const template = document.getElementById('task-template');
    const taskElement = template.content.firstElementChild.cloneNode(true); 
    
    const taskContent = taskElement.querySelector('.task-content');
    taskContent.textContent = taskText;

    const menuBtn = taskElement.querySelector('.task-menu-btn');
    const dropdown = taskElement.querySelector('.task-dropdown');
    const editBtn = taskElement.querySelector('.edit-btn');
    const copyBtn = taskElement.querySelector('.copy-btn');
    const deleteBtn = taskElement.querySelector('.delete-btn');

    const startBtn = dropdown.querySelector('.start-btn');
    const postponeBtn = dropdown.querySelector('.postpone-btn');
    const doneBtn = dropdown.querySelector('.done-btn');

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        
        document.querySelectorAll('.task-dropdown').forEach(menu => {
            if (menu !== dropdown) {
                menu.classList.add('hidden');
            }
        });
        
        dropdown.classList.toggle('hidden');
    });

    startBtn.addEventListener('click', () => {
        const inProgressColumn = document.getElementById('in-progress');
        inProgressColumn.querySelector('.task-list').appendChild(taskElement);

        dropdown.classList.add('hidden');
        updateCounters();
    });

    postponeBtn.addEventListener('click', () => {
        const doColumn = document.getElementById('do');
        doColumn.querySelector('.task-list').appendChild(taskElement);

        dropdown.classList.add('hidden');
        updateCounters();
    });

    doneBtn.addEventListener('click', () => {
        const doneColumn = document.getElementById('done');
        doneColumn.querySelector('.task-list').appendChild(taskElement);

        dropdown.classList.add('hidden');
        updateCounters();
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
        addTask(currentColumnId, taskContent.textContent + ' (копия)');

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

    taskList.appendChild(taskElement);
    updateCounters();
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

function updateCounters() {
    document.querySelectorAll('.column').forEach(column => {
        const counter = column.querySelector('.counter');
        const taskCount = column.querySelectorAll('.task').length;
        counter.textContent = taskCount;
    });
}

document.addEventListener('click', () => {
    document.querySelectorAll('.task-dropdown').forEach(menu => {
        menu.classList.add('hidden');
    });
});

document.addEventListener('DOMContentLoaded', function() {
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
                if (!document.hasFocus()) {
                    return;
                }
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
});