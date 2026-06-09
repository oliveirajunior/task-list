const API_BASE = '/task-lists';

let activeListId = null;

const translations = {
    status: { 'OPEN': 'Aberto', 'CLOSED': 'Fechado' },
    priority: { 'LOW': 'Baixa', 'MEDIUM': 'Média', 'HIGH': 'Alta' }
};

const priorityBadges = {
    'LOW': 'bg-green-50 text-green-700 border-green-200',
    'MEDIUM': 'bg-amber-50 text-amber-700 border-amber-200',
    'HIGH': 'bg-red-50 text-red-700 border-red-200'
};

document.addEventListener('DOMContentLoaded', () => {
    loadTaskLists();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('btn-delete-list').addEventListener('click', () => deleteActiveList());
    document.getElementById('btn-edit-list').addEventListener('click', () => openEditListModal());
    document.getElementById('btn-new-task').addEventListener('click', () => openNewTaskModal());
}

function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
    if(id === 'modal-list') document.getElementById('form-list').reset();
    if(id === 'modal-task') document.getElementById('form-task').reset();
}

// --- OPERAÇÕES DA LISTA DE TAREFAS (TASKLIST) ---

async function loadTaskLists() {
    try {
        const response = await fetch(API_BASE);
        if (!response.ok) throw new Error('Erro ao buscar listas');
        const lists = await response.json();
        
        const container = document.getElementById('lists-container');
        container.innerHTML = '';

        lists.forEach(list => {
            const taskCount = list.count || 0;
            
            // Tratamento contra o NaN%: se não houver tarefas, exibe como 100% concluído
            let percentage = 100;
            if (taskCount > 0 && list.progress !== undefined && list.progress !== null) {
                percentage = Math.round(list.progress * 100);
                if (isNaN(percentage)) percentage = 100;
            }

            const isActive = list.id === activeListId;

            const item = document.createElement('div');
            item.className = `p-4 rounded-xl cursor-pointer border transition-all duration-200 ${
                isActive 
                ? 'bg-indigo-50/70 border-indigo-200 shadow-sm' 
                : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
            }`;
            
            item.onclick = () => selectList(list.id);
            item.innerHTML = `
                <div class="flex justify-between items-start mb-1">
                    <h4 class="font-bold text-sm ${isActive ? 'text-indigo-950' : 'text-slate-800'} break-all">${list.title}</h4>
                    <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">${taskCount}</span>
                </div>
                <p class="text-xs text-slate-500 mb-3 truncate">${list.description || 'Sem descrição.'}</p>
                <div class="w-full bg-slate-200/70 rounded-full h-1.5">
                    <div class="bg-indigo-600 h-1.5 rounded-full transition-all" style="width: ${percentage}%"></div>
                </div>
            `;
            container.appendChild(item);
        });

        if (activeListId) {
            updateActiveListHeader();
        }
    } catch (error) {
        console.error(error);
    }
}

async function selectList(id) {
    activeListId = id;
    document.getElementById('empty-state').classList.add('hidden');
    document.getElementById('active-list-header').classList.remove('hidden');
    document.getElementById('tasks-container').classList.remove('hidden');
    
    await loadTaskLists();
    await loadTasks();
}

async function updateActiveListHeader() {
    try {
        const response = await fetch(`${API_BASE}/${activeListId}`);
        if (!response.ok) return;
        const list = await response.json();

        document.getElementById('active-list-title').innerText = list.title;
        document.getElementById('active-list-desc').innerText = list.description || 'Sem descrição vinculada.';
        
        const taskCount = list.count || 0;
        
        // Tratamento contra o NaN% no Cabeçalho da Lista Ativa
        let percentage = 100;
        if (taskCount > 0 && list.progress !== undefined && list.progress !== null) {
            percentage = Math.round(list.progress * 100);
            if (isNaN(percentage)) percentage = 100;
        }

        document.getElementById('active-list-progress-bar').style.width = `${percentage}%`;
        document.getElementById('active-list-progress-text').innerText = `${percentage}% concluído`;
    } catch (error) {
        console.error(error);
    }
}

async function saveList(event) {
    event.preventDefault();
    const id = document.getElementById('list-id').value;
    const title = document.getElementById('list-title-input').value;
    const description = document.getElementById('list-desc-input').value;

    const payload = { title, description };
    if (id) payload.id = id;

    const url = id ? `${API_BASE}/${id}` : API_BASE;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Erro ao salvar lista');
        const savedList = await response.json();
        
        closeModal('modal-list');
        if(!id) activeListId = savedList.id;
        await selectList(activeListId);
    } catch (error) {
        console.error(error);
        alert('Ocorreu um erro ao salvar a lista.');
    }
}

async function openEditListModal() {
    const response = await fetch(`${API_BASE}/${activeListId}`);
    if (!response.ok) return;
    const list = await response.json();

    document.getElementById('list-id').value = list.id;
    document.getElementById('list-title-input').value = list.title;
    document.getElementById('list-desc-input').value = list.description || '';
    
    document.getElementById('modal-list-title').innerText = "Editar Lista de Tarefas";
    openModal('modal-list');
}

