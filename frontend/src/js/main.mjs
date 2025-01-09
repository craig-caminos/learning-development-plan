import { createClient } from '@supabase/supabase-js';
import { Router } from './router.mjs';

console.log('main.mjs loaded');

// Initialize Supabase client
const supabaseUrl = 'https://ygvdfmdepabymvwsittp.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlndmRmbWRlcGFieW12d3NpdHRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYxMjUwNjUsImV4cCI6MjA1MTcwMTA2NX0.vMvFvK3G-uxFrNqekp65JkuDMxCOeoow-BrCCN_Gb4o';
const supabase = createClient(supabaseUrl, supabaseKey);

// State management
let currentUser = null;
let isLoginMode = true;

// DOM Elements
const loginBtn = document.getElementById('loginBtn');
console.log('loginBtn found:', !!loginBtn);

const authModal = document.getElementById('authModal');
console.log('authModal found:', !!authModal);

const authForm = document.getElementById('authForm');
const navLinks = document.getElementById('navLinks');
const mainContent = document.getElementById('mainContent');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const authTitle = document.getElementById('authTitle');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const signupFields = document.getElementById('signupFields');
const verificationSuccess = document.getElementById('verificationSuccess');
const proceedToLogin = document.getElementById('proceedToLogin');
const adminSkillModal = document.getElementById('adminSkillModal');
const adminSkillForm = document.getElementById('adminSkillForm');
const closeAdminSkillModal = document.getElementById('closeAdminSkillModal');
const cancelAdminSkillBtn = document.getElementById('cancelAdminSkillBtn');
const adminSkillModalTitle = document.getElementById('adminSkillModalTitle');

// Helper functions
function getSkillTypeClass(type) {
    const classes = {
        technical: 'bg-blue-50 text-blue-700',
        soft: 'bg-green-50 text-green-700',
        business: 'bg-purple-50 text-purple-700'
    };
    return classes[type] || 'bg-gray-50 text-gray-700';
}

function groupSkillsByType(skills) {
    const grouped = skills.reduce((acc, skill) => {
        if (!acc[skill.type]) {
            acc[skill.type] = [];
        }
        acc[skill.type].push(skill);
        return acc;
    }, {});
    return Object.entries(grouped);
}

function isSkillAdded(skillId, userSkills) {
    return userSkills.some(us => us.skills.id === skillId);
}

function toggleAuthModal() {
    console.log('toggleAuthModal called');
    console.log('authModal before:', authModal.classList.contains('hidden'));
    authModal.classList.toggle('hidden');
    console.log('authModal after:', authModal.classList.contains('hidden'));
    
    if (!authModal.classList.contains('hidden')) {
        // Reset form when opening
        authForm.reset();
        document.getElementById('email').focus();
    }
}

// Event Listeners
loginBtn.addEventListener('click', async () => {
    console.log('Login button clicked'); // Debug log
    if (currentUser) {
        console.log('User is logged in, attempting logout'); // Debug log
        await handleLogout();
    } else {
        console.log('No current user, showing auth modal'); // Debug log
        toggleAuthModal();
        console.log('Auth modal visibility:', !authModal.classList.contains('hidden')); // Debug log
    }
});

// Auth Functions
async function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        if (isLoginMode) {
            // Login
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            currentUser = data.user;
            await loadUserProfile();
        } else {
            const fullName = document.getElementById('fullName').value;
            
            console.log('Starting signup process...'); // Debug log
            
            // Sign up the user
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        email: email
                    },
                    emailRedirectTo: `${window.location.origin}`
                }
            });

            if (signUpError) throw signUpError;

            toggleAuthModal();
            alert('Please check your email for a verification link. Once verified, you can log in to your account.');
            return;
        }

        toggleAuthModal();
        updateNavigation();
        loadDashboard();
    } catch (error) {
        console.error('Auth Error:', error); // Debug log
        alert(error.message);
    }
}

// Add more event listeners
authForm.addEventListener('submit', handleAuth);
toggleAuthMode.addEventListener('click', toggleAuthModeHandler);
proceedToLogin.addEventListener('click', () => {
    verificationSuccess.classList.add('hidden');
    isLoginMode = true;
    toggleAuthModeHandler();
    toggleAuthModal();
});

