document.addEventListener('DOMContentLoaded', () => {
    // Initial State
    let tasks = JSON.parse(localStorage.getItem('kanban-tasks')) || [];
    
    // DOM Elements
    const modal = document.getElementById('task-modal');
    const addBtn = document.getElementById('add-task-btn');
    const closeBtn = document.querySelector('.close-btn');
    const form = document.getElementById('task-form');
    
    // Render initial tasks
    renderTasks();

    // Modal Event Listeners
    addBtn.addEventListener('click', () => modal.classList.add('active'));
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        form.reset();
    });
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            form.reset();
        }
    });

    // Form Submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('task-title').value;
        const desc = document.getElementById('task-desc').value;
        const priority = document.getElementById('task-priority').value;
        
        const newTask = {
            id: Date.now().toString(),
            title,
            desc,
            priority,
            status: 'todo',
            createdAt: new Date().toLocaleDateString()
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        
        modal.classList.remove('active');
        form.reset();
    });

    function saveTasks() {
        localStorage.setItem('kanban-tasks', JSON.stringify(tasks));
        updateCounts();
    }

    function renderTasks() {
        // Clear all columns
        document.querySelectorAll('.task-list').forEach(list => list.innerHTML = '');
        
        tasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = 'task-card';
            taskEl.draggable = true;
            taskEl.id = task.id;
            
            taskEl.innerHTML = `
                <div class="task-header">
                    <div class="task-title">${task.title}</div>
                    <button class="delete-btn" onclick="deleteTask('${task.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
                <div class="task-desc">${task.desc}</div>
                <div class="task-footer">
                    <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                    <span style="font-size: 0.75rem; color: var(--text-secondary)">${task.createdAt}</span>
                </div>
            `;
            
            // Drag Events
            taskEl.addEventListener('dragstart', dragStart);
            taskEl.addEventListener('dragend', dragEnd);
            
            const column = document.querySelector(`#${task.status} .task-list`);
            if (column) column.appendChild(taskEl);
        });
        
        updateCounts();
    }

    function updateCounts() {
        ['todo', 'in-progress', 'done'].forEach(status => {
            const count = tasks.filter(t => t.status === status).length;
            document.querySelector(`#${status} .task-count`).textContent = count;
        });
    }

    // Global delete function
    window.deleteTask = function(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }

    // Drag and Drop Logic
    let draggedTask = null;

    function dragStart(e) {
        draggedTask = this;
        setTimeout(() => this.classList.add('dragging'), 0);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.id);
    }

    function dragEnd() {
        this.classList.remove('dragging');
        draggedTask = null;
    }
    
    // Add dragover listeners to task lists to show drop visual cue (optional)
    document.querySelectorAll('.task-list').forEach(list => {
        list.addEventListener('dragover', e => {
            e.preventDefault();
        });
    });

    window.allowDrop = function(e) {
        e.preventDefault();
    }

    window.drop = function(e) {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');
        
        // Find the closest column
        const column = e.target.closest('.column');
        if (!column) return;
        
        const newStatus = column.dataset.status;
        
        // Update task status
        const taskIndex = tasks.findIndex(t => t.id === id);
        if (taskIndex !== -1) {
            tasks[taskIndex].status = newStatus;
            saveTasks();
            renderTasks();
        }
    }
});
