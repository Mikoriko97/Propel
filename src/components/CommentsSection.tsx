import { useState } from 'react';
import { MessageCircle, Send, ThumbsUp, ThumbsDown, User } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  timestamp: Date;
  likes: number;
  dislikes: number;
  userVote?: 'like' | 'dislike' | null;
  isCreator?: boolean;
}

interface CommentsSectionProps {
  projectId: string;
  isCreator?: boolean;
}

export function CommentsSection({ projectId, isCreator = false }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: 'Alexander Petrenko',
      content: 'Very interesting project! Are you planning to add support for other languages besides English?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 5,
      dislikes: 0,
      userVote: null,
    },
    {
      id: '2',
      author: 'Maria Kovalenko',
      content: 'It would be great if you added integration with popular text editors as a plugin.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      likes: 3,
      dislikes: 1,
      userVote: 'like',
    },
    {
      id: '3',
      author: 'Dmitry Ivanenko',
      content: 'Will APIs be available for developers? This could significantly expand usage possibilities.',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      likes: 7,
      dislikes: 0,
      userVote: null,
    },
  ]);

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Current User',
      content: newComment,
      timestamp: new Date(),
      likes: 0,
      dislikes: 0,
      userVote: null,
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleVote = (commentId: string, voteType: 'like' | 'dislike') => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const currentVote = comment.userVote;
        let newLikes = comment.likes;
        let newDislikes = comment.dislikes;
        let newUserVote: 'like' | 'dislike' | null = voteType;

        // Remove previous vote
        if (currentVote === 'like') newLikes--;
        if (currentVote === 'dislike') newDislikes--;

        // Add new vote or remove if same
        if (currentVote === voteType) {
          newUserVote = null;
        } else {
          if (voteType === 'like') newLikes++;
          if (voteType === 'dislike') newDislikes++;
        }

        return {
          ...comment,
          likes: newLikes,
          dislikes: newDislikes,
          userVote: newUserVote,
        };
      }
      return comment;
    }));
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-emerald-light" />
        <h3 className="text-xl font-bold text-[var(--text-primary)]">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-emerald-light rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts or questions..."
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-emerald-light/50"
              rows={3}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-[var(--text-muted)]">
                {newComment.length}/500 characters
              </span>
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-light text-white rounded-lg hover:bg-emerald-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3 p-4 bg-[var(--bg-primary)] rounded-lg">
            <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-[var(--text-primary)]">
                  {comment.author}
                </span>
                {comment.isCreator && (
                  <span className="px-2 py-0.5 bg-emerald-light/10 text-emerald-dark dark:text-emerald-light text-xs rounded-full">
                    Author
                  </span>
                )}
                <span className="text-xs text-[var(--text-muted)]">
                  {formatTimeAgo(comment.timestamp)}
                </span>
              </div>
              <p className="text-[var(--text-secondary)] mb-3">
                {comment.content}
              </p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => handleVote(comment.id, 'like')}
                  className={`flex items-center gap-1 text-sm transition-colors ${
                    comment.userVote === 'like'
                      ? 'text-emerald-light'
                      : 'text-[var(--text-muted)] hover:text-emerald-light'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  {comment.likes}
                </button>
                <button
                  onClick={() => handleVote(comment.id, 'dislike')}
                  className={`flex items-center gap-1 text-sm transition-colors ${
                    comment.userVote === 'dislike'
                      ? 'text-ruby'
                      : 'text-[var(--text-muted)] hover:text-ruby'
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  {comment.dislikes}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isCreator && (
        <div className="mt-6 p-4 bg-emerald-light/5 border border-emerald-light/20 rounded-lg">
          <h4 className="font-semibold text-emerald-dark dark:text-emerald-light mb-2">
            For Project Author
          </h4>
          <p className="text-sm text-[var(--text-muted)]">
            Respond to comments and questions from investors to build trust in your project.
            Active communication helps attract more support.
          </p>
        </div>
      )}
    </div>
  );
}