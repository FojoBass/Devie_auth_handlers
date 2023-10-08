import React, { useState, useEffect } from 'react';
import './scss/main.scss';
import {
  checkActionCode,
  applyActionCode,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from './services/firebase';

const App = () => {
  const getParameterByName = (name: string, url = window.location.href) => {
    const params = url.split('?')[1]?.split('&');

    if (params) {
      for (const param of params) {
        const [paramName, paramValue] = param.split('=');
        if (paramName === name) return decodeURIComponent(paramValue);
      }
    }

    return '';
  };

  // const mode = getParameterByName('mode')  'verifyEmail';
  const mode: string = 'verifyEmail';
  const actionCode = getParameterByName('oobCode');
  const continueUrl = getParameterByName('continueUrl');
  const lang = getParameterByName('lang') || 'en';

  const [isVerifying, setIsVerifying] = useState(true);
  const [verifyFailed, setVerifyFailed] = useState(false);

  const handleVerify = async () => {
    try {
      await applyActionCode(auth, actionCode);
    } catch (error) {
      console.log(`Verification failed: ${error}`);
      setVerifyFailed(true);
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    switch (mode) {
      case 'resetPassword':
        document.title = 'Devie-Reset Password';
        break;
      case 'verifyEmail':
        document.title = 'Devie-Verify Email';
        handleVerify();
        break;
      default:
        return;
    }
  }, [mode]);

  return (
    <section>
      <div className='center_sect'>
        {mode === 'resetPassword' ? (
          <></>
        ) : mode === 'verifyEmail' ? (
          <>
            <h2 className='sect_heading'>Email Verification</h2>
            <main>
              {isVerifying ? (
                <p>Verifying Email...</p>
              ) : verifyFailed ? (
                <>
                  <p>Verification failed</p>
                  <a href={continueUrl}>Return back to Devie</a>
                </>
              ) : (
                <>
                  <p>Email verified</p>
                  <a href={continueUrl}>Return back to Devie</a>
                </>
              )}
            </main>
          </>
        ) : (
          <></>
        )}
      </div>
    </section>
  );
};

export default App;
