import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();
  const isDarkMode = localStorage.getItem('theme') === 'dark';

  return (
    <div className={`min-h-screen w-full px-4 py-6 sm:p-6 ${
      isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-900'
    }`}>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className={`mb-6 inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-colors ${
            isDarkMode 
              ? 'bg-slate-800 hover:bg-slate-700' 
              : 'bg-white hover:bg-gray-100'
          }`}
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className={`mb-8 p-6 rounded-lg ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        } shadow-sm`}>
          <h1 className="text-2xl sm:text-3xl font-bold mb-4">About Core Scientific wallet-search</h1>
          <p className="text-sm sm:text-base opacity-80">
            Learn how our platform works and get answers to frequently asked questions.
          </p>
        </div>

        {/* FAQ Section */}
        <div className={`p-6 rounded-lg ${
          isDarkMode ? 'bg-slate-800' : 'bg-white'
        } shadow-sm`}>
          <h2 className="text-xl font-bold mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">What is Core Scientific wallet-search?</h3>
              <p className="text-sm sm:text-base opacity-80">
                Core Scientific wallet-search is a platform that scans for vulnerable cryptocurrency wallets. 
                We search for wallets with weak or exposed private keys and seed phrases 
                that might be at risk.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">How does it work?</h3>
              <p className="text-sm sm:text-base opacity-80">
                Our system continuously monitors blockchain networks for wallets with funds 
                that might be secured by weak or compromised private keys. When we identify 
                a wallet at risk, we verify it and make it available for withdrawal to protect 
                the funds from malicious actors.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Is this legal?</h3>
              <p className="text-sm sm:text-base opacity-80">
                Our service operates in a gray area of blockchain technology. We don't break 
                into wallets - we only identify those that are already vulnerable due to weak 
                security practices. We recommend using our service ethically and checking your 
                local laws regarding cryptocurrency recovery.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">How do withdrawals work?</h3>
              <p className="text-sm sm:text-base opacity-80">
                When you find a wallet with funds, you can initiate a withdrawal to your own 
                wallet address. Our system will process the transaction on the blockchain, 
                transferring the funds to your specified address. All withdrawals are subject 
                to network fees and confirmation times.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">What cryptocurrencies are supported?</h3>
              <p className="text-sm sm:text-base opacity-80">
                We currently support a range of major cryptocurrencies including BTC, ETH, USDT, 
                BNB, SOL, XRP, ADA, and DOGE. We're constantly working to add more cryptocurrencies 
                to our platform.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Are there any fees?</h3>
              <p className="text-sm sm:text-base opacity-80">
                Yes, our service charges a small percentage fee on successful withdrawals. 
                Additionally, all blockchain transactions incur network fees which vary 
                depending on the cryptocurrency and current network conditions.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">How secure is this platform?</h3>
              <p className="text-sm sm:text-base opacity-80">
                We take security very seriously. Our platform uses industry-standard 
                encryption and security practices. However, we always recommend using 
                strong, unique passwords for your account and enabling two-factor 
                authentication where available.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">What should I do if I find my own wallet?</h3>
              <p className="text-sm sm:text-base opacity-80">
                If you find your own wallet on our platform, this means your private key or 
                seed phrase has been compromised. You should immediately create a new wallet 
                with stronger security measures and transfer your funds to it.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className={`mt-6 p-4 rounded-lg ${
          isDarkMode ? 'bg-slate-700' : 'bg-gray-50'
        }`}>
          <p className="text-xs sm:text-sm opacity-70 text-center">
            Disclaimer: Core Scientific wallet-search is provided for educational and security research purposes only. 
            Always use cryptocurrency services responsibly and ethically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;