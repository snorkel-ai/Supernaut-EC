import React, { useState, useEffect } from 'react';
import './App.css';
import Guidelines from './components/Guidelines';
import DetailedTaskView from './components/DetailedTaskView';
import CSVUpload from './components/CSVUpload';

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
  const [currentView, setCurrentView] = useState<'tasks' | 'guidelines' | 'csv-upload' | 'imported-data'>('tasks');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [importedTasks, setImportedTasks] = useState<Task[]>([]);
  useEffect(() => {
    fetch('./data.json')
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

  const handleCSVDataLoaded = (csvConversations: Task[]) => {
    // Store CSV conversations separately
    setImportedTasks(csvConversations);
    // Switch to imported data view to see the new data
    setCurrentView('imported-data');
  };

  // Group tasks by failure type for flat organized display
  const groupedTasks = tasks.reduce((groups: any, task) => {
    const failureType = task.failure_type || 'Unknown Failure Type';
    if (!groups[failureType]) {
      groups[failureType] = [];
    }
    groups[failureType].push(task);
    return groups;
  }, {});

  // Group imported tasks by failure type for flat organized display  
  const groupedImportedTasks = importedTasks.reduce((groups: any, task) => {
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

  const renderImportedDataView = () => (
    <div className="tasks-flat-view">
      <div className="task-browser-header">
        <h2>Imported Data ({importedTasks.length} conversations)</h2>
        <p>Conversations imported from CSV files</p>
      </div>

      {Object.keys(groupedImportedTasks).length === 0 ? (
        <div className="no-tasks">
          <p>No imported conversations yet. Use CSV Import to add data.</p>
        </div>
      ) : (
        Object.entries(groupedImportedTasks).map(([failureType, failureTasks]: [string, any]) => (
          <div key={failureType} className="failure-type-section">
            <h3 className="section-header">{failureType}</h3>
            
            {/* Group by intent category within each failure type */}
            {Object.entries(
              (failureTasks as Task[]).reduce((categoryGroups: any, task) => {
                const category = task.intent_category || 'Unknown Category';
                if (!categoryGroups[category]) {
                  categoryGroups[category] = [];
                }
                categoryGroups[category].push(task);
                return categoryGroups;
              }, {})
            ).map(([category, categoryTasks]: [string, any]) => (
              <div key={category} className="category-section">
                <h4 className="category-header">{category}</h4>
                
                {/* Group by intent subcategory within each category */}
                {Object.entries(
                  (categoryTasks as Task[]).reduce((subcategoryGroups: any, task) => {
                    const subcategory = task.intent_subcategory || 'Unknown Subcategory';
                    if (!subcategoryGroups[subcategory]) {
                      subcategoryGroups[subcategory] = [];
                    }
                    subcategoryGroups[subcategory].push(task);
                    return subcategoryGroups;
                  }, {})
                ).map(([subcategory, subcategoryTasks]: [string, any]) => (
                  <div key={subcategory} className="subcategory-section">
                    <h5 className="subcategory-header">{subcategory}</h5>
                    
                    {(subcategoryTasks as Task[]).map((task) => (
                      <div 
                        key={task.task_id} 
                        className="task-item"
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="task-prompt">
                          {task.conversation?.turns?.[0]?.messages?.[0]?.content || task.task_id}
                        </div>
                        <div className="task-id-small">{task.task_id}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
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
        <button 
          className={`nav-button ${currentView === 'csv-upload' ? 'active' : ''}`}
          onClick={() => setCurrentView('csv-upload')}
        >
          CSV Import
        </button>
        {importedTasks.length > 0 && (
          <button 
            className={`nav-button ${currentView === 'imported-data' ? 'active' : ''}`}
            onClick={() => setCurrentView('imported-data')}
          >
            Imported Data ({importedTasks.length})
          </button>
        )}
      </div>

      {selectedTask ? (
        <DetailedTaskView 
          task={selectedTask} 
          onBack={() => setSelectedTask(null)}
        />
      ) : currentView === 'tasks' ? (
        renderTasksView()
      ) : currentView === 'guidelines' ? (
        <Guidelines />
      ) : currentView === 'imported-data' ? (
        renderImportedDataView()
      ) : (
        <CSVUpload 
          onDataLoaded={handleCSVDataLoaded}
          onBack={() => setCurrentView('tasks')}
        />
      )}
    </div>
  );
}

export default App;