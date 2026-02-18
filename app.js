// FIREBASE CONFIG
var firebaseConfig = {
  apiKey: "ISI_API_KEY",
  authDomain: "ISI_PROJECT.firebaseapp.com",
  projectId: "ISI_PROJECT",
  storageBucket: "ISI_PROJECT.appspot.com",
  messagingSenderId: "ISI_SENDER_ID",
  appId: "ISI_APP_ID"
};

firebase.initializeApp(firebaseConfig);

var transactions = [];

// LOGIN
function loginGoogle(){
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
  .then(function(){
    window.location.href="dashboard.html";
  })
  .catch(function(error){
    alert(error.message);
  });
}

// LOGOUT
function logout(){
  firebase.auth().signOut().then(function(){
    window.location.href="index.html";
  });
}

// TAMBAH TRANSAKSI
function addTransaction(){
  var title=document.getElementById("title").value;
  var amount=document.getElementById("amount").value;
  var date=document.getElementById("date").value;
  var file=document.getElementById("receipt").files[0];

  if(!title||!amount||!date){
    alert("Isi semua data");
    return;
  }

  if(file){
    var reader=new FileReader();
    reader.onload=function(e){
      transactions.push({title,amount,date,receipt:e.target.result});
      render();
    };
    reader.readAsDataURL(file);
  }else{
    transactions.push({title,amount,date});
    render();
  }
}

// RENDER
function render(list=transactions){
  var container=document.getElementById("transactionList");
  if(!container) return;

  container.innerHTML="";
  list.forEach(function(tx){
    container.innerHTML+=`
      <div class="card">
        <b>${tx.title}</b><br>
        Rp ${tx.amount}<br>
        ${tx.date}
        ${tx.receipt?`<br><img src="${tx.receipt}" width="100">`:""}
      </div>
    `;
  });
}

// SEARCH
function applySearch(){
  var name=document.getElementById("searchName").value.toLowerCase();
  var month=document.getElementById("searchMonth").value;

  var filtered=transactions.filter(function(tx){
    var matchName=tx.title.toLowerCase().includes(name);
    var matchMonth=month?tx.date.startsWith(month):true;
    return matchName && matchMonth;
  });

  render(filtered);
}

function resetSearch(){
  render();
}

// PDF
function downloadPDF(){
  const { jsPDF } = window.jspdf;
  const doc=new jsPDF();
  var y=10;

  transactions.forEach(function(tx,i){
    doc.text(`${i+1}. ${tx.title} - Rp ${tx.amount} - ${tx.date}`,10,y);
    y+=10;
  });

  doc.save("Buktiku.pdf");
}