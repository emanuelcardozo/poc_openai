function changeTrainingMode(event) {
  trainingMode = event.target.value
}

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

  function showErrorAlert() {
    showAlert({ 
      type: 'error', 
      title: 'Error', 
      message: 'Por favor, intenta de nuevo mas tarde.'
    })
  }
  
  function cleanTextArea() {
    const textArea = document.getElementById('chat')
    textArea.innerHTML = ''
  }

  function onClickRemove(event) {
    const buttonElement = event.currentTarget
    const rowElement = buttonElement.parentElement.parentElement
  
    rowElement.remove()
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