// Trip Planner page: rule-based itinerary generator.
// Note: this runs entirely in the browser using curated activity data -
// there is no external AI API call, since that would require a server-side key.
document.addEventListener('DOMContentLoaded', function(){

    const THEME_ACTIVITIES = {
        beach: {
            morning: ["Sunrise swim and beachfront breakfast", "Snorkeling trip to a nearby reef", "Paddleboarding on calm morning water", "Beach yoga followed by fresh fruit"],
            afternoon: ["Relaxing by an infinity pool with ocean views", "Island-hopping boat tour", "Beachside seafood lunch and free time", "Jet ski and water sports session"],
            evening: ["Sunset dinner cruise", "Beach bonfire with live music", "Rooftop bar overlooking the coastline", "Candlelit dinner on the sand"],
            cost: { morning: 12, afternoon: 32, evening: 38 }
        },
        mountains: {
            morning: ["Guided hike to a scenic viewpoint", "Cable car ride up the peak", "Alpine breakfast with valley views", "Mountain biking on forest trails"],
            afternoon: ["Visit a local village and market", "Picnic lunch by a glacial lake", "Ziplining through the valley", "Photography walk along mountain trails"],
            evening: ["Dinner at a cozy mountain lodge", "Stargazing away from city lights", "Fondue night with local specialties", "Evening by the fireplace"],
            cost: { morning: 15, afternoon: 30, evening: 35 }
        },
        city: {
            morning: ["Walking tour of the historic district", "Visit to a major museum or landmark", "Local café breakfast and street exploration", "Guided architecture walk"],
            afternoon: ["Shopping in the main district", "Lunch at a popular local eatery", "Visit to an art gallery or cultural site", "Explore a neighborhood market"],
            evening: ["Dinner at a well-reviewed local restaurant", "Skyline views from a rooftop bar", "Live music or theatre show", "Evening walk through the city center"],
            cost: { morning: 14, afternoon: 34, evening: 40 }
        },
        adventure: {
            morning: ["Early start for a jungle trek", "ATV ride through rugged terrain", "Waterfall hike and swim", "Rock climbing with a certified guide"],
            afternoon: ["White-water rafting", "Ziplining canopy tour", "Cave exploration", "Off-road adventure tour"],
            evening: ["Campfire dinner under the stars", "Local storytelling and cultural show", "Spa treatment after an active day", "Casual dinner at the adventure lodge"],
            cost: { morning: 20, afternoon: 45, evening: 30 }
        }
    };

    const DESTINATION_THEMES = {
        "bali": ["beach", "mountains", "adventure"],
        "santorini": ["beach"],
        "switzerland": ["mountains"],
        "tokyo": ["city"],
        "maldives": ["beach", "adventure"],
        "paris": ["city"],
        "new york": ["city"],
        "dubai": ["city", "adventure"]
    };

    const TIERS = {
        budget: { label: "Budget-friendly", multiplier: 0.6, accommodation: 25 },
        comfort: { label: "Comfortable", multiplier: 1, accommodation: 70 },
        luxury: { label: "Luxury", multiplier: 2.2, accommodation: 220 }
    };

    const LOADING_MESSAGES = [
        "Reading your preferences...",
        "Matching activities to your destination...",
        "Balancing your budget across each day...",
        "Finalizing your itinerary..."
    ];

    const form = document.getElementById('plannerForm');
    if(!form) return;

    const destinationInput = document.getElementById('plannerDestination');
    const daysInput = document.getElementById('plannerDays');
    const budgetInput = document.getElementById('plannerBudget');

    const destinationError = document.getElementById('plannerDestinationError');
    const daysError = document.getElementById('plannerDaysError');
    const budgetError = document.getElementById('plannerBudgetError');

    const loadingPanel = document.getElementById('plannerLoading');
    const loadingText = document.getElementById('plannerLoadingText');
    const resultsPanel = document.getElementById('plannerResults');
    const resultTitle = document.getElementById('plannerResultTitle');
    const resultSubtitle = document.getElementById('plannerResultSubtitle');
    const budgetStatus = document.getElementById('plannerBudgetStatus');
    const dayList = document.getElementById('plannerItineraryDays');

    const regenerateBtn = document.getElementById('plannerRegenerate');
    const startOverBtn = document.getElementById('plannerStartOver');

    let lastInputs = null;

    function showError(field, errorEl, message){
        errorEl.textContent = message;
        field.setAttribute('aria-invalid', 'true');
    }

    function clearError(field, errorEl){
        errorEl.textContent = '';
        field.removeAttribute('aria-invalid');
    }

    function resolveThemes(destinationRaw){
        const key = destinationRaw.trim().toLowerCase();
        for(const name in DESTINATION_THEMES){
            if(key.includes(name)){
                return DESTINATION_THEMES[name];
            }
        }
        return ["city"];
    }

    function resolveTier(budgetPerDay){
        if(budgetPerDay < 80) return TIERS.budget;
        if(budgetPerDay <= 200) return TIERS.comfort;
        return TIERS.luxury;
    }

    function pickVaried(pool, usedIndexes){
        if(pool.length === 1) return { text: pool[0], index: 0 };
        let index = Math.floor(Math.random() * pool.length);
        let attempts = 0;
        while(usedIndexes.has(index) && attempts < 6){
            index = Math.floor(Math.random() * pool.length);
            attempts++;
        }
        usedIndexes.add(index);
        if(usedIndexes.size >= pool.length) usedIndexes.clear();
        return { text: pool[index], index: index };
    }

    function generateItinerary(destination, days, budget){
        const themes = resolveThemes(destination);
        const budgetPerDay = budget / days;
        const tier = resolveTier(budgetPerDay);

        const usedByTheme = {};
        let totalCost = 0;
        const dayPlans = [];

        for(let dayNumber = 1; dayNumber <= days; dayNumber++){
            const theme = themes[(dayNumber - 1) % themes.length];
            const activities = THEME_ACTIVITIES[theme];

            if(!usedByTheme[theme]){
                usedByTheme[theme] = { morning: new Set(), afternoon: new Set(), evening: new Set() };
            }

            const morning = pickVaried(activities.morning, usedByTheme[theme].morning);
            const afternoon = pickVaried(activities.afternoon, usedByTheme[theme].afternoon);
            const evening = pickVaried(activities.evening, usedByTheme[theme].evening);

            const dayCost = Math.round(
                (activities.cost.morning + activities.cost.afternoon + activities.cost.evening) * tier.multiplier
                + tier.accommodation
            );
            totalCost += dayCost;

            dayPlans.push({
                dayNumber: dayNumber,
                cost: dayCost,
                slots: [
                    { time: "Morning", text: morning.text },
                    { time: "Afternoon", text: afternoon.text },
                    { time: "Evening", text: evening.text }
                ]
            });
        }

        return {
            tier: tier,
            totalCost: totalCost,
            days: dayPlans
        };
    }

    function renderResults(destinationLabel, days, budget, itinerary){
        resultTitle.textContent = destinationLabel + ' \u2014 ' + days + (days === 1 ? ' Day' : ' Days');
        resultSubtitle.textContent = itinerary.tier.label + ' trip, estimated cost $' + itinerary.totalCost.toLocaleString();

        const difference = budget - itinerary.totalCost;
        if(difference >= 0){
            budgetStatus.textContent = 'Within budget \u2014 $' + difference.toLocaleString() + ' to spare';
            budgetStatus.className = 'PlannerBudgetStatus is-ok';
        } else {
            budgetStatus.textContent = 'Over budget by $' + Math.abs(difference).toLocaleString();
            budgetStatus.className = 'PlannerBudgetStatus is-over';
        }

        dayList.innerHTML = '';
        itinerary.days.forEach(function(day){
            const card = document.createElement('div');
            card.className = 'PlannerDayCard';

            const header = document.createElement('div');
            header.className = 'PlannerDayHeader';

            const heading = document.createElement('h3');
            heading.textContent = 'Day ' + day.dayNumber;

            const cost = document.createElement('span');
            cost.className = 'PlannerDayCost';
            cost.textContent = '~$' + day.cost;

            header.appendChild(heading);
            header.appendChild(cost);
            card.appendChild(header);

            day.slots.forEach(function(slot){
                const row = document.createElement('div');
                row.className = 'PlannerSlot';

                const time = document.createElement('div');
                time.className = 'PlannerSlotTime';
                time.textContent = slot.time;

                const text = document.createElement('div');
                text.className = 'PlannerSlotText';
                text.textContent = slot.text;

                row.appendChild(time);
                row.appendChild(text);
                card.appendChild(row);
            });

            dayList.appendChild(card);
        });
    }

    function runGeneration(destinationLabel, destinationRaw, days, budget){
        form.hidden = true;
        resultsPanel.hidden = true;
        resultsPanel.classList.remove('is-visible');
        loadingPanel.hidden = false;

        let messageIndex = 0;
        loadingText.textContent = LOADING_MESSAGES[0];
        const messageTimer = setInterval(function(){
            messageIndex++;
            if(messageIndex < LOADING_MESSAGES.length){
                loadingText.textContent = LOADING_MESSAGES[messageIndex];
            }
        }, 500);

        setTimeout(function(){
            clearInterval(messageTimer);
            const itinerary = generateItinerary(destinationRaw, days, budget);
            renderResults(destinationLabel, days, budget, itinerary);

            loadingPanel.hidden = true;
            resultsPanel.hidden = false;
            requestAnimationFrame(function(){
                resultsPanel.classList.add('is-visible');
            });

            if(window.showToast){
                window.showToast('Your itinerary is ready!', 'success');
            }
        }, LOADING_MESSAGES.length * 500 + 300);
    }

    form.addEventListener('submit', function(event){
        event.preventDefault();
        let isValid = true;

        const destinationRaw = destinationInput.value.trim();
        if(destinationRaw === ''){
            showError(destinationInput, destinationError, 'Please enter a destination');
            isValid = false;
        } else {
            clearError(destinationInput, destinationError);
        }

        const days = parseInt(daysInput.value, 10);
        if(isNaN(days) || days < 1 || days > 14){
            showError(daysInput, daysError, 'Enter a trip length between 1 and 14 days');
            isValid = false;
        } else {
            clearError(daysInput, daysError);
        }

        const budget = parseFloat(budgetInput.value);
        if(isNaN(budget) || budget < 50){
            showError(budgetInput, budgetError, 'Enter a budget of at least $50');
            isValid = false;
        } else {
            clearError(budgetInput, budgetError);
        }

        if(!isValid) return;

        const destinationLabel = destinationRaw.charAt(0).toUpperCase() + destinationRaw.slice(1);
        lastInputs = { destinationLabel: destinationLabel, destinationRaw: destinationRaw, days: days, budget: budget };
        runGeneration(destinationLabel, destinationRaw, days, budget);
    });

    if(regenerateBtn){
        regenerateBtn.addEventListener('click', function(){
            if(!lastInputs) return;
            runGeneration(lastInputs.destinationLabel, lastInputs.destinationRaw, lastInputs.days, lastInputs.budget);
        });
    }

    if(startOverBtn){
        startOverBtn.addEventListener('click', function(){
            resultsPanel.hidden = true;
            resultsPanel.classList.remove('is-visible');
            form.hidden = false;
        });
    }
});
