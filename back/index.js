
const { ApolloServer, gql } = require('apollo-server')
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
      author: String!
      genres: [String!]!
      id: ID!
    }
    type Query {  
      authorCount: Int!
      bookCount: Int!
      allBooks(author: String, genre: String): [Book!]!
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
      return Book.find({})
    },
    allAuthors: (root, args) => {
      return Author.find({})
    }
  },

  Author: {
    bookCount: (root) => {
      const byAuthor = (book) =>
        book.author === root.name
      return books.filter(byAuthor).length
    }
  },

  Mutation: {
    addBook: async (root, args, context) => {
      let author = await Author.findOne({ name: args.author })
      console.log(args)
      console.log('first', author)
      if (!author) {
        author = new Author({ name: args.author })
        await author.save();
      }
      console.log('second', author)
      const book = new Book({ ...args, author: author })
      await book.save()
      return book
    },
    editAuthor: (root, args) => {
      const author = authors.find(a => a.name === args.name)
      if (!author) {
        return null
      }

      const updatedAuthor = {...author, born: args.setBornTo }
      authors = authors.map(a => a.name === args.name ? updatedAuthor : a)
      return updatedAuthor
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