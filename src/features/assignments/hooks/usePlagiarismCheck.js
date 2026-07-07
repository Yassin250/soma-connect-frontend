import { useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';

const API_BASE_URL = 'http://localhost:5050/api/admin';

export const usePlagiarismCheck = () => {
  const { token } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const scanDocument = useCallback(async (file, options = {}) => {
    setScanning(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (options.title) formData.append('title', options.title);
      if (options.studentName) formData.append('studentName', options.studentName);
      if (options.course) formData.append('course', options.course);

      const response = await fetch(`${API_BASE_URL}/plagiarism/scan`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Scan failed: ${response.status}`);
      }

      const data = await response.json();
      const scanResult = data.data || data;
      setResult(scanResult);
      return scanResult;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setScanning(false);
    }
  }, [token]);

  const reset = useCallback(() => {
    setScanning(false);
    setResult(null);
    setError(null);
  }, []);

  return { scanDocument, scanning, result, error, reset };
};