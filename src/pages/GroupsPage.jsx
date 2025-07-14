import React from 'react'
import { Routes, Route } from 'react-router-dom'
import GroupList from '../components/Groups/GroupList'
import GroupDetail from '../components/Groups/GroupDetail'
import SessionDetail from '../components/Sessions/SessionDetail'

function GroupsPage() {
  return (
    <Routes>
      <Route path="/" element={<GroupList />} />
      <Route path="/:groupId" element={<GroupDetail />} />
      <Route path="/:groupId/edit" element={<GroupDetail isEditing={true} />} />
    </Routes>
  )
}

export default GroupsPage