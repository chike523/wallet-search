import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const InitializationPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const licenseKey = localStorage.getItem('licenseKey');

  // Use useMemo to prevent recreation of steps array on each render
  const steps = useMemo(() => [
    { name: 'Checking system dependencies', duration: 3000 },
    { name: 'Verifying license validity', duration: 2000 },
    { name: 'Checking device processor', duration: 2500 },
    { name: 'Setting up wallet search configurations', duration: 3500 },
    { name: 'Initializing blockchain connectivity', duration: 2000 },
    { name: 'Preparing search algorithms', duration: 3000 },
  ], []); // Empty dependency array means this will only be calculated once

  // Function to mark a license key as initialized
  const markLicenseAsInitialized = (key) => {
    // Get current initialized keys
    const initializedKeys = JSON.parse(localStorage.getItem('initializedLicenseKeys') || '[]');
    
    // Add current key if not already in list
    if (!initializedKeys.includes(key)) {
      initializedKeys.push(key);
      localStorage.setItem('initializedLicenseKeys', JSON.stringify(initializedKeys));
    }
  };

  useEffect(() => {
    // Redirect to login if no license key is found
    if (!licenseKey) {
      navigate('/');
      return;
    }

    if (currentStep < steps.length) {
      const stepTimer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setStepProgress(0);
        setProgress(((currentStep + 1) / steps.length) * 100);
      }, steps[currentStep].duration);
      
      // Animate progress within each step
      const interval = 50; // update every 50ms
      const stepInterval = setInterval(() => {
        setStepProgress(prev => {
          const newProgress = prev + (interval / steps[currentStep].duration) * 100;
          return newProgress > 100 ? 100 : newProgress;
        });
      }, interval);
      
      return () => {
        clearTimeout(stepTimer);
        clearInterval(stepInterval);
      };
    } else {
      // All steps completed
      // Mark this license key as initialized
      markLicenseAsInitialized(licenseKey);
      
      // Redirect after a short delay
      const finalDelay = setTimeout(() => {
        navigate('/search');
      }, 1000);
      
      return () => clearTimeout(finalDelay);
    }
  }, [currentStep, navigate, steps, licenseKey]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-8 text-center">Initializing Wallet Finder</h1>
        
        {/* Main progress bar */}
        <div className="mb-8">
          <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="mt-2 text-right text-sm text-slate-400">
            {Math.round(progress)}% Complete
          </div>
        </div>
        
        {/* Steps display */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className={`font-medium ${index < currentStep ? 'text-green-400' : index === currentStep ? 'text-blue-400' : 'text-slate-500'}`}>
                  {step.name}
                </span>
                <span className="text-xs">
                  {index < currentStep ? (
                    <span className="text-green-400">✓ Complete</span>
                  ) : index === currentStep ? (
                    <span className="text-blue-400">In progress...</span>
                  ) : (
                    <span className="text-slate-500">Pending</span>
                  )}
                </span>
              </div>
              
              {/* Step progress bar */}
              {index === currentStep && (
                <div className="h-1 w-full bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-100"
                    style={{ width: `${stepProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {currentStep >= steps.length && (
          <div className="mt-6 text-center text-green-400 font-bold">
            Initialization complete! Redirecting to wallet finder...
          </div>
        )}
        
        <div className="mt-6 text-center text-xs text-slate-500">
          Device setup for license key: {licenseKey}
        </div>
      </div>
    </div>
  );
};

export default InitializationPage;