document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const dashboardContainer = document.getElementById('dashboard-container');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    const addLinkForm = document.getElementById('add-link-form');
    const linksList = document.getElementById('links-list');

    const apiBaseUrl = '/admin';
    let token = localStorage.getItem('adminToken');

    const showLogin = () => {
        loginContainer.classList.remove('hidden');
        dashboardContainer.classList.add('hidden');
    };

    const showDashboard = () => {
        loginContainer.classList.add('hidden');
        dashboardContainer.classList.remove('hidden');
        fetchLinks();
    };

    const login = async (email, password) => {
        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await fetch(`${apiBaseUrl}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                token = data.access_token;
                localStorage.setItem('adminToken', token);
                loginError.textContent = '';
                showDashboard();
            } else {
                const error = await response.json();
                loginError.textContent = error.detail || 'Login failed.';
            }
        } catch (error) {
            loginError.textContent = 'An error occurred during login.';
            console.error('Login error:', error);
        }
    };

    const logout = () => {
        token = null;
        localStorage.removeItem('adminToken');
        showLogin();
    };

    const fetchLinks = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${apiBaseUrl}/links`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const links = await response.json();
                renderLinks(links);
            } else if (response.status === 401) {
                logout();
            }
        } catch (error) {
            console.error('Error fetching links:', error);
        }
    };

    const renderLinks = (links) => {
        linksList.innerHTML = '';
        links.forEach(link => {
            const linkEl = document.createElement('div');
            linkEl.className = 'link-item';
            linkEl.innerHTML = `
                <div>
                    <strong>${link.title}</strong>
                    <br>
                    <a href="${link.url}" target="_blank">${link.url}</a>
                </div>
                <div>
                    <button class="edit-btn" data-id="${link.id}">Edit</button>
                    <button class="delete-btn" data-id="${link.id}">Delete</button>
                </div>
            `;
            linksList.appendChild(linkEl);
        });
    };

    const addLink = async (title, url) => {
        if (!token) return;
        try {
            const response = await fetch(`${apiBaseUrl}/links`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, url, visible: true })
            });
            if (response.ok) {
                fetchLinks();
                addLinkForm.reset();
            } else {
                console.error('Failed to add link');
            }
        } catch (error) {
            console.error('Error adding link:', error);
        }
    };

    const deleteLink = async (id) => {
        if (!token) return;
        if (!confirm('Are you sure you want to delete this link?')) return;
        try {
            const response = await fetch(`${apiBaseUrl}/links/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchLinks();
            } else {
                console.error('Failed to delete link');
            }
        } catch (error) {
            console.error('Error deleting link:', error);
        }
    };

    // Event Listeners
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });

    logoutBtn.addEventListener('click', logout);

    addLinkForm.addEventListener('submit', e => {
        e.preventDefault();
        const title = document.getElementById('link-title').value;
        const url = document.getElementById('link-url').value;
        addLink(title, url);
    });

    linksList.addEventListener('click', e => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            deleteLink(id);
        }
        if (e.target.classList.contains('edit-btn')) {
            alert('Edit functionality not implemented in this example, but you can add it!');
        }
    });

    // Initial Check
    if (token) {
        showDashboard();
    } else {
        showLogin();
    }
});