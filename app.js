// কোর ডেটা স্টেট
let walletBalance = 5000.00; 
let isBalanceVisible = false;

// পেজ রেডি হবার পর ইনপুট ফিল্টারিং রান করা
document.addEventListener('DOMContentLoaded', () => {
    const numericInputs = document.querySelectorAll('.input-numeric-only');
    numericInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    });
});

// ১. রেজিস্ট্রেশন ফাংশন
function handleSignUp(e) {
    if (e) e.preventDefault();
    
    const name = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const pin = document.getElementById('reg-pin').value.trim();

    if (!name || phone.length !== 11 || pin.length !== 5) {
        alert("❌ তথ্য ভুল! নাম, ১১ ডিজিটের মোবাইল নম্বর এবং ৫ ডিজিটের পিন দিন।");
        return;
    }

    const userData = { name: name, phone: phone, pin: pin };
    localStorage.setItem('bkash_user', JSON.stringify(userData));

    alert("🎉 রেজিস্ট্রেশন সফল! অনুগ্রহ করে এবার লগইন করুন।");
    goToLoginScreen();
    document.getElementById('login-phone').value = phone;
}

// ২. লগইন ফাংশন
function handleLogin(e) {
    if (e) e.preventDefault();

    const loginPhone = document.getElementById('login-phone').value.trim();
    const loginPin = document.getElementById('login-pin').value.trim();
    const storedUser = localStorage.getItem('bkash_user');

    if (!storedUser) {
        alert("❌ কোনো অ্যাকাউন্ট পাওয়া যায়নি! প্রথমে সাইন-আপ করুন।");
        goToSignUpScreen();
        return;
    }

    const userObj = JSON.parse(storedUser);

    if (loginPhone === userObj.phone && loginPin === userObj.pin) {
        openDashboard(userObj.name);
    } else {
        alert("❌ ভুল নম্বর অথবা পিন! আবার চেষ্টা করুন।");
    }
}

// ৩. টেস্ট করার জন্য সরাসরি ড্যাশবোর্ড বাইপাস বাটন ফাংশন
function bypassToDashboard(e) {
    if (e) e.preventDefault();
    const demoUser = { name: "মোঃ শারিয়া সবুজ (টেস্ট)", phone: "01627602806", pin: "12345" };
    localStorage.setItem('bkash_user', JSON.stringify(demoUser));
    openDashboard(demoUser.name);
    alert("⚙️ টেস্ট মোড ওপেন হয়েছে! ট্রানজেকশনের জন্য পিন নম্বর '12345' ব্যবহার করুন।");
}

function openDashboard(userName) {
    document.getElementById('user-name-display').textContent = userName;
    document.getElementById('signup-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-workspace').classList.remove('hidden');
}

// ৪. ব্যালেন্স ট্যাপ কন্ট্রোলার
document.getElementById('balance-tap-box').addEventListener('click', () => {
    if (isBalanceVisible) return;

    isBalanceVisible = true;
    const balanceTextNode = document.getElementById('balance-text-node');
    const balanceStatusBtn = document.getElementById('balance-status-btn');

    balanceTextNode.textContent = `৳ ${walletBalance.toLocaleString('bn-BD', { minimumFractionDigits: 2 })}`;
    balanceTextNode.classList.add('text-yellow-300');
    balanceStatusBtn.innerHTML = `<i class="fa-solid fa-lock"></i> সুরক্ষিত`;

    setTimeout(() => {
        isBalanceVisible = false;
        balanceTextNode.textContent = "৳ ••••••";
        balanceTextNode.classList.remove('text-yellow-300');
        balanceStatusBtn.innerHTML = `<i class="fa-solid fa-circle-dot"></i> ব্যালেন্স দেখুন`;
    }, 3500);
});

