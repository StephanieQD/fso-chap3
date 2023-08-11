const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Enter a password to view full phonebook OR enter a password, name and number to make a new entry.')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://stephanieqrysdeetman:${password}@cluster0.tqvzl4z.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length < 5) {
  Person
    .find({})
    .then(people => {
      console.log('phonebook:')
      people.forEach((person) => {
        console.log(`${person.name} ${person.number}`)
      })
      mongoose.connection.close()
    })
} else {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })

  person.save().then(result => {
    console.log(`Added ${result.name} number ${result.number} to phonebook`)
    mongoose.connection.close()
  })
}