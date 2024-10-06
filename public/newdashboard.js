
function showDashboard() {
    applyRollEffect(); // Apply rolling animation
    setTimeout(() => {
      document.getElementById('dashboardpage').style.display = 'block';
      document.getElementById('transfermain').style.display = 'none';
      document.getElementById('airtimesection').style.display = 'none';
    }, 4000); 
  }
  
  
  function showTransfer() {
    applyRollEffect();
    setTimeout(() => {
      document.getElementById('dashboardpage').style.display = 'none';
      document.getElementById('transfermain').style.display = 'block';
      document.getElementById('airtimesection').style.display = 'none';
    }, 4000); 
  }
  
  
  function showAirtime() {
    applyRollEffect(); 
    setTimeout(() => {
      document.getElementById('dashboardpage').style.display = 'none';
      document.getElementById('transfermain').style.display = 'none';
      document.getElementById('airtimesection').style.display = 'block';
    }, 4000); 
  }
  
  // rolling animation function
  function applyRollEffect() {
    document.getElementById('dashboardpage').classList.add('roll-effect');
    document.getElementById('transfermain').classList.add('roll-effect');
    document.getElementById('airtimesection').classList.add('roll-effect');
  
    setTimeout(() => {
      // Remove animation classes after animation completes
      document.getElementById('dashboardpage').classList.remove('roll-effect');
      document.getElementById('transfermain').classList.remove('roll-effect');
      document.getElementById('airtimesection').classList.remove('roll-effect');
    }, 4000); 
  }
  
  // Initial setup to hide all sections except the dashboard
  document.addEventListener('DOMContentLoaded', function() {
    showDashboard();
  });
  
  // Event listeners for navbar buttons
  function dashboardbtn() {
    showDashboard();
  }
  
  function transfernavbtn() {
    showTransfer();
  }
  
  function airtimenav() {
    showAirtime();
  }
  
    // SIGN OUT SIGN OUT SIGN OUT SIGN OUT SIGN OUT SIGN OUT SIGN OUT SIGN OUT SIGN OUT
    
    function signOut() {
        document.getElementById('signOutLoader').style.display = 'block';

        firebase.auth().signOut()
            .then(() => {
                console.log('User signed out successfully.');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 4000);
            })
            .catch((error) => {
                console.error('Sign-out error:', error.message);
            })
            .finally(() => {
                document.getElementById('signOutLoader').style.display = 'none';
            });
    }


// function transfernavbtn() {
//     showTransfer();
// }

// function airtimenav() {
//     showAirtime();
// }







 
  const firebaseConfig = {
    apiKey: "AIzaSyDoI5jcWsQrDRhiNc2cR3unhRtaZBIIISQ",
    authDomain: "bankapp-b784e.firebaseapp.com",
    databaseURL: "https://bankapp-b784e-default-rtdb.firebaseio.com",
    projectId: "bankapp-b784e",
    storageBucket: "bankapp-b784e.appspot.com",
    messagingSenderId: "538992171201",
    appId: "1:538992171201:web:beb3376817b90410311c40"
  };

  const app = firebase.initializeApp(firebaseConfig);
  const db=firebase.firestore();

  firebase.auth().createUserWithEmailAndPassword(email, password)
  .then((userCredential) => {
    // Signed in 
    var user = userCredential.user;
    // ...
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    // ..
  });

//   UPLOAD PROFILE PICTURE STARTS UPLOAD PROFILE PICTURE STARTS UPLOAD PROFILE PICTURE STARTS
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("file-upload").addEventListener("change", function() {
        let file = this.files[0];
        if (!file) return;

        let reader = new FileReader();
        reader.onload = function(e) {
            let preview = document.getElementById("preview");
            preview.src = e.target.result;
            preview.style.display = "block"; // Changed from inline to block
            document.getElementById("pic-text").style.display = "none";
        };
        reader.readAsDataURL(file);

        let storageRef = storage.ref('profile_pictures/' + file.name);
        storageRef.put(file).then((snapshot) => {
            return storageRef.getDownloadURL();
        }).then((url) => {
            console.log('File available at', url);
            return db.collection('users').doc('USER_ID').set({
                profilePicture: url
            });
        }).then(() => {
            console.log("Document successfully written!");
        }).catch((error) => {
            console.error("Error:", error);
        });
    });
});

