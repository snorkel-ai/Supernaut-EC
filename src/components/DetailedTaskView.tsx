import React, { useState } from 'react';

interface Message {
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
}

interface Turn {
  turn_id: number;
  messages: Message[];
  turn_grading_guidance?: string;
  model_a_edited?: string;
  model_b_edited?: string;
  model_a_fail_flag?: boolean;
  model_b_fail_flag?: boolean;
  failure_explanation?: string;
  sxs_rating?: {
    text?: string;
  };
}

interface Task {
  task_id: string;
  worker_id: string;
  failure_type: string;
  intent_category: string;
  intent_subcategory: string;
  perceived_difficulty: string;
  conversation: {
    turns: Turn[];
  };
}

interface DetailedTaskViewProps {
  task: Task;
  onBack: () => void;
}

const DetailedTaskView: React.FC<DetailedTaskViewProps> = ({ task, onBack }) => {
  const [expandedTurns, setExpandedTurns] = useState<Set<number>>(new Set([1])); // First turn expanded by default

  const toggleTurn = (turnId: number) => {
    const newExpanded = new Set(expandedTurns);
    if (newExpanded.has(turnId)) {
      newExpanded.delete(turnId);
    } else {
      newExpanded.add(turnId);
    }
    setExpandedTurns(newExpanded);
  };

  const getUserPrompt = (turn: Turn) => {
    return turn.messages.find(msg => msg.role === 'user');
  };

  const getAssistantResponses = (turn: Turn) => {
    return turn.messages.filter(msg => msg.role === 'assistant');
  };

  const getRatingButtonClass = (rating: string | null | undefined) => {
    const baseClass = 'rating-button';
    switch(rating?.toLowerCase()) {
      case 'amazing': return `${baseClass} rating-amazing`;
      case 'good': return `${baseClass} rating-good`;
      case 'pretty good': return `${baseClass} rating-pretty-good`;
      case 'okay': return `${baseClass} rating-okay`;
      case 'bad': return `${baseClass} rating-bad`;
      case 'pretty bad': return `${baseClass} rating-pretty-bad`;
      case 'horrible': return `${baseClass} rating-horrible`;
      default: return `${baseClass} rating-unrated`;
    }
  };

  const getFailureStatusClass = (failFlag: boolean | undefined) => {
    return failFlag ? 'failure-status failure' : 'failure-status success';
  };

  return (
    <div className="detailed-task-view">
      {/* Header with back button */}
      <div className="detailed-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Task List
        </button>
        <h2>Task Details</h2>
      </div>

      {/* Task Metadata */}
      <div className="task-metadata">
        <div className="info-item">
          <div className="info-label">FAILURE MODE</div>
          <div className="info-value">{task.failure_type}</div>
        </div>
        <div className="info-item">
          <div className="info-label">INTENT CATEGORY</div>
          <div className="info-value">{task.intent_category}</div>
        </div>
        <div className="info-item">
          <div className="info-label">INTENT SUBCATEGORY</div>
          <div className="info-value">{task.intent_subcategory}</div>
        </div>
        <div className="info-item">
          <div className="info-label">PERCEIVED DIFFICULTY</div>
          <div className="info-value">{task.perceived_difficulty}</div>
        </div>
      </div>


      {/* Conversation Section */}
      <div className="conversation-section">
        <h3>Conversation</h3>
        
        {task.conversation.turns.map((turn) => {
          const userPrompt = getUserPrompt(turn);
          const assistantResponses = getAssistantResponses(turn);
          const isExpanded = expandedTurns.has(turn.turn_id);
          const hasFailure = turn.model_a_fail_flag || turn.model_b_fail_flag;

          return (
            <div key={turn.turn_id} className="turn-container">
              {/* Turn Header */}
              <div 
                className={`turn-header ${hasFailure ? 'failure-turn' : ''}`}
                onClick={() => toggleTurn(turn.turn_id)}
              >
                <span>Turn {turn.turn_id}{hasFailure ? ' (FAILURE)' : ''}</span>
                <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
              </div>

              {/* Turn Content (collapsible) */}
              {isExpanded && (
                <div className="turn-content">
                  {/* User Prompt */}
                  {userPrompt && (
                    <div className="user-prompt-section">
                      <div className="section-header">
                        <span>User Prompt</span>
                        <span className="expand-icon">▼</span>
                      </div>
                      <div className="user-prompt-content">
                        {userPrompt.content}
                      </div>
                    </div>
                  )}

                  {/* Turn Grading Guidance */}
                  {turn.turn_grading_guidance && (
                    <div className="turn-grading-guidance-section">
                      <div className="section-header">
                        <span>Turn Grading Guidance</span>
                        <span className="expand-icon">▼</span>
                      </div>
                      <div className="grading-guidance-content">
                        {turn.turn_grading_guidance}
                      </div>
                    </div>
                  )}

                  {/* Model Responses */}
                  <div className="model-responses-section">
                    <div className="section-header">
                      <span>Model Responses</span>
                      <span className="expand-icon">▼</span>
                    </div>
                    
                    <div className="model-responses-grid">
                      {assistantResponses.map((response, index) => {
                        const modelLetter = String.fromCharCode(65 + index); // A, B, C...
                        const isModelA = index === 0;
                        
                        return (
                          <div key={index} className="model-response">
                            <div className="model-header">
                              <span>MODEL {modelLetter} {isModelA ? '▼' : ''}</span>
                            </div>
                            
                            <div className="model-content">
                              {response.content}
                            </div>
                            
                            <div className="model-footer">
                              <div className="rating-section">
                                <button className={getRatingButtonClass(response.absolute_rating)}>
                                  {response.absolute_rating || 'Unrated'}
                                </button>
                              </div>
                              
                              <div className="failure-section">
                                <span className={getFailureStatusClass(isModelA ? turn.model_a_fail_flag : turn.model_b_fail_flag)}>
                                  {(isModelA ? turn.model_a_fail_flag : turn.model_b_fail_flag) ? '❌ Failure' : '✅ No Failure'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Side-by-Side Rating */}
                    {turn.sxs_rating?.text && (
                      <div className="sxs-rating-section">
                        <div className="sxs-label">Side-by-Side Rating:</div>
                        <div className="sxs-value">{turn.sxs_rating.text}</div>
                      </div>
                    )}

                    {/* Failure Explanation */}
                    {turn.failure_explanation && (
                      <div className="failure-explanation-section">
                        <div className="failure-label">Failure Explanation:</div>
                        <div className="failure-text">{turn.failure_explanation}</div>
                      </div>
                    )}

                    {/* Edited Response Section */}
                    {(turn.model_a_edited !== 'N/A' || turn.model_b_edited !== 'N/A') && (
                      <div className="edited-response-section">
                        <div className="edited-label">
                          {turn.model_a_edited !== 'N/A' ? 'Model A Edited Response' : 'Model B Edited Response'}
                        </div>
                        <div className="edited-content">
                          {turn.model_a_edited !== 'N/A' ? turn.model_a_edited : turn.model_b_edited}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DetailedTaskView;
