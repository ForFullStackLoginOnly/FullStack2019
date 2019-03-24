import React, { useState } from 'react'
import { useApolloClient } from 'react-apollo-hooks'



const Reccomend = (props) => {
  if (!props.show) {
    return null
  }


  const [books, setBook] = useState(props.allBooks.data.allBooks)
  let filtered = []
  const client = useApolloClient
  if (props.allBooks.loading || !props.favoriteGenre.data.me.favoriteGenre) {
    return <div>loading...</div>
  } else {
    books.map(b => {
      b.genres.map(g => {
        if(g === props.favoriteGenre.data.me.favoriteGenre) {
          filtered.push(b)
        }
      })
    })
  }




  return (

    <div>
      <h2>recomended for you genre: {props.favoriteGenre.data.me.favoriteGenre}</h2>

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
          {filtered.map(a =>
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

export default Reccomend