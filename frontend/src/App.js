import { useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import BugForm from './components/BugForm';
import BugList from './components/BugList';
import { bugAPI } from './services/api';
import './App.css';

function App() {
  const [refresh, setRefresh] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleCreateBug = async (bugData) => {
    try {
      await bugAPI.createBug(bugData);
      setRefresh(prev => prev + 1);
      setShowForm(false);
      showNotification('Bug reported successfully!');
    } catch (error) {
      console.error('Error creating bug:', error);
      const message = error.response?.data?.error || 'Failed to create bug';
      showNotification(message, 'error');
    }
  };

  return (
    <ErrorBoundary>
      <div className="app">
        <header className="app-header">
          <h1>🐛 Bug Tracker</h1>
          <p>Track and manage software bugs efficiently</p>
        </header>

        {notification && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        )}

        <main className="app-main">
          <div className="form-section">
            <div className="section-header">
              <h2>Report New Bug</h2>
              <button 
                onClick={() => setShowForm(!showForm)}
                className="toggle-btn"
              >
                {showForm ? 'Hide Form' : 'Show Form'}
              </button>
            </div>
            
            {showForm && (
              <BugForm onSubmit={handleCreateBug} />
            )}
          </div>

          <div className="list-section">
            <h2>All Bugs</h2>
            <BugList 
              refresh={refresh}
              onUpdate={() => setRefresh(prev => prev + 1)}
            />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;