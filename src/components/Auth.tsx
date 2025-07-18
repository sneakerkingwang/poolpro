import React, { useState } from 'react';
import { Lock, X, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';

// NEW: Import the auth object and Firebase functions
import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";

// The props are the same, they just handle closing the modal
interface AuthProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onClose, onLoginSuccess }) => {
  // NEW: State to toggle between Sign In and Sign Up modes
  const [isSigningUp, setIsSigningUp] = useState(false);
  // CHANGE: State is now for email, not username
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // NEW: A single function to handle both login and registration
  const handleAuth = async () => {
    setError(''); // Clear previous errors before trying

    if (isSigningUp) {
      // Handle User Sign Up (Registration)
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        onLoginSuccess(); // This will close the modal
      } catch (err: any) {
        // Display user-friendly errors from Firebase
        setError(err.message);
      }
    } else {
      // Handle User Sign In (Login)
      try {
        await signInWithEmailAndPassword(auth, email, password);
        onLoginSuccess(); // This will close the modal
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAuth();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            {/* CHANGE: Icon and Title change based on mode */}
            {isSigningUp ? <UserPlus className="w-6 h-6 text-primary" /> : <Lock className="w-6 h-6 text-primary" />}
            <h3 className="text-lg font-semibold text-gray-900">
              {isSigningUp ? 'Create Account' : 'Admin & Player Login'}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            {/* CHANGE: Label is now for Email */}
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email" // Use type="email" for better semantics
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter password"
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button onClick={onClose} className="btn bg-gray-200 hover:bg-gray-300 flex-1">
              Cancel
            </button>
            {/* CHANGE: This button now calls handleAuth and changes its text */}
            <button onClick={handleAuth} className="btn btn-primary flex-1">
              {isSigningUp ? 'Create Account' : 'Sign In'}
            </button>
          </div>
          
          {/* NEW: Toggle button to switch between modes */}
          <div className="text-center pt-4">
            <button 
              onClick={() => {
                setIsSigningUp(!isSigningUp);
                setError(''); // Clear errors when switching modes
              }} 
              className="text-sm text-primary hover:underline"
            >
              {isSigningUp 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;