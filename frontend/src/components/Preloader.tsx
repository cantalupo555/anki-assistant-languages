// Import necessary React hooks and components
import React, { useEffect, useState } from 'react';

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

export const Preloader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleLoad = () => {
      setIsLoading(false);
    };

    window.addEventListener('load', handleLoad);
    document.addEventListener('DOMContentLoaded', handleLoad);

    return () => {
      window.removeEventListener('load', handleLoad);
      document.removeEventListener('DOMContentLoaded', handleLoad);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <PreloaderContainer id="preloader">
      <Loader />
    </PreloaderContainer>
  );
};
