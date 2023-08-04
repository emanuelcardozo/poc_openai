const API_URL = 'https://b0e1-152-171-172-219.ngrok-free.app/api'

function uploadEmbeddingDocumentToAPI({ text, metadata }) {
  return fetch(`${API_URL}/embedding/documents`, {
  // return fetch(API_URL + '/documents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text, metadata })
  }).then(res => res.json())
}

function uploadFineTuningDocumentToAPI({ text }) {
  return fetch(`${API_URL}/fine-tuning/documents`, {
  // return fetch(API_URL + '/documents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: text.replaceAll('\n', '\\n')
  }).then(res => res.json())
}

function trainToAPI({ trainingMode }) {
  return fetch(`${API_URL}/${trainingMode}/train`, {
  // return fetch(API_URL + '/train', {
    method: 'POST',
  })
  .then(res => res.json())
}

function resetToAPI({ trainingMode }) {
  return fetch(`${API_URL}/${trainingMode}/train`, {
  // return fetch(API_URL + '/train', {
    method: 'DELETE',
  })
  .then(res => res.json())
}

function sendPromptToAPI({ trainingMode, prompt }) {
  return fetch(`${API_URL}/${trainingMode}/completions`, {
  // return fetch(API_URL + '/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  })
  .then(res => res.json())
}