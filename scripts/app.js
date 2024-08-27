// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBNTDHR67L48F1nPReRs2dSoQ-PxgNKWYM",
    authDomain: "login2-d485e.firebaseapp.com",
    projectId: "login2-d485e",
    storageBucket: "login2-d485e.appspot.com",
    messagingSenderId: "602998933832",
    appId: "1:602998933832:web:a397944522901f3c12cb7d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to sign in with Google
window.signInWithGoogle = async function() {
    console.log("Sign-in button clicked");
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("User signed in:", result.user);
        loadCurrentUser();
        loadOrders(); // Load orders from Firestore
    } catch (error) {
        console.error("Error signing in with Google:", error);
    }
};

// Function to sign out
window.signOutUser = async function() {
    console.log("Sign-out button clicked");
    try {
        await signOut(auth);
        console.log("User signed out.");
        document.getElementById('user-list').innerHTML = '';
        document.getElementById('order-list').innerHTML = '';
    } catch (error) {
        console.error("Error signing out:", error);
    }
};

// Function to load the currently signed-in user
function loadCurrentUser() {
    onAuthStateChanged(auth, (user) => {
        const userList = document.getElementById('user-list');
        userList.innerHTML = ''; // Clear previous content

        if (user) {
            const userItem = document.createElement('div');
            userItem.textContent = `Email: ${user.email}, UID: ${user.uid}`;
            userList.appendChild(userItem);
        } else {
            userList.textContent = "No user is signed in.";
        }
    });
}

// Function to load orders from Firestore
async function loadOrders() {
    const orderList = document.getElementById('order-list');
    const searchOrderId = document.getElementById('search-order-id').value;
    const filterStatus = document.getElementById('filter-status').value;
    const filterDate = document.getElementById('filter-date').value;

    let ordersQuery = collection(db, 'orders');

    // Apply filters based on user input
    const filters = [];
    if (searchOrderId) {
        filters.push(where("orderId", "==", searchOrderId));
    }
    if (filterStatus) {
        filters.push(where("status", "==", filterStatus === 'true'));
    }
    if (filterDate) {
        filters.push(orderBy("date", filterDate === 'desc' ? 'desc' : 'asc'));
    } else {
        filters.push(orderBy("date", 'desc'));
    }

    // Combine all filters using query
    ordersQuery = query(ordersQuery, ...filters);

    try {
        const orderSnapshot = await getDocs(ordersQuery);
        orderList.innerHTML = ''; // Clear previous content

        orderSnapshot.forEach(doc => {
            const order = doc.data();
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';

            orderItem.innerHTML = `
                <div class="editable">
                    <strong>Order ID:</strong> <span>${order.orderId}</span><br>
                    <strong>Product:</strong> <input type="text" value="${order.product}" data-id="${doc.id}" data-field="product"><br>
                    <strong>Price:</strong> <input type="text" value="${order.price}" data-id="${doc.id}" data-field="price"><br>
                    <strong>Your_Item:</strong> <input type="text" value="${order.Your_Item || ''}" data-id="${doc.id}" data-field="Your_Item"><br>
                    <strong>Date:</strong> ${order.date.toDate().toLocaleString()}<br>
                    <div class="status">
                        <strong>Status:</strong>
                        <select data-id="${doc.id}" data-field="status">
                            <option value="true" ${order.status ? 'selected' : ''}>Active</option>
                            <option value="false" ${!order.status ? 'selected' : ''}>Inactive</option>
                        </select>
                    </div>
                </div>
                <button onclick="updateOrder('${doc.id}')">Save Changes</button>
            `;

            orderList.appendChild(orderItem);
        });
    } catch (error) {
        console.error("Error loading orders:", error);
    }
}

// Function to update order in Firestore
window.updateOrder = async function(orderId) {
    const product = document.querySelector(`input[data-id="${orderId}"][data-field="product"]`).value;
    const price = document.querySelector(`input[data-id="${orderId}"][data-field="price"]`).value;
    const yourItem = document.querySelector(`input[data-id="${orderId}"][data-field="Your_Item"]`).value;
    const status = document.querySelector(`select[data-id="${orderId}"][data-field="status"]`).value === 'true';

    try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, {
            product: product,
            price: price,
            Your_Item: yourItem,
            status: status
        });
        alert("Order updated successfully");
    } catch (error) {
        console.error("Error updating order:", error);
    }
};

// Event listeners for search and filters
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sign-in-button').addEventListener('click', window.signInWithGoogle);
    document.getElementById('sign-out-button').addEventListener('click', window.signOutUser);
    document.getElementById('apply-filters').addEventListener('click', loadOrders);
});

