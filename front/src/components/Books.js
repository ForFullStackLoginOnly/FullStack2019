import React from 'react'
import { useApolloClient } from 'react-apollo-hooks'

const Books = (props) => {
  if (!props.show) {
    return null
  }

  const client  = useApolloClient
  if (props.result.loading) {
    return <div>loading...</div>
  }

  const books = props.result.data.allBooks

  if(books == null) {
    return (
      <div>
        <h2>No books</h2>
      </div>
    )
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>
              author
            </th>
            <th>
              published
            </th>
          </tr>
          {books.map(a =>
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Books