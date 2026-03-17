import { useState } from 'react'
import { SideNav, SideNavItems, SideNavMenu, SideNavMenuItem } from '@carbon/react'
import { Add, TrashCan } from '@carbon/icons-react'
import { useAppDispatch, useAppSelector } from '../store/store'
import { addThread, switchThread, removeThread, renameThread } from '../store/threadsSlice'
import { clearMessages } from '../store/chatSlice'

interface CanvasThreadSidebarProps {
  isExpanded: boolean
  onToggle: () => void
}

// ADR-0020: NO Redux imports here — all state via store hooks.
// Mirrors cv-builder ThreadSidebar: position:fixed right side, slides in/out.
export default function CanvasThreadSidebar({ isExpanded, onToggle }: CanvasThreadSidebarProps) {
  const dispatch = useAppDispatch()
  const threads = useAppSelector(s => s.threads.threads)
  const activeThreadId = useAppSelector(s => s.threads.activeThreadId)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleAdd = () => {
    dispatch(addThread(`Canvas ${threads.length + 1}`))
    dispatch(clearMessages())
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
    <div {...(!isExpanded ? { inert: '' } : {})}>
      <SideNav
        aria-label="Canvas session navigation"
        expanded={isExpanded}
        onOverlayClick={onToggle}
        className="canvas-thread-sidebar"
      >
        <SideNavItems>
          <div className="canvas-thread-sidebar-header">
            <h4>Sessions</h4>
            <button
              onClick={handleAdd}
              title="New session"
              className="canvas-thread-action-btn canvas-thread-action-primary"
            >
              <Add size={16} />
            </button>
          </div>

          {threads.length === 0 ? (
            <div className="canvas-thread-empty">No sessions yet</div>
          ) : (
            <SideNavMenu title="Recent" defaultExpanded>
              {threads.map(thread => (
                <SideNavMenuItem
                  key={thread.id}
                  isActive={thread.id === activeThreadId}
                  onClick={() => handleSwitch(thread.id)}
                >
                  <div className="canvas-thread-item">
                    {editingId === thread.id ? (
                      <input
                        className="canvas-thread-rename-input"
                        value={editValue}
                        autoFocus
                        onChange={e => setEditValue(e.target.value)}
                        onBlur={() => handleRenameCommit(thread.id)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRenameCommit(thread.id)
                          if (e.key === 'Escape') { setEditingId(null); setEditValue('') }
                          e.stopPropagation()
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <div className="canvas-thread-item-content">
                        <span
                          className="canvas-thread-item-title"
                          onDoubleClick={e => {
                            e.stopPropagation()
                            setEditingId(thread.id)
                            setEditValue(thread.name)
                          }}
                        >
                          {thread.name}
                        </span>
                        <span className="canvas-thread-item-date">
                          {new Date(thread.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {threads.length > 1 && editingId !== thread.id && (
                      <button
                        className="canvas-thread-item-delete"
                        onClick={e => {
                          e.stopPropagation()
                          dispatch(removeThread(thread.id))
                        }}
                        title="Remove session"
                      >
                        <TrashCan size={14} />
                      </button>
                    )}
                  </div>
                </SideNavMenuItem>
              ))}
            </SideNavMenu>
          )}
        </SideNavItems>

        <style>{`
          .canvas-thread-sidebar {
            position: fixed !important;
            right: 1rem !important;
            left: auto !important;
            top: calc(48px + 0.5rem) !important;
            height: calc(100vh - 48px - 1rem) !important;
            width: 320px !important;
            max-width: 320px !important;
            transform: translateX(${isExpanded ? '0' : 'calc(100% + 1rem)'}) !important;
            visibility: ${isExpanded ? 'visible' : 'hidden'} !important;
            transition: transform 0.3s ease, visibility 0s${isExpanded ? '' : ' 0.3s'} !important;
            background: var(--cds-layer-01) !important;
            border-left: 1px solid var(--cds-border-subtle) !important;
            border-right: none !important;
            z-index: 999 !important;
            box-shadow: ${isExpanded ? '-4px 0 12px rgba(0,0,0,0.1)' : 'none'} !important;
          }

          .canvas-thread-sidebar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem;
            border-bottom: 1px solid var(--cds-border-subtle);
          }

          .canvas-thread-sidebar-header h4 {
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
          }

          .canvas-thread-action-btn {
            padding: 0.5rem;
            background: transparent;
            border: 1px solid var(--cds-border-subtle);
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
          }

          .canvas-thread-action-btn:hover {
            background: var(--cds-layer-hover);
          }

          .canvas-thread-action-primary {
            background: var(--cds-button-primary);
            color: var(--cds-text-on-color);
            border-color: var(--cds-button-primary);
          }

          .canvas-thread-action-primary:hover {
            background: var(--cds-button-primary-hover);
          }

          .canvas-thread-empty {
            padding: 2rem 1rem;
            text-align: center;
            color: var(--cds-text-secondary);
            font-size: 0.875rem;
          }

          .canvas-thread-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            padding: 0.5rem 0;
          }

          .canvas-thread-item-content {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
            flex: 1;
            min-width: 0;
          }

          .canvas-thread-item-title {
            font-size: 0.875rem;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            cursor: pointer;
          }

          .canvas-thread-item-date {
            font-size: 0.75rem;
            color: var(--cds-text-secondary);
          }

          .canvas-thread-item-delete {
            padding: 0.25rem;
            background: transparent;
            border: none;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s;
            display: flex;
            align-items: center;
            color: var(--cds-text-secondary);
          }

          .canvas-thread-item:hover .canvas-thread-item-delete {
            opacity: 1;
          }

          .canvas-thread-item-delete:hover {
            color: var(--cds-support-error);
          }

          .canvas-thread-rename-input {
            flex: 1;
            background: var(--cds-field-01);
            border: 1px solid var(--cds-focus);
            border-radius: 2px;
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
            color: var(--cds-text-primary);
            outline: none;
          }

          /* Carbon SideNav overrides — match cv-builder ThreadSidebar pattern */
          .cds--side-nav__overlay {
            right: 0 !important;
            left: auto !important;
          }

          .canvas-thread-sidebar .cds--side-nav__navigation {
            top: 0 !important;
            height: 100% !important;
            width: 100% !important;
          }

          .canvas-thread-sidebar .cds--side-nav__items {
            padding-top: 0 !important;
          }
        `}</style>
      </SideNav>
    </div>
  )
}
