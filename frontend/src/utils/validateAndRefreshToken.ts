const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:5000';

export const validateAndRefreshToken = async (): Promise<string | null> => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    // Primeira validação do token
    const validationResponse = await fetch(`${BACKEND_API_URL}/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!validationResponse.ok) throw new Error('Token inválido');
    
    const { isValid, user } = await validationResponse.json();
    
    if (!isValid) {
      // Tentar renovar o token se for inválido
      const refreshResponse = await fetch(`${BACKEND_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!refreshResponse.ok) throw new Error('Falha ao renovar token');
      
      const { token: newToken } = await refreshResponse.json();
      localStorage.setItem('token', newToken);
      return newToken;
    }
    
    return token;
  } catch (error) {
    console.error('Erro na validação do token:', error);
    localStorage.removeItem('token');
    return null;
  }
};
