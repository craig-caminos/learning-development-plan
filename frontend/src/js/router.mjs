export class Router {
    constructor(routes) {
        this.routes = routes;
        this.currentPath = '';
        
        // Handle route changes
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('load', () => this.handleRoute());
    }

    handleRoute() {
        const hash = window.location.hash || '#dashboard';
        const path = hash.slice(1); // Remove the # symbol
        
        // Find matching route
        const route = this.findMatchingRoute(path);
        
        if (route) {
            this.currentPath = path;
            route.handler();
        } else {
            // Handle 404
            this.handle404();
        }
    }

    findMatchingRoute(path) {
        // First try exact match
        let route = this.routes.find(r => r.path === path);
        
        if (route) return route;

        // Then try pattern matching
        return this.routes.find(r => {
            if (r.pattern) {
                return new RegExp(r.pattern).test(path);
            }
            return false;
        });
    }

    handle404() {
        const mainContent = document.getElementById('mainContent');
        mainContent.innerHTML = `
            <div class="text-center py-8">
                <h2 class="text-2xl font-bold mb-4">Page Not Found</h2>
                <p class="text-gray-600">The page you're looking for doesn't exist.</p>
                <a href="#dashboard" class="text-blue-600 hover:text-blue-800 mt-4 inline-block">Return to Dashboard</a>
            </div>
        `;
    }

    navigate(path) {
        window.location.hash = path;
    }
} 