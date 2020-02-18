import React from 'react'
import { useVisibilityFilterReducer } from '../store'
import { setVisibilityFilter } from '../actions'
import Link from '../components/Link'

export default function FilterLink ({ filter, children }) {
  const [visibilityFilter, dispatch] = useVisibilityFilterReducer()
  return <Link
    active={filter === visibilityFilter}
    onClick={() => dispatch(setVisibilityFilter(filter))}
  >
    {children}
  </Link>
}