function toggleAuthModeHandler() {
    isLoginMode = !isLoginMode;
    authTitle.textContent = isLoginMode ? 'Login' : 'Sign Up';
    toggleAuthMode.textContent = isLoginMode ? 'Sign Up Instead' : 'Login Instead';
    authSubmitBtn.textContent = isLoginMode ? 'Login' : 'Sign Up';
    signupFields.classList.toggle('hidden');
}

async function loadUserProfile() {
    console.log('Loading user profile for:', currentUser.id);
    try {
        // Changed the query to use match the exact id
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)  // This is the correct way to use eq
            .single();

        if (error) {
            console.error('Error loading profile:', error);
            // Create profile if it doesn't exist
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert([{
                    id: currentUser.id,
                    email: currentUser.email,
                    full_name: currentUser.user_metadata?.full_name || 'User',
                    is_admin: false  // Default to non-admin
                }])
                .select()
                .single();

            if (createError) {
                console.error('Error creating profile:', createError);
                return;
            }

            currentUser.profile = newProfile;
        } else {
            console.log('Profile loaded:', data);
            currentUser.profile = data;
        }
        
        // Force navigation update after profile load
        updateNavigation();
    } catch (error) {
        console.error('Error in loadUserProfile:', error);
    }
}

function updateNavigation() {
    if (!currentUser) {
        navLinks.innerHTML = '';
        loginBtn.textContent = 'Login';
        return;
    }

    loginBtn.textContent = 'Logout';
    const isAdmin = currentUser.profile?.is_admin;
    console.log('Updating navigation. Is admin?', isAdmin); // Debug log

    const links = isAdmin ? [
        { text: 'Dashboard', href: '#dashboard' },
        { text: 'Manage Skills', href: '#admin/skills' },
        { text: 'Manage Users', href: '#admin/users' },
        { text: 'My Skills', href: '#skills' }
    ] : [
        { text: 'Dashboard', href: '#dashboard' },
        { text: 'My Skills', href: '#skills' },
        { text: 'Profile', href: '#profile' }
    ];

    navLinks.innerHTML = links
        .map(link => `<a href="${link.href}" class="mx-2 hover:text-blue-200">${link.text}</a>`)
        .join('');
}

// Add this at the top with your other initialization code
let notificationTimeout;