async function deleteActiveList() {
    if (!confirm('Tem certeza de que deseja excluir esta lista inteira e todas as suas tarefas?')) return;
    try {
        const response = await fetch(`${API_BASE}/${activeListId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Erro ao deletar');
        
        activeListId = null;
        document.getElementById('active-list-header').classList.add('hidden');
        document.getElementById('tasks-container').classList.add('hidden');
        document.getElementById('empty-state').classList.remove('hidden');
        loadTaskLists();
    } catch (error) {
        console.error(error);
        alert('Erro ao excluir lista.');
    }
}


// --- OPERAÇÕES DE TAREFAS (TASKS VINCULADAS) ---

async function loadTasks() {
    try {
        const response = await fetch(`${API_BASE}/${activeListId}/tasks`);
        if (!response.ok) throw new Error('Erro ao carregar tarefas');
        const tasks = await response.json();

        const container = document.getElementById('tasks-container');
        container.innerHTML = '';

        if(tasks.length === 0) {
            container.innerHTML = `
                <div class="col-span-full py-12 text-center text-slate-400 text-sm">
                    Nenhuma tarefa cadastrada nesta lista ainda.
                </div>`;
            return;
        }

        tasks.forEach(task => {
            let dateFormatted = "Sem data";
            if(task.dueDate) {
                const date = new Date(task.dueDate);
                dateFormatted = date.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
            }

            const statusTexto = translations.status[task.status] || 'Aberto';
            const prioridadeTexto = translations.priority[task.priority] || 'Baixa';
            const badgeClass = priorityBadges[task.priority] || 'bg-slate-100 text-slate-700';
            
            const card = document.createElement('div');
            const isClosed = task.status === 'CLOSED';
            card.className = `bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${isClosed ? 'bg-slate-50/80 border-slate-200/60 opacity-75' : ''}`;

            card.innerHTML = `
                <div>
                    <div class="flex justify-between items-start gap-2 mb-2">
                        <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${badgeClass}">
                            ${prioridadeTexto}
                        </span>
                        <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${isClosed ? 'bg-slate-200 text-slate-700' : 'bg-indigo-100 text-indigo-700'}">
                            ${statusTexto}
                        </span>
                    </div>
                    <h5 class="font-bold text-base text-slate-900 mb-1 ${isClosed ? 'line-through text-slate-400' : ''} break-all">${task.title}</h5>
                    <p class="text-xs text-slate-500 mb-4 break-words">${task.description || 'Sem descrição.'}</p>
                </div>
                <div class="border-t border-slate-100 pt-3 mt-2 flex justify-between items-center text-xs text-slate-400">
                    <div class="flex items-center space-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span>${dateFormatted}</span>
                    </div>
                    <div class="flex space-x-1">
                        <button onclick="openEditTaskModal('${task.id}')" class="text-slate-500 hover:text-indigo-600 p-1 rounded hover:bg-slate-100 transition-colors">
                            Ajustar
                        </button>
                        <button onclick="deleteTask('${task.id}')" class="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors">
                            Excluir
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error(error);
    }
}

function openNewTaskModal() {
    document.getElementById('modal-task-title').innerText = "Nova Tarefa";
    document.getElementById('task-id').value = '';
    
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('task-date-input').value = now.toISOString().slice(0,16);
    document.getElementById('task-status-input').value = 'OPEN';
    openModal('modal-task');
}

async function openEditTaskModal(taskId) {
    try {
        const response = await fetch(`${API_BASE}/${activeListId}/tasks/${taskId}`);
        if (!response.ok) return;
        const task = await response.json();

        document.getElementById('task-id').value = task.id;
        document.getElementById('task-title-input').value = task.title;
        document.getElementById('task-desc-input').value = task.description || '';
        document.getElementById('task-priority-input').value = task.priority;
        document.getElementById('task-status-input').value = task.status || 'OPEN';
        
        if (task.dueDate) {
            document.getElementById('task-date-input').value = task.dueDate.slice(0, 16);
        }

        document.getElementById('modal-task-title').innerText = "Editar Tarefa";
        openModal('modal-task');
    } catch (error) {
        console.error(error);
    }
}

async function saveTask(event) {
    event.preventDefault();
    const id = document.getElementById('task-id').value;
    const title = document.getElementById('task-title-input').value;
    const description = document.getElementById('task-desc-input').value;
    let dueDate = document.getElementById('task-date-input').value;
    const priority = document.getElementById('task-priority-input').value;
    const status = document.getElementById('task-status-input').value;

    // Higienização e Mascaramento temporal de 4 dígitos para o ano
    if (dueDate) {
        if (dueDate.length > 16) {
            dueDate = dueDate.slice(0, 16);
        }
        if (dueDate.length === 16) {
            dueDate = `${dueDate}:00`;
        }
    }

    const payload = { 
        title, 
        description, 
        dueDate, 
        priority, 
        status 
    };
    
    if (id) {
        payload.id = id;
    }

    const url = id ? `${API_BASE}/${activeListId}/tasks/${id}` : `${API_BASE}/${activeListId}/tasks`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error('Erro ao salvar tarefa');
        
        closeModal('modal-task');
        await selectList(activeListId);
    } catch (error) {
        console.error(error);
        alert('Erro ao salvar tarefa: Verifique os parâmetros enviados.');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Remover esta tarefa definitivamente?')) return;
    try {
        const response = await fetch(`${API_BASE}/${activeListId}/tasks/${taskId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Erro ao deletar tarefa');
        await selectList(activeListId);
    } catch (error) {
        console.error(error);
    }
}