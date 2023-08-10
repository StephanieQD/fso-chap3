require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(express.static('new_build'))
app.use(express.json())
app.use(cors())

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

app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    console.log(people)
    response.json(people)
  })
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

  if ( errorMsg.length > 0 ) {
    return response.status(400).json({ 
      error: errorMsg
    })
  }
  
  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

/*--------------------------------------------------
 # Get single person
 --------------------------------------------------*/
app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => {
      console.log(error)
      response.status(400).send({ error: 'malformatted id' })
    })
})

/*--------------------------------------------------
 # Delete an item
 --------------------------------------------------*/
app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      console.log(result)
      response.status(204).end()
    })
    .catch((error => console.log(error)))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" })
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})