// Notification System
function showNotification(message, type = 'info', duration = 5000) {
    const container = document.querySelector('.notifications-container') || 
        (() => {
            const cont = document.createElement('div');
            cont.className = 'notifications-container';
            document.body.appendChild(cont);
            return cont;
        })();

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            ${type === 'success' ? `
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
            ` : type === 'error' ? `
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            ` : `
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            `}
        </div>
        <div class="notification-content">
            <p>${message}</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
    `;

    container.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('notification-exit');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Loading State Component
function createLoadingState(type = 'card') {
    if (type === 'card') {
        return `
            <div class="stat-card">
                <div class="loading-skeleton w-12 h-12 rounded"></div>
                <div class="stat-content">
                    <div class="loading-skeleton w-24 h-4 mb-2"></div>
                    <div class="loading-skeleton w-16 h-6 mb-1"></div>
                    <div class="loading-skeleton w-32 h-4"></div>
                </div>
            </div>
        `;
    }
    return '';
}

// Add ripple effect to buttons
document.addEventListener('click', function(e) {
    if (e.target.matches('.btn, .nav-item')) {
        e.target.classList.add('ripple');
        setTimeout(() => e.target.classList.remove('ripple'), 600);
    }
});

// Update your existing functions to use these new features
async function loadDashboard() {
    // Show loading state
    mainContent.innerHTML = `
        <div class="dashboard-content">
            <div class="content-header">
                <div class="loading-skeleton w-48 h-8 mb-2"></div>
                <div class="loading-skeleton w-64 h-4"></div>
            </div>
            <div class="stats-grid">
                ${createLoadingState('card')}
                ${createLoadingState('card')}
                ${createLoadingState('card')}
            </div>
        </div>
    `;

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Your existing dashboard loading code...
}

// Example usage in your existing functions
async function handleAdminSkillSubmit(e) {
    e.preventDefault();
    try {
        // Your existing code...
        showNotification('Skill saved successfully!', 'success');
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Add hover effects to cards
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.stat-card, .activity-item').forEach(el => {
        el.classList.add('hover-lift');
    });
});

async function checkAuthState() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session) {
            currentUser = session.user;
            await loadUserProfile();
            updateNavigation();
            loadDashboard();
        }
    } catch (error) {
        console.error('Error checking auth state:', error);
    }
}

async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        window.location.hash = '#'; // Reset to home
        currentUser = null; // Clear user after navigation
        updateNavigation();
        loadDashboard(); // Show default dashboard
    } catch (error) {
        console.error('Error logging out:', error);
        alert(error.message);
    }
}

const router = new Router([
    { 
        path: 'admin/skills', 
        handler: loadAdminSkillsPage,
        pattern: '^admin/skills' // Add pattern to match exactly
    },
    { path: 'dashboard', handler: loadDashboard },
    { path: '', handler: loadDashboard },
    { path: 'skills', handler: loadSkillsPage }
]);

// Initial setup
updateNavigation();
checkAuthState();
ensureAdminStatus();

async function loadAdminSkillsPage() {
    console.log('Loading admin skills page');
    console.log('Current user:', currentUser);
    console.log('Is admin?', currentUser?.profile?.is_admin);

    if (!currentUser?.profile?.is_admin) {
        console.log('Not an admin, redirecting to dashboard');
        window.location.hash = '#dashboard';
        return;
    }

    try {
        const { data: skills, error } = await supabase
            .from('skills')
            .select('*')
            .order('type', { ascending: true });

        if (error) throw error;

        mainContent.innerHTML = `
            <div class="container">
                <div class="card">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-900">Manage Skills</h2>
                        <button 
                            id="addSkillBtn"
                            class="btn btn-primary"
                        >
                            Add New Skill
                        </button>
                    </div>
                    
                    <div class="overflow-hidden">
                        <table class="skills-table">
                            <thead>
                                <tr>
                                    <th class="w-1/4">Name</th>
                                    <th class="w-1/6">Type</th>
                                    <th class="w-1/2">Description</th>
                                    <th class="w-1/6">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${skills.map(skill => `
                                    <tr data-skill-id="${skill.id}">
                                        <td class="font-medium">${skill.name}</td>
                                        <td>
                                            <span class="skill-badge ${getSkillTypeClass(skill.type)}">
                                                ${skill.type}
                                            </span>
                                        </td>
                                        <td class="text-gray-600">${skill.description}</td>
                                        <td>
                                            <div class="flex space-x-2">
                                                <button 
                                                    class="edit-skill-btn text-blue-600 hover:text-blue-800"
                                                >
                                                    Edit
                                                </button>
                                                <button 
                                                    class="delete-skill-btn text-red-600 hover:text-red-800"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners after creating the content
        document.getElementById('addSkillBtn').addEventListener('click', showAdminSkillModal);

        // Add event delegation for edit and delete buttons
        document.addEventListener('click', async (e) => {
            const target = e.target;
            if (target.matches('.edit-skill-btn')) {
                const skillId = target.closest('tr').dataset.skillId;
                await editSkill(skillId);
            } else if (target.matches('.delete-skill-btn')) {
                const skillId = target.closest('tr').dataset.skillId;
                await deleteSkill(skillId);
            }
        });
    } catch (error) {
        console.error('Error loading admin skills page:', error);
        mainContent.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>There was an error loading the skills management page. Please try refreshing.</p>
            </div>
        `;
    }
}

function toggleAdminSkillModal() {
    adminSkillModal.classList.toggle('hidden');
    if (adminSkillModal.classList.contains('hidden')) {
        // Reset form when closing
        adminSkillForm.reset();
        document.getElementById('adminSkillId').value = '';
        adminSkillModalTitle.textContent = 'Add New Skill';
    }
}

function showAdminSkillModal() {
    adminSkillModalTitle.textContent = 'Add New Skill';
    document.getElementById('adminSkillId').value = '';
    document.getElementById('skillName').value = '';
    document.getElementById('skillType').value = '';
    document.getElementById('skillDescription').value = '';
    toggleAdminSkillModal();
}

async function editSkill(skillId) {
    try {
        const { data: skill, error } = await supabase
            .from('skills')
            .select('*')
            .eq('id', skillId)
            .single();

        if (error) throw error;

        adminSkillModalTitle.textContent = 'Edit Skill';
        document.getElementById('adminSkillId').value = skillId;
        document.getElementById('skillName').value = skill.name;
        document.getElementById('skillType').value = skill.type;
        document.getElementById('skillDescription').value = skill.description;
        
        toggleAdminSkillModal();
    } catch (error) {
        console.error('Error loading skill for edit:', error);
        alert('Failed to load skill for editing. Please try again.');
    }
}

async function handleAdminSkillSubmit(e) {
    e.preventDefault();
    console.log('Handling admin skill submit');
    
    const skillId = document.getElementById('adminSkillId').value;
    const isUpdate = !!skillId;
    
    const formData = {
        name: document.getElementById('skillName').value,
        type: document.getElementById('skillType').value,
        description: document.getElementById('skillDescription').value
    };
    
    console.log('Form data:', formData);
    
    try {
        if (isUpdate) {
            console.log('Updating existing skill');
            const { data, error } = await supabase
                .from('skills')
                .update(formData)
                .eq('id', skillId)
                .select();
            
            if (error) throw error;
            console.log('Skill updated:', data);
        } else {
            console.log('Creating new skill');
            const { data, error } = await supabase
                .from('skills')
                .insert([formData])
                .select();
            
            if (error) throw error;
            console.log('Skill created:', data);
        }
        
        toggleAdminSkillModal();
        // Stay on the admin skills page
        window.location.hash = '#admin/skills';
        // Refresh the skills list
        await loadAdminSkillsPage();
    } catch (error) {
        console.error('Error saving skill:', error);
        alert('Failed to save skill. Please try again. Error: ' + error.message);
    }
}

async function deleteSkill(skillId) {
    if (!confirm('Are you sure you want to delete this skill? This action cannot be undone.')) {
        return;
    }

    try {
        // First check if the skill is being used by any users
        const { data: userSkills, error: checkError } = await supabase
            .from('user_skills')
            .select('id')
            .eq('skill_id', skillId);

        if (checkError) throw checkError;

        if (userSkills.length > 0) {
            alert('This skill cannot be deleted because it is currently being used by users.');
            return;
        }

        // If not being used, proceed with deletion
        const { error: deleteError } = await supabase
            .from('skills')
            .delete()
            .eq('id', skillId);

        if (deleteError) throw deleteError;

        loadAdminSkillsPage(); // Refresh the page
    } catch (error) {
        console.error('Error deleting skill:', error);
        alert('Failed to delete skill. Please try again.');
    }
}

async function loadAdminUsersPage() {
    if (!currentUser?.profile?.is_admin) {
        window.location.hash = '#dashboard';
        return;
    }

    try {
        const { data: users, error } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name', { ascending: true });

        if (error) throw error;

        mainContent.innerHTML = `
            <div class="space-y-6">
                <div class="bg-white shadow rounded-lg p-6">
                    <h2 class="text-2xl font-bold mb-4">Manage Users</h2>
                    <div class="overflow-x-auto">
                        <table class="min-w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-200">
                                ${users.map(user => `
                                    <tr>
                                        <td class="px-6 py-4 whitespace-nowrap">${user.full_name}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">${user.email}</td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                            }">
                                                ${user.is_admin ? 'Admin' : 'User'}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <button 
                                                onclick="toggleUserAdmin('${user.id}', ${!user.is_admin})"
                                                class="text-indigo-600 hover:text-indigo-900"
                                            >
                                                ${user.is_admin ? 'Remove Admin' : 'Make Admin'}
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading users page:', error);
        mainContent.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>There was an error loading the users management page. Please try refreshing.</p>
            </div>
        `;
    }
}

async function loadSkillsPage() {
    try {
        // Fetch all available skills and user's skills in parallel
        const [availableSkillsResponse, userSkillsResponse] = await Promise.all([
            supabase
                .from('skills')
                .select('*')
                .order('type', { ascending: true }),
            supabase
                .from('user_skills')
                .select(`
                    *,
                    skills (
                        id,
                        name,
                        type,
                        description
                    )
                `)
                .eq('user_id', currentUser.id)
        ]);

        if (availableSkillsResponse.error) throw availableSkillsResponse.error;
        if (userSkillsResponse.error) throw userSkillsResponse.error;

        const availableSkills = availableSkillsResponse.data;
        const userSkills = userSkillsResponse.data;

        mainContent.innerHTML = `
            <div class="space-y-6">
                <!-- Header -->
                <div class="bg-white shadow rounded-lg p-6">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold">My Skills</h2>
                        <button id="addSkillBtn" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                            Add New Skill
                        </button>
                    </div>
                </div>

                <!-- Skills Dashboard -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Current Skills -->
                    <div class="bg-white shadow rounded-lg p-6">
                        <h3 class="text-xl font-bold mb-4">Current Skills</h3>
                        <div class="space-y-4">
                            ${userSkills.length > 0 ? userSkills.map(skill => `
                                <div class="border rounded-lg p-4 hover:shadow transition-shadow">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <h4 class="font-bold">${skill.skills.name}</h4>
                                            <p class="text-sm text-gray-600">${skill.skills.description}</p>
                                            <span class="inline-block px-2 py-1 text-xs rounded mt-2 ${getSkillTypeClass(skill.skills.type)}">
                                                ${skill.skills.type}
                                            </span>
                                        </div>
                                        <button 
                                            onclick="updateSkill('${skill.id}')"
                                            class="text-gray-600 hover:text-gray-800"
                                        >
                                            ✏️
                                        </button>
                                    </div>
                                    <div class="mt-3">
                                        <div class="flex justify-between text-sm mb-1">
                                            <span>Current Level: ${skill.current_score}/10</span>
                                            <span>Target: ${skill.target_score}/10</span>
                                        </div>
                                        <div class="w-full bg-gray-200 rounded-full h-2.5">
                                            <div 
                                                class="bg-blue-600 h-2.5 rounded-full" 
                                                style="width: ${(skill.current_score/10)*100}%"
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            `).join('') : `
                                <p class="text-gray-500">You haven't added any skills yet. Add some skills to track your progress!</p>
                            `}
                        </div>
                    </div>

                    <!-- Available Skills -->
                    <div class="bg-white shadow rounded-lg p-6">
                        <h3 class="text-xl font-bold mb-4">Available Skills by Category</h3>
                        <div class="space-y-4">
                            ${groupSkillsByType(availableSkills).map(([type, skills]) => `
                                <div class="border rounded-lg p-4">
                                    <h4 class="font-bold mb-2 capitalize">${type}</h4>
                                    <div class="grid grid-cols-2 gap-2">
                                        ${skills.map(skill => `
                                            <div class="text-sm p-2 rounded ${
                                                isSkillAdded(skill.id, userSkills) 
                                                ? 'bg-gray-100 text-gray-600' 
                                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer'
                                            }"
                                            ${!isSkillAdded(skill.id, userSkills) ? `onclick="addSkill('${skill.id}')"` : ''}
                                            >
                                                ${skill.name}
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listener for the add skill button
        document.getElementById('addSkillBtn')?.addEventListener('click', showAddSkillModal);
    } catch (error) {
        console.error('Error loading skills page:', error);
        mainContent.innerHTML = `
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>There was an error loading the skills page. Please try refreshing the page.</p>
            </div>
        `;
    }
}

async function ensureAdminStatus() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({ is_admin: true })
            .eq('email', 'craig.caminos@gmail.com')
            .select()
            .single();

        if (error) {
            console.error('Error setting admin status:', error);
            return;
        }

        console.log('Admin status updated:', data);
        
        // Update current user's profile if it matches
        if (currentUser?.email === 'craig.caminos@gmail.com') {
            currentUser.profile = data;
            updateNavigation();
        }
    } catch (error) {
        console.error('Error in ensureAdminStatus:', error);
    }
}

// Add these with your other event listeners
closeAdminSkillModal.addEventListener('click', toggleAdminSkillModal);
cancelAdminSkillBtn.addEventListener('click', toggleAdminSkillModal);
adminSkillForm.addEventListener('submit', handleAdminSkillSubmit);
