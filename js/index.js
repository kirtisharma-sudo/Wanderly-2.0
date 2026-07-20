// Home page: hero entrance animation, dynamic destination cards, search validation.
(function(){

    function onPageReady(callback){
        if(document.body.classList.contains('page-ready')){
            callback();
        } else {
            document.addEventListener('wanderly:pageready', callback, { once: true });
        }
    }

    const hero = document.querySelector('.Sub14');
    const searchPanel = document.getElementById('searchForm');

    onPageReady(function(){
        if(hero){
            hero.classList.add('is-visible');
        }
        if(searchPanel){
            setTimeout(function(){
                searchPanel.classList.add('is-visible');
            }, 240);
        }
    });

    const popularDestinations = [
        { name: "Bali, Indonesia", price: "From $409", image: "https://tse1.mm.bing.net/th/id/OIP.XOQd3pvPeYgVLgZ-AWr43gHaE8?pid=Api&P=0&h=180" },
        { name: "Santorini, Greece", price: "From $689", image: "https://tse3.mm.bing.net/th/id/OIP.ifZ7gki3wtSDJIf_5oml_QHaEo?pid=Api&P=0&h=180" },
        { name: "Switzerland", price: "From $889", image: "https://tse2.mm.bing.net/th/id/OIP.tS0Lh6B52iNDkwGxc7n0FgHaE6?pid=Api&P=0&h=180" },
        { name: "Tokyo, Japan", price: "From $789", image: "https://tse2.mm.bing.net/th/id/OIP.G2Th8Ked3PwTxwID4Cn6rgHaE8?pid=Api&P=0&h=180" }
    ];

    function goToDestination(destinationName){
        const params = new URLSearchParams({ location: destinationName.split(',')[0].trim() });
        window.location.href = 'explore.html?' + params.toString();
    }

    function renderDestinationCards(){
        const grid = document.getElementById('destinationGrid');
        if(!grid) return;

        popularDestinations.forEach(function(destination){
            const card = document.createElement('div');
            card.className = 'DestCard';
            card.setAttribute('role', 'link');
            card.setAttribute('tabindex', '0');
            card.setAttribute('aria-label', 'Explore ' + destination.name);

            const img = document.createElement('img');
            img.src = destination.image;
            img.alt = destination.name;
            img.loading = 'lazy';

            const heading = document.createElement('h3');
            heading.textContent = destination.name;

            const price = document.createElement('p');
            price.textContent = destination.price;

            card.appendChild(img);
            card.appendChild(heading);
            card.appendChild(price);

            if(window.WanderlyWishlist){
                card.appendChild(window.WanderlyWishlist.createButton(destination.name));
            }
            grid.appendChild(card);

            card.addEventListener('click', function(){
                goToDestination(destination.name);
            });

            card.addEventListener('keydown', function(event){
                if(event.key === 'Enter' || event.key === ' '){
                    event.preventDefault();
                    goToDestination(destination.name);
                }
            });
        });

        const cards = grid.querySelectorAll('.DestCard');

        if(!('IntersectionObserver' in window)){
            cards.forEach(function(card){ card.classList.add('is-visible'); });
            return;
        }

        const cardObserver = new IntersectionObserver(function(entries, observer){
            entries.forEach(function(entry){
                if(!entry.isIntersecting) return;
                const index = Array.prototype.indexOf.call(cards, entry.target);
                setTimeout(function(){
                    entry.target.classList.add('is-visible');
                }, index * 120);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.2 });

        cards.forEach(function(card){
            cardObserver.observe(card);
        });
    }

    renderDestinationCards();

    const featuredDestinations = [
        { name: "Maldives", tagline: "Overwater villas and turquoise lagoons", image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1600&q=80" },
        { name: "Paris, France", tagline: "Timeless streets and iconic landmarks", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80" },
        { name: "New York, USA", tagline: "The city that never sleeps", image: "https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=1600&q=80" },
        { name: "Dubai, UAE", tagline: "Where the desert meets the skyline", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80" }
    ];

    function initFeaturedSlider(){
        const slider = document.getElementById('featuredSlider');
        const track = document.getElementById('featuredTrack');
        const dotsWrap = document.getElementById('sliderDots');
        const prevBtn = document.getElementById('sliderPrev');
        const nextBtn = document.getElementById('sliderNext');
        if(!slider || !track || !dotsWrap || !prevBtn || !nextBtn) return;

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let currentIndex = 0;
        let autoplayTimer = null;

        featuredDestinations.forEach(function(destination){
            const slide = document.createElement('div');
            slide.className = 'FeaturedSlide';

            const img = document.createElement('img');
            img.src = destination.image;
            img.alt = destination.name;
            img.loading = 'lazy';

            const caption = document.createElement('div');
            caption.className = 'FeaturedCaption';

            const heading = document.createElement('h3');
            heading.textContent = destination.name;

            const tagline = document.createElement('p');
            tagline.textContent = destination.tagline;

            caption.appendChild(heading);
            caption.appendChild(tagline);
            slide.appendChild(img);
            slide.appendChild(caption);
            track.appendChild(slide);

            const dot = document.createElement('button');
            dot.className = 'SliderDot';
            dot.setAttribute('aria-label', 'Go to ' + destination.name);
            dotsWrap.appendChild(dot);
        });

        const slideEls = track.querySelectorAll('.FeaturedSlide');
        const dotEls = dotsWrap.querySelectorAll('.SliderDot');

        function goToSlide(index){
            currentIndex = (index + slideEls.length) % slideEls.length;
            track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';

            slideEls.forEach(function(slide, slideIndex){
                slide.setAttribute('aria-hidden', slideIndex === currentIndex ? 'false' : 'true');
            });

            dotEls.forEach(function(dot, dotIndex){
                dot.classList.toggle('is-active', dotIndex === currentIndex);
            });
        }

        function startAutoplay(){
            if(prefersReducedMotion) return;
            stopAutoplay();
            autoplayTimer = setInterval(function(){
                goToSlide(currentIndex + 1);
            }, 6000);
        }

        function stopAutoplay(){
            if(autoplayTimer){
                clearInterval(autoplayTimer);
                autoplayTimer = null;
            }
        }

        prevBtn.addEventListener('click', function(){
            goToSlide(currentIndex - 1);
            startAutoplay();
        });

        nextBtn.addEventListener('click', function(){
            goToSlide(currentIndex + 1);
            startAutoplay();
        });

        dotEls.forEach(function(dot, dotIndex){
            dot.addEventListener('click', function(){
                goToSlide(dotIndex);
                startAutoplay();
            });
        });

        slider.addEventListener('keydown', function(event){
            if(event.key === 'ArrowLeft'){
                goToSlide(currentIndex - 1);
                startAutoplay();
            } else if(event.key === 'ArrowRight'){
                goToSlide(currentIndex + 1);
                startAutoplay();
            }
        });

        slider.addEventListener('mouseenter', stopAutoplay);
        slider.addEventListener('mouseleave', startAutoplay);
        slider.addEventListener('focusin', stopAutoplay);
        slider.addEventListener('focusout', startAutoplay);

        goToSlide(0);
        startAutoplay();
    }

    initFeaturedSlider();

    const newsletterForm = document.getElementById('newsletterForm');
    if(newsletterForm){
        newsletterForm.addEventListener('submit', function(event){
            event.preventDefault();
            const emailInput = document.getElementById('newsletterEmail');
            if(!emailInput.checkValidity()){
                emailInput.reportValidity();
                return;
            }
            showToast('Subscribed! Check your inbox for travel updates.', 'success');
            newsletterForm.reset();
        });
    }

    const form = document.getElementById('searchForm');
    if(!form) return;

    const locationField = document.getElementById('LocationSelect');
    const checkinField = document.getElementById('CheckInInput');
    const checkoutField = document.getElementById('CheckOutInput');
    const guestsField = document.getElementById('GuestsInput');

    const locationError = document.getElementById('locationError');
    const checkinError = document.getElementById('checkinError');
    const checkoutError = document.getElementById('checkoutError');
    const guestsError = document.getElementById('guestsError');

    function toDateString(date){
        const offset = date.getTimezoneOffset();
        const local = new Date(date.getTime() - offset * 60000);
        return local.toISOString().split('T')[0];
    }

    function dayAfter(dateString){
        const date = new Date(dateString);
        date.setDate(date.getDate() + 1);
        return toDateString(date);
    }

    function showError(field, errorEl, message){
        errorEl.textContent = message;
        field.setAttribute('aria-invalid', 'true');
    }

    function clearError(field, errorEl){
        errorEl.textContent = '';
        field.removeAttribute('aria-invalid');
    }

    checkinField.min = toDateString(new Date());

    checkinField.addEventListener('change', function(){
        if(checkinField.value){
            checkoutField.min = dayAfter(checkinField.value);
            if(checkoutField.value && checkoutField.value <= checkinField.value){
                checkoutField.value = '';
            }
        }
        clearError(checkinField, checkinError);
    });

    checkoutField.addEventListener('change', function(){
        clearError(checkoutField, checkoutError);
    });

    locationField.addEventListener('change', function(){
        clearError(locationField, locationError);
    });

    guestsField.addEventListener('input', function(){
        clearError(guestsField, guestsError);
    });

    guestsField.addEventListener('blur', function(){
        const value = parseInt(guestsField.value, 10);
        if(isNaN(value)) return;
        guestsField.value = Math.min(10, Math.max(1, value));
    });

    form.addEventListener('submit', function(event){
        event.preventDefault();
        let isValid = true;

        if(!locationField.value){
            showError(locationField, locationError, 'Please choose a destination');
            isValid = false;
        } else {
            clearError(locationField, locationError);
        }

        if(!checkinField.value){
            showError(checkinField, checkinError, 'Check-in date is required');
            isValid = false;
        } else {
            clearError(checkinField, checkinError);
        }

        if(!checkoutField.value){
            showError(checkoutField, checkoutError, 'Check-out date is required');
            isValid = false;
        } else if(checkinField.value && checkoutField.value <= checkinField.value){
            showError(checkoutField, checkoutError, 'Must be after check-in date');
            isValid = false;
        } else {
            clearError(checkoutField, checkoutError);
        }

        const guestsValue = parseInt(guestsField.value, 10);
        if(isNaN(guestsValue) || guestsValue < 1 || guestsValue > 10){
            showError(guestsField, guestsError, 'Enter 1 to 10 guests');
            isValid = false;
        } else {
            clearError(guestsField, guestsError);
        }

        if(!isValid) return;

        const params = new URLSearchParams({
            location: locationField.value,
            checkin: checkinField.value,
            checkout: checkoutField.value,
            guests: String(guestsValue)
        });

        window.location.href = 'explore.html?' + params.toString();
    });
})();
