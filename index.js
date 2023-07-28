const API_URL = 'http://192.168.0.16:5001'
const DEFAULT_DELAY = 5_000

function uploadDocument(e) {
  e.preventDefault()

  const trainTextElement = event.target.elements.new_knowledgment
  const trainText = trainTextElement.value

  if(!trainText) return

  trainTextElement.disabled = true
  trainTextElement.value = ''

  return fetch(API_URL + '/documents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text: trainText })
  })
  .then(res => res.json())
  .then(() => {   
    const pendingsDocsElement = document.getElementById("pending_docs")
    pendingsDocsElement.value = Number(pendingsDocsElement.value) + 1 

    showAlert({ 
      type: 'alert-primary',
      title: 'IA',
      message: 'Archivo subido.'
    })
  })
  .catch(console.error)
  .finally(() => {
    trainTextElement.disabled = false
  })
}

function train() {
  fetch(API_URL + '/train', {
    method: 'POST',
  })
  .then(res => res.json())
  .then(() => {
    const pendingsDocsElement = document.getElementById("pending_docs")
    const learnedDocsElement = document.getElementById("learned_docs")

    learnedDocsElement.value = Number(learnedDocsElement.value) + Number(pendingsDocsElement.value)
    pendingsDocsElement.value = 0

    showAlert({ 
      type: 'alert-info',
      title: 'IA', 
      message: 'Aprendizaje terminado.'
    })
  })
  .catch(console.error)
}

function reset() {
  fetch(API_URL + '/train', {
    method: 'DELETE',
  })
  .then(res => res.json())
  .then(() => {
    const learnedDocsElement = document.getElementById("learned_docs")
    learnedDocsElement.value = 0
    
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
    })
    .catch(showErrorAlert)
    .finally(() => {
      promptInput.disabled = false
      promptInput.focus()
    })
}