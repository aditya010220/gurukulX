import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import LoginForm from './components/LoginForm';
import CulturalBackground from './components/CulturalBackground';
import Icon from '../../components/AppIcon';

const AuthenticationPage = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    // Redirect to home if user is already signed in
    if (isSignedIn) {
      navigate('/personal-user-hub');
    }
  }, [isSignedIn, navigate]);

  return (
    <div className="min-h-screen flex overflow-x-hidden">
      {/* Left Side - Cultural Background */}
      <CulturalBackground />

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-warm-lg p-6 md:p-8">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Icon name="ChefHat" size={24} color="white" />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold text-foreground">Rural Catering</h1>
              </div>
            </div>

            {/* Login Form */}
            <div className="mb-6">
              <h2 className="text-2xl font-heading font-bold text-foreground">Welcome Back!</h2>
              <p className="text-muted-foreground mt-1">Sign in to continue your journey</p>
            </div>
            
            <LoginForm />
          </div>

          {/* Terms Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground caption">
              By continuing, you agree to our{' '}
              <a href="#" className="text-green-500 hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-green-500 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthenticationPage;
