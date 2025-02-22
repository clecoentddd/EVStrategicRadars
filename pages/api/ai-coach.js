// pages/api/ai-coach.js
export default async function handler(req, res) {
    if (req.method === 'POST') {
      const { radarId, purpose } = req.body;
  
      try {
        // Call Mistral API with the purpose
        const response = await callMistral(purpose);
  
        // Return the response
        res.status(200).json({
          success: true,
          data: response,
        });
      } catch (error) {
        console.error('Error calling Mistral:', error.message);
        res.status(500).json({
          success: false,
          message: 'Failed to call Mistral API.',
        });
      }
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  }

  // Function to call Mistral API using fetch
  async function callMistral(purpose) {
    const prompt = `Assess the following purpose and provide:
  1. An NPS rating between 0 to 5.
  2. Comments on the purpose:: Evaluation Criteria (please do rate each of these 5 sections of them 0 to 5- do not reuse numbering)
    2.1 Inspiration and Motivation:
    - Does the purpose statement inspire and motivate both employees and customers?
    - How emotionally engaging is the statement?
    2.2 Customer Focus:
    - Does it emphasize learning from customers and meeting their evolving needs?
    - How well does it prioritize customer satisfaction and loyalty?
    2.3 Growth and Improvement:
    -Does it highlight continuous improvement, innovation, or skill development?
    - How does it encourage a culture of learning and adaptation?
    2.4 Uniqueness and Differentiation:
    - Does it differentiate the organization from competitors?
    - How unique and memorable is the statement?
    2.5 Alignment with Values:
    - Does it align with the organization's core values and mission?
    - How well does it reflect the organization's identity and goals?
  3. If the NPS is below 4.5, provide 3 suggestions to improve the purpose. If the NPS is 4.5 or above, return "Job done".
  
  **Purpose:** ${purpose}
  
  **Response Format:**
  - NPS Rating: [Rating between 0 and 5]
  - Comments: [Your feedback on the purpose, including emotional impact and focus]
  - Suggestions: [3 suggestions if NPS < 4.5, otherwise "Job done"]`;
  
    const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mistral-medium', // Use the appropriate Mistral model
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });
  
    if (!mistralResponse.ok) {
      const errorResponse = await mistralResponse.json();
      console.error('Mistral API Error:', errorResponse);
      throw new Error(`Mistral API error! Status: ${mistralResponse.status}`);
    }
  
    const responseData = await mistralResponse.json();
  
    // Parse the Mistral response
    const responseText = responseData.choices[0].message.content;
  
  // Extract NPS, comments, and suggestions from the response
  const npsMatch = responseText.match(/NPS Rating:\s*(\d+(\.\d+)?)/);
  const commentsMatch = responseText.match(/Comments:\s*([\s\S]*?)(?=\n- Suggestions:|$)/);
  const suggestionsMatch = responseText.match(/Suggestions:\s*([\s\S]*)/);
  
    const nps = npsMatch ? parseFloat(npsMatch[1]) : null;
    const comments = commentsMatch ? commentsMatch[1].trim() : '';
    const suggestions = suggestionsMatch ? suggestionsMatch[1].trim() : 'Job done';
  
    return {
      potentialNPS: nps,
      comments,
      suggestions,
    };
  }
  // Function to call OpenAI API using fetch
  async function callOpenAI(purpose) {
    const prompt = `Assess the following purpose and provide:
1. An NPS rating between 0 to 5.
2. Comments on the purpose's clarity, inspiration, and actionability, with a focus on:
   - Whether the purpose evokes emotions that would create loyalty for customers.
   - Whether the purpose evokes emotions that would create loyalty for employees.
   - Whether the purpose is inward-focused (employees), outward-focused (customers), or well-balanced.
3. If the NPS is below 4.5, provide 3 suggestions to improve the purpose. If the NPS is 4.5 or above, return "Job done".

**Purpose:** ${purpose}

**Response Format:**
- NPS Rating: [Rating between 0 and 5]
- Comments: [Your feedback on the purpose, including emotional impact and focus]
- Suggestions: [3 suggestions if NPS < 4.5, otherwise "Job done"]`;
  
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Store your API key in .env
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Use GPT-3.5 or GPT-4
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });
  
    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error! Status: ${openAIResponse.status}`);
    }
  
    const responseData = await openAIResponse.json();
  
    // Parse the OpenAI response
    const responseText = responseData.choices[0].message.content;
  
    // Extract NPS, comments, and suggestions from the response
    const npsMatch = responseText.match(/NPS Rating:\s*(\d+(\.\d+)?)/);
    const commentsMatch = responseText.match(/Comments:\s*([\s\S]*?)/);
    const suggestionsMatch = responseText.match(/Suggestions:\s*([\s\S]*)/);
  
    const nps = npsMatch ? parseFloat(npsMatch[1]) : null;
    const comments = commentsMatch ? commentsMatch[1].trim() : '';
    const suggestions = suggestionsMatch ? suggestionsMatch[1].trim() : 'Job done';
  
    return {
      potentialNPS: nps,
      comments,
      suggestions,
    };
  }