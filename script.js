// Data
const teamMembers = [
    { id: 1, name: 'Alex Morgan', role: 'Product Owner', avatar: 'http://static.photos/people/200x200/42' },
    { id: 2, name: 'Sarah Chen', role: 'UI Designer', avatar: 'http://static.photos/people/200x200/45' },
    { id: 3, name: 'Mike Johnson', role: 'Frontend Dev', avatar: 'http://static.photos/people/200x200/48' },
    { id: 4, name: 'Emma Wilson', role: 'UX Researcher', avatar: 'http://static.photos/people/200x200/52' }
];

// Sprint Planning Data
let projectGoals = [
    { id: 1, title: 'Complete Design System v2', description: 'Finalize all components and documentation', priority: 'high' },
    { id: 2, title: 'Mobile App MVP', description: 'Launch iOS and Android MVP versions', priority: 'high' },
    { id: 3, title: 'Performance Optimization', description: 'Improve load times by 50%', priority: 'medium' }
];

let backlogTasks = [
    { id: 101, title: 'Design button component library', points: 5, goalId: 1, type: 'design', status: 'backlog' },
    { id: 102, title: 'Create icon system', points: 3, goalId: 1, type: 'design', status: 'backlog' },
    { id: 103, title: 'Setup React Native project', points: 8, goalId: 2, type: 'dev', status: 'backlog' },
    { id: 104, title: 'Implement navigation', points: 5, goalId: 2, type: 'dev', status: 'backlog' },
    { id: 105, title: 'User authentication flow', points: 8, goalId: 2, type: 'dev', status: 'backlog' },
    { id: 106, title: 'Optimize image loading', points: 5, goalId: 3, type: 'dev', status: 'backlog' },
    { id: 107, title: 'Database query optimization', points: 8, goalId: 3, type: 'dev', status: 'backlog' },
    { id: 108, title: 'Research competitor apps', points: 3, goalId: 2, type: 'research', status: 'backlog' },
    { id: 109, title: 'Write documentation', points: 3, goalId: 1, type: 'dev', status: 'backlog' },
    { id: 110, title: 'Setup CI/CD pipeline', points: 5, goalId: 2, type: 'dev', status: 'backlog' }
];

let generatedSprintsData = [];

let tasks = [
    { id: 1, title: 'Design system documentation', type: 'design', priority: 'high', status: 'todo', assignee: 2, tags: ['Design', 'Docs'], comments: 3 },
    { id: 2, title: 'Fix navigation responsiveness', type: 'bug', priority: 'high', status: 'progress', assignee: 3, tags: ['Bug', 'Mobile'], comments: 1 },
    { id: 3, title: 'User interview synthesis', type: 'research', priority: 'medium', status: 'review', assignee: 4, tags: ['Research'], comments: 5 },
    { id: 4, title: 'API integration dashboard', type: 'dev', priority: 'high', status: 'progress', assignee: 3, tags: ['Backend'], comments: 2 },
    { id: 5, title: 'Color palette refinement', type: 'design', priority: 'low', status: 'done', assignee: 2, tags: ['Design'], comments: 0 },
    { id: 6, title: 'Accessibility audit', type: 'research', priority: 'medium', status: 'todo', assignee: 4, tags: ['A11y'], comments: 4 },
    { id: 7, title: 'Component library setup', type: 'dev', priority: 'high', status: 'done', assignee: 3, tags: ['Frontend'], comments: 8 },
    { id: 8, title: 'Landing page animations', type: 'design', priority: 'medium', status: 'review', assignee: 2, tags: ['Animation'], comments: 2 },
    { id: 9, title: 'Database schema design', type: 'dev', priority: 'high', status: 'todo', assignee: 3, tags: ['Backend'], comments: 1 },
    { id: 10, title: 'Mobile app wireframes', type: 'design', priority: 'medium', status: 'done', assignee: 2, tags: ['Mobile'], comments: 3 },
    { id: 11, title: 'Performance optimization', type: 'dev', priority: 'low', status: 'done', assignee: 3, tags: ['Performance'], comments: 0 }
];

