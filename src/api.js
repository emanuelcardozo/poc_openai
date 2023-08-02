const API_URL = 'http://10.1.1.120:5001'

function uploadDocumentToAPI({ trainingMode, text, metadata }) {
  // return fetch(`${API_URL}/${trainingMode}/documents`, {
  return fetch(API_URL + '/documents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text, metadata })
  }).then(res => res.json())
}

function trainToAPI({ trainingMode }) {
  // return fetch(`${API_URL}/${trainingMode}/train`, {
  return fetch(API_URL + '/train', {
    method: 'POST',
  })
  .then(res => res.json())
}

function resetToAPI({ trainingMode }) {
  // return fetch(`${API_URL}/${trainingMode}/train`, {
  return fetch(API_URL + '/train', {
    method: 'DELETE',
  })
  .then(res => res.json())
}

function sendPromptToAPI({ trainingMode, prompt }) {
  // return fetch(`${API_URL}/${trainingMode}/completions`, {
  return fetch(API_URL + '/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  })
  .then(res => res.json())
}