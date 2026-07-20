// Validates the login form on login.html
function LoginForm(){
    let Email = document.getElementById("mail").value;
    let Password = document.getElementById("pass").value;

    if(Email==""){
        document.getElementById("alert1").innerHTML="Email is required";
        return false;
    } else {
        document.getElementById("alert1").innerHTML="";
    }

    if(Password==""){
        document.getElementById("alert2").innerHTML="Password is required";
        return false;
    } else if(Password.length<6){
        document.getElementById("alert2").innerHTML="Password must be at least 6 characters";
        return false;
    } else {
        document.getElementById("alert2").innerHTML="";
    }

    showToast("Login successful! Welcome back.", "success");
    return false;
}