const activities = [
    { user: 2, action: 'moved', target: 'Design system', from: 'In Progress', to: 'Review', time: '2 min ago' },
    { user: 3, action: 'completed', target: 'API Integration', time: '1 hour ago' },
    { user: 4, action: 'commented on', target: 'User Research', time: '3 hours ago' },
    { user: 1, action: 'created', target: 'Sprint 24 Planning', time: '5 hours ago' },
    { user: 2, action: 'uploaded', target: '3 new mockups', time: 'Yesterday' }
];

let selectedAssignee = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    renderBoard();
    renderActivity();
    initChart();
    renderAssignees();
    initSprintPlanner();
    
    // Mobile menu toggle
    document.getElementById('mobile-menu-btn').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('hidden');
    });

    // Form submission
    document.getElementById('newTaskForm').addEventListener('submit', handleNewTask);
    document.getElementById('goalForm').addEventListener('submit', handleNewGoal);
    document.getElementById('backlogForm').addEventListener('submit', handleNewBacklogTask);

    // Capacity calculation listeners
    document.getElementById('teamVelocity')?.addEventListener('input', updateCapacity);
    document.getElementById('bufferPercent')?.addEventListener('input', updateCapacity);
});

// View Navigation
function showSprintPlanner() {
    document.querySelector('main:not(#sprintPlannerView)').classList.add('hidden');
    document.getElementById('sprintPlannerView').classList.remove('hidden');
    document.getElementById('sprintPlannerView').classList.add('block');
    renderGoals();
    renderBacklog();
    updateCapacity();
    lucide.createIcons();
}

function showBoard() {
    document.querySelector('main:not(#sprintPlannerView)').classList.remove('hidden');
    document.getElementById('sprintPlannerView').classList.add('hidden');
    document.getElementById('sprintPlannerView').classList.remove('block');
    lucide.createIcons();
}

// Sprint Planning Functions
function initSprintPlanner() {
    updateGoalSelect();
}

function updateCapacity() {
    const velocity = parseInt(document.getElementById('teamVelocity')?.value || 40);
    const buffer = parseInt(document.getElementById('bufferPercent')?.value || 20);
    const effective = Math.floor(velocity * (1 - buffer / 100));
    document.getElementById('effectiveCapacity').textContent = effective + ' pts';
    
    const totalPoints = backlogTasks.reduce((sum, task) => sum + task.points, 0);
    document.getElementById('totalBacklogPoints').textContent = totalPoints + ' pts';
}

function renderGoals() {
    const container = document.getElementById('goalsList');
    if (!container) return;
    
    container.innerHTML = projectGoals.map(goal => `
        <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div class="w-2 h-2 rounded-full mt-2 ${getPriorityDot(goal.priority)}"></div>
            <div class="flex-1">
                <h4 class="font-semibold text-gray-900 text-sm">${goal.title}</h4>
                <p class="text-xs text-gray-500 mt-1">${goal.description}</p>
                <div class="flex items-center gap-2 mt-2">
                    <span class="text-xs px-2 py-0.5 bg-white rounded border border-gray-200 text-gray-600">
                        ${backlogTasks.filter(t => t.goalId === goal.id).reduce((s, t) => s + t.points, 0)} pts
                    </span>
                    <span class="text-xs text-gray-400">${backlogTasks.filter(t => t.goalId === goal.id).length} tasks</span>
                </div>
            </div>
            <button onclick="deleteGoal(${goal.id})" class="text-gray-400 hover:text-red-500">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
        </div>
    `).join('');
    
    lucide.createIcons();
}

function renderBacklog() {
    const container = document.getElementById('backlogTasks');
    if (!container) return;
    
    container.innerHTML = backlogTasks.map(task => {
        const goal = projectGoals.find(g => g.id === task.goalId);
        return `
        <div class="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
            <div class="w-8 h-8 rounded-lg ${getTypeColor(task.type)} flex items-center justify-center flex-shrink-0">
                <i data-lucide="${getTypeIcon(task.type)}" class="w-4 h-4"></i>
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">${task.title}</p>
                <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">${task.points} pts</span>
                    ${goal ? `<span class="text-xs text-gray-500 truncate">${goal.title}</span>` : ''}
                </div>
            </div>
            <button onclick="deleteBacklogTask(${task.id})" class="text-gray-400 hover:text-red-500 flex-shrink-0">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>
    `}).join('');
    
    lucide.createIcons();
    updateCapacity();
    updateGoalSelect();
}

