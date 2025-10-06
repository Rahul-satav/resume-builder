
const firebaseConfig = {
  apiKey: "AIzaSyDrBuk7fgf17ven3EfBemsksI1IEgiReS4",
  authDomain: "resume-builder-c1267.firebaseapp.com",
  projectId: "resume-builder-c1267",
  storageBucket: "resume-builder-c1267.firebasestorage.app",
  messagingSenderId: "739951054545",
  appId: "1:739951054545:web:9d170033da8c4d30f23ff0",
  measurementId: "G-B0W6T3K1HN"
};
const loader=(()=>{
  const s1=document.createElement('script');s1.src='https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js';
  const s2=document.createElement('script');s2.src='https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js';
  document.head.appendChild(s1);document.head.appendChild(s2);
  s2.onload=()=>{ firebase.initializeApp(firebaseConfig); document.dispatchEvent(new Event('fb-ready')); };
})();
