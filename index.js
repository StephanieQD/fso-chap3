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

/*--------------------------------------------------
 # Get all people in the phonebook
 --------------------------------------------------*/
app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    console.log(people)
    response.json(people)
  })
})

/*--------------------------------------------------
 # Get info on count of people in the phonebook
 --------------------------------------------------*/
app.get('/info', (request, response) => {
  const date = new Date;
  Person.find({}).then(people => {
    console.log(people)
    response.send(`<p>Phonebook has info for ${people.length} ${people.length === 1 ? 'person' : 'people'}</p><p>${date}</p>`)
  })
})

/*--------------------------------------------------
 # Create a new person in the phonebook
 --------------------------------------------------*/
app.post('/api/persons', (request, response, next) => {
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

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

/*--------------------------------------------------
 # Get single person
 --------------------------------------------------*/
app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
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

/*--------------------------------------------------
 # Update an item
 --------------------------------------------------*/
app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(
    request.params.id, person, { new: true, runValidators: true, context: 'query' }
  )
  .then(updatedPerson => {
    response.json(updatedPerson)
  })
  .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" })
}

app.use(unknownEndpoint)

/*--------------------------------------------------
 # Error handling middleware
 --------------------------------------------------*/
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

// this has to be the last loaded middleware.
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})