function getPriorityDot(priority) {
    const colors = { high: 'bg-red-500', medium: 'bg-orange-500', low: 'bg-green-500' };
    return colors[priority] || 'bg-gray-500';
}

function getTypeColor(type) {
    const colors = {
        design: 'bg-pink-100 text-pink-600',
        dev: 'bg-blue-100 text-blue-600',
        research: 'bg-purple-100 text-purple-600',
        testing: 'bg-green-100 text-green-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
}

function updateGoalSelect() {
    const select = document.getElementById('backlogGoal');
    if (!select) return;
    select.innerHTML = '<option value="">No Goal</option>' + 
        projectGoals.map(g => `<option value="${g.id}">${g.title}</option>`).join('');
}

// Modals
function addGoal() {
    document.getElementById('goalModal').classList.remove('hidden');
}

function closeGoalModal() {
    document.getElementById('goalModal').classList.add('hidden');
    document.getElementById('goalForm').reset();
}

function addBacklogTask() {
    document.getElementById('backlogModal').classList.remove('hidden');
}

function closeBacklogModal() {
    document.getElementById('backlogModal').classList.add('hidden');
    document.getElementById('backlogForm').reset();
}

function handleNewGoal(e) {
    e.preventDefault();
    const newGoal = {
        id: Date.now(),
        title: document.getElementById('goalTitle').value,
        description: document.getElementById('goalDesc').value,
        priority: document.getElementById('goalPriority').value
    };
    projectGoals.push(newGoal);
    renderGoals();
    closeGoalModal();
    updateGoalSelect();
}

function handleNewBacklogTask(e) {
    e.preventDefault();
    const newTask = {
        id: Date.now(),
        title: document.getElementById('backlogTitle').value,
        points: parseInt(document.getElementById('backlogPoints').value),
        goalId: parseInt(document.getElementById('backlogGoal').value) || null,
        type: document.getElementById('backlogType').value,
        status: 'backlog'
    };
    backlogTasks.push(newTask);
    renderBacklog();
    closeBacklogModal();
}

function deleteGoal(id) {
    projectGoals = projectGoals.filter(g => g.id !== id);
    backlogTasks = backlogTasks.filter(t => t.goalId !== id);
    renderGoals();
    renderBacklog();
}

function deleteBacklogTask(id) {
    backlogTasks = backlogTasks.filter(t => t.id !== id);
    renderBacklog();
}

// Sprint Generation Algorithm
function generateSprints() {
    const velocity = parseInt(document.getElementById('teamVelocity').value);
    const buffer = parseInt(document.getElementById('bufferPercent').value);
    const effectiveCapacity = Math.floor(velocity * (1 - buffer / 100));
    const duration = parseInt(document.getElementById('sprintDuration').value);
    
    // Sort tasks by priority (high priority goals first) and points
    const sortedTasks = [...backlogTasks].sort((a, b) => {
        const goalA = projectGoals.find(g => g.id === a.goalId);
        const goalB = projectGoals.find(g => g.id === b.goalId);
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const priorityDiff = (priorityWeight[goalB?.priority] || 0) - (priorityWeight[goalA?.priority] || 0);
        if (priorityDiff !== 0) return priorityDiff;
        return b.points - a.points; // Larger tasks first for better packing
    });
    
    const sprints = [];
    let currentSprint = { number: 1, tasks: [], totalPoints: 0, goals: new Set() };
    let unassignedTasks = [];
    
    sortedTasks.forEach(task => {
        if (currentSprint.totalPoints + task.points <= effectiveCapacity) {
            currentSprint.tasks.push(task);
            currentSprint.totalPoints += task.points;
            if (task.goalId) currentSprint.goals.add(task.goalId);
        } else {
            // Check if any remaining tasks can fit
            const remainingSpace = effectiveCapacity - currentSprint.totalPoints;
            const fittingTask = sortedTasks.find(t => 
                !currentSprint.tasks.includes(t) && 
                !unassignedTasks.includes(t) &&
                t.points <= remainingSpace &&
                t.id !== task.id
            );
            
            if (fittingTask && fittingTask.id !== task.id) {
                currentSprint.tasks.push(fittingTask);
                currentSprint.totalPoints += fittingTask.points;
                if (fittingTask.goalId) currentSprint.goals.add(fittingTask.goalId);
                unassignedTasks.push(task);
            } else {
                sprints.push(currentSprint);
                currentSprint = { 
                    number: sprints.length + 1, 
                    tasks: [task], 
                    totalPoints: task.points,
                    goals: new Set(task.goalId ? [task.goalId] : [])
                };
            }
        }
    });
    
    if (currentSprint.tasks.length > 0) {
        sprints.push(currentSprint);
    }
    
    // Add unassigned tasks to new sprints if any
    unassignedTasks.forEach(task => {
        const lastSprint = sprints[sprints.length - 1];
        if (lastSprint && lastSprint.totalPoints + task.points <= effectiveCapacity) {
            lastSprint.tasks.push(task);
            lastSprint.totalPoints += task.points;
            if (task.goalId) lastSprint.goals.add(task.goalId);
        } else {
            sprints.push({
                number: sprints.length + 1,
                tasks: [task],
                totalPoints: task.points,
                goals: new Set(task.goalId ? [task.goalId] : [])
            });
        }
    });
    
    generatedSprintsData = sprints;
    renderGeneratedSprints(sprints, effectiveCapacity, duration);
}

function renderGeneratedSprints(sprints, capacity, duration) {
    const container = document.getElementById('sprintsPreview');
    const wrapper = document.getElementById('generatedSprints');
    
    if (sprints.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm text-center py-4">No tasks to generate sprints from</p>';
    } else {
        container.innerHTML = sprints.map(sprint => {
            const goalNames = Array.from(sprint.goals).map(gid => {
                const goal = projectGoals.find(g => g.id === gid);
                return goal ? goal.title : '';
            }).filter(Boolean);
            
            const utilization = Math.round((sprint.totalPoints / capacity) * 100);
            const utilizationColor = utilization > 90 ? 'text-green-600 bg-green-50' : 
                                    utilization > 70 ? 'text-blue-600 bg-blue-50' : 'text-orange-600 bg-orange-50';
            
            return `
            <div class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="font-bold text-gray-900">Sprint ${sprint.number}</h4>
                        <p class="text-xs text-gray-500 mt-0.5">${duration} weeks • ${sprint.tasks.length} tasks</p>
                    </div>
                    <span class="text-xs font-semibold px-2 py-1 rounded-lg ${utilizationColor}">
                        ${sprint.totalPoints}/${capacity} pts
                    </span>
                </div>
                
                <div class="space-y-2 mb-3">
                    ${sprint.tasks.slice(0, 3).map(t => `
                        <div class="flex items-center gap-2 text-xs">
                            <span class="w-5 h-5 rounded flex items-center justify-center ${getTypeColor(t.type)} flex-shrink-0">
                                <i data-lucide="${getTypeIcon(t.type)}" class="w-3 h-3"></i>
                            </span>
                            <span class="text-gray-700 truncate flex-1">${t.title}</span>
                            <span class="text-gray-400 flex-shrink-0">${t.points}p</span>
                        </div>
                    `).join('')}
                    ${sprint.tasks.length > 3 ? `<p class="text-xs text-gray-400 pl-7">+${sprint.tasks.length - 3} more tasks</p>` : ''}
                </div>
                
                ${goalNames.length > 0 ? `
                <div class="flex flex-wrap gap-1 pt-2 border-t border-gray-100">
                    ${goalNames.map(g => `<span class="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded">${g}</span>`).join('')}
                </div>
                ` : ''}
            </div>
            `;
        }).join('');
    }
    
    wrapper.classList.remove('hidden');
    lucide.createIcons();
}

function applyGeneratedSprints() {
    if (generatedSprintsData.length === 0) return;
    
    // Transform generated sprints into actual sprints
    const startDate = new Date();
    generatedSprintsData.forEach((sprint, index) => {
        const sprintName = `Sprint ${25 + index}`;
        const sprintTasks = sprint.tasks.map(t => ({
            id: tasks.length + 1,
            title: t.title,
            type: t.type,
            priority: 'medium',
            status: index === 0 ? 'todo' : 'backlog',
            assignee: teamMembers[index % teamMembers.length].id,
            tags: [t.type.charAt(0).toUpperCase() + t.type.slice(1)],
            comments: 0,
            storyPoints: t.points,
            sprintName: sprintName
        }));
        tasks.push(...sprintTasks);
    });
    
    // Clear backlog
    backlogTasks = [];
    renderBacklog();
    
    // Show board
    showBoard();
    renderBoard();
    
    // Show success message
    alert(`Successfully created ${generatedSprintsData.length} sprints with ${tasks.length} tasks!`);
}

// Close modals on outside click
document.getElementById('goalModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeGoalModal();
});
document.getElementById('backlogModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeBacklogModal();
});

