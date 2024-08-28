import React from 'react';
import { signOut } from 'aws-amplify/auth';
import { useAuth } from '../context/AuthContext';

function SignOutButton() {
  const { signOut: signOutContext } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut({ global: true });

      // Limpia el estado del contexto de autenticación
      signOutContext();

      // Redirige al usuario a la página de inicio de sesión
      window.location.href = '/';
    } catch (error) {
      console.log('Error signing out: ', error);
    }
  };

  return (
    <button onClick={handleSignOut} className='signout_button'>
      Sign Out
    </button>
  );
}

export default SignOutButton;
