import { auth } from './firebase.js';
import { showAlert } from './utils.js'; // FIXED: Import shared utils
import { 
  onAuthStateChanged, 
  signOut 
} from 'https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js';


const payBtns = document.querySelectorAll('.payBtn');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const dashboardLink = document.getElementById('dashboardLink');
const trialBtn = document.getElementById('trialBtn');

const PAYSTACK_KEY = 'pk_test_cd92f51ced9efc2019350706d438af9a97499608';

let currentUser = null;

// Proper auth listener
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    loginBtn.classList.add('hidden');
    registerBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    dashboardLink.classList.remove('hidden');
    trialBtn.textContent = 'Trial Active';
    payBtns.forEach(btn => btn.disabled = false);
  } else {
    loginBtn.classList.remove('hidden');
    registerBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    dashboardLink.classList.add('hidden');
    payBtns.forEach(btn => btn.disabled = true);
  }
});

logoutBtn.addEventListener('click', () => signOut(auth));


// Paystack handlers
payBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    if (!currentUser) {
      showAlert('Please login first!', 'error');
      return;
    }
    const plan = e.target.dataset.plan;
    const amount = parseInt(e.target.dataset.amount);

    let handler = PaystackPop.setup({
      key: PAYSTACK_KEY,
      email: currentUser.email,
      amount: amount,
      currency: 'ZAR',
      ref: 'mathwithmdu_' + Math.floor((Math.random() * 1000000000) + 1),
      callback: function(response) {
        const ref = response.reference;
        showAlert(`Payment successful! Ref: ${ref}. Contact WhatsApp to activate ${plan} plan.`, 'success');
      },
      onClose: function() {
        showAlert('Payment cancelled.', 'error');
      }
    });
    handler.openIframe();
  });
});


// FIXED: showAlert removed - now imported from utils.js as showAlert()


