// Shared dark/light theme toggle for every page.
(function(){
    const STORAGE_KEY = 'wanderlyTheme';

    function getStoredTheme(){
        return localStorage.getItem(STORAGE_KEY);
    }

    function getPreferredTheme(){
        const stored = getStoredTheme();
        if(stored === 'dark' || stored === 'light') return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    function applyTheme(theme){
        document.documentElement.setAttribute('data-theme', theme);
        document.querySelectorAll('.ThemeToggle, .MobileThemeToggle').forEach(function(button){
            button.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        });
    }

    function setTheme(theme){
        localStorage.setItem(STORAGE_KEY, theme);
        applyTheme(theme);
    }

    function toggleTheme(){
        const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        setTheme(current === 'dark' ? 'light' : 'dark');
    }

    applyTheme(getPreferredTheme());

    document.querySelectorAll('.ThemeToggle, .MobileThemeToggle').forEach(function(button){
        button.addEventListener('click', toggleTheme);
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(event){
        if(!getStoredTheme()){
            applyTheme(event.matches ? 'dark' : 'light');
        }
    });

    window.addEventListener('storage', function(event){
        if(event.key === STORAGE_KEY && event.newValue){
            applyTheme(event.newValue);
        }
    });
})();
