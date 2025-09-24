import React, { useState } from 'react';

interface CSVConversation {
  task_id: string;
  worker_id: string;
  failure_type: string;
  intent_category: string;
  intent_subcategory: string;
  perceived_difficulty: string;
  conversation: {
    turns: any[];
  };
}

interface CSVUploadProps {
  onDataLoaded: (conversations: CSVConversation[]) => void;
  onBack: () => void;
}

const CSVUpload: React.FC<CSVUploadProps> = ({ onDataLoaded, onBack }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
    
    result.push(current);
    return result;
  };

  const parseConversationData = (submissionData: string): any => {
    try {
      const parsed = JSON.parse(submissionData);
      
      // Extract conversation turns
      const conversationKey = Object.keys(parsed).find(key => key.includes('multiTurnConversation'));
      if (!conversationKey) return null;
      
      const turns = parsed[conversationKey];
      const processedTurns: any[] = [];
      
      // Group turns by user prompts and responses
      let currentTurnId = 1;
      let userPrompt = null;
      
      for (const turn of turns) {
        if (turn.turnType === 'user-prompt') {
          userPrompt = turn.conversationBlocks?.[0]?.content || turn['preset-textarea-prompt'] || '';
        } else if (turn.turnType === 'failure-mode-model-responses' && userPrompt) {
          const messages = [
            {
              role: 'user',
              content: userPrompt,
              selected: null,
              absolute_rating: null,
              model_metadata: {}
            }
          ];
          
          // Add assistant responses
          if (turn.conversationBlocks) {
            for (const block of turn.conversationBlocks) {
              if (block.role === 'assistant') {
                messages.push({
                  role: 'assistant',
                  content: block.content,
                  selected: null,
                  absolute_rating: turn['radio-model_a_rating'] || turn['radio-model_b_rating'] || null,
                  model_metadata: {}
                });
              }
            }
          }
          
          // Add model responses from preset data
          const modelA = turn['preset-failure-mode-dual-model-response']?.model_a?.response;
          const modelB = turn['preset-failure-mode-dual-model-response']?.model_b?.response;
          
          if (modelA?.content) {
            messages.push({
              role: 'assistant',
              content: modelA.content,
              selected: null,
              absolute_rating: turn['radio-model_a_rating'] || null,
              model_metadata: { model_id: 'model_a' }
            });
          }
          
          if (modelB?.content) {
            messages.push({
              role: 'assistant',
              content: modelB.content,
              selected: null,
              absolute_rating: turn['radio-model_b_rating'] || null,
              model_metadata: { model_id: 'model_b' }
            });
          }
          
          processedTurns.push({
            turn_id: currentTurnId++,
            messages,
            turn_grading_guidance: turn['textarea-grading_guidance'] || null,
            model_a_edited: turn['textarea-edited_model_response'] || 'N/A',
            model_b_edited: 'N/A',
            model_a_fail_flag: turn['boolean-did_this_turn_contain_a_failure'] || false,
            model_b_fail_flag: false,
            failure_explanation: turn['textarea-failure_comments'] || null,
            sxs_rating: turn['radio-relative_rating'] ? { text: turn['radio-relative_rating'] } : null
          });
          
          userPrompt = null; // Reset for next turn
        }
      }
      
      return processedTurns;
    } catch (e) {
      console.error('Error parsing conversation data:', e);
      return null;
    }
  };

  const extractFailureInfo = (staticData: string): any => {
    try {
      const parsed = JSON.parse(staticData);
      return {
        failure_type: parsed.generated_content?.failure_type || 'Unknown',
        intent_category: parsed.generated_content?.intent_category || 'Unknown',
        intent_subcategory: parsed.generated_content?.intent_subcategory || 'Unknown'
      };
    } catch (e) {
      return {
        failure_type: 'Unknown',
        intent_category: 'Unknown', 
        intent_subcategory: 'Unknown'
      };
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('CSV file must have at least a header row and one data row');
      }

      const headers = parseCSVLine(lines[0]);
      const conversations: CSVConversation[] = [];
      const preview: any[] = [];

      for (let i = 1; i < Math.min(lines.length, 6); i++) { // Process first 5 rows for preview
        const values = parseCSVLine(lines[i]);
        const row: any = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        preview.push(row);
        
        if (i <= 5) { // Only convert first 5 to conversations for now
          const turns = parseConversationData(row['Submission Data']);
          if (turns && turns.length > 0) {
            const failureInfo = extractFailureInfo(row['Static Data']);
            
            conversations.push({
              task_id: row['Submission ID'] || `csv-task-${Date.now()}-${i}`,
              worker_id: row['Submitter User ID'] || `csv-worker-${Date.now()}`,
              failure_type: failureInfo.failure_type,
              intent_category: failureInfo.intent_category,
              intent_subcategory: failureInfo.intent_subcategory,
              perceived_difficulty: 'Medium', // Default value
              conversation: {
                turns
              }
            });
          }
        }
      }

      setPreviewData(preview);
      setShowPreview(true);
      
      if (conversations.length > 0) {
        onDataLoaded(conversations);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process CSV file');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="csv-upload-container">
      <div className="detailed-header">
        <button className="back-button" onClick={onBack}>
          ← Back to Navigation
        </button>
        <h2>CSV Data Import</h2>
      </div>

      <div className="upload-section">
        <h3>Upload Conversation CSV</h3>
        <p>Upload a CSV file containing conversation data in the Supernaut format.</p>
        
        <div className="file-upload">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isProcessing}
            id="csv-file-input"
          />
          <label htmlFor="csv-file-input" className="upload-button">
            {isProcessing ? 'Processing...' : 'Choose CSV File'}
          </label>
        </div>

        {error && (
          <div className="error-message">
            <h4>Error:</h4>
            <p>{error}</p>
          </div>
        )}

        {showPreview && previewData.length > 0 && (
          <div className="preview-section">
            <h3>Data Preview (First 5 rows)</h3>
            <div className="preview-table-container">
              <table className="preview-table">
                <thead>
                  <tr>
                    <th>Submission ID</th>
                    <th>Task Type</th>
                    <th>Created At</th>
                    <th>State</th>
                    <th>Data Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index}>
                      <td>{row['Submission ID']?.substring(0, 8)}...</td>
                      <td>{row['Task Type']}</td>
                      <td>{row['Created At']?.substring(0, 10)}</td>
                      <td>{row['State Enum']}</td>
                      <td>
                        {row['Submission Data'] ? 
                          `${row['Submission Data'].substring(0, 50)}...` : 
                          'No data'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="preview-note">
              ✅ Successfully processed {previewData.length} rows. 
              Conversations with valid data have been added to your Imported Data.
            </p>
          </div>
        )}
      </div>

      <div className="csv-info">
        <h3>Expected CSV Format</h3>
        <p>The CSV should contain columns for:</p>
        <ul>
          <li><strong>Submission ID</strong> - Unique identifier for each conversation</li>
          <li><strong>Submission Data</strong> - JSON data containing the conversation turns</li>
          <li><strong>Static Data</strong> - JSON data containing failure type and intent information</li>
          <li><strong>Task Type</strong> - Type of task</li>
          <li><strong>State Enum</strong> - Status of the submission</li>
        </ul>
      </div>
    </div>
  );
};

export default CSVUpload;