function getPriorityColor(priority) {
    const colors = {
        high: 'bg-red-100 text-red-700 border-red-200',
        medium: 'bg-orange-100 text-orange-700 border-orange-200',
        low: 'bg-green-100 text-green-700 border-green-200'
    };
    return colors[priority] || colors.medium;
}

function getTypeIcon(type) {
    const icons = {
        design: 'palette',
        dev: 'code',
        bug: 'bug',
        research: 'search'
    };
    return icons[type] || 'circle';
}

function createTaskCard(task) {
    const assignee = teamMembers.find(m => m.id === task.assignee);
    const priorityClass = getPriorityColor(task.priority);
    
    return `
        <div class="task-card bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-move" 
             draggable="true" 
             ondragstart="drag(event)" 
             data-task-id="${task.id}">
            
            <div class="flex justify-between items-start mb-2">
                <span class="px-2 py-1 rounded-lg text-xs font-medium border ${priorityClass} uppercase tracking-wide">
                    ${task.priority}
                </span>
                <button onclick="deleteTask(${task.id})" class="text-gray-400 hover:text-red-500 transition-colors" title="Delete task">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>

            <h4 class="font-semibold text-gray-900 mb-2 line-clamp-2">${task.title}</h4>
            
            <div class="flex items-center gap-2 mb-3">
                <i data-lucide="${getTypeIcon(task.type)}" class="w-4 h-4 text-gray-400"></i>
                <span class="text-xs text-gray-500 capitalize">${task.type}</span>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                <div class="flex items-center gap-2">
                    <img src="${assignee.avatar}" alt="${assignee.name}" class="w-6 h-6 rounded-full border border-white">
                    <div class="flex gap-1">
                        ${task.tags.map(tag => `<span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">${tag}</span>`).join('')}
                    </div>
                </div>
                <div class="flex items-center gap-1 text-gray-400 text-xs">
                    <i data-lucide="message-square" class="w-3 h-3"></i>
                    <span>${task.comments}</span>
                </div>
            </div>
        </div>
    `;
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex > -1) {
            const deletedTask = tasks[taskIndex];
            tasks.splice(taskIndex, 1);
            renderBoard();
            
            // Add to activity
            activities.unshift({
                user: teamMembers[0].id,
                action: 'deleted',
                target: deletedTask.title,
                time: 'Just now'
            });
            renderActivity();
        }
    }
}

function renderBoard() {
    const columns = {
        todo: document.getElementById('todo-column'),
        progress: document.getElementById('progress-column'),
        review: document.getElementById('review-column'),
        done: document.getElementById('done-column')
    };

    const counts = {
        todo: 0,
        progress: 0,
        review: 0,
        done: 0
    };

    // Clear columns
    Object.values(columns).forEach(col => col.innerHTML = '');

    // Populate columns
    tasks.forEach(task => {
        if (columns[task.status]) {
            columns[task.status].innerHTML += createTaskCard(task);
            counts[task.status]++;
        }
    });

    // Update counts
    document.getElementById('count-todo').textContent = counts.todo;
    document.getElementById('count-progress').textContent = counts.progress;
    document.getElementById('count-review').textContent = counts.review;
    document.getElementById('count-done').textContent = counts.done;

    lucide.createIcons();
}

function renderActivity() {
    const container = document.getElementById('activity-feed');
    container.innerHTML = activities.map(activity => {
        const user = teamMembers.find(m => m.id === activity.user);
        return `
            <div class="flex gap-3 items-start">
                <img src="${user.avatar}" class="w-8 h-8 rounded-full border border-gray-200 flex-shrink-0">
                <div class="flex-1 min-w-0">
                    <p class="text-sm text-gray-900">
                        <span class="font-semibold">${user.name}</span>
                        <span class="text-gray-600">${activity.action}</span>
                        <span class="font-medium text-gray-900">${activity.target}</span>
                    </p>
                    <p class="text-xs text-gray-500 mt-0.5">${activity.time}</p>
                </div>
            </div>
        `;
    }).join('');
}

function renderAssignees() {
    const container = document.getElementById('assigneeList');
    container.innerHTML = teamMembers.map(member => `
        <div class="flex-shrink-0 cursor-pointer assignee-option" 
             data-id="${member.id}"
             onclick="selectAssignee(${member.id})">
            <img src="${member.avatar}" 
                 class="w-10 h-10 rounded-full border-2 ${selectedAssignee === member.id ? 'border-indigo-600' : 'border-transparent'} hover:scale-110 transition-transform">
            <p class="text-xs text-center mt-1 text-gray-600">${member.name.split(' ')[0]}</p>
        </div>
    `).join('');
}

function selectAssignee(id) {
    selectedAssignee = id;
    renderAssignees();
}

function initChart() {
    const ctx = document.getElementById('burndownChart').getContext('2d');
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const ideal = [32, 29, 26, 23, 20, 17, 14, 11, 8, 5, 2];
    const actual = [32, 30, 28, 25, 24, 20, 18, 15, 12, 8];

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Ideal',
                    data: ideal,
                    borderColor: '#e5e7eb',
                    borderDash: [5, 5],
                    tension: 0.4,
                    pointRadius: 0,
                    borderWidth: 2
                },
                {
                    label: 'Actual',
                    data: actual,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#6366f1',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f3f4f6'
                    },
                    ticks: {
                        color: '#9ca3af',
                        font: { size: 11 }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#9ca3af',
                        font: { size: 11 }
                    }
                }
            }
        }
    });
}

// Drag and Drop
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("taskId", ev.target.getAttribute('data-task-id'));
    ev.target.classList.add('dragging');
}

function drop(ev) {
    ev.preventDefault();
    const taskId = parseInt(ev.dataTransfer.getData("taskId"));
    const column = ev.target.closest('.kanban-column');
    
    if (column) {
        const newStatus = column.getAttribute('data-status');
        const task = tasks.find(t => t.id === taskId);
        
        if (task && task.status !== newStatus) {
            task.status = newStatus;
            renderBoard();
            
            // Add to activity
            const user = teamMembers[0]; // Current user
            activities.unshift({
                user: user.id,
                action: 'moved',
                target: task.title,
                from: task.status,
                to: newStatus,
                time: 'Just now'
            });
            renderActivity();
        }
    }
    
    document.querySelectorAll('.task-card').forEach(card => {
        card.classList.remove('dragging');
    });
}

// Modal Functions
function openTaskModal() {
    document.getElementById('taskModal').classList.remove('hidden');
    selectedAssignee = null;
    renderAssignees();
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.add('hidden');
    document.getElementById('newTaskForm').reset();
}

function handleNewTask(e) {
    e.preventDefault();
    
    const title = document.getElementById('taskTitle').value;
    const type = document.getElementById('taskType').value;
    const priority = document.getElementById('taskPriority').value;
    
    if (!selectedAssignee) {
        alert('Please select an assignee');
        return;
    }
    
    const newTask = {
        id: tasks.length + 1,
        title: title,
        type: type,
        priority: priority,
        status: 'todo',
        assignee: selectedAssignee,
        tags: [type.charAt(0).toUpperCase() + type.slice(1)],
        comments: 0
    };
    
    tasks.push(newTask);
    renderBoard();
    closeTaskModal();
    
    // Add activity
    activities.unshift({
        user: selectedAssignee,
        action: 'created',
        target: title,
        time: 'Just now'
    });
    renderActivity();
}

// Close modal on outside click
document.getElementById('taskModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        closeTaskModal();
    }
});