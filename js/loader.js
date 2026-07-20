(function(){
    const preloader = document.getElementById('preloader');

    function markPageReady(){
        document.body.classList.add('page-ready');
        document.dispatchEvent(new CustomEvent('wanderly:pageready'));
    }

    if(!preloader){
        markPageReady();
        return;
    }

    const alreadyVisited = sessionStorage.getItem('wanderlyVisited');
    if(alreadyVisited){
        preloader.remove();
        markPageReady();
        return;
    }

    document.body.classList.add('no-scroll');
    const minVisibleTime = 700;
    const startTime = Date.now();

    function hidePreloader(){
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(minVisibleTime - elapsed, 0);

        setTimeout(function(){
            preloader.classList.add('is-hidden');
            document.body.classList.remove('no-scroll');
            sessionStorage.setItem('wanderlyVisited', 'true');
            markPageReady();
            setTimeout(function(){
                preloader.remove();
            }, 550);
        }, remaining);
    }

    if(document.readyState === 'complete'){
        hidePreloader();
    } else {
        window.addEventListener('load', hidePreloader);
    }
})();
