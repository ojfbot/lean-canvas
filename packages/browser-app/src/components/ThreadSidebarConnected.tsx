import { ThreadSidebar } from '@ojfbot/frame-ui-components'
import '@ojfbot/frame-ui-components/styles/thread-sidebar'
import type { ThreadItem } from '@ojfbot/frame-ui-components'
import { useAppDispatch, useAppSelector } from '../store/store'
import { addThread, switchThread, removeThread } from '../store/threadsSlice'

interface Props {
  isExpanded: boolean
  onToggle: () => void
}

export default function ThreadSidebarConnected({ isExpanded, onToggle }: Props) {
  const dispatch = useAppDispatch()
  const threads = useAppSelector(s => s.threads.threads)
  const activeThreadId = useAppSelector(s => s.threads.activeThreadId)

  const threadItems: ThreadItem[] = threads.map(t => ({
    threadId: t.id,
    title: t.name,
    updatedAt: t.createdAt,
  }))

  return (
    <ThreadSidebar
      isExpanded={isExpanded}
      onToggle={onToggle}
      threads={threadItems}
      currentThreadId={activeThreadId}
      title="Canvas Sessions"
      onCreateThread={() => dispatch(addThread(`Canvas ${threads.length + 1}`))}
      onSelectThread={(threadId) => {
        if (threadId !== activeThreadId) dispatch(switchThread(threadId))
      }}
      onDeleteThread={(threadId) => dispatch(removeThread(threadId))}
    />
  )
}
