const API_URL = 'http://localhost:5001'
const DEFAULT_DELAY = 5_000

function uploadDocument() {
  return fetch(API_URL + '/documents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: TRAIN_TEXT })
  })
  .then(res => res.json())
  .then(() => {
    showAlert({ 
      type: 'alert-primary',
      title: 'IA',
      message: 'Archivo subido.'
    })
  })
  .catch(showErrorAlert)
}

function train() {
  fetch(API_URL + '/train', {
    method: 'POST',
  })
  .then(res => res.json())
  .then(() => {
    showAlert({ 
      type: 'alert-info',
      title: 'IA', 
      message: 'Aprendizaje terminado.'
    })
  })
  .catch(showErrorAlert)
}

function reset() {
  fetch(API_URL + '/train', {
    method: 'DELETE',
  })
  .then(res => res.json())
  .then(() => {
    showAlert({ 
      type: 'alert-warning',
      title: 'IA', 
      message: 'Aprendizaje eliminado.'
    })
  })
  .catch(showErrorAlert)
}

function sendPromptToAPI(prompt) {
  return fetch(API_URL + '/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  })
}

function showErrorAlert() {
  showAlert({ 
    type: 'alert-danger', 
    title: 'Error', 
    message: 'Por favor, intenta de nuevo mas tarde.'
  })
}

let timeoutId

function showAlert({ type, title, message }) {
  const alert = document.getElementById('alert')
  const titleElement = alert.children[0]
  const messageElement = alert.children[1]

  alert.classList.remove('show', type)
  clearTimeout(timeoutId)

  alert.classList.add('show', type)
  titleElement.innerText = title
  messageElement.innerText = message

  timeoutId = setTimeout(function() {
    alert.classList.remove('show', type)
  }, DEFAULT_DELAY)
}

function cleanTextArea() {
  const textArea = document.getElementById('chat')
  textArea.innerHTML = ''
  
  showAlert({ 
    type: 'alert-secondary', 
    title: 'Clear', 
    message: 'Historial eliminado.'
  })
}

function sendPrompt(e) {
  e.preventDefault()

  const promptInput = event.target.elements.prompt
  const prompt = promptInput.value

  if(!prompt) return

  const textArea = document.getElementById('chat')
  textArea.append("User: " + prompt + "\n")
  
  promptInput.value = ''
  promptInput.disabled = true

  sendPromptToAPI(prompt)
    .then(res => res.json())
    .then(({ data }) => {
      textArea.append("IA: " + data + "\n")
      textArea.append(" ------------------------------------------- \n")
      promptInput.disabled = false
      promptInput.focus()
    })
    .catch(showErrorAlert)
}