'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SocialMediaPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen the popup before
    const hasSeenPopup = localStorage.getItem('hasSeenSocialPopup');
    
    if (!hasSeenPopup) {
      // Show popup after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    // Remember that user has seen the popup
    localStorage.setItem('hasSeenSocialPopup', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]"
          >
            <div className="social-card">
              <style jsx>{`
                .social-card {
                  --dark: #212121;
                  --darker: #111111;
                  --semidark: #2c2c2c;
                  --lightgray: #e8e8e8;
                  --unit: 10px;

                  background-color: var(--darker);
                  box-shadow: 0 0 var(--unit) var(--darker);
                  border: calc(var(--unit) / 2) solid var(--darker);
                  border-radius: var(--unit);
                  position: relative;
                  padding: var(--unit);
                  overflow: hidden;
                }

                .social-card::before {
                  content: "";
                  position: absolute;
                  width: 120%;
                  height: 20%;
                  top: 40%;
                  left: -10%;
                  background: linear-gradient(144deg, #af40ff, #5b42f3 50%, #00ddeb);
                  animation: keyframes-floating-light 2.5s infinite ease-in-out;
                  filter: blur(20px);
                }

                @keyframes keyframes-floating-light {
                  0% {
                    transform: rotate(-5deg) translateY(-5%);
                    opacity: 0.5;
                  }

                  50% {
                    transform: rotate(5deg) translateY(5%);
                    opacity: 1;
                  }

                  100% {
                    transform: rotate(-5deg) translateY(-5%);
                    opacity: 0.5;
                  }
                }

                .social-card::after {
                  content: "";
                  position: absolute;
                  width: 100%;
                  height: 100%;
                  top: 0%;
                  left: 0%;
                  background: linear-gradient(144deg, #af40ff, #5b42f3 50%, #00ddeb);
                  filter: blur(20px);
                  pointer-events: none;
                  animation: keyframes-intro 1s ease-in forwards;
                }

                @keyframes keyframes-intro {
                  100% {
                    transform: translate(-100%);
                    opacity: 0;
                  }
                }

                .social-card .image {
                  width: 200px;
                  animation: keyframes-floating-img 10s ease-in-out infinite;
                  position: relative;
                  z-index: 1;
                }

                @keyframes keyframes-floating-img {
                  0% {
                    transform: translate(-2%, 2%) scaleY(0.95) rotate(-5deg);
                  }

                  50% {
                    transform: translate(2%, -2%) scaleY(1) rotate(5deg);
                  }

                  100% {
                    transform: translate(-2%, 2%) scaleY(0.95) rotate(-5deg);
                  }
                }

                .social-card .heading {
                  font-weight: 600;
                  font-size: small;
                  text-align: center;
                  margin-top: calc(var(--unit) * -2);
                  padding-block: var(--unit);
                  color: var(--lightgray);
                  animation: keyframes-flash-text 0.5s infinite;
                  position: relative;
                  z-index: 1;
                }

                @keyframes keyframes-flash-text {
                  50% {
                    opacity: 0.5;
                  }
                }

                .social-card .icons {
                  display: flex;
                  gap: var(--unit);
                  position: relative;
                  z-index: 1;
                }

                .social-card .icons a {
                  display: flex;
                  flex-grow: 1;
                  align-items: center;
                  justify-content: center;
                  background-color: var(--dark);
                  color: var(--lightgray);
                  padding: calc(var(--unit) / 2);
                  border-radius: calc(var(--unit) / 2);
                  cursor: pointer;
                  transition: 0.2s;
                }

                .social-card .icons a:hover {
                  background-color: var(--semidark);
                }

                .close-button {
                  position: absolute;
                  top: 8px;
                  right: 8px;
                  background: var(--dark);
                  border: none;
                  color: var(--lightgray);
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  cursor: pointer;
                  z-index: 2;
                  font-size: 14px;
                  transition: 0.2s;
                }

                .close-button:hover {
                  background: var(--semidark);
                }
              `}</style>

              {/* Close button */}
              <button onClick={handleClose} className="close-button" aria-label="Close">
                ✕
              </button>

              <img
                className="image"
                alt="Astronaut"
                src="https://uiverse.io/astronaut.png"
              />
              <div className="heading">We're on Social Media</div>
              <div className="icons">
                <a className="x" onClick={(e) => e.preventDefault()}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    height="24"
                    width="24"
                  >
                    <path
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeWidth="2"
                      stroke="currentColor"
                      d="M19.8003 3L13.5823 10.105L19.9583 19.106C20.3923 19.719 20.6083 20.025 20.5983 20.28C20.594 20.3896 20.5657 20.4969 20.5154 20.5943C20.4651 20.6917 20.3941 20.777 20.3073 20.844C20.1043 21 19.7293 21 18.9793 21H17.2903C16.8353 21 16.6083 21 16.4003 20.939C16.2168 20.8847 16.0454 20.7957 15.8953 20.677C15.7253 20.544 15.5943 20.358 15.3313 19.987L10.6813 13.421L4.64033 4.894C4.20733 4.281 3.99033 3.975 4.00033 3.72C4.00478 3.61035 4.03323 3.50302 4.08368 3.40557C4.13414 3.30812 4.20536 3.22292 4.29233 3.156C4.49433 3 4.87033 3 5.62033 3H7.30833C7.76333 3 7.99033 3 8.19733 3.061C8.38119 3.1152 8.55295 3.20414 8.70333 3.323C8.87333 3.457 9.00433 3.642 9.26733 4.013L13.5833 10.105M4.05033 21L10.6823 13.421"
                    ></path>
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
