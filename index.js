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
    type: 'error', 
    title: 'Error', 
    message: 'Por favor, intenta de nuevo mas tarde.'
  })
}

let timeoutId

function showAlert({ type, title, message }) {
  const toastElement = document.getElementById('liveToast')
  const titleElement = toastElement.getElementsByClassName("me-auto")[0]
  titleElement.innerText = title

  const bodyElement = toastElement.getElementsByClassName("toast-body")[0]
  bodyElement.innerText = message

  if(type === 'error') {
    toastElement.classList.add("text-white", "bg-danger")
  } else {
    toastElement.classList.remove("text-white", "bg-danger")
  }

  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastElement)
  toastBootstrap.show()
}

function cleanTextArea() {
  const textArea = document.getElementById('chat')
  textArea.innerHTML = ''
}

function sendPrompt(e) {
  e.preventDefault()

  const promptInput = event.target.elements.prompt
  const prompt = promptInput.value

  if(!prompt) return

  const textArea = document.getElementById('chat')
  textArea.append(">> User:\n" + prompt + "\n")
  
  promptInput.value = ''
  promptInput.disabled = true

  sendPromptToAPI(prompt)
    .then(res => res.json())
    .then(({ data }) => {
      textArea.append("<< IA:" + data + "\n")
    })
    .catch(showErrorAlert)
    .finally(() => {
      promptInput.disabled = false
      promptInput.focus()
    })
}