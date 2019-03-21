import React, { useState } from 'react'
import { Query, ApolloConsumer, Mutation } from 'react-apollo'
import { gql } from 'apollo-boost'
import { useQuery, useMutation } from 'react-apollo-hooks'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'


const ALL_AUTHORS = gql`
{
  allAuthors {
    name
    born
    bookCount
  }
}
`

const ALL_BOOKS = gql`
{
  allBooks {
    title
    author
    published
  }
}
`

const App = () => {
  const [page, setPage] = useState('authors')

  const allAuthors = useQuery(ALL_AUTHORS)
  const allBooks = useQuery(ALL_BOOKS)

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Authors result={allAuthors}
        show={page === 'authors' }
      />

      <Books result={allBooks}
        show={page === 'books'}
      />

      <NewBook
        show={page === 'add'}
      />

    </div>
  )
}

export default App
