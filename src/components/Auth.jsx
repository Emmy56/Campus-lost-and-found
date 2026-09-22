import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, Mail, ShieldCheck } from 'lucide-react';
import { defaultUser, defaultAdmin } from '../data/mockData';

const MATRIC_REGEX = /^[A-Za-z]{3}\/\d{4}\/\d{3}$/;

export default function Auth({ initialScreen, onAuthSuccess, onSwitchScreen }) {
  const [screen, setScreen] = useState(initialScreen);
  const [fullname, setFullname] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    const cleanMatric = matricNumber.trim().toUpperCase();
    const isSpecialAdmin = cleanMatric === 'ADMIN' || cleanMatric === 'ADMIN/OAU/001';

    if (screen === 'signup') {
      if (!fullname || !matricNumber || !email || !password || !confirmPassword) {
        setErrorMsg('Please fill in all required fields.');
        return;
      }
      
      // Strict Matric Format Validation: XXX/0000/000
      if (!MATRIC_REGEX.test(cleanMatric)) {
        setErrorMsg('Matriculation Number must follow the format XXX/0000/000 (e.g. CSC/2022/012)');
        return;
      }

      // Strict OAU Student Email Validation: ONLY @student.oauife.edu.ng
      const isOauStudentEmail = email.toLowerCase().trim().endsWith('@student.oauife.edu.ng');
      if (!isOauStudentEmail) {
        setErrorMsg('Registration is restricted exclusively to valid OAU student emails ending with @student.oauife.edu.ng');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }

      const newUser = {
        id: 'user-' + Date.now(),
        name: fullname,
        matricNumber: cleanMatric,
        studentId: cleanMatric,
        email: email.toLowerCase().trim(),
        password: password,
        role: 'student',
        isBanned: false
      };
      onAuthSuccess(newUser);
    } else {
      if (!email || !password) {
        setErrorMsg('Please enter your Student Email Address and Password.');
        return;
      }
      
      const cleanEmail = email.toLowerCase().trim();
      const isAdminEmail = cleanEmail === 'admin@student.oauife.edu.ng' || cleanEmail === 'admin';

      if (!isAdminEmail && !cleanEmail.endsWith('@student.oauife.edu.ng')) {
        setErrorMsg('Sign in requires a valid @student.oauife.edu.ng email address.');
        return;
      }

      const loggedUser = {
        id: 'user-' + Date.now(),
        email: cleanEmail,
        password: password,
        matricNumber: cleanEmail.split('@')[0].toUpperCase(),
        role: isAdminEmail ? 'admin' : 'student'
      };
      onAuthSuccess(loggedUser);
    }
  };

  return (
    <div className="bg-white min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-2 text-center px-4">
        <h2 className="text-3xl font-extrabold text-black tracking-tight">
          {screen === 'signin' ? 'Sign in to Campus Lost & Found' : 'Register OAU Student Account'}
        </h2>
        <p className="text-sm text-gray-500">
          {screen === 'signin' ? 'Sign in with your @student.oauife.edu.ng email & password' : 'Restricted exclusively to OAU students (@student.oauife.edu.ng)'}
        </p>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-4 border border-gray-100 rounded-2xl sm:px-10 shadow-sm">
          
          {errorMsg && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            
            {/* SIGN UP: Name field */}
            {screen === 'signup' && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Full Name
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    placeholder="e.g. Samuel Adebayo"
                    className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* SIGN UP ONLY: Matric Number field */}
            {screen === 'signup' && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Matriculation Number (Format: XXX/0000/000)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-mono text-xs font-bold select-none">
                    ID
                  </div>
                  <input
                    type="text"
                    required
                    value={matricNumber}
                    onChange={(e) => setMatricNumber(e.target.value)}
                    placeholder="e.g. CSC/2022/012"
                    className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs font-mono font-bold uppercase focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Email field (Sign In & Sign Up) */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Student Email Address (@student.oauife.edu.ng)
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@student.oauife.edu.ng"
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-gray-700">
                Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* SIGN UP: Confirm Password */}
            {screen === 'signup' && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-700">
                  Confirm Password
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Main Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
              >
                {screen === 'signin' ? 'Sign in' : 'Create Account'}
              </button>
            </div>

          </form>

          {/* Screen Switch Trigger Footer */}
          <div className="mt-6 text-center">
            <span className="text-xs text-gray-500 font-medium">
              {screen === 'signin' ? "Don't have an account? " : 'Already registered? '}
            </span>
            <button
              onClick={() => {
                const next = screen === 'signin' ? 'signup' : 'signin';
                setScreen(next);
                onSwitchScreen(next);
                setErrorMsg('');
              }}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              {screen === 'signin' ? 'Register Now' : 'Sign In'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
