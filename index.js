const API_URL = 'http://localhost:5001'
const DEFAULT_DELAY = 5_000

const TRAIN_TEXT = `La final de la Copa Mundial de la FIFA Catar 2022 la disputaron los ganadores de las semifinales: Argentina y Francia. El encuentro se jugó a las 18:00 horas (AST) del 18 de diciembre en el estadio Icónico de Lusail, coincidiendo con el Día Nacional de Catar.2​

Los equipos tenían como principales figuras a Lionel Messi y Kylian Mbappé, compañeros del club francés Paris Saint-Germain.3​ Tras igualar 2:2 en el tiempo reglamentario, se disputó tiempo suplementario. Con un nuevo empate en el marcador, 3:3, el ganador debió definirse con tiros desde el punto de penal. Argentina, imponiéndose 4:2, se consagró por tercera vez en la historia campeón, título que no obtenía desde 1986, con Diego Maradona a la cabeza.4​

El partido fue elogiado por su naturaleza cambiante y muchos medios afirmaron que fue la mejor final de todas las ocurridas,5​6​7​8​ con una calidad y dramatismo similar o superior al famoso «Partido del Siglo»; por lo cual lo consideraron entre las mejores finales de la Copa Mundial de la FIFA de todos los tiempos y uno de los mejores partidos de fútbol en la historia del deporte.9​10​11​12​13​14​ Esto concordó con la opinión de muchas personalidades reconocidas, como Gianni Infantino, por la abundancia de todo lo acaecido durante el encuentro.15​

Fue la tercera final en la historia de la competición que se definió en tanda de penales, tras Brasil 0:0 (3:2) Italia —Estados Unidos 1994— e Italia 1:1 (5:3) Francia —Alemania 2006—. Además, fue la primera final, en casi 100 años de historia, que no se disputa en los meses de junio o julio.

Para Les Bleus resultó ser su cuarta final de copa del mundo, segunda consecutiva tras el título en Rusia 2018. En cambio, los albicelestes vivieron su sexta cita finalista, segunda en los últimos tres mundiales (perdió en Brasil 2014).`

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