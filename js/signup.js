// Validates the sign-up form on signup.html
function SignupForm(){
    const name = document.getElementById('fullname').value.trim();
    const email = document.getElementById('mail').value.trim();
    const pass = document.getElementById('pass').value;
    const pass2 = document.getElementById('pass2').value;
    let ok = true;

    document.getElementById('alertName').innerHTML='';
    document.getElementById('alertEmail').innerHTML='';
    document.getElementById('alertPass').innerHTML='';
    document.getElementById('alertPass2').innerHTML='';

    if(!name){ document.getElementById('alertName').innerHTML='Full name is required'; ok=false; }
    if(!email){ document.getElementById('alertEmail').innerHTML='Email is required'; ok=false; }
    if(!pass){ document.getElementById('alertPass').innerHTML='Password is required'; ok=false; }
    else if(pass.length<6){ document.getElementById('alertPass').innerHTML='Password must be at least 6 characters'; ok=false; }
    if(pass!==pass2){ document.getElementById('alertPass2').innerHTML='Passwords do not match'; ok=false; }

    if(ok){ showToast('Account created successfully!', 'success'); }
    return false;
}
