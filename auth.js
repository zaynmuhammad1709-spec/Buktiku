document.addEventListener("DOMContentLoaded", function () {

  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const registerBtn = document.getElementById("registerBtn");
  const loginBtn = document.getElementById("loginBtn");

  registerBtn.addEventListener("click", async () => {

    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value
    });

    if (error) {
      alert("Register gagal: " + error.message);
    } else {
      alert("Register berhasil! Cek email jika perlu verifikasi.");
    }
  });

  loginBtn.addEventListener("click", async () => {

    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    });

    if (error) {
      alert("Login gagal: " + error.message);
    } else {
      window.location.href = "dashboard.html";
    }
  });

});