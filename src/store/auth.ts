import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false);
  const currentUser = ref('');
  const isFirstLogin = ref(false);

  function handleLogin(email: string, password: string) {
    // 테스트 계정: user@sk.ax / user123
    if (email === 'user@sk.ax' && password === 'user123') {
      currentUser.value = 'user@sk.ax';
      isLoggedIn.value = true;
      isFirstLogin.value = false;
    } else {
      // 다른 계정은 로그인 가능
      currentUser.value = email;
      isLoggedIn.value = true;
      isFirstLogin.value = false;
    }
  }

  function handleSignup(email: string) {
    currentUser.value = email;
    isLoggedIn.value = true;
    isFirstLogin.value = true;
  }

  function handleLogout() {
    isLoggedIn.value = false;
    currentUser.value = '';
    isFirstLogin.value = false;
  }

  function handleDeleteAccount() {
    // 계정 삭제 로직 (실제로는 API 호출)
    isLoggedIn.value = false;
    currentUser.value = '';
    isFirstLogin.value = false;
  }

  function completeFirstLogin() {
    isFirstLogin.value = false;
  }

  return {
    isLoggedIn,
    currentUser,
    isFirstLogin,
    handleLogin,
    handleSignup,
    handleLogout,
    handleDeleteAccount,
    completeFirstLogin,
  };
});
