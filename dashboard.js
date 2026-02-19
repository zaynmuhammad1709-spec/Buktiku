async function logout(){
  await supabase.auth.signOut();
  window.location.href="index.html";
}

async function checkUser(){
  const { data } = await supabase.auth.getUser();
  if(!data.user){
    window.location.href="index.html";
  }
}

checkUser();