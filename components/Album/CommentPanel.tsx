'use client'

import { FiSend, FiX, FiCheck } from 'react-icons/fi'
import { format } from 'date-fns'

interface Comment {
  id: string
  page: number
  x: number
  y: number
  text: string
  author: string
  timestamp: string
  resolved: boolean
}

interface CommentPanelProps {
  comments: Comment[]
  onAddComment: () => void
  newComment: string
  onCommentChange: (comment: string) => void
}

export default function CommentPanel({
  comments,
  onAddComment,
  newComment,
  onCommentChange,
}: CommentPanelProps) {
  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Comments</h3>
        <p className="text-sm text-gray-600">{comments.length} comment{comments.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No comments on this page</p>
            <p className="text-xs mt-1">Add a comment to provide feedback</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-3 rounded-lg border ${
                comment.resolved
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-sm text-gray-900">{comment.author}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(comment.timestamp), 'MMM d, h:mm a')}
                  </p>
                </div>
                {comment.resolved && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Resolved
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700">{comment.text}</p>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => onCommentChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onAddComment()
              }
            }}
            placeholder="Add a comment..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
          />
          <button
            onClick={onAddComment}
            disabled={!newComment.trim()}
            className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  )
}

