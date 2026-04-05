// MysticTools Search Functionality
class ToolSearch {
    constructor() {
        this.searchData = [];
        this.searchBar = null;
        this.searchResults = null;
        this.isSearching = false;
        this.init();
    }

    async init() {
        // Load search data
        try {
            const response = await fetch('/search-data.json');
            this.searchData = await response.json();
        } catch (error) {
            console.warn('Search data not available:', error);
        }

        // Initialize search elements
        this.searchBar = document.querySelector('.search-bar');
        this.searchResults = document.querySelector('.search-results');
        
        if (this.searchBar && this.searchResults) {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        let searchTimeout;
        
        this.searchBar.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                this.hideResults();
                return;
            }

            searchTimeout = setTimeout(() => {
                this.performSearch(query);
            }, 300);
        });

        this.searchBar.addEventListener('focus', () => {
            if (this.searchBar.value.trim().length >= 2) {
                this.performSearch(this.searchBar.value.trim());
            }
        });

        // Hide results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideResults();
            }
        });

        // Keyboard navigation
        this.searchBar.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideResults();
                this.searchBar.blur();
            }
        });
    }

    performSearch(query) {
        if (!this.searchData.length) {
            this.showNoResults();
            return;
        }

        const results = this.searchData.filter(tool => {
            const searchStr = `${tool.name} ${tool.tagline} ${tool.category} ${tool.keywords || ''}`.toLowerCase();
            return searchStr.includes(query.toLowerCase());
        }).slice(0, 8);

        this.displayResults(results, query);
    }

    displayResults(results, query) {
        if (results.length === 0) {
            this.showNoResults();
            return;
        }

        const resultsHtml = results.map(tool => `
            <div class="search-result-item" data-url="/${tool.category}/${tool.slug}/">
                <div class="search-result-title">${this.highlightMatch(tool.name, query)}</div>
                <div class="search-result-category">${tool.categoryIcon} ${tool.categoryName}</div>
            </div>
        `).join('');

        this.searchResults.innerHTML = resultsHtml;
        this.searchResults.classList.add('active');

        // Add click handlers to results
        this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                window.location.href = item.dataset.url;
            });
        });
    }

    showNoResults() {
        this.searchResults.innerHTML = `
            <div class="search-result-item">
                <div class="search-result-title">No tools found</div>
                <div class="search-result-category">Try different keywords</div>
            </div>
        `;
        this.searchResults.classList.add('active');
    }

    hideResults() {
        this.searchResults.classList.remove('active');
    }

    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }
}

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ToolSearch();
});

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const headerNav = document.querySelector('.header-nav');
    
    if (menuToggle && headerNav) {
        menuToggle.addEventListener('click', () => {
            headerNav.classList.toggle('mobile-open');
        });
    }
});
