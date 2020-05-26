import React from 'react'
import AsyncComponent from './AsyncComponent'

const App = () => {
  const components = [
    import('../containers/AddTodo'),
    import('../containers/VisibleTodoList'),
    import('./Footer'),
  ]
  return (
    <div>
      {components.map((component, i) =>
        <AsyncComponent key={i} component={component} />
      )}
    </div>
  )
}

export default App
