// About page: newsletter subscription form.
(function(){
    const newsletterForm = document.getElementById('newsletterForm');
    if(!newsletterForm) return;

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
})();
