let trainingMode

document.addEventListener("DOMContentLoaded", function() {
  const searchParams = new URLSearchParams(location.search)
  const tMode = searchParams.get('t') === TRAINING_MODE.FINE_TUNING ? TRAINING_MODE.FINE_TUNING : TRAINING_MODE.EMBEDDING

  changeTrainingMode({ target: { value: tMode }})

  if(tMode === TRAINING_MODE.FINE_TUNING) {
    document.getElementById("fine_tuning_option").checked = true
  } else {
    document.getElementById("embedding_option").checked = true
  }
})

function uploadDocument(e) {
  e.preventDefault()
  const formElements = e.target.elements
  const button = document.activeElement
  const trainTextElement = formElements.new_knowledgment
  const trainText = trainTextElement.value

  if(!trainText) return

  trainTextElement.disabled = true
  startLoadingButton(button)

  let requestPromise

  if(trainingMode === TRAINING_MODE.EMBEDDING) {
    const metadata = getMetadata(formElements)
    requestPromise = uploadEmbeddingDocumentToAPI({ text: trainText, metadata })
      
  } else {
    requestPromise = uploadFineTuningDocumentToAPI({ text: trainText })
  }

  requestPromise
  .then(() => {
    if(trainingMode === TRAINING_MODE.EMBEDDING) {
      const pendingsDocsElement = document.getElementById("pending_docs")
      pendingsDocsElement.value = Number(pendingsDocsElement.value) + 1 
      cleanMetadatFields()
    }
    
    trainTextElement.value = ''

    showAlert({ 
      type: 'success',
      title: 'Envío exitoso',
      message: 'El documento se encuentra disponible para aprender.'
    })
  })
  .catch(showErrorAlert)
  .finally(() => {
    trainTextElement.disabled = false
    finishLoadingButton(button)
  })
}

function train(event) {
  event.preventDefault()

  const button = event.currentTarget
  startLoadingButton(button)

  trainToAPI({ trainingMode })
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

  resetToAPI({ trainingMode })
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

function sendPrompt(event) {
  event.preventDefault()

  const promptInput = event.target.elements.prompt
  const prompt = promptInput.value
  
  if(!prompt) return
  
  const button = event.currentTarget.getElementsByTagName("button")[0]
  startLoadingButton(button)

  const textArea = document.getElementById('chat')
  textArea.append(">> User:\n" + prompt + "\n")
  textArea.scrollTop = textArea.scrollHeight
  
  promptInput.value = ''
  promptInput.disabled = true

  sendPromptToAPI({ trainingMode, prompt })
    .then((res) => {
      const data = trainingMode === TRAINING_MODE.EMBEDDING ? res.data : `\n${res.choices[0].text}`

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