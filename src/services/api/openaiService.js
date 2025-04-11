import { API_ENDPOINTS } from '../../constants/apiEndpoints';
import { CONFIG } from '../../constants/config';
import { callAPI } from './apiClient';
import SYSTEM_FIRST_PROMPT from "../../prompts/systemFirstPrompt";
import SYSTEM_SECOND_PROMPT from "../../prompts/systemSecondPrompt";
import SYSTEM_THIRD_PROMPT from "../../prompts/systemThirdPrompt";

export const generateDiagrams = async (
  treeStructure, 
  readmeFile, 
  importsStructure
) => {
  // Step 1: Analyze code structure
  const firstCallResponse = await callAPI(API_ENDPOINTS.openai, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.REACT_APP_OPEN_API_API_KEY}`
    },
    body: JSON.stringify({
      model: CONFIG.models.default,
      messages: [
        { role: "system", content: SYSTEM_FIRST_PROMPT },
        {
          role: "user",
          content: `<file_tree> ${treeStructure} </file_tree> 
          <readme> ${readmeFile} </readme> 
          <imports> ${importsStructure} </imports>`
        }
      ],
      temperature: CONFIG.temperature
    })
  });

  const firstReply = firstCallResponse.choices[0].message.content;

  // Step 2: Generate first diagram
  const secondCallResponse = await callAPI(API_ENDPOINTS.openai, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.REACT_APP_OPEN_API_API_KEY}`
    },
    body: JSON.stringify({
      model: CONFIG.models.default,
      messages: [
        { role: "system", content: SYSTEM_SECOND_PROMPT },
        {
          role: "user",
          content: `<explanation> ${firstReply} </explanation>`
        }
      ],
      temperature: CONFIG.temperature
    })
  });

  const secondReply = secondCallResponse.choices[0].message.content;

  // Step 3: Generate second diagram
  const thirdCallResponse = await callAPI(API_ENDPOINTS.openai, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.REACT_APP_OPEN_API_API_KEY}`
    },
    body: JSON.stringify({
      model: CONFIG.models.default,
      messages: [
        { role: "system", content: SYSTEM_THIRD_PROMPT },
        {
          role: "user",
          content: `<file_tree> ${treeStructure} </file_tree> 
          <readme> ${readmeFile} </readme> 
          <imports> ${importsStructure} </imports>
          <explanation> ${firstReply} </explanation>`
        }
      ],
      temperature: CONFIG.temperature
    })
  });

  const thirdReply = thirdCallResponse.choices[0].message.content;

  return {
    firstDiagram: secondReply,
    secondDiagram: thirdReply
  };
};