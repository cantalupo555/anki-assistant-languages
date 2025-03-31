// Import necessary React hooks and components
// Removed unused imports: React, useEffect, useState

// Import styled components
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const PreloaderContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #ffffff;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 1;
  visibility: visible;
  transition: opacity 0.5s ease, visibility 0.5s ease;

  &.fade-out {
    opacity: 0;
    visibility: hidden;
  }
`;

export const Loader = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
`;

// Simplified Preloader: Always renders the spinner.
// The parent component (AuthWrapper) should conditionally render this based on loading state (e.g., isCheckingAuth).

// --- FORCEFULLY DISABLED FOR DEBUGGING ---
export const Preloader = () => {
  // Return null to render nothing, regardless of where it might be called from.
  return null;

  // Original code:
  // return (
  //   <PreloaderContainer id="preloader">
  //     <Loader />
  //   </PreloaderContainer>
  // );
};
