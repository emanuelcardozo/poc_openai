const API_URL = 'http://localhost:5001'

function sendPromptToAPI(prompt) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Accept", "application/json");
  myHeaders.append("Data-Type", "json");

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: JSON.stringify({ prompt }),
  };
  return fetch(API_URL + '/completions', requestOptions)
}

function sendPrompt(e) {
  e.preventDefault()

  const promptInput = event.target.elements.prompt
  const prompt = promptInput.value
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
    .catch(console.error)  
}