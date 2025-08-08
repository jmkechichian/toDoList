// =============================================
// CONSTANTES Y VARIABLES GLOBALES
// =============================================
const state = {
    currentFilter: 'all',
    searchTerm: ''
};

// =============================================
// FUNCIONES DE UTILIDAD
// =============================================

// Función para mostrar notificaciones Toast
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-5 left-1/2 transform -translate-x-1/2 translate-y-24 py-4 px-6 rounded-full shadow-lg z-50 opacity-0 transition-all duration-300 flex items-center gap-3 max-w-[80%] whitespace-nowrap ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    } text-white`;
    
    toast.innerHTML = `
        <i class="fa-solid ${
            type === 'success' ? 'fa-circle-check' : 
            type === 'error' ? 'fa-circle-xmark' : 'fa-circle-info'
        }"></i>
        <span class="toast-message">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.remove('translate-y-24');
        toast.classList.add('translate-y-0');
        toast.classList.remove('opacity-0');
        toast.classList.add('opacity-100');
    }, 100);
    
    setTimeout(() => {
        toast.classList.remove('translate-y-0');
        toast.classList.add('translate-y-24');
        toast.classList.remove('opacity-100');
        toast.classList.add('opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Función para guardar estado en localStorage
const saveCurrentState = () => {
    const tasks = Array.from(document.querySelectorAll('#task-list li')).map(li => ({
        text: li.querySelector('.task-text').textContent,
        completed: li.querySelector('.checkbox').checked,
        id: li.dataset.id || Date.now().toString()
    }));
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
};

// Función para cargar tareas guardadas
const loadSavedTasks = () => {
    const savedTasks = JSON.parse(localStorage.getItem('todoTasks'));
    if (savedTasks) {
        savedTasks.forEach(task => {
            createTaskElement(task.text, task.completed, task.id);
        });
    }
};

// Función para crear elementos de tarea
const createTaskElement = (text, completed = false, id = null) => {
    const li = document.createElement('li');
    li.className = `flex items-center justify-between p-3 rounded-lg ${
        completed ? 'bg-primary-200 dark:bg-dark-400' : 'bg-white dark:bg-dark-300'
    } border border-primary-200 dark:border-dark-400 shadow-sm transition-all`;
    li.dataset.id = id || Date.now().toString();
    
    li.innerHTML = `
        <div class="flex items-center flex-1 min-w-0">
            <input type="checkbox" class="checkbox h-5 w-5 rounded border-2 ${
                completed ? 
                'border-accent-green bg-accent-green' : 
                'border-primary-300 dark:border-dark-200 bg-white dark:bg-dark-400'
            } appearance-none cursor-pointer transition-all">
            <span class="task-text ml-3 truncate ${
                completed ? 
                'line-through text-primary-500 dark:text-primary-400' : 
                'text-primary-700 dark:text-primary-100'
            }">${text}</span>
        </div>
        <div class="task-buttons flex gap-2 ml-3">
            <button class="edit-btn p-2 rounded-full ${
                completed ? 
                'bg-primary-300 dark:bg-dark-200 cursor-not-allowed opacity-50' : 
                'bg-accent-yellow hover:bg-amber-500'
            } text-white transition-all">
                <i class="fa-solid fa-pen text-xs"></i>
            </button>
            <button class="delete-btn p-2 rounded-full bg-accent-pink hover:bg-pink-600 text-white transition-all">
                <i class="fa-solid fa-trash text-xs"></i>
            </button>
        </div>
    `;
    
    document.getElementById('task-list').appendChild(li);
    setupTaskEvents(li);
    return li;
};


// Función para actualizar el contador
const updateTaskCounter = () => {
    const totalTasks = document.querySelectorAll('#task-list li').length;
    const completedTasks = document.querySelectorAll('#task-list li .checkbox:checked').length;
    const taskCounter = document.querySelector('.task-counter');

    taskCounter.classList.toggle('hidden', totalTasks === 0);
    taskCounter.classList.toggle('opacity-0', totalTasks === 0);
    taskCounter.classList.toggle('translate-y-2.5', totalTasks === 0);
    
    if (totalTasks > 0) {
        document.getElementById('completed-count').textContent = completedTasks;
        document.getElementById('total-count').textContent = totalTasks;
        
        const progressPercentage = Math.round((completedTasks / totalTasks) * 100);
        document.getElementById('progress-percentage').textContent = `${progressPercentage}%`;
        
        const progressBarEl = document.querySelector('.progress');
        progressBarEl.style.width = `${progressPercentage}%`;
        progressBarEl.className = `progress h-full rounded-full transition-all duration-300 ${
            completedTasks === totalTasks ? 'bg-accent-green' : 'bg-gradient-to-r from-accent-pink to-accent-green'
        }`;
    }
};

// Función para alternar estado vacío
const toggleEmptyState = () => {
    const visibleTasks = document.querySelectorAll('#task-list li:not(.hidden)');
    const emptyStateContainer = document.querySelector('.empty-state-container');
    const taskList = document.getElementById('task-list');
    
    if (visibleTasks.length === 0) {
        taskList.style.display = 'none';
        emptyStateContainer.style.display = 'flex';
    } else {
        taskList.style.display = 'block';
        emptyStateContainer.style.display = 'none';
    }
    
    updateTaskCounter();
};
// =============================================
// FUNCIONES PRINCIPALES
// =============================================

// Configura eventos para una tarea
const setupTaskEvents = (li) => {
    const checkbox = li.querySelector('.checkbox');
    const taskSpan = li.querySelector('.task-text');
    const editBtn = li.querySelector('.edit-btn');
    const deleteBtn = li.querySelector('.delete-btn');

    const editTask = () => {
        if (checkbox.checked) return;
        const newText = prompt('Editar tarea:', taskSpan.textContent);
        if (newText !== null && newText.trim() !== '') {
            taskSpan.textContent = newText.trim();
            taskSpan.classList.remove('line-through', 'text-primary-500', 'dark:text-primary-400');
            filterTasks();
            saveCurrentState();
        }
    };

    const deleteTask = () => {
        li.remove();
        updateTaskCounter();
        toggleEmptyState();
        saveCurrentState();
        showToast('Tarea eliminada', 'error');
    };

    editBtn.addEventListener('click', editTask);
    deleteBtn.addEventListener('click', deleteTask);
    
    checkbox.addEventListener('change', () => {
        taskSpan.classList.toggle('line-through', checkbox.checked);
        taskSpan.classList.toggle('text-primary-500', checkbox.checked);
        taskSpan.classList.toggle('dark:text-primary-400', checkbox.checked);
        
        editBtn.disabled = checkbox.checked;
        editBtn.classList.toggle('bg-primary-300', checkbox.checked);
        editBtn.classList.toggle('dark:bg-dark-200', checkbox.checked);
        editBtn.classList.toggle('cursor-not-allowed', checkbox.checked);
        editBtn.classList.toggle('opacity-50', checkbox.checked);
        editBtn.classList.toggle('bg-accent-yellow', !checkbox.checked);
        editBtn.classList.toggle('hover:bg-amber-500', !checkbox.checked);
        
        li.classList.toggle('bg-primary-200', checkbox.checked);
        li.classList.toggle('dark:bg-dark-400', checkbox.checked);
        li.classList.toggle('bg-white', !checkbox.checked);
        li.classList.toggle('dark:bg-dark-300', !checkbox.checked);
        
        checkbox.classList.toggle('border-accent-green', checkbox.checked);
        checkbox.classList.toggle('bg-accent-green', checkbox.checked);
        checkbox.classList.toggle('border-primary-300', !checkbox.checked);
        checkbox.classList.toggle('dark:border-dark-200', !checkbox.checked);
        checkbox.classList.toggle('bg-white', !checkbox.checked);
        checkbox.classList.toggle('dark:bg-dark-400', !checkbox.checked);
        
        filterTasks();
        saveCurrentState();
        showToast(checkbox.checked ? 'Tarea completada!' : 'Tarea pendiente', checkbox.checked ? 'success' : 'info');
    });
};

// Función para filtrar tareas
const filterTasks = () => {
    const tasks = document.querySelectorAll('#task-list li');
    
    tasks.forEach(task => {
        const text = task.querySelector('.task-text').textContent.toLowerCase();
        const isCompleted = task.querySelector('.checkbox').checked;
        let shouldShow = true;
        
        if (state.currentFilter === 'active' && isCompleted) shouldShow = false;
        else if (state.currentFilter === 'completed' && !isCompleted) shouldShow = false;
        
        if (state.searchTerm && !text.includes(state.searchTerm.toLowerCase())) {
            shouldShow = false;
        }
        
        task.classList.toggle('hidden', !shouldShow);
    });
    
    toggleEmptyState();
    updateTaskCounter();
};

// Función para agregar tarea
const addTask = (event) => {
    event.preventDefault();
    const taskInput = document.getElementById('task-input');
    const taskText = taskInput.value.trim();
    
    if (!taskText) return;

    createTaskElement(taskText);
    
    taskInput.value = '';
    filterTasks();
    updateTaskCounter();
    saveCurrentState();
    showToast('Tarea agregada correctamente', 'success');
};

// =============================================
// INICIALIZACIÓN Y EVENT LISTENERS
// =============================================
document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('search-input');
    const displayFiltersBtn = document.getElementById('display-filters');
    const filtersContainer = document.querySelector('.controls');

    // Cargar tareas guardadas
    loadSavedTasks();

    // Configuración inicial
    filtersContainer.classList.add('hidden');
    filterButtons[0].classList.add('active');
    toggleEmptyState();
    updateTaskCounter();

    // Evento para mostrar/ocultar filtros
    displayFiltersBtn.addEventListener('click', (e) => {
        e.preventDefault();
        filtersContainer.classList.toggle('hidden');
        
        // Cambiar ícono
        const icon = displayFiltersBtn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-times');
            icon.classList.toggle('fa-filter');
        }
    });

    // Event listeners para filtros
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active', 'bg-green-500'));
            button.classList.add('active', 'bg-green-500');
            state.currentFilter = button.dataset.filter;
            filterTasks();
        });
    });

    // Event listener para búsqueda
    searchInput.addEventListener('input', (e) => {
        state.searchTerm = e.target.value.trim();
        filterTasks();
    });

    // Event listeners principales
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask(e);
    });
});