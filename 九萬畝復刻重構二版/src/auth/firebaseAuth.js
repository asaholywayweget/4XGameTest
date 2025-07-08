// firebaseAuth.js
// 職責：專門處理所有 Firebase Authentication 的相關操作

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInAnonymously,
    signOut,
    EmailAuthProvider,
    linkWithCredential
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";

// --- DOM 元素 (此處省略，與前版相同) ---
const authContainer = document.getElementById('auth-container');
const authStatus = document.getElementById('auth-status');
const userDetails = document.getElementById('user-details');
const messageBoxAuth = document.getElementById('message-box-auth');
const loggedOutSection = document.getElementById('logged-out-section');
const guestSection = document.getElementById('guest-section');
const emailLoginSection = document.getElementById('email-login-section');
const logoutSection = document.getElementById('logout-section');
const guestLoginBtn = document.getElementById('guest-login-btn');
const showEmailLoginBtn = document.getElementById('show-email-login-btn');
const linkAccountBtn = document.getElementById('link-account-btn');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const backToStartBtn = document.getElementById('back-to-start-btn');
const authLogoutBtn = document.getElementById('logout-btn');
const bindEmailInput = document.getElementById('bind-email');
const bindPasswordInput = document.getElementById('bind-password');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

let auth, db;

/**
 * 初始化 Firebase 並設定認證監聽器
 * @param {object} callbacks - 包含 onLogin 和 onLogout 回呼函式的物件
 */
export function setupFirebaseAuth(callbacks) {
    try {
        const firebaseConfig = {
          apiKey: "AIzaSyDum1oxVUQ-9cbwLpAqPdyitTZWigGUPl0",
          authDomain: "testgame-579f4.firebaseapp.com",
          projectId: "testgame-579f4",
          storageBucket: "testgame-579f4.appspot.com",
          messagingSenderId: "926624139350",
          appId: "1:926624139350:web:018a45a9922d91e98113f7",
          measurementId: "G-3DFJC8E63H"
        };
        document.getElementById('current-project-id').textContent = firebaseConfig.projectId;
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        getAnalytics(app); 
        console.log("Firebase 登入系統初始化成功，專案:", firebaseConfig.projectId);

        onAuthStateChanged(auth, async (user) => {
            updateAuthUI(user);
            if (user) {
                authContainer.classList.add('hidden');
                
                const playerDocRef = doc(db, "jiuwanmu_players", user.uid);
                const playerDocSnap = await getDoc(playerDocRef);
                if (!playerDocSnap.exists()) {
                     console.log("新玩家，正在建立初始資料...");
                     // 【關鍵修正】在建立新玩家資料時，直接將城市結構常數加入
                     const newPlayerData = {
                        id: user.uid,
                        name: user.isAnonymous ? `訪客_${user.uid.substring(0, 4)}` : user.email.split('@')[0],
                        allianceId: null,
                        cities: [{
                            id: `city_${user.uid}`,
                            name: '主城',
                            placedBuildings: [{ name: "主城", row: 8, col: 8, level: 1 }],
                            teams: [],
                            preTrainingQueue: {},
                            // 加入城市結構定義
                            MAIN_CITY_MIN_ROW: 6,
                            MAIN_CITY_MAX_ROW: 10,
                            MAIN_CITY_MIN_COL: 6,
                            MAIN_CITY_MAX_COL: 10
                        }]
                     };
                     await setDoc(playerDocRef, newPlayerData);
                     console.log("初始資料建立完成!");
                } else { 
                    console.log("既有玩家，讀取資料。"); 
                }
                
                callbacks.onLogin(db, user);

            } else {
                authContainer.classList.remove('hidden');
                callbacks.onLogout();
            }
            messageBoxAuth.classList.add('hidden');
        });

        setupEventListeners();

    } catch (error) {
        console.error("Firebase 登入系統初始化失敗:", error);
        document.getElementById('current-project-id').textContent = '初始化失敗';
    }
}

function updateAuthUI(user) {
    // ... 此處邏輯不變 ...
    document.querySelectorAll('#auth-container .form-section').forEach(s => s.classList.remove('active'));
    if (user) {
        logoutSection.classList.add('active');
        if (user.isAnonymous) {
            authStatus.textContent = '訪客已登入'; authStatus.className = 'text-teal-400 font-semibold';
            userDetails.innerHTML = `訪客 ID: <br><span class="font-mono">${user.uid}</span>`;
            guestSection.classList.add('active');
        } else {
            authStatus.textContent = '會員已登入'; authStatus.className = 'text-green-400 font-semibold';
            userDetails.innerHTML = `信箱: ${user.email}<br>UID: <span class="font-mono">${user.uid}</span>`;
        }
    } else {
        authStatus.textContent = '尚未登入'; authStatus.className = 'text-yellow-400 font-semibold';
        userDetails.innerHTML = '';
        loggedOutSection.classList.add('active');
    }
}

function showAuthMessage(message, isError = false) {
    // ... 此處邏輯不變 ...
    messageBoxAuth.textContent = message;
    messageBoxAuth.className = `mt-4 p-3 rounded-md text-sm ${isError ? 'bg-red-900/70 text-red-300' : 'bg-green-900/70 text-green-300'}`;
}

function setupEventListeners() {
    // ... 此處邏輯不變 ...
    showEmailLoginBtn.addEventListener('click', () => { loggedOutSection.classList.remove('active'); emailLoginSection.classList.add('active'); });
    backToStartBtn.addEventListener('click', () => { emailLoginSection.classList.remove('active'); loggedOutSection.classList.add('active'); });
    guestLoginBtn.addEventListener('click', async () => { try { await signInAnonymously(auth); showAuthMessage('訪客登入成功！'); } catch (e) { showAuthMessage(`訪客登入失敗: ${e.code}`, true); } });
    linkAccountBtn.addEventListener('click', async () => {
        const email = bindEmailInput.value, pass = bindPasswordInput.value;
        if (!email || !pass) return showAuthMessage("信箱和密碼不能為空。", true);
        try { await linkWithCredential(auth.currentUser, EmailAuthProvider.credential(email, pass)); showAuthMessage('帳號綁定成功！'); }
        catch (e) { let m = `綁定失敗: ${e.code}`; if (e.code==='auth/email-already-in-use'||e.code==='auth/credential-already-in-use') m="綁定失敗：此信箱已被使用。"; showAuthMessage(m,true); }
    });
    registerBtn.addEventListener('click', async () => {
        const email = emailInput.value, pass = passwordInput.value;
        if (!email || !pass) return showAuthMessage("信箱和密碼不能為空。", true);
        try { await createUserWithEmailAndPassword(auth, email, pass); showAuthMessage('註冊成功！'); }
        catch (e) { showAuthMessage(`註冊失敗: ${e.code==='auth/email-already-in-use'?'此信箱已被註冊':e.code}`, true); }
    });
    loginBtn.addEventListener('click', async () => {
        const email = emailInput.value, pass = passwordInput.value;
        if (!email || !pass) return showAuthMessage("信箱和密碼不能為空。", true);
        try { await signInWithEmailAndPassword(auth, email, pass); showAuthMessage('登入成功！'); }
        catch (e) { showAuthMessage(`登入失敗: ${e.code==='auth/invalid-credential'?'信箱或密碼錯誤':e.code}`, true); }
    });
    authLogoutBtn.addEventListener('click', async () => { try { await signOut(auth); showAuthMessage('您已成功登出。'); } catch (e) { showAuthMessage(`登出失敗: ${e.code}`, true); } });
}
