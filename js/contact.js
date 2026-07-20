// Validates and "sends" the contact form on contact.html
function ContactForm(){
    let Name = document.getElementById("name").value;
    let Email = document.getElementById("email").value;
    let Subject = document.getElementById("subject").value;
    let Message = document.getElementById("message").value;

    if(Name==""){
        document.getElementById("alert1").innerHTML="Name is required";
        return false;
    } else {
        document.getElementById("alert1").innerHTML="";
    }

    if(Email==""){
        document.getElementById("alert2").innerHTML="Email is required";
        return false;
    } else {
        document.getElementById("alert2").innerHTML="";
    }

    if(Subject==""){
        document.getElementById("alert3").innerHTML="Subject is required";
        return false;
    } else {
        document.getElementById("alert3").innerHTML="";
    }

    if(Message==""){
        document.getElementById("alert4").innerHTML="Message is required";
        return false;
    } else {
        document.getElementById("alert4").innerHTML="";
    }

    showToast("Message sent successfully! We'll get back to you soon.", "success");
    document.getElementById("name").value="";
    document.getElementById("email").value="";
    document.getElementById("subject").value="";
    document.getElementById("message").value="";
    return false;
}

document.addEventListener('DOMContentLoaded', function(){
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
});
