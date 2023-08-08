const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')

app.use(express.json())
app.use(cors())

app.use(express.static('new_build'))

morgan.token("reqbody", function (req, res) {
  return JSON.stringify(req.body)
})

app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :reqbody"
  )
)

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]

function genRandomInt(max) {
  return Math.floor(Math.random() * max);
}

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
  const date = new Date;
  response.send(`<p>Phonebook has info for ${persons.length} ${persons.length === 1 ? 'person' : 'people'}</p><p>${date}</p>`)
})

/*--------------------------------------------------
 # Create a new person in the phonebook
 --------------------------------------------------*/
app.post('/api/persons', (request, response) => {
  const body = request.body
  console.log(body)
  
  let errorMsg = '';

  if ( ! body.name ) {
    errorMsg += 'Name is missing. '
  }

  if ( ! body.number ) {
    errorMsg += 'Number is missing. '
  }

  const dupPerson = persons.find(person => person.name === body.name)

  if (dupPerson) {
    errorMsg += 'Name must be unique. '
  }

  if ( errorMsg.length > 0 ) {
    return response.status(400).json({ 
      error: errorMsg
    })
  }
  
  const person = {
    id: genRandomInt(99999999),
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(person)
  response.json(person)
})

/*--------------------------------------------------
 # Get single person
 --------------------------------------------------*/
app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})