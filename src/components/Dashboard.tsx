import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

type ToggleState = boolean[];

interface LocationState {
  loginId: string;
  accountName: string;
}

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Use type assertion for location.state
  const { loginId, accountName } = location.state as LocationState;

  const [timer, setTimer] = useState<number>(0);
  const [toggles, setToggles] = useState<ToggleState>([false, false, false]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [serverMessage, setServerMessage] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch initial toggle states from server
    fetch(`/api/toggles/${loginId}`)
      .then(response => response.json())
      .then(data => setToggles(data))
      .catch(error => console.error('Error fetching toggles:', error));

    // Fetch message from server
    fetch('/api/hello')
      .then(response => response.json())
      .then(data => setServerMessage(data.message))
      .catch(error => console.error('Error:', error));

    // Set up polling to check for updates every 5 seconds
    const pollInterval = setInterval(() => {
      fetch(`/api/toggles/${loginId}`)
        .then(response => response.json())
        .then(data => setToggles(data))
        .catch(error => console.error('Error polling toggles:', error));
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [loginId]);

  const handleLogout = () => {
    navigate('/');
  };

  const handleToggle = (index: number) => {
    const newToggles = toggles.map((toggle, i) => i === index ? !toggle : toggle);
    setToggles(newToggles);

    // Update server with new toggle states
    fetch(`/api/toggles/${loginId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ toggles: newToggles }),
    })
      .catch(error => console.error('Error updating toggles:', error));
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`shopify-container ${theme === 'dark' ? 'dark' : ''}`}>
      <aside className={`shopify-sidebar ${isSidebarOpen ? 'block' : 'hidden'} md:block
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}>
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">MyVillageHome</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="mt-8">
          <a href="#" className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 dark:text-gray-200 dark:bg-gray-700">
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </a>
        </nav>
      </aside>

      <main className="shopify-main bg-gray-100 dark:bg-gray-900">
        <header className="shopify-header bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button onClick={() => setIsSidebarOpen(true)} className="mr-2 md:hidden">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-lg font-medium">Welcome, {accountName}</h2>
            </div>
            <div className="flex items-center">
              <button
                onClick={toggleTheme}
                className="mr-4 p-2 rounded-full bg-gray-200 dark:bg-gray-600"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <div className="shopify-content">
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Session Information</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-300">
                <p>Current session time: {formatTime(timer)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Toggles</h3>
              <div className="space-y-4">
                {toggles.map((toggle, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Toggle {index + 1}</span>
                    <button
                      onClick={() => handleToggle(index)}
                      className={`${
                        toggle ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-600'
                      } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                      <span
                        className={`${
                          toggle ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg mt-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Server Message</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500 dark:text-gray-300">
                <p>{serverMessage}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;