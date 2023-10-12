import React, { useState, useEffect, useRef, useReducer } from 'react';
import './scss/main.scss';
import {
  checkActionCode,
  applyActionCode,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from 'firebase/auth';
import { auth } from './services/firebase';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { BsEyeSlash, BsEye } from 'react-icons/bs';

// TODO SET UP THE TRY CATCH FOR RESETTING PASSWORD, AND WE SHOULD BE DONE WITH THIS MINI PROJ

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route
        path='/'
        element={<Root />}
        errorElement={
          <section>
            <div className='center_sect'>
              <h1 className='sect_heading'>404</h1>
              <h2 className='error_text'>Page not found</h2>
            </div>
          </section>
        }
      />
    )
  );

  return <RouterProvider router={router} />;
};

export default App;

interface InfoInt {
  type: 'error' | 'success' | '';
  msg: string;
  state: boolean;
}

interface ActionInt {
  type: 'ERROR' | 'SUCCESS' | 'RESET';
  payload?: string;
}

const Root = () => {
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

  const mode = getParameterByName('mode');
  // const mode: string = 'resetPassword';
  const actionCode = getParameterByName('oobCode');
  const continueUrl = getParameterByName('continueUrl');

  const [isVerifying, setIsVerifying] = useState(true);
  const [verifyFailed, setVerifyFailed] = useState(false);
  const [pWord, setPword] = useState('');
  const [conPword, setConPword] = useState('');
  const [isShowPword, setIsShowPword] = useState(false);
  const [isShowConPword, setIsShowConPword] = useState(false);
  const [info, setInfo] = useReducer(reducer, {
    state: false,
    type: '',
    msg: '',
  });
  const infoRef = useRef<HTMLParagraphElement | null>(null);
  const infoWrapperRef = useRef<HTMLDivElement | null>(null);
  const [verifyingRest, setVerifyingReset] = useState(true);
  const [email, setEmail] = useState('');
  const [pwordResetting, setPwordResetting] = useState(false);
  const [pwordReset, setPwordReset] = useState(false);

  const validatePassword = (): boolean => {
    if (!pWord) setInfo({ type: 'ERROR', payload: 'Enter password' });

    if (pWord.length < 8) {
      setInfo({
        type: 'ERROR',
        payload: "Password's char should be at least 8",
      });
      return false;
    }

    // ! ENSURE TO CHANGE BACK TO STRONG PASSWORD AND FOR MAIN APP
    if (regex.alphaNumeric.test(pWord)) return true;

    setInfo({
      type: 'ERROR',
      payload:
        'Password should contain at least one; uppercase letter, lowercase letter, digit, and spceial character',
    });

    return false;
  };

  const validateConPassword = (): boolean => {
    if (conPword !== pWord)
      setInfo({ type: 'ERROR', payload: 'Passwords do not match' });
    else return true;

    return false;
  };

  const handleVerify = async () => {
    try {
      await applyActionCode(auth, actionCode);
    } catch (error) {
      console.log(`Verification failed`);
      setVerifyFailed(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validatePassword() && validateConPassword()) {
      try {
        setPwordResetting(true);
        await confirmPasswordReset(auth, actionCode, pWord);
        setPwordReset(true);
        setInfo({ type: 'SUCCESS', payload: 'Password reset successful' });
      } catch (error) {
        setInfo({ type: 'ERROR', payload: 'Password reset failed' });
        console.log('Reset failed');
      } finally {
        setPwordResetting(false);
      }
    }
  };

  const verifyReset = async () => {
    try {
      setVerifyingReset(true);
      const email = await verifyPasswordResetCode(auth, actionCode);
      setEmail(email);
    } catch (error) {
      console.log(error);
    } finally {
      setVerifyingReset(false);
    }
  };

  useEffect(() => {
    if (infoRef.current && infoWrapperRef.current) {
      const infoEl = infoRef.current;
      const infoWrapperEl = infoWrapperRef.current;

      if (info.state)
        infoWrapperEl.style.height =
          infoEl.getBoundingClientRect().height + 'px';
      else infoWrapperEl.style.height = '0px';
    }
  }, [infoRef, infoWrapperRef, info]);

  useEffect(() => {
    let infoTimer: NodeJS.Timer;
    if (info.state) {
      infoTimer = setTimeout(() => {
        setInfo({ type: 'RESET' });
      }, 3000);

      return () => clearTimeout(infoTimer);
    }
  }, [info]);

  useEffect(() => {
    switch (mode) {
      case 'resetPassword':
        document.title = 'Devie-Reset Password';
        verifyReset();
        break;
      case 'verifyEmail':
        document.title = 'Devie-Verify Email';
        handleVerify();
        break;
      default:
        window.location.href = 'https://devie.netlify.app';
        return;
    }
  }, [mode]);

  return (
    <section>
      <div className='center_sect'>
        {mode === 'resetPassword' ? (
          <>
            <h2 className='sect_heading'>Reset Password</h2>
            {verifyingRest ? (
              <div className='loading_wrapper'>
                <div className='loading'></div>
              </div>
            ) : !verifyingRest && !email ? (
              <p className='fail_verify'>
                Link verification failed. Please request another reset{' '}
              </p>
            ) : (
              <>
                <h3>Password reset for {email}</h3>
                <form onSubmit={handleReset}>
                  <div className='form_opts'>
                    <div className='form_opt'>
                      <input
                        type={`${isShowPword ? 'text' : 'password'}`}
                        placeholder='New Password'
                        value={pWord}
                        onChange={(e) => setPword(e.target.value)}
                      />
                      <button
                        type='button'
                        onClick={() => setIsShowPword(!isShowPword)}
                      >
                        {isShowPword ? <BsEye /> : <BsEyeSlash />}
                      </button>
                    </div>

                    <div className='form_opt'>
                      <input
                        type={`${isShowConPword ? 'text' : 'password'}`}
                        placeholder='Confirm Password'
                        value={conPword}
                        onChange={(e) => setConPword(e.target.value)}
                      />
                      <button
                        type='button'
                        onClick={() => setIsShowConPword(!isShowConPword)}
                      >
                        {isShowConPword ? <BsEye /> : <BsEyeSlash />}
                      </button>
                    </div>
                  </div>

                  {pwordReset ? (
                    <a href={continueUrl}>Return back to Devie</a>
                  ) : (
                    <button
                      className='reset_btn'
                      disabled={pwordResetting}
                      style={
                        pwordResetting
                          ? { opacity: 0.5, cursor: 'not-allowed' }
                          : {}
                      }
                    >
                      {pwordResetting ? 'Resetting...' : 'Reset'}
                    </button>
                  )}

                  <div
                    className='info_wrapper'
                    ref={infoWrapperRef}
                    style={
                      info.type === 'error'
                        ? { backgroundColor: '#ff000027', color: '#ff0000' }
                        : info.type === 'success'
                        ? { backgroundColor: '#00800027', color: '#008800' }
                        : {}
                    }
                  >
                    <p className='info' ref={infoRef}>
                      {info.msg}
                    </p>
                  </div>
                </form>
              </>
            )}
          </>
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
          <h1>You are not supposed to be here</h1>
        )}
      </div>
    </section>
  );
};

const reducer = (info: InfoInt, action: ActionInt): InfoInt => {
  switch (action.type) {
    case 'ERROR':
      return { ...info, state: true, msg: action.payload ?? '', type: 'error' };
    case 'SUCCESS':
      return {
        ...info,
        state: true,
        msg: action.payload ?? '',
        type: 'success',
      };
    case 'RESET':
      return { ...info, state: false };
    default:
      return info;
  }
};

export const regex = {
  alpha: /^[A-Za-z\s]+$/,
  alphaNumeric: /^[a-zA-Z0-9]+$/,
  email: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
  url: /^(http|https|ftp):\/\/([^\s/$.?#].[^\s]*)?$/,
  strongPword: /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/,
};
