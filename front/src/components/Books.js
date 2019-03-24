import React, { useState } from 'react'
import { useApolloClient } from 'react-apollo-hooks'

const Books = (props) => {
  if (!props.show) {
    return null
  }

  const client = useApolloClient
  if (props.allBooks.loading) {
    return <div>loading...</div>
  }

  const [books, setBook] = useState(props.allBooks.data.allBooks)
  const [genre, setGenre] = useState('all genres')

  if (props.genres.length < 1) {
    let genres = []
  
    books.map(b => {
      b.genres.map(g => {
        if (!genres.includes(g)) {
          console.log(g)
          genres.push(g)
        }
      })
    })
    props.setGenres(genres)
  }

  const onChangeUpdate = async (currentGenre) => {
    setGenre(currentGenre)
    const bookByGenre = await props.allBooks.refetch({ genre: currentGenre })
    setBook(bookByGenre.data.allBooks)
  }


  if (books == null) {
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
      <div>
        <button key='all' onClick={() => onChangeUpdate('all genres')}>any genre</button>
        {props.genres.map(g =>
          <button key={g} onClick={() => onChangeUpdate(g)}>{g}</button>)}
      </div>
    </div>
  )
}

export default Books