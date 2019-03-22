import React, { useState } from 'react'
import { useApolloClient } from 'react-apollo-hooks'


const Authors = (props) => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  if (!props.show) {
    return null
  }

  const submit = async (e) => {
    e.preventDefault()

    await props.editAuthor({
      variables: { name, setBornTo:parseInt(born) }
    })
  }

  const client = useApolloClient
  if (props.result.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <div>
        <h2>authors</h2>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>
                born
            </th>
              <th>
                books
            </th>
            </tr>
            {props.result.data.allAuthors.map(a =>
              <tr key={a.name}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            )}
          </tbody>
        </table>

      </div>
      <div>
        <h2>set birthyear</h2>
        <form onSubmit={submit}>
          <div>
            name 
            <select value={name} onChange={({ target }) => setName(target.value)}>
            {props.result.data.allAuthors.map(a => 
              <option value={a.name}>{a.name}</option>
            )}
            </select>
          </div>
          <div>
            born <input
              value={born}
              onChange={({ target }) => setBorn(target.value)}
            />
          </div>
          <button type='submit'>update author</button>
        </form>
      </div>
    </div>
  )
}

export default Authors