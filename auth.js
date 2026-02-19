async function register(){
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signUp({
    email: email,
    password: password
  });

  if(error){
    document.getElementById("msg").innerText = error.message;
  }else{
    document.getElementById("msg").innerText = "Register berhasil! Silakan login.";
  }
}

async function login(){
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });

  if(error){
    document.getElementById("msg").innerText = error.message;
  }else{
    window.location.href="dashboard.html";
  }
}