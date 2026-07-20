// Explore page: category filter pills + live destination search with suggestions.
document.addEventListener('DOMContentLoaded', function(){
    const buttons = document.querySelectorAll('.Buttons button');
    const cards = document.querySelectorAll('.Sub21 .DestCard');
    const noResults = document.getElementById('noResults');
    const searchInput = document.getElementById('destinationSearch');
    const clearBtn = document.getElementById('clearSearchBtn');
    const suggestionsList = document.getElementById('searchSuggestions');

    const destinations = Array.prototype.map.call(cards, function(card){
        return {
            name: card.querySelector('h3').textContent,
            element: card
        };
    });

    if(window.WanderlyWishlist){
        destinations.forEach(function(destination){
            destination.element.appendChild(window.WanderlyWishlist.createButton(destination.name));
        });
    }

    let activeCategory = 'all';
    let activeSearchTerm = '';
    let activeSuggestionIndex = -1;

    function setActiveCategory(btn){
        buttons.forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        activeCategory = btn.dataset.filter || 'all';
        applyFilters();
    }

    function applyFilters(){
        let visibleCount = 0;
        const term = activeSearchTerm.trim().toLowerCase();

        destinations.forEach(function(destination){
            const cats = (destination.element.dataset.category || '').split(/\s+/).filter(Boolean);
            const matchesCategory = activeCategory === 'all' || cats.includes(activeCategory);
            const matchesSearch = term === '' || destination.name.toLowerCase().includes(term);
            const isVisible = matchesCategory && matchesSearch;

            destination.element.style.display = isVisible ? '' : 'none';
            if(isVisible) visibleCount++;
        });

        if(noResults){
            noResults.hidden = visibleCount !== 0;
        }
    }

    buttons.forEach(function(btn){
        btn.addEventListener('click', function(){
            setActiveCategory(btn);
        });
    });

    if(!searchInput || !suggestionsList) return;

    let debounceTimer = null;

    function closeSuggestions(){
        suggestionsList.hidden = true;
        suggestionsList.innerHTML = '';
        activeSuggestionIndex = -1;
        searchInput.setAttribute('aria-expanded', 'false');
    }

    function highlightMatch(name, term){
        const index = name.toLowerCase().indexOf(term);
        if(index === -1) return name;
        return name.slice(0, index) + '<mark>' + name.slice(index, index + term.length) + '</mark>' + name.slice(index + term.length);
    }

    function renderSuggestions(term){
        const matches = destinations.filter(function(destination){
            return destination.name.toLowerCase().includes(term);
        }).slice(0, 5);

        if(matches.length === 0){
            closeSuggestions();
            return;
        }

        suggestionsList.innerHTML = '';
        matches.forEach(function(destination, index){
            const item = document.createElement('li');
            item.setAttribute('role', 'option');
            item.id = 'suggestion-' + index;
            item.innerHTML = highlightMatch(destination.name, term);
            item.addEventListener('click', function(){
                selectSuggestion(destination.name);
            });
            suggestionsList.appendChild(item);
        });

        suggestionsList.hidden = false;
        activeSuggestionIndex = -1;
        searchInput.setAttribute('aria-expanded', 'true');
    }

    function selectSuggestion(name){
        searchInput.value = name;
        activeSearchTerm = name;
        clearBtn.hidden = false;
        closeSuggestions();
        applyFilters();
    }

    function updateActiveSuggestion(items){
        items.forEach(function(item, index){
            item.classList.toggle('is-active', index === activeSuggestionIndex);
        });
        if(activeSuggestionIndex >= 0){
            searchInput.setAttribute('aria-activedescendant', items[activeSuggestionIndex].id);
        } else {
            searchInput.removeAttribute('aria-activedescendant');
        }
    }

    searchInput.addEventListener('input', function(){
        const value = searchInput.value;
        clearBtn.hidden = value.length === 0;
        activeSearchTerm = value;

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function(){
            applyFilters();
            const term = value.trim().toLowerCase();
            if(term.length === 0){
                closeSuggestions();
            } else {
                renderSuggestions(term);
            }
        }, 150);
    });

    searchInput.addEventListener('keydown', function(event){
        const items = suggestionsList.querySelectorAll('li');
        if(suggestionsList.hidden || items.length === 0) return;

        if(event.key === 'ArrowDown'){
            event.preventDefault();
            activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
            updateActiveSuggestion(items);
        } else if(event.key === 'ArrowUp'){
            event.preventDefault();
            activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
            updateActiveSuggestion(items);
        } else if(event.key === 'Enter'){
            if(activeSuggestionIndex >= 0){
                event.preventDefault();
                items[activeSuggestionIndex].click();
            }
        } else if(event.key === 'Escape'){
            closeSuggestions();
        }
    });

    clearBtn.addEventListener('click', function(){
        searchInput.value = '';
        activeSearchTerm = '';
        clearBtn.hidden = true;
        closeSuggestions();
        applyFilters();
        searchInput.focus();
    });

    document.addEventListener('click', function(event){
        if(!event.target.closest('.ExploreSearch')){
            closeSuggestions();
        }
    });

    const presetLocation = new URLSearchParams(window.location.search).get('location');
    if(presetLocation){
        searchInput.value = presetLocation;
        activeSearchTerm = presetLocation;
        clearBtn.hidden = false;
        applyFilters();
    }
});
