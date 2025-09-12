import React, { useState } from 'react';

interface GuidelinesProps {}

const Guidelines: React.FC<GuidelinesProps> = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'submission', label: 'Submission Workflow' },
    { id: 'failures', label: 'Types of Failures' },
    { id: 'rates', label: 'Rate Schedule' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="guidelines-content">
            <h3>Project Supernaut Overview</h3>
            <p>
              This project focuses on uncovering and documenting how an LLM fails to understand user intent in multi-turn conversations. 
              In other words, the model doesn't understand what the user is actually asking. Your job is to adversarially design 
              conversations where the assistant gives incorrect or inadequate responses due to misunderstanding the user's intent.
            </p>
            <p>Each conversation must demonstrate a failure that falls into one of these specific failure types:</p>
            <ul>
              <li><strong>Task Continuation</strong></li>
              <li><strong>Instruction Retention</strong></li>
              <li><strong>Course Correction</strong></li>
            </ul>
            <p>
              A failure is when a model responds in a way that demonstrates that the model did not understand the intent of the prompt. 
              It is not a failure if the model does not respond exactly how you would like.
            </p>

            <h4>Intent Categories</h4>
            <p>
              Throughout this project, the Snorkel team will allocate intent scenarios strategically to meet the following distribution criteria into these desired intent categories:
            </p>
            <table className="intent-categories-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Target Ratio</th>
                  <th>Subcategory Examples</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Informational</td>
                  <td>25%</td>
                  <td>Factual Queries, Concept Explanation, General Conversation, Biography</td>
                </tr>
                <tr>
                  <td>Discovery</td>
                  <td>10%</td>
                  <td>Experiences, Entertainment</td>
                </tr>
                <tr>
                  <td>Writing Tasks</td>
                  <td>15%</td>
                  <td>Editing & Proofreading, Summarizing, Translation, E-mail writing</td>
                </tr>
                <tr>
                  <td>Skill Acquisition</td>
                  <td>10%</td>
                  <td>Language Learning, Translation</td>
                </tr>
                <tr>
                  <td>Reasoning Exercise</td>
                  <td>10%</td>
                  <td>Logic and Reasoning Problems, Exam & Quiz Answering, Maths & Physics problems</td>
                </tr>
                <tr>
                  <td>Personal Advice Seeking</td>
                  <td>15%</td>
                  <td>Symptom Checking & Medical Advice, Tax Advice, Legal Advice, Parenting Advice, etc.</td>
                </tr>
                <tr>
                  <td>Coding</td>
                  <td>15%</td>
                  <td>Code Generation, Code Understanding, Code Testing, Code Debugging</td>
                </tr>
              </tbody>
            </table>

            <h4>Underspecification</h4>
            <p>
              In this task, use natural language with sparse or underspecified input, as long as the intent would be clear to an intelligent layperson.
            </p>
            <ul>
              <li>In an underspecified prompt, the model would not be expected to correctly understand the first user intent, but should be able to build it over a thread of messages.</li>
              <li>Depending on the different failure modes, determine if you should use underspecified (*) prompts in your user prompt (UP).</li>
            </ul>

            <div className="underspecification-examples">
              <div className="failure-mode-example">
                <h5>Task Continuation:</h5>
                <p>After you've established a clear context, use underspecified prompts.</p>
                <ul>
                  <li>UP1: How do you say "just arrived" in Spanish?</li>
                  <li>UP2*: I just arrived and taking a cab now</li>
                </ul>
              </div>

              <div className="failure-mode-example">
                <h5>Instruction Retention:</h5>
                <p>Avoid underspecified prompts. Use clearer prompts throughout the intent scenario.</p>
                <ul>
                  <li>UP1: Give me 10 movie titles that have something to do with the European Union</li>
                  <li>UP2: Remove all thrillers</li>
                  <li>UP3: Titles of real movies</li>
                </ul>
              </div>

              <div className="failure-mode-example">
                <h5>Course Correction:</h5>
                <p>Use underspecified prompts throughout the entire intent scenario.</p>
                <ul>
                  <li>UP1*: whats the va london</li>
                  <li>UP2*: museum?</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'submission':
        return (
          <div className="guidelines-content">
            <h3>Submission Workflow</h3>
            <p>
              You will be given an intent scenario, which prescribes the intent category and failure mode that should be targeted in the generated conversation. Take this scenario and craft user prompts that trigger responses and a failure from the model. Continue prompting the model until it corrects itself.
            </p>
            <p>For examples, see the Types of Failures that include examples of an expected submission.</p>
            
            <h4>Instructions</h4>
            <div className="instructions-section">
              <div className="instruction-item">
                <h5>1. Design the conversation</h5>
                <ul>
                  <li>Use natural and realistic dialogue.</li>
                  <li>Avoid overly artificial or clearly adversarial phrasing.</li>
                  <li>Each conversation should have 2–5 turns. A turn is defined as a pair of user prompt and model response.</li>
                  <li>The failure must occur in the 4th turn or earlier, so the model has time to correct itself with additional prompting.</li>
                  <li>If no failure has occurred by turn 5, the conversation is invalid and cannot be accepted or used.</li>
                  <li>If needed, use light set-up questions to lead the model into the failure naturally.</li>
                </ul>
                <p>For each turn (prompt/response pair), you will be shown two different model responses.</p>
              </div>

              <div className="instruction-item">
                <h5>2. For each turn, provide the following information:</h5>
                <ul>
                  <li>A binary selection for whether each response is a failure or not, both Model A and Model B.</li>
                  <li><strong>Grading Guidance:</strong> Define what a good response should include. Ensure the guidance is comprehensive.</li>
                  <li><strong>Absolute Rating:</strong> Rate how good each model response is, independent of other response, on a scale of: Amazing, Good, Okay, Bad, Horrible</li>
                  <li><strong>NOTE:</strong> If a model fails, it should not be rated higher than Bad.</li>
                  <li><strong>Relative Rating:</strong> Rate how good each model response is compared to the other model response.</li>
                </ul>
              </div>

              <div className="instruction-item">
                <h5>3. If needed, provide Failure Comments</h5>
                <p>For each turn that results in a failure, write 1-2 sentences explaining what the failure is.</p>
              </div>

              <div className="instruction-item">
                <h5>4. If you reach the fifth turn and the model is still failing:</h5>
                <ul>
                  <li>Edit the model response such that it correctly answers the fifth user prompt.</li>
                  <li>Describe the edits that you made in the Editing Comments field.</li>
                  <li>If the model corrects itself in or before the fifth response, there is no need to edit the response.</li>
                </ul>
              </div>

              <div className="instruction-item">
                <h5>5. Enter your Average Handling Time (AHT)</h5>
                <ul>
                  <li>Record the number of minutes it took to complete the task.</li>
                  <li>Do not include commentary or any additional information, only the time in minutes.</li>
                </ul>
              </div>

              <div className="instruction-item">
                <h5>6. Submit the conversation</h5>
                <p>Ensure all fields are filled out correctly, then submit.</p>
              </div>
            </div>

            <h4>Grading Guidance</h4>
            <p>Aside from generating valid failures, it is important to create thorough and correct grading guidance. Here is the good grading guidance:</p>
            <ul>
              <li>Answers should be free-form, diverse, and not follow any single template. In other words, they should not always include bullets, nor always be paragraphs.</li>
              <li>Explain the intent of the prompt, calling out any contextual clues that the Assistant should pick up on to better understand the intent.</li>
              <li>For example, "The model should correctly interpret CIA' as 'Culinary Institute of America' in the context of this conversation."</li>
              <li>If the intent is somewhat ambiguous, include an explanation of the probable interpretation(s).</li>
              <li>Include any additional implicit context that is hard to pick up on.</li>
              <li>Provide examples of bad answers.</li>
              <li>Include guidance related to future messages of a user, such as in the context of a frustrated user.</li>
              <li>Provide a ground truth answer that is objective and unchanging with time.</li>
              <li>Allow reasonable interpretation.</li>
              <li>Allow clarifying questions.</li>
              <li>Never refer to a specific response, but refer to the function for any response to the query.</li>
            </ul>
          </div>
        );

      case 'failures':
        return (
          <div className="guidelines-content">
            <h3>Types of Failures</h3>
            <p className="note">
              <strong>Note:</strong> Most of these examples do not show the correction aspect of the task. These examples only demonstrate the different failure types. The only example that correctly displays the full conversation annotation is the first Translation example. Use this Translation example to understand the full conversation requirements.
            </p>

            <div className="failure-type">
              <h4>Task Continuation</h4>
              <p>The user attempts to continue a conversation with previous context but the model doesn't comprehend.</p>
              
              <div className="example-section">
                <h5>General Example - FIFA World Cup</h5>
                <div className="conversation-example">
                  <div className="turn">
                    <p><strong>UP 1:</strong> When and where was the first FIFA World Cup?</p>
                    <p><strong>AR 1:</strong> The first FIFA World Cup was held in **1930** in **Uruguay**. The tournament took place from **July 13 to July 30, 1930**. Uruguay was chosen as the host nation to celebrate the 100th anniversary of its first constitution, and the final was played at the **Estadio Centenario** in Montevideo. Uruguay also won the tournament, defeating Argentina 4–2 in the final.</p>
                    <p><strong>Grading Guidance:</strong> A good response should state that the first FIFA World Cup was held in 1930 in Uruguay, ideally mentioning Montevideo or Estadio Centenario for completeness.</p>
                  </div>
                  <div className="turn">
                    <p><strong>UP 2:</strong> North America?</p>
                    <p><strong>AR 2 ✅:</strong> The first **FIFA World Cup** held in **North America** was the **1970 World Cup in Mexico**.</p>
                    <p><strong>AR 2 ❌:</strong> The very first FIFA World Cup never took place in North America. It was staged entirely in Uruguay (South America) in July 1930.</p>
                    <p><strong>Grading Guidance:</strong> The response should show that the assistant understands the user's shift in focus. Instead of repeating details about Uruguay in 1930, it needs to supply the correct milestone for North America: the 1970 World Cup in Mexico.</p>
                  </div>
                </div>
              </div>

              <div className="example-section">
                <h5>Example (Logic & Reasoning) - Chess Knight</h5>
                <div className="conversation-example">
                  <div className="turn">
                    <p><strong>User:</strong> A knight is on the square d4. How many spaces can it move and land on from this position?</p>
                    <p><strong>Assistant:</strong> [Detailed explanation concluding] A knight on d4 can move to 8 different squares.</p>
                  </div>
                  <div className="turn">
                    <p><strong>User:</strong> how many from there</p>
                    <p><strong>Assistant ❌:</strong> From the position **d4**, a knight can move to **8 different squares**. [Repeats same answer]</p>
                    <p><strong>Comments:</strong> The model failed to understand the prompt intent very severely where instead of answering the question logically by continuing the chess puzzle and finding how many second step moves the particular knight could make in total, it repeats the answer of the first step.</p>
                    <p><strong>Grading Guidance:</strong> The model should be rated on whether it understood the implication of a puzzle that logically continued in two steps, meaning "how many from there" is referring to how many moves are possible after the first move (of which there are 8 possible first moves). The answer should be 56 total possible moves.</p>
                  </div>
                </div>
              </div>

              <div className="example-section">
                <h5>Example (Translation) - Complete Annotation</h5>
                <div className="conversation-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Turn</th>
                        <th>Model A (weaker)</th>
                        <th>Model B (stronger)</th>
                        <th>Grading Guidance</th>
                        <th>Ratings</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>UP 1:</strong> How do you say "just arrived" in Spanish</td>
                        <td>In Spanish, "just arrived" can be translated as "recién llegado."</td>
                        <td>"Just arrived" in Spanish can be translated as: "Recién llegado"</td>
                        <td>The model should translate the english phrase into Spanish</td>
                        <td>Good / Good<br/>Model A might be slightly better</td>
                      </tr>
                      <tr>
                        <td><strong>UP 2:</strong> I just arrived and taking a cab now</td>
                        <td>❌Welcome! I hope you have a pleasant journey to your destination.</td>
                        <td>✅Acabo de llegar y estoy tomando un taxi ahora</td>
                        <td>The model should give the translation in Spanish of "I just arrived and taking a cab now".</td>
                        <td>Terrible / Amazing<br/>Model B is much better</td>
                      </tr>
                      <tr>
                        <td><strong>UP 3:</strong> No translate</td>
                        <td>❌Sure, I won't translate any further messages unless you ask me to.</td>
                        <td>✅I'm sorry for the confusion. Your sentence in Spanish would be: "Acabo de llegar y estoy tomando un taxi ahora."</td>
                        <td>The model should apologize and give the correct translation of the English phrase.</td>
                        <td>Terrible / Amazing<br/>Model B is much better</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="example-section">
                <h5>Example (Search + Discovery)</h5>
                <div className="conversation-example">
                  <div className="turn">
                    <p><strong>User:</strong> When was the cannes festival?</p>
                    <p><strong>Assistant:</strong> The Cannes Film Festival in 2025 took place from May 13 to May 24</p>
                  </div>
                  <div className="turn">
                    <p><strong>User:</strong> whats the best film?</p>
                    <p><strong>Assistant ❌:</strong> Determining the "best" film is highly subjective... [Lists general films like Shawshank Redemption, Godfather, etc.]</p>
                    <p><strong>Reasoning:</strong> The user is asking about the best film at the Cannes film festival, not the best film ever made.</p>
                    <p><strong>Grading Guidance:</strong> The response should address the most likely interpretation (Cannes films for the specific year mentioned in the assistant response) instead of generic film recommendations</p>
                  </div>
                </div>
              </div>

              <div className="example-section">
                <h5>Example (Professional Writing)</h5>
                <div className="conversation-example">
                  <div className="turn">
                    <p><strong>User:</strong> Confusion Matrix: [[4580 694] [ 303 787]]</p>
                    <p><strong>Assistant ❌:</strong> The confusion matrix you provided is a 2×2 matrix typically used to evaluate the performance of a binary classification model. Here's how it is usually interpreted: **True Negatives (TN):** 4580... [Explains what confusion matrices are]</p>
                    <p><strong>Reasoning:</strong> The user is trying to prompt a better formatted version of their table, not ask about confusion matrices in a vacuum.</p>
                    <p><strong>Grading Guidance:</strong> Rather than switching to bullet-point explanations or breaking table structure, the assistant should continue with a labeled Markdown table</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="failure-type">
              <h4>Instruction Retention</h4>
              <p>The model forgets initial or refined instructions as a multi-turn conversation progresses.</p>
              
              <div className="example-section">
                <h5>General Example - Game Reporting Email</h5>
                <div className="conversation-example">
                  <div className="turn">
                    <p><strong>User:</strong> I need help drafting an email about how to report a user in a game I'm playing. The game is Life Makeover, and the publisher is Papergames.</p>
                    <p><strong>Assistant:</strong> [Provides detailed email template for reporting harassment to Papergames for Life Makeover]</p>
                  </div>
                  <div className="turn">
                    <p><strong>User:</strong> Oh wait, I made a mistake and just realized the publisher isn't Papergames, it's actually Archosaur Games. Can you rewrite that email for me? And actually, I don't want to report anyone yet because I don't actually know what the rules are. Just make it so that I'm asking where I can get information about rules.</p>
                    <p><strong>Assistant:</strong> [Provides revised email asking about rules, addressed to Archosaur Games]</p>
                  </div>
                  <div className="turn">
                    <p><strong>User:</strong> Oh, duh, I was thinking of the wrong game. I'm playing Shining Nikki. Can you go back to the original version though?</p>
                    <p><strong>Assistant ❌:</strong> No problem! Since you're actually playing Shining Nikki (published by Papergames), here's the revised version of your original email—this time correctly addressed to Papergames, asking about their rules and reporting policies before taking action: [Uses the second email format about asking for rules, not the original reporting format]</p>
                    <p><strong>Comments:</strong> The model failed to understand that "the original version" referred to the very first email that the model produced for Round 1. It used the second email format, the one that was focused on inquiring about rules, that was the re-written email requested for Round 2.</p>
                    <p><strong>Grading Guidance:</strong> A good response should refer to "Papergames" and "Shining Nikki", use the original e-mail format about reporting harassment (from Round 1), and include the "Details of the Incident" section to report the user.</p>
                  </div>
                </div>
              </div>

              <div className="example-section">
                <h5>Example (Search + Discovery)</h5>
                <div className="conversation-example">
                  <div className="turn">
                    <p><strong>User:</strong> Give me 10 movie titles that have something to do with the European Union</p>
                    <p><strong>Assistant:</strong> [Lists fake documentary-style titles like "The European Union: A Success Story"]</p>
                  </div>
                  <div className="turn">
                    <p><strong>User:</strong> Real movies</p>
                    <p><strong>Assistant ❌:</strong> I apologize for the misunderstanding earlier. Here are 10 real movie titles that have something to do with the European Union: The Square, The Great Beauty, Ida, The Lives of Others... [Lists real movies that don't actually have anything to do with the European Union]</p>
                    <p><strong>Reasoning:</strong> The titles no longer all have something to do with the European union</p>
                    <p><strong>Grading Guidance:</strong> The response should include only real movie titles that have something to do with the european union; if real movies fitting the criteria do not exist it should be transparent about this limitation</p>
                  </div>
                </div>
              </div>

              <div className="example-section">
                <h5>Example (Informational)</h5>
                <div className="conversation-example">
                  <div className="turn">
                    <p><strong>User:</strong> What fast food chains are not American?</p>
                    <p><strong>Assistant:</strong> [Lists Jollibee, Tim Hortons, Pret A Manger, Nando's, etc.]</p>
                  </div>
                  <div className="turn">
                    <p><strong>User:</strong> In the UK?</p>
                    <p><strong>Assistant ❌:</strong> In the UK, there are several fast food chains that are not American. Here are a few notable examples: 1. Pret A Manger 2. Greggs 3. Leon 4. ❌Five Guys 5. Nando's 6. ❌Subway 7. ❌KFC [Includes American chains]</p>
                    <p><strong>Reasoning:</strong> Model did not refine its request to UK food chains that are not American</p>
                    <p><strong>Grading Guidance:</strong> The response should only include UK fast food chains that are not American - even if the fast food chains have many franchises in the UK</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="failure-type">
              <h4>Course Correction</h4>
              <p>The model is unable to recover or "correct course" after misinterpreting an underspecified user prompt.</p>
              
              <div className="example-section">
                <h5>General Example - Shredding</h5>
                <div className="conversation-example">
                  <div className="turn">
                    <p><strong>User:</strong> How do I shred?</p>
                    <p><strong>Assistant:</strong> Shredding typically refers to the act of playing a fast and complex solo on a guitar... [Detailed guitar shredding advice]</p>
                  </div>
                  <div className="turn">
                    <p><strong>User:</strong> snow</p>
                    <p><strong>Assistant ❌:</strong> Could you please clarify what you mean by "snow"? Are you asking about snow as a weather phenomenon, snow-related activities, or something else?</p>
                    <p><strong>Comments:</strong> The first prompt was asking how to shred, and the model assumed that the user was talking about shredding guitar. The current prompt the user sent a correction to tell the model that they were referring to shredding snow, as in snowboarding. The model did not recognize this correction and instead clarified what the user meant instead of understanding the intent and providing helpful information.</p>
                    <p><strong>Grading Guidance:</strong> The model should recognize that the user was correcting its assumption in the previous response that "shred" was referring to how to shred on a guitar. The model should recognize that the user was asking about how to snowboard and provide advice on how to snowboard.</p>
                  </div>
                </div>
              </div>

              <div className="example-section">
                <h5>Example (Code)</h5>
                <div className="conversation-example">
                  <div className="turn">
                    <p><strong>User:</strong> Visualize a JSON file on disk, remove keys abc and def from the preview.</p>
                    <p><strong>Assistant:</strong> Please upload your JSON file so I can help you visualize it and remove the specified keys.</p>
                  </div>
                  <div className="turn">
                    <p><strong>User:</strong> bash</p>
                    <p><strong>Assistant ❌:</strong> It looks like you mentioned "bash." Are you looking to perform a specific task or need help with something related to Bash scripting or commands? Let me know how I can assist you!</p>
                    <p><strong>Reasoning:</strong> Model should provide a clear and correct method to visualize a JSON file and remove the specified keys using bash. It understands the request in a single turn prompt</p>
                    <p><strong>Grading Guidance:</strong> The model should give a step-by-step guide on how to visualize a JSON file on disk and remove the keys abc and def from the preview using bash.</p>
                  </div>
                </div>
              </div>

              <div className="example-section">
                <h5>Example (Search + Discovery)</h5>
                <div className="conversation-example">
                  <div className="turn">
                    <p><strong>User:</strong> whats the va london</p>
                    <p><strong>Assistant:</strong> The term "VA London" could refer to a few different things, but it most commonly stands for "Virtual Assistant London"...</p>
                  </div>
                  <div className="turn">
                    <p><strong>User:</strong> museam ?</p>
                    <p><strong>Assistant ❌:</strong> If you're referring to a museum in London, there are many famous ones to choose from. [Lists multiple museums including V&A]</p>
                    <p><strong>Reasoning:</strong> Though the V&A museum is included here, the model should infer from the context the user is asking about this museum specifically.</p>
                    <p><strong>Grading Guidance:</strong> The response should identify The Victoria and Albert Museum in London (UK) as the target of the user's query – with some historical facts, visitor information, and optionally a link to the official website of the VA.</p>
                  </div>
                </div>
              </div>

              <div className="example-section">
                <h5>Example (Wordplay)</h5>
                <div className="conversation-example">
                  <div className="turn">
                    <p><strong>User:</strong> Are you sleeping?</p>
                    <p><strong>Assistant:</strong> No, I'm not sleeping. I'm here and ready to help you with any questions or tasks you have. How can I assist you today?</p>
                  </div>
                  <div className="turn">
                    <p><strong>User:</strong> Are you sleeping?</p>
                    <p><strong>Assistant:</strong> No, I'm not sleeping. I'm here and ready to help you with any questions or tasks you have. How can I assist you today?</p>
                  </div>
                  <div className="turn">
                    <p><strong>User:</strong> Brother john</p>
                    <p><strong>Assistant ❌:</strong> It seems like you might be referring to someone or something specific with "Brother John." Could you provide more context or clarify what you're asking about?</p>
                    <p><strong>Reasoning:</strong> User is quoting lyrics to Frère Jacques, which the model understands in a single turn prompt</p>
                    <p><strong>Grading Guidance:</strong> The response should mention "Frère Jacques" as a possible interpretation, and optionally finish the lyrics of the song</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'rates':
        return (
          <div className="guidelines-content">
            <h3>Rate Schedule</h3>
            
            <h4>Current Rates</h4>
            <div className="rate-table">
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Pay Rate</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Accepted Conversation (general)</td>
                    <td>$38</td>
                    <td rowSpan={4}>These rates are only applicable for the current phase of this project and are subject to change.</td>
                  </tr>
                  <tr>
                    <td>Review (general)</td>
                    <td>$12</td>
                  </tr>
                  <tr>
                    <td>Accepted Conversation (coding)</td>
                    <td>$50</td>
                  </tr>
                  <tr>
                    <td>Review (coding)</td>
                    <td>$20</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h4>Previous Rates (up to 9/4/2025)</h4>
            <div className="rate-table">
              <table>
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Pay Rate</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Accepted Conversation</td>
                    <td>$12</td>
                    <td rowSpan={2}>These rates are only applicable for the pilot phase of this project and are subject to change.</td>
                  </tr>
                  <tr>
                    <td>Reviewed Conversation</td>
                    <td>$5</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="guidelines">
      <h2>Project Guidelines</h2>
      <div className="guidelines-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="guidelines-panel">
        {renderContent()}
      </div>
    </div>
  );
};

export default Guidelines;