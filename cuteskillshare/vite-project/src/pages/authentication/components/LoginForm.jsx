import React, { useState } from 'react';
import { SignInButton, SignUpButton } from '@clerk/clerk-react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground caption mb-2">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleInputChange}
          className="focus:outline-none focus:ring-0 focus:border-transparent"
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground caption mb-2">
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange}
            className="pr-12 focus:outline-none focus:ring-0 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
          </button>
        </div>
      </div>

      <SignInButton mode="modal">
        <Button
          type="button"
          variant="primary"
          fullWidth
          className="min-touch-target"
        >
          Sign In
        </Button>
      </SignInButton>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-card text-muted-foreground caption">Don't have an account?</span>
        </div>
      </div>
      
      <SignUpButton mode="modal">
        <Button
          type="button"
          variant="outline"
          iconName="UserPlus"
          iconPosition="left"
          fullWidth
          className="min-touch-target"
        >
          Sign Up
        </Button>
      </SignUpButton>
    </div>
  );
};

export default LoginForm;
