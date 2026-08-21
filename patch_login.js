const fs = require('fs');

function patchFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Replace googleClientId logic
  code = code.replace(
    /const googleClientId =[\s\S]*?console\.log\('CLIENT ID IS:', googleClientId\);/,
    `const getClientId = () => {
    try {
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
        // @ts-ignore
        return import.meta.env.VITE_GOOGLE_CLIENT_ID;
      }
    } catch(e) {}
    try {
      if (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      }
    } catch(e) {}
    return '';
  };
  const googleClientId = getClientId();
  console.log('CLIENT ID IS:', googleClientId);`
  );

  // Replace useEffect logic to poll for window.google
  code = code.replace(
    /if \(window\.google\?\.accounts\?\.id && googleClientId\) \{[\s\S]*?\}\s*\}\s*\}, \[googleClientId, googleLogin, navigate\]\);/,
    `const initGoogle = () => {
      if (window.google?.accounts?.id && googleClientId) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCallback,
        });

        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            shape: 'rectangular',
            text: file.includes('SignupPage') ? 'signup_with' : 'signin_with',
            logo_alignment: 'center',
            width: 320,
          });
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const intervalId = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(intervalId);
          initGoogle();
        }
      }, 100);
      return () => clearInterval(intervalId);
    }
  }, [googleClientId, googleLogin, navigate]);`
  ).replace("file.includes('SignupPage') ? 'signup_with' : 'signin_with'", file.includes('Signup') ? "'signup_with'" : "'signin_with'");

  fs.writeFileSync(file, code);
}

patchFile('client/src/pages/LoginPage.jsx');
patchFile('client/src/pages/SignupPage.jsx');
