import React, { useState, useEffect } from 'react';
import './App.css';

interface Task {
  task_id: string;
  worker_id: string;
  failure_type: string;
  intent_category: string;
  intent_subcategory: string;
  perceived_difficulty: string;
  conversation: {
    turns: Array<{
      turn_id: number;
      messages: Array<{
        role: string;
        content: string;
      }>;
    }>;
  };
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetch('/data.json')
      .then(response => response.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load data');
        setLoading(false);
      });
  }, []);

  const filteredTasks = tasks.filter(task => 
    task.task_id.toLowerCase().includes(search.toLowerCase()) ||
    task.failure_type.toLowerCase().includes(search.toLowerCase()) ||
    task.intent_category.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTasks = filteredTasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="App">
      <header>
        <h1>Project Supernaut</h1>
      </header>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="task-list">
        {currentTasks.map(task => (
          <div key={task.task_id} className="task-item">
            <div 
              className="task-header" 
              onClick={() => setExpandedTask(expandedTask === task.task_id ? null : task.task_id)}
            >
              <h3>{task.task_id}</h3>
              <div className="task-meta">
                <span>Type: {task.failure_type}</span>
                <span>Category: {task.intent_category}</span>
                <span>Difficulty: {task.perceived_difficulty}</span>
              </div>
            </div>
            
            {expandedTask === task.task_id && (
              <div className="task-content">
                <div className="conversation">
                  {task.conversation.turns.map(turn =>
                    turn.messages.map((message, idx) => (
                      <div key={`${turn.turn_id}-${idx}`} className={`message ${message.role}`}>
                        <strong>{message.role}:</strong>
                        <p>{message.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pagination">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default App;