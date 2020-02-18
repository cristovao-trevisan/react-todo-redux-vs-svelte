import React from 'react'
import TodoList from '../components/TodoList'
import { toggleTodo } from '../actions'
import { VisibilityFilters } from '../actions'
import { useTodosReducer, useVisibilityFilterReducer } from '../store'

const getVisibleTodos = (todos, filter) => {
  switch (filter) {
    case VisibilityFilters.SHOW_ALL:
      return todos
    case VisibilityFilters.SHOW_COMPLETED:
      return todos.filter(t => t.completed)
    case VisibilityFilters.SHOW_ACTIVE:
      return todos.filter(t => !t.completed)
    default:
      throw new Error('Unknown filter: ' + filter)
  }
}

export default function VisibleTodoList() {
  const [todos, dispatch] = useTodosReducer()
  const [visibilityFilter] = useVisibilityFilterReducer()

  return <TodoList
    todos={getVisibleTodos(todos, visibilityFilter)}
    toggleTodo={id => dispatch(toggleTodo(id))}
  />
}