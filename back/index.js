
const { ApolloServer, gql, UserInputError } = require('apollo-server')
const uuid = require('uuid/v1')
const mongoose = require('mongoose')
const Author = require('./modules/Author')
const Book = require('./modules/Book')
const MONGODB_URI = 'mongodb+srv://jasperli:muumio@klusteri-lxoe6.mongodb.net/test?retryWrites=true'


mongoose.set('useFindAndModify', false)

mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDb', error.message)
  })

const typeDefs = gql`
    type Author {
      name: String!
      id: ID!
      born: Int
      bookCount: Int
    }
    type Book {
      title: String!
      published: Int!
      author: Author!
      genres: [String!]!
      id: ID!
    }
    type Query {  
      authorCount: Int!
      bookCount: Int!
      allBooks: [Book!]!
      allAuthors: [Author!]!
    }  
    type Mutation {
      addBook(
        title: String!
        published: Int!
        author: String!
        genres: [String]!
      ): Book
      editAuthor(
        name: String!
        setBornTo: Int!
      ): Author
    }
`

const resolvers = {
  Query: {
    authorCount: () => Author.collection.countDocuments(),
    bookCount: () => Book.collection.countDocuments(),
    allBooks: (root, args) => {
      return Book.find({}).populate('author')
    },
    allAuthors: (root, args) => {
      return Author.find({})
    }
  },

  Author: {
    bookCount: (root) => Book.find({ author: root }).countDocuments()
  },

  Mutation: {
    addBook: async (root, args, context) => {
      let author = await Author.findOne({ name: args.author })
      if (!author) {
        try {
          author = new Author({ name: args.author })
          await author.save()
        } catch (error) {
          throw new UserInputError(error.message, {
            message: 'failedat creating new author when one does not exist',
            invalidArgs: args
          })
        }
      }
      try {
        const book = new Book({ ...args, author: author })
        await book.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          message: 'failed at creating book',
          invalidArgs: args
        })
      }
      return book
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })
      if (!author) {
        throw new Error('It was not the author you were looking for')
      }
      author.born = args.setBornTo
      return author.save()
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})