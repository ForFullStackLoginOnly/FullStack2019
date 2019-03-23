
const { ApolloServer, gql, UserInputError } = require('apollo-server')
const mongoose = require('mongoose')
const Author = require('./modules/Author')
const Book = require('./modules/Book')
const User = require('./modules/User')
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
    type User {
      username: String!
      favoriteGenre: String!
      id: ID!
    }
    type Token {
      value: String!
    }
    type Query {  
      authorCount: Int!
      bookCount: Int!
      allBooks: [Book!]!
      allAuthors: [Author!]!
      me: User
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
      createUser(
        username: String!
      ): User
      login(
        username: String!
        password: String!
      ): Token
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
    },
    me: (root, args, context) => {
      return context.currentUser
    }
  },

  Author: {
    bookCount: (root) => Book.find({ author: root }).countDocuments()
  },

  Mutation: {
    addBook: async (root, args, context) => {
      let author = await Author.findOne({ name: args.author })
      const currentUser = context.currentUser
      
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }

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
    editAuthor: async (root, args, context) => {
      const currentUser = context.currentUser
      
      if (!currentUser) {
        throw new AuthenticationError("not authenticated")
      }      
      const author = await Author.findOne({ name: args.name })
      if (!author) {
        throw new Error('It was not the author you were looking for')
      }
      author.born = args.setBornTo
      return author.save()
    },
    createUser: (root, args) => {
      const user = new User({ username: args.username })

      return user.save()
        .catch(error => {
          throw new UserInputError(error.message, {
            invalidArgs: args,
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'secred') {
        throw new UserInputError("wrong credentials")
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      }

      return { value: jwt.sign(userForToken, JWT_SECRET) }
    },
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})