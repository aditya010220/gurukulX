import React, { useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const ContextualModal = ({ isOpen, onClose, content, theme = 'warm' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e?.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderContent = () => {
    if (!content) {
      return (
        <div className="text-center py-12">
          <Icon name="AlertCircle" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
          <p className="text-muted-foreground">No content available</p>
        </div>
      );
    }

    switch (content?.type) {
      case 'exchange-request':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
                <Icon name="Users" size={32} color="var(--color-primary-foreground)" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-heading font-semibold text-foreground mb-2">
                  {content?.title || 'New Exchange Request'}
                </h3>
                <p className="text-muted-foreground">
                  {content?.description || 'Start a new skill exchange with a community member'}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-2xl">
                <p className="text-sm font-medium text-foreground mb-2">Your Skill to Share</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon name="BookOpen" size={20} color="var(--color-secondary-foreground)" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{content?.userSkill || 'React Development'}</p>
                    <p className="text-sm text-muted-foreground caption">Advanced Level</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-2xl">
                <p className="text-sm font-medium text-foreground mb-2">Skill to Learn</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                    <Icon name="Palette" size={20} color="var(--color-accent-foreground)" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{content?.targetSkill || 'UI/UX Design'}</p>
                    <p className="text-sm text-muted-foreground caption">Intermediate Level</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button variant="default" onClick={() => console.log('Exchange requested')} className="flex-1">
                Send Request
              </Button>
            </div>
          </div>
        );

      case 'user-profile':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                <Icon name="User" size={48} color="var(--color-primary-foreground)" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-foreground mb-2">
                {content?.userName || 'Sarah Chen'}
              </h3>
              <p className="text-muted-foreground">{content?.userTitle || 'Full Stack Developer'}</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Icon name="MapPin" size={16} color="var(--color-muted-foreground)" />
                <span className="text-sm text-muted-foreground caption">
                  {content?.location || 'San Francisco, CA'}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground caption mb-3">Skills to Share</h4>
                <div className="flex flex-wrap gap-2">
                  {(content?.skills || ['React', 'Node.js', 'TypeScript', 'GraphQL'])?.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-secondary rounded-full text-sm font-medium text-secondary-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground caption mb-3">Looking to Learn</h4>
                <div className="flex flex-wrap gap-2">
                  {(content?.learningGoals || ['UI Design', 'Motion Graphics', 'Figma'])?.map((goal, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-accent rounded-full text-sm font-medium text-accent-foreground"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-muted rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">SkillCoins Balance</span>
                  <span className="font-mono font-semibold text-lg text-secondary-foreground data-text">
                    {content?.skillCoins || 1250}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Exchanges Completed</span>
                  <span className="font-semibold text-success-foreground">{content?.exchangesCompleted || 24}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
              <Button variant="default" onClick={() => console.log('Connect clicked')} className="flex-1">
                Connect
              </Button>
            </div>
          </div>
        );

      case 'community-post':
        return (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Icon name="User" size={24} color="var(--color-primary-foreground)" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-foreground">{content?.author || 'Michael Torres'}</p>
                  <span className="text-sm text-muted-foreground caption">2 hours ago</span>
                </div>
                <p className="text-sm text-muted-foreground caption">{content?.authorTitle || 'Product Designer'}</p>
              </div>
            </div>
            <div>
              <p className="text-foreground leading-relaxed">
                {content?.postContent || 'Just completed an amazing exchange learning React hooks! The community here is incredible. Looking forward to sharing my design knowledge next.'}
              </p>
            </div>
            <div className="flex items-center gap-6 py-4 border-t border-b border-border">
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth">
                <Icon name="Heart" size={20} />
                <span className="text-sm font-medium">{content?.likes || 24}</span>
              </button>
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth">
                <Icon name="MessageCircle" size={20} />
                <span className="text-sm font-medium">{content?.comments || 8}</span>
              </button>
              <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth">
                <Icon name="Share2" size={20} />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Comments</h4>
              {(content?.commentsList || [
                { author: 'Emma Wilson', text: 'Congrats! React hooks are game-changers!', time: '1 hour ago' },
                { author: 'David Kim', text: 'Would love to learn from you!', time: '45 minutes ago' },
              ])?.map((comment, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                    <Icon name="User" size={16} color="var(--color-accent-foreground)" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-foreground">{comment?.author}</p>
                      <span className="text-xs text-muted-foreground caption">{comment?.time}</span>
                    </div>
                    <p className="text-sm text-foreground">{comment?.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={onClose} fullWidth>
              Close
            </Button>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-heading font-semibold text-foreground">
              {content?.title || 'Modal Content'}
            </h3>
            <p className="text-foreground">{content?.description || 'Content goes here'}</p>
            <Button variant="outline" onClick={onClose} fullWidth>
              Close
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-card rounded-3xl shadow-warm-xl overflow-hidden animate-scale-in">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-muted hover:bg-border flex items-center justify-center transition-smooth focus-ring-lavender"
            aria-label="Close modal"
          >
            <Icon name="X" size={20} color="var(--color-foreground)" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[90vh] scrollbar-warm">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ContextualModal;