// UPLOAD PROFILE PICTURE STOPS UPLOAD PROFILE PICTURE STOPS UPLOAD PROFILE PICTURE STOPS

//   TRANSFER MODE TRANSFER MODE TRANSFER MODE TRANSFER MODE TRANSFER MODE
function transferForm() {
    // Show the loader and hide the button
    document.getElementById("loader").style.display = "block";
    document.getElementById("transferbtn").style.display = "none";

    const recipientName = document.getElementById('recipeinput').value;
    const recipientAccountNumber = document.getElementById('recipnumber').value;
    const transferAmount = parseInt(document.getElementById('recipamount').value);
    const transferMessage = document.getElementById('reciprefmes').value;
    const password = document.getElementById('transferpword').value;

    // Authenticate user
    const user = firebase.auth().currentUser;
    if (!user) {
        alert('Please sign in first.');
        document.getElementById("loader").style.display = "none";
        document.getElementById("transferbtn").style.display = "block";
        return;
    }

    
    if (recipientName==="" || recipientAccountNumber==="" || isNaN(transferAmount) || password==="") {
        alert('Please fill in all required fields.');
        document.getElementById("loader").style.display = "none";
        document.getElementById("transferbtn").style.display = "block";
        return;
    }

    // Retrieve user's profile information
    db.collection('Profile').doc(user.email).get()
    .then((doc) => {
        if (!doc.exists) {
            throw new Error('User profile not found.');
        }

        const userData = doc.data();
        const userBalance = userData.balance;
        const userPin = userData.pin;

        if (transferAmount > userBalance) {
            throw new Error('Insufficient balance.');
        } 

        if (password !== userPin) {
            throw new Error('Incorrect PIN.');
        }

        // Deduct the amount from user's balance
        return db.collection('Profile').doc(user.email).update({
            balance: userBalance - transferAmount
        });
    })
    .then(() => {
        // Add the transaction to the transactions collection
        return db.collection('transactions').add({
            recipientName: recipientName,
            recipientAccountNumber: recipientAccountNumber,
            transferAmount: transferAmount,
            transferMessage: transferMessage,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userId: user.uid
        });
    })
    .then((docRef) => {
        console.log('Transaction recorded with ID:', docRef.id);
        alert('Transaction submitted successfully!');
        document.getElementById("loader").style.display = "none";
        document.getElementById("transferbtn").style.display = "block";
        document.getElementById('transferform').reset();

        // if balance is zero
        return db.collection('Profile').doc(user.email).get();
    })
    .then((doc) => {
        const userData = doc.data();
        if (userData.balance === 0) {
            alert('Your balance is zero.');
        }
    })
    .catch((error) => {
        console.error('Error adding transaction:', error);
        alert('Failed to submit transaction. ' + error.message);
        document.getElementById("loader").style.display = "none";
        document.getElementById("transferbtn").style.display = "block";
    });
}




    // AIRTIME RECHARGE AIRTIME RECHARGE AIRTIME RECHARGE AIRTIME RECHARGE
    function airtimebtn() {
        let airtimeinput = document.getElementById("airtimeinput").value;
        let selectairtime = document.getElementById("selectairtime").value;
        let inputamountairt = document.getElementById("inputamountairt").value;
        let pinairtime = document.getElementById("pinairtime").value.trim(); // Trim whitespace
        let senditt2 = document.getElementById("airtimebtn");
        let transactId = ""; // Reset the transaction ID generator
    
        if (!airtimeinput || !inputamountairt || !selectairtime || !pinairtime) {
            alert('Please fill in all fields');
            return;
        }
    
        if (airtimeinput.length < 11) {
            alert('Phone number should be at least 11 digits');
            return;
        }
    
        senditt2.innerHTML = `
            <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
            <span class="visually-hidden" role="status">Loading...</span>
        `;
    
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                const email = user.email;
                console.log(`Authenticated user email: ${email}`);
    
                db.collection("Profile").doc(email).get().then((doc) => {
                    if (doc.exists) {
                        console.log("Document data:", doc.data());
    
                        const balance = doc.data().balance;
                        const newBalance = balance - inputamountairt;
                        const pin = doc.data().pin;
    
                        console.log(`Retrieved PIN from Firestore: ${pin}`);
                        console.log(`Entered PIN by user: ${pinairtime}`);
    
                        if (inputamountairt > balance) {
                            alert("Insufficient Balance");
                            senditt2.innerHTML = "Buy Airtime";
                        } else if (pinairtime !== pin) {
                            alert("Incorrect PIN");
                            senditt2.innerHTML = "Buy Airtime";
                        } else {
                            db.collection("Profile").doc(email).update({
                                balance: newBalance,
                            }).then(() => {
                                db.collection("Profile").doc(email).onSnapshot((doc) => {
                                    document.getElementById("amountairtime").innerText = doc.data().balance;
                                });
    
                                for (let i = 0; i < 10; i++) {
                                    const randomnumber = Math.floor(Math.random() * 10);
                                    transactId += randomnumber;
                                }
    
                                const currentDate = new Date();
                                const day = currentDate.getDate().toString().padStart(2, "0");
                                const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
                                const year = currentDate.getFullYear();
                                const hour = currentDate.getHours().toString().padStart(2, "0");
                                const minute = currentDate.getMinutes().toString().padStart(2, "0");
                                const second = currentDate.getSeconds().toString().padStart(2, "0");
    
                                const formattedDate = `${day}-${month}-${year} ${hour}:${minute}:${second}`;
    
                                db.collection("transaction").add({
                                    receiverEmail: "",
                                    type: "airtime",
                                    amount: inputamountairt,
                                    date: currentDate,
                                    senderEmail: email,
                                    senderName: `${doc.data().title} ${doc.data().firstName} ${doc.data().lastName}`,
                                    senderOldBalance: balance,
                                    senderNewBalance: newBalance,
                                    transactionId: transactId,
                                    receipientNum: airtimeinput,
                                    description: "",
                                    network: selectairtime,
                                }).then(() => {
                                    document.getElementById("lasttransactions").innerHTML += `
                                        <div id="lasttrans">
                                            <h4 id="lastp">${airtimeinput}</h4>
                                            <p id="lastpp">- N ${inputamountairt}</p>
                                        </div>
                                    `;
    
                                    document.getElementById("receipt2").innerHTML = `
                                        <p class="treceipt" id="Dated">Transaction Date: <span>${formattedDate}</span></p>
                                        <p class="treceipt" id="Type">Transaction Type: <span>Airtime</span></p>
                                        <p class="treceipt" id="Amount">Amount: <span>&#8358 ${inputamountairt}</span></p>
                                        <p class="treceipt" id="Senderacc">Network: <span>${selectairtime}</span></p>
                                        <p class="treceipt" id="Type">Transaction Id: <span>${transactId}</span></p>
                                    `;
    
                                    // Append new transaction details to "Recent Activity"
                                    document.getElementById("recent-activity-container").innerHTML += `
                                        <div class="transaction">
                                            <p><strong>Transaction ID:</strong> ${transactId}</p>
                                            <p><strong>Amount:</strong> &#8358;${inputamountairt}</p>
                                            <p><strong>Network:</strong> ${selectairtime}</p>
                                            <p><strong>Phone Number:</strong> ${airtimeinput}</p>
                                            <p><strong>Date:</strong> ${formattedDate}</p>
                                        </div>
                                    `;
    
                                    senditt2.innerHTML = "Buy Airtime";
                                    document.getElementById("airtimeinput").value = "";
                                    document.getElementById("inputamountairt").value = "";
                                    document.getElementById("pinairtime").value = "";
                                }).catch((error) => {
                                    console.error("Error adding transaction: ", error);
                                    senditt2.innerHTML = "Buy Airtime";
                                });
                            }).catch((error) => {
                                console.error("Error updating balance: ", error);
                                senditt2.innerHTML = "Buy Airtime";
                            });
                        }
                    } else {
                        console.log("No such document!");
                        alert("Profile document not found for the current user.");
                        senditt2.innerHTML = "Buy Airtime";
                    }
                }).catch((error) => {
                    console.error("Error getting document: ", error);
                    senditt2.innerHTML = "Buy Airtime";
                });
            } else {
                console.log("User not authenticated!");
                senditt2.innerHTML = "Buy Airtime";
            }
        });
    }
    
    


  