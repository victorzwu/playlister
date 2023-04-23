import React from 'react'
import { useParams } from 'react-router-dom'


export default function Album() {
  return (
    <div>Album {useParams.artistId}</div>
  )
}
