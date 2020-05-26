import { writable } from 'svelte/store'
import todosReducer from '../reducers/todos'
import visibilityFilterReducer from '../reducers/visibilityFilter'
import { VisibilityFilters } from '../actions'
import { useReducerWithStore } from './use-store'

const todos = writable([])
const visibilityFilter = writable(VisibilityFilters.SHOW_ALL)

export const useTodosReducer = () => useReducerWithStore(todosReducer, todos)
export const useVisibilityFilterReducer = () => useReducerWithStore(visibilityFilterReducer, visibilityFilter)
