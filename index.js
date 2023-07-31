const API_URL = 'http://192.168.0.16:5001'
const DEFAULT_DELAY = 5_000

function getMetadata(formElements) {
  const metadata = {}
  const keysElements = Array.from(formElements["metadata_keys[]"])
  const valuesElements = Array.from(formElements["metadata_values[]"])

  keysElements.forEach((keyEl, index) => {
    const key = keyEl.value.trim()
    const value = valuesElements[index].value.trim()

    if(key && value)
      metadata[key] = value
  })

  return metadata
}

function cleanMetadatFields() {
  const metadataContainerElement = document.getElementById("metadata_container")
  metadataContainerElement.innerHTML = ''

  addEmptyRow()
}

function uploadDocument(e) {
  e.preventDefault()
  const formElements = e.target.elements
  const metadata = getMetadata(formElements)
  const trainTextElement = formElements.new_knowledgment
  const trainText = trainTextElement.value

  if(!trainText) return

  trainTextElement.disabled = true  

  return fetch(API_URL + '/documents', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
      text: trainText,
      metadata
    })
  })
  .then(res => res.json())
  .then(() => {   
    const pendingsDocsElement = document.getElementById("pending_docs")
    pendingsDocsElement.value = Number(pendingsDocsElement.value) + 1 
    trainTextElement.value = ''
    cleanMetadatFields()

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
  textArea.scrollTop = textArea.scrollHeight
  
  promptInput.value = ''
  promptInput.disabled = true

  sendPromptToAPI(prompt)
    .then(res => res.json())
    .then(({ data }) => {
      textArea.append("<< IA:" + data + "\n")
      textArea.scrollTop = textArea.scrollHeight
    })
    .catch(showErrorAlert)
    .finally(() => {
      promptInput.disabled = false
      promptInput.focus()
    })
}

function onClickRemove(event) {
  const buttonElement = event.currentTarget
  const rowElement = buttonElement.parentElement.parentElement

  rowElement.remove()
}

function changeToRemoveButton(buttonElement) {
  buttonElement.classList.remove('btn-primary')
  buttonElement.classList.add('btn-danger')
  buttonElement.innerHTML = `<i class="bi bi-dash"></i>`
  buttonElement.setAttribute("onclick", "return onClickRemove(event)")
}

function addEmptyRow() {
  const metadataContainerElement = document.getElementById("metadata_container")

  metadataContainerElement.insertAdjacentHTML('beforeend', `
  <div class="row my-1">
    <div class="col-5">
      <input class="form-control" placeholder="Nombre" name="metadata_keys[]" onkeyup="return onMetadataChange(event)" />
    </div>
    <div class="col-5">
      <input class="form-control" placeholder="Valor" name="metadata_values[]" onkeyup="return onMetadataChange(event)" />
    </div>
    <div class="col-2">
      <button role="button" class="btn btn-primary" onclick="return onClickAdd(event)" disabled>
        <i class="bi bi-plus"></i>
      </button>
    </div>
  </div>
  `)
}

function onClickAdd(event) {
  event.preventDefault()

  const buttonElement = event.currentTarget
  changeToRemoveButton(buttonElement)
  addEmptyRow()
}

function onMetadataChange(event) {
  const rowElement = event.target.parentElement.parentElement
  const buttonEl = rowElement.getElementsByTagName('button')[0]
  const [nameInputEl, valueInputEl] = rowElement.getElementsByTagName('input')

  if(!nameInputEl.value.trim() || !valueInputEl.value.trim()) {
    buttonEl.disabled = true
    return
  }

  buttonEl.disabled = false
}