// ৫. বিকাশ সার্ভিস গেটওয়ে
function triggerService(type) {
    document.getElementById('action-modal').classList.remove('hidden');
    document.getElementById('current-action-type').value = type;
    document.getElementById('form-target-number').value = "";
    document.getElementById('form-amount').value = "";
    document.getElementById('form-secure-pin').value = "";

    const actionSchemas = {
        sendMoney: { title: "সেন্ড মানি", label: "প্রাপকের বিকাশ অ্যাকাউন্ট নম্বর" },
        recharge: { title: "মোবাইল রিচার্জ", label: "মোবাইল নম্বরটি লিখুন" },
        cashOut: { title: "ক্যাশ আউট", label: "এজেন্ট নম্বরটি ইনপুট করুন" },
        payment: { title: "মার্চেন্ট পেমেন্ট", label: "মার্চেন্ট পেমেন্ট নম্বর দিন" }
    };

    document.getElementById('modal-title-text').textContent = actionSchemas[type].title;
    document.getElementById('dynamic-input-label').textContent = actionSchemas[type].label;
}

function closeActionModal() {
    document.getElementById('action-modal').classList.add('hidden');
}

// ৬. ট্রানজেকশন প্রসেসর
function executeTransaction(e) {
    if (e) e.preventDefault();

    const actionType = document.getElementById('current-action-type').value;
    const targetNum = document.getElementById('form-target-number').value.trim();
    const amountValue = parseFloat(document.getElementById('form-amount').value);
    const inputPin = document.getElementById('form-secure-pin').value.trim();

    const storedUser = JSON.parse(localStorage.getItem('bkash_user'));

    if (!storedUser || inputPin !== storedUser.pin) {
        alert("❌ পিন নম্বর ভুল! লেনদেন বাতিল করা হয়েছে।");
        return;
    }
    if (!targetNum || isNaN(amountValue) || amountValue < 10) {
        alert("❌ সঠিক নম্বর এবং নূন্যতম ১০ টাকা প্রদান করুন।");
        return;
    }
    if (amountValue > walletBalance) {
        alert("❌ পর্যাপ্ত ব্যালেন্স নেই!");
        return;
    }

    walletBalance -= amountValue;

    if (isBalanceVisible) {
        document.getElementById('balance-text-node').textContent = `৳ ${walletBalance.toLocaleString('bn-BD', { minimumFractionDigits: 2 })}`;
    }

    const serviceStrings = { sendMoney: "সেন্ড মানি", recharge: "মোবাইল রিচার্জ", cashOut: "ক্যাশ আউট", payment: "পেমেন্ট" };
    const trxIdGenerated = "BK" + Math.random().toString(36).substr(2, 7).toUpperCase();

    const logRow = document.createElement('div');
    logRow.className = "flex justify-between items-center p-3.5 bg-pink-50/40 rounded-2xl border border-pink-100/60";
    logRow.innerHTML = `
        <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-red-100 text-red-500 rounded-xl flex items-center justify-center text-sm"><i class="fa-solid fa-arrow-up-right-from-square"></i></div>
            <div>
                <p class="text-xs font-bold text-gray-800">${serviceStrings[actionType]} (${targetNum})</p>
                <p class="text-[9px] text-gray-400">এখনই • TrxID: ${trxIdGenerated}</p>
            </div>
        </div>
        <span class="text-xs font-black text-red-500">-৳${amountValue.toFixed(2)}</span>
    `;
    
    const container = document.getElementById('transaction-log-container');
    container.insertBefore(logRow, container.firstChild);

    closeActionModal();
    alert(`🎉 সফলভাবে ${serviceStrings[actionType]} সম্পন্ন হয়েছে!`);
}

// স্ক্রিন নেভিগেশন কন্ট্রোলস
function goToLoginScreen() {
    document.getElementById('signup-screen').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
}

function goToSignUpScreen() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('signup-screen').classList.remove('hidden');
}

function logout() {
    document.getElementById('app-workspace').classList.add('hidden');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('login-pin').value = "";
}

function toggleInbox() {
    document.getElementById('inbox-panel').classList.toggle('hidden');
}

function navSwitch(target) {
    if (target === 'statement') {
        document.getElementById('statement-anchor').scrollIntoView({ behavior: 'smooth' });
    } else {
        document.getElementById('main-scroll-view').scrollTo({ top: 0, behavior: 'smooth' });
    }
}
