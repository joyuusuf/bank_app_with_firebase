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

    // Get user email from the user object
    const userEmail = user.email;

    // Check for required fields
    if (!recipientName || !recipientAccountNumber || isNaN(transferAmount) || !password) {
        alert('Please fill in all required fields.');
        document.getElementById("loader").style.display = "none";
        document.getElementById("transferbtn").style.display = "block";
        return;
    }

    // Retrieve user's profile information from Firestore
    db.collection('Profile').doc(userEmail).get()
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
        return db.collection('Profile').doc(userEmail).update({
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

        // Check if balance is zero
        return db.collection('Profile').doc(userEmail).get();
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
