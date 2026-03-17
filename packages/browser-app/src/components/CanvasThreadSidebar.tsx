import { useState } from 'react'
import {
  Button,
  IconButton,
  TextInput,
} from '@carbon/react'
import { Add, TrashCan, Close } from '@carbon/icons-react'
import { useAppDispatch, useAppSelector } from '../store/store'
import {
  addThread,
  switchThread,
  removeThread,
  renameThread,
  setSidebarExpanded,
} from '../store/threadsSlice'
import { clearMessages } from '../store/chatSlice'
import './CanvasThreadSidebar.css'

// ADR-0020: NO Redux imports in this component — all state wiring via store hooks.
export default function CanvasThreadSidebar() {
  const dispatch = useAppDispatch()
  const threads = useAppSelector(s => s.threads.threads)
  const activeThreadId = useAppSelector(s => s.threads.activeThreadId)
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleAdd = () => {
    const name = newName.trim() || `Canvas ${threads.length + 1}`
    dispatch(addThread(name))
    dispatch(clearMessages())
    setNewName('')
  }

  const handleSwitch = (id: string) => {
    if (id === activeThreadId) return
    dispatch(switchThread(id))
    dispatch(clearMessages())
  }

  const handleRenameCommit = (id: string) => {
    if (editValue.trim()) dispatch(renameThread({ id, name: editValue.trim() }))
    setEditingId(null)
    setEditValue('')
  }

  return (
    <div className="canvas-thread-sidebar" data-element="canvas-thread-sidebar">
      <div className="canvas-thread-sidebar-header">
        <span className="canvas-thread-sidebar-title">Canvas Sessions</span>
        <IconButton
          label="Close sidebar"
          onClick={() => dispatch(setSidebarExpanded(false))}
          size="sm"
          kind="ghost"
        >
          <Close size={16} />
        </IconButton>
      </div>

      <ul className="canvas-thread-list">
        {threads.map(thread => (
          <li
            key={thread.id}
            className={`canvas-thread-item${thread.id === activeThreadId ? ' active' : ''}`}
          >
            {editingId === thread.id ? (
              <TextInput
                id={`rename-${thread.id}`}
                labelText=""
                value={editValue}
                size="sm"
                autoFocus
                onChange={e => setEditValue(e.target.value)}
                onBlur={() => handleRenameCommit(thread.id)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleRenameCommit(thread.id)
                  if (e.key === 'Escape') { setEditingId(null); setEditValue('') }
                }}
              />
            ) : (
              <button
                className="canvas-thread-name"
                onClick={() => handleSwitch(thread.id)}
                onDoubleClick={() => {
                  setEditingId(thread.id)
                  setEditValue(thread.name)
                }}
              >
                {thread.name}
              </button>
            )}
            {threads.length > 1 && (
              <IconButton
                label="Remove session"
                onClick={() => dispatch(removeThread(thread.id))}
                size="sm"
                kind="ghost"
                className="canvas-thread-remove"
              >
                <TrashCan size={14} />
              </IconButton>
            )}
          </li>
        ))}
      </ul>

      <div className="canvas-thread-add">
        <TextInput
          id="canvas-new-thread"
          labelText=""
          placeholder="New session name…"
          size="sm"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <Button
          renderIcon={Add}
          onClick={handleAdd}
          size="sm"
          kind="ghost"
          hasIconOnly
          iconDescription="Add session"
        />
      </div>

      <p className="canvas-thread-hint">Double-click a session name to rename it.</p>
    </div>
  )
}
