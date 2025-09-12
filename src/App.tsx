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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
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

  const filteredTasks = tasks; // No filtering needed since we removed search

  // Group tasks hierarchically
  const groupedTasks = filteredTasks.reduce((groups: any, task) => {
    const failureType = task.failure_type || 'Unknown Failure Type';
    const category = task.intent_category || 'Unknown Category';
    const subcategory = task.intent_subcategory || 'Unknown Subcategory';
    
    if (!groups[failureType]) {
      groups[failureType] = {};
    }
    if (!groups[failureType][category]) {
      groups[failureType][category] = {};
    }
    if (!groups[failureType][category][subcategory]) {
      groups[failureType][category][subcategory] = [];
    }
    
    groups[failureType][category][subcategory].push(task);
    return groups;
  }, {});

  // Debug: Count total tasks in groups
  const totalTasksInGroups = Object.values(groupedTasks).reduce((total: number, failureTypes: any) => {
    return total + Object.values(failureTypes).reduce((ftTotal: number, categories: any) => {
      return ftTotal + Object.values(categories).reduce((catTotal: number, tasks: any) => {
        return catTotal + tasks.length;
      }, 0);
    }, 0);
  }, 0);

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  const renderTasksView = () => (
    <>

      <div className="task-groups">
        {Object.keys(groupedTasks).map(failureType => (
          <div key={failureType} className="failure-type-group">
            <div 
              className="group-header failure-type-header"
              onClick={() => toggleGroup(`failure-${failureType}`)}
            >
              <span className="group-title">{failureType}</span>
              <span className="task-count">({Object.values(groupedTasks[failureType]).reduce((count: number, categories: any) => count + Object.values(categories).flat().length, 0)} tasks)</span>
              <span className="expand-icon">
                {expandedGroups.has(`failure-${failureType}`) ? '▼' : '▶'}
              </span>
            </div>
            
            {expandedGroups.has(`failure-${failureType}`) && (
              <div className="group-content">
                {Object.keys(groupedTasks[failureType]).map(category => (
                  <div key={category} className="category-group">
                    <div 
                      className="group-header category-header"
                      onClick={() => toggleGroup(`category-${failureType}-${category}`)}
                    >
                      <span className="group-title">{category}</span>
                      <span className="task-count">({Object.values(groupedTasks[failureType][category]).reduce((count: number, tasks: any) => count + tasks.length, 0)} tasks)</span>
                      <span className="expand-icon">
                        {expandedGroups.has(`category-${failureType}-${category}`) ? '▼' : '▶'}
                      </span>
                    </div>
                    
                    {expandedGroups.has(`category-${failureType}-${category}`) && (
                      <div className="group-content">
                        {Object.keys(groupedTasks[failureType][category]).map(subcategory => (
                          <div key={subcategory} className="subcategory-group">
                            <div 
                              className="group-header subcategory-header"
                              onClick={() => toggleGroup(`subcategory-${failureType}-${category}-${subcategory}`)}
                            >
                              <span className="group-title">{subcategory}</span>
                              <span className="task-count">({groupedTasks[failureType][category][subcategory].length} tasks)</span>
                              <span className="expand-icon">
                                {expandedGroups.has(`subcategory-${failureType}-${category}-${subcategory}`) ? '▼' : '▶'}
                              </span>
                            </div>
                            
                            {expandedGroups.has(`subcategory-${failureType}-${category}-${subcategory}`) && (
                              <div className="group-content">
                                <div className="task-list">
                                  {groupedTasks[failureType][category][subcategory].map((task: Task) => (
                                    <div key={task.task_id} className="task-item">
                                      <div 
                                        className="task-header" 
                                        onClick={() => setSelectedTask(task)}
                                      >
                                        <h3 className="task-prompt">
                                          {task.conversation?.turns?.[0]?.messages?.[0]?.content || task.task_id}
                                        </h3>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="task-summary">
        <p>Total filtered tasks: {filteredTasks.length} | Tasks in groups: {totalTasksInGroups}</p>
        {filteredTasks.length !== totalTasksInGroups && (
          <p style={{color: 'red', fontSize: '0.8rem'}}>
            Warning: Task count mismatch! Some tasks may have missing metadata.
          </p>
        )}
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