function addTask(columnId, taskText) {
    const column = document.getElementById(columnId);
    const taskList = column.querySelector('.task-list');

    const template = document.getElementById('task-template');
    const taskElement = template.content.firstElementChild.cloneNode(true); 
    
    const taskContent = taskElement.querySelector('.task-content');
    taskContent.textContent = taskText;

    const menuBtn = taskElement.querySelector('.task-menu-btn');
    const dropdown = taskElement.querySelector('.task-dropdown');
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
    });

    postponeBtn.addEventListener('click', () => {
        const doColumn = document.getElementById('do');
        doColumn.querySelector('.task-list').appendChild(taskElement);
        dropdown.classList.add('hidden');
    });

    doneBtn.addEventListener('click', () => {
        const doneColumn = document.getElementById('done');
        doneColumn.querySelector('.task-list').appendChild(taskElement);
        dropdown.classList.add('hidden');
    });

    deleteBtn.addEventListener('click', () => {
        if (confirm('Точно удалить эту задачу?')) {
            taskElement.remove();
        }
    });

    taskList.appendChild(taskElement);
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
            
            input.style.width = '100%';
            input.style.padding = '8px';
            input.style.boxSizing = 'border-box';
            input.style.marginBottom = '10px';

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
});