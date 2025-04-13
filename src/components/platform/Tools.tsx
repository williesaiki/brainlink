import React from 'react';
import { Routes, Route } from 'react-router-dom';
import TaskList from './tools/TaskList';
import Notes from './tools/Notes';
import OfferAnalysis from './tools/OfferAnalysis';

function Tools() {
  return (
    <Routes>
      <Route path="tasks" element={<TaskList />} />
      <Route path="notes" element={<Notes />} />
      <Route path="analysis" element={<OfferAnalysis />} />
    </Routes>
  );
}

export default Tools;