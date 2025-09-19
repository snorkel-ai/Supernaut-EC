import React, { useState, useEffect } from 'react';
import './App.css';
import Guidelines from './components/Guidelines';
import DetailedTaskView from './components/DetailedTaskView';

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
        selected?: boolean | null;
        absolute_rating?: string | null;
        model_metadata?: {
          model_id?: string;
          hyperparameters?: {
            temperature?: number;
          };
        };
      }>;
      turn_grading_guidance?: string;
      model_a_edited?: string;
      model_b_edited?: string;
      model_a_fail_flag?: boolean;
      model_b_fail_flag?: boolean;
      failure_explanation?: string;
      sxs_rating?: {
        text?: string;
      };
    }>;
  };
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'tasks' | 'guidelines'>('tasks');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
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

  // Group tasks by failure type for flat organized display
  const groupedTasks = tasks.reduce((groups: any, task) => {
    const failureType = task.failure_type || 'Unknown Failure Type';
    if (!groups[failureType]) {
      groups[failureType] = [];
    }
    groups[failureType].push(task);
    return groups;
  }, {});

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  const renderTasksView = () => (
    <>
      <div className="tasks-flat-view">
        {Object.keys(groupedTasks).map(failureType => (
          <div key={failureType} className="failure-type-section">
            <h2 className="section-header">{failureType}</h2>
            
            <div className="task-list">
              {groupedTasks[failureType].map((task: Task) => (
                <div key={task.task_id} className="task-item">
                  <div 
                    className="task-header" 
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="task-meta-line">
                      <span className="category-tag">{task.intent_category}</span>
                      <span className="subcategory-tag">{task.intent_subcategory}</span>
                      <span className="difficulty-tag">{task.perceived_difficulty}</span>
                    </div>
                    <h3 className="task-prompt">
                      {task.conversation?.turns?.[0]?.messages?.[0]?.content || task.task_id}
                    </h3>
                    <div className="task-id-small">
                      {task.task_id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="task-summary">
        Total tasks: {tasks.length}
      </div>
    </>
  );

  return (
    <div className="App">
      <header>
        <h1>Project Supernaut</h1>
      </header>

      <div className="app-nav">
        <button 
          className={`nav-button ${currentView === 'tasks' ? 'active' : ''}`}
          onClick={() => setCurrentView('tasks')}
        >
          Example Bank
        </button>
        <button 
          className={`nav-button ${currentView === 'guidelines' ? 'active' : ''}`}
          onClick={() => setCurrentView('guidelines')}
        >
          Guidelines
        </button>
      </div>

      {selectedTask ? (
        <DetailedTaskView 
          task={selectedTask} 
          onBack={() => setSelectedTask(null)}
        />
      ) : currentView === 'tasks' ? (
        renderTasksView()
      ) : (
        <Guidelines />
      )}
    </div>
  );
}

export default App;