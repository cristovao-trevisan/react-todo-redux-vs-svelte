import React, { useState, useEffect } from 'react'

const AsyncComponent = ({ component }) => {
  const [state, setState] = useState({ loading: true })
  useEffect(() => {
    component
      .then(file => file.default)
      .then(Component => setState({ Component, loaded: true }))
      .catch(error => setState({ error }))
  }, [])

  if (state.loading) return <div> Loading Component </div>
  if (state.error) return <div> Error: {state.error} </div>
  return <state.Component />
}

export default AsyncComponent
