
// Handle login/logout UI
document.addEventListener('fb-ready', () => {
  const auth = firebase.auth();
  const provider = new firebase.auth.GoogleAuthProvider();
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const chip = document.getElementById('userChip');
  if (loginBtn) loginBtn.onclick = () => auth.signInWithPopup(provider);
  if (logoutBtn) logoutBtn.onclick = () => auth.signOut();
  auth.onAuthStateChanged(user => {
    if (user) {
      if (loginBtn) loginBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'inline-block';
      if (chip) { chip.style.display='inline-block'; chip.textContent = 'Signed in as ' + (user.displayName || user.email); }
      localStorage.setItem('rb_user', JSON.stringify({uid:user.uid, name:user.displayName||user.email}));
    } else {
      if (loginBtn) loginBtn.style.display = 'inline-block';
      if (logoutBtn) logoutBtn.style.display = 'none';
      if (chip) chip.style.display='none';
      localStorage.removeItem('rb_user');
    }
  });
});
