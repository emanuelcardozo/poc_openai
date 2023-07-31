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

function startLoadingButton(buttonElement) {
  const iconElement = buttonElement.getElementsByTagName('i')[0]
  iconElement.classList.add('visually-hidden')
  
  buttonElement.insertAdjacentHTML('afterbegin', `<span class="spinner-border spinner-border-sm" aria-hidden="true"></span>`)
  buttonElement.disabled = true
}

function finishLoadingButton(buttonElement) {
  const iconElement = buttonElement.getElementsByTagName('i')[0]
  iconElement.classList.remove('visually-hidden')
  
  const spinnerElement = buttonElement.getElementsByClassName('spinner-border')[0]
  spinnerElement.remove()

  buttonElement.disabled = false
}

function uploadDocument(e) {
  e.preventDefault()
  const formElements = e.target.elements
  const button = document.activeElement
  const metadata = getMetadata(formElements)
  const trainTextElement = formElements.new_knowledgment
  const trainText = trainTextElement.value

  if(!trainText) return

  trainTextElement.disabled = true
  startLoadingButton(button)

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
      type: 'success',
      title: 'Envío exitoso',
      message: 'El documento se encuentra disponible para aprender.'
    })
  })
  .catch(console.error)
  .finally(() => {
    trainTextElement.disabled = false
    finishLoadingButton(button)
  })
}

function train(event) {
  event.preventDefault()

  const button = event.currentTarget
  startLoadingButton(button)

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
      type: 'success',
      title: 'Entrenamiento exitoso', 
      message: 'Puedes consultar sobre los documentos aprendidos.'
    })
  })
  .catch(console.warn)
  .finally(() => finishLoadingButton(button))
}

function reset(event) {
  event.preventDefault()

  const button = event.currentTarget
  startLoadingButton(button)

  fetch(API_URL + '/train', {
    method: 'DELETE',
  })
  .then(res => res.json())
  .then(() => {
    const learnedDocsElement = document.getElementById("learned_docs")
    learnedDocsElement.value = 0
    
    showAlert({ 
      type: 'success',
      title: 'Aprendizaje eliminado', 
      message: 'Todo el conocimiento adquirido ya no está disponible.'
    })
  })
  .catch(showErrorAlert)
  .finally(() => finishLoadingButton(button))
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

  const promptInput = e.target.elements.prompt
  const prompt = promptInput.value
  
  if(!prompt) return
  
  const button = e.currentTarget.getElementsByTagName("button")[0]
  startLoadingButton(button)

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
      finishLoadingButton(button)
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
  <div class="input-group my-2">
    <input class="form-control" placeholder="Nombre" name="metadata_keys[]" onkeyup="return onMetadataChange(event)" />
    <input class="form-control" placeholder="Valor" name="metadata_values[]" onkeyup="return onMetadataChange(event)" />
    <button class="btn btn-primary" onclick="return onClickAdd(event)" disabled>
      <i class="bi bi-plus"></i>
    </button>
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
  const rowElement = event.target.parentElement
  const buttonEl = rowElement.getElementsByTagName('button')[0]
  const [nameInputEl, valueInputEl] = rowElement.getElementsByTagName('input')

  if(!nameInputEl.value.trim() || !valueInputEl.value.trim()) {
    buttonEl.disabled = true
    return
  }

  buttonEl.disabled = false
}