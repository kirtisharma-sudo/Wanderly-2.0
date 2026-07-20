// Shared navbar behavior for every page (index, about, explore, contact, login, signup).

// Toast notification utility, callable from any page script as window.showToast(message, type).
window.showToast = function(message, type){
    const container = document.getElementById('toastContainer');
    if(!container) return;

    const toast = document.createElement('div');
    toast.className = 'Toast Toast--' + (type || 'info');
    toast.setAttribute('role', 'status');

    const text = document.createElement('span');
    text.textContent = message;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'ToastClose';
    closeBtn.setAttribute('aria-label', 'Dismiss notification');
    closeBtn.textContent = '\u00D7';

    toast.appendChild(text);
    toast.appendChild(closeBtn);
    container.appendChild(toast);

    requestAnimationFrame(function(){
        toast.classList.add('is-visible');
    });

    function removeToast(){
        toast.classList.remove('is-visible');
        setTimeout(function(){
            toast.remove();
        }, 300);
    }

    closeBtn.addEventListener('click', removeToast);
    const dismissTimer = setTimeout(removeToast, 4000);

    toast.addEventListener('mouseenter', function(){
        clearTimeout(dismissTimer);
    });
};

// Wishlist utility, backed by localStorage, callable from any page script.
window.WanderlyWishlist = {
    STORAGE_KEY: 'wanderlyWishlist',

    getAll: function(){
        try{
            const raw = localStorage.getItem(this.STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch(e){
            return [];
        }
    },

    isSaved: function(name){
        return this.getAll().indexOf(name) !== -1;
    },

    toggle: function(name){
        const list = this.getAll();
        const index = list.indexOf(name);
        let saved;
        if(index === -1){
            list.push(name);
            saved = true;
        } else {
            list.splice(index, 1);
            saved = false;
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
        return saved;
    },

    createButton: function(name){
        const self = this;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'WishlistBtn';
        const saved = this.isSaved(name);
        btn.classList.toggle('is-saved', saved);
        btn.setAttribute('aria-pressed', saved ? 'true' : 'false');
        btn.setAttribute('aria-label', (saved ? 'Remove ' : 'Save ') + name + (saved ? ' from wishlist' : ' to wishlist'));
        btn.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"></path></svg>';

        btn.addEventListener('click', function(event){
            event.stopPropagation();
            const isSaved = self.toggle(name);
            btn.classList.toggle('is-saved', isSaved);
            btn.setAttribute('aria-pressed', isSaved ? 'true' : 'false');
            btn.setAttribute('aria-label', (isSaved ? 'Remove ' : 'Save ') + name + (isSaved ? ' from wishlist' : ' to wishlist'));
            if(window.showToast){
                window.showToast(isSaved ? 'Added to wishlist' : 'Removed from wishlist', isSaved ? 'success' : 'info');
            }
        });

        return btn;
    }
};

(function(){
    const toggleBtn = document.getElementById('navToggle');
    const nav = document.getElementById('mobileNav');
    const backdrop = document.getElementById('mobileBackdrop');
    const navbar = document.querySelector('.NavBar') || document.querySelector('.Main1');

    function closeMenu(){
        if(!toggleBtn || !nav || !backdrop) return;
        nav.classList.remove('open');
        backdrop.classList.remove('open');
        toggleBtn.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
    }

    function openMenu(){
        nav.classList.add('open');
        backdrop.classList.add('open');
        toggleBtn.classList.add('open');
        toggleBtn.setAttribute('aria-expanded', 'true');
    }

    if(toggleBtn && nav && backdrop){
        toggleBtn.addEventListener('click', function(){
            const isOpen = nav.classList.contains('open');
            isOpen ? closeMenu() : openMenu();
        });

        backdrop.addEventListener('click', closeMenu);

        nav.querySelectorAll('a').forEach(function(link){
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', function(event){
            if(event.key === 'Escape') closeMenu();
        });
    }

    const scrollProgress = document.getElementById('scrollProgress');
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    if(navbar || scrollProgress || scrollTopBtn){
        function updateScrollState(){
            if(navbar){
                navbar.classList.toggle('is-scrolled', window.scrollY > 4);
            }
            if(scrollProgress){
                const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
                const percent = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
                scrollProgress.style.width = percent + '%';
            }
            if(scrollTopBtn){
                scrollTopBtn.classList.toggle('is-visible', window.scrollY > 400);
            }
        }
        updateScrollState();
        window.addEventListener('scroll', updateScrollState, { passive: true });
        window.addEventListener('resize', updateScrollState);
    }

    if(scrollTopBtn){
        scrollTopBtn.addEventListener('click', function(){
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        });
    }
})();
