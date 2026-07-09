import React, { useEffect, useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const ShareModalContent = ({ userId, referralStats, onClose }) => {
  const [copied, setCopied] = useState(false);

  const referralLink = userId
    ? `${window.location.origin}/?ref=${userId}`
    : `${window.location.origin}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SkillGarden - Peer-to-Peer Skill Exchange',
          text: 'Join me on SkillGarden to share and learn skills! Use my link to get a welcome bonus of 100 SkillCoins.',
          url: referralLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary">
          <Icon name="Share2" size={32} />
        </div>
        <h3 className="text-2xl font-heading font-semibold text-foreground mb-2">
          Invite Friends, Earn SkillCoins!
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Share your referral link with friends. When they register, you will instantly earn <span className="font-semibold text-foreground">50 SkillCoins</span> and they will get a <span className="font-semibold text-foreground">100 SkillCoins</span> welcome bonus!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-2xl">
        <div className="text-center py-2 border-r border-border">
          <p className="text-2xl font-bold font-mono text-primary">
            {referralStats?.referralCount || 0}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Friends Referred</p>
        </div>
        <div className="text-center py-2">
          <div className="flex items-center justify-center gap-1">
            <Icon name="Coins" size={18} color="var(--color-secondary-foreground)" />
            <span className="text-2xl font-bold font-mono text-secondary-foreground">
              {referralStats?.totalEarned || 0}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Coins Earned</p>
        </div>
      </div>

      {/* Link Input & Buttons */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground block">
          Your Referral Link
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="flex-1 bg-muted border border-border rounded-xl px-3 py-2 text-sm text-muted-foreground select-all focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Button
            variant={copied ? "success" : "default"}
            size="sm"
            onClick={handleCopy}
            className="px-4 whitespace-nowrap min-w-[90px]"
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* Native share button if supported */}
      {navigator.share && (
        <Button variant="outline" fullWidth onClick={handleShare} iconName="Share" iconPosition="left">
          Share link via...
        </Button>
      )}

      {/* Referral History */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Referral History</h4>
        {referralStats?.history && referralStats.history.length > 0 ? (
          <div className="max-h-40 overflow-y-auto space-y-2 pr-1 scrollbar-warm">
            {referralStats.history.map((ref) => (
              <div key={ref.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-xl text-sm border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
                    {ref.name ? ref.name.slice(0, 2).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{ref.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 font-mono font-semibold text-success-foreground">
                  + {ref.amount} <Icon name="Coins" size={14} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-muted/30 border border-dashed border-border rounded-2xl">
            <p className="text-sm text-muted-foreground">No referrals yet. Start sharing your link to earn coins!</p>
          </div>
        )}
      </div>

      <div className="pt-2">
        <Button variant="outline" onClick={onClose} fullWidth>
          Close
        </Button>
      </div>
    </div>
  );
};

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
        ); case 'exchange-details':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-border">
              <img
                src={content?.partnerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}
                alt={content?.partnerAvatarAlt || "Partner avatar"}
                className="w-16 h-16 rounded-2xl object-cover shadow-sm"
              />
              <div>
                <h3 className="text-xl font-heading font-semibold text-foreground mb-1">
                  {content?.partnerName || 'Exchange Partner'}
                </h3>
                <p className="text-sm text-muted-foreground">{content?.partnerTitle || 'Community Member'}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-2xl">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">What you are teaching</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Icon name="BookOpen" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{content?.teachingSkill || 'React Development'}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted rounded-2xl">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">What you are learning</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary-foreground">
                    <Icon name="BookOpen" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{content?.learningSkill || 'UI/UX Design'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-2xl">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Session Progress</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent-foreground">
                      <Icon name="Calendar" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {content?.completedSessions ?? 0} / {content?.totalSessions ?? 10}
                      </p>
                      <p className="text-xs text-muted-foreground">Sessions Completed</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-2xl">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Next Session Date</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center text-success-foreground">
                      <Icon name="Clock" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {content?.nextSession || 'Not scheduled'}
                      </p>
                      <p className="text-xs text-muted-foreground">Scheduled Time</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Close
              </Button>
              <Button variant="default" onClick={() => { onClose(); console.log('Message partner'); }} className="flex-1">
                Message Partner
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

      case 'share':
        return (
          <ShareModalContent
            userId={content?.userId}
            referralStats={content?.referralStats}
            onClose={onClose}
          />
        );

      case 'purchase-confirm':
        return (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto text-secondary-foreground">
              <Icon name="ShoppingCart" size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-heading font-semibold text-foreground mb-2">
                Confirm Purchase
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Are you sure you want to purchase <span className="font-semibold text-foreground">"{content?.title}"</span>?
              </p>
            </div>

            <div className="p-4 bg-muted rounded-2xl max-w-sm mx-auto flex items-center justify-between border border-border">
              <span className="text-sm font-medium text-foreground">Price</span>
              <div className="flex items-center gap-1">
                <Icon name="Coins" size={18} color="var(--color-secondary-foreground)" />
                <span className="text-xl font-bold font-mono text-foreground">{content?.price}</span>
                <span className="text-xs text-muted-foreground">coins</span>
              </div>
            </div>

            {content?.userBalance !== undefined && (
              <div className="text-xs text-muted-foreground">
                Your Balance: <span className="font-mono">{content.userBalance}</span> coins
                {content.userBalance < content.price && (
                  <p className="text-error mt-1 font-semibold">Insufficient SkillCoins balance.</p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={onClose} className="flex-1" disabled={content?.isProcessing}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={content?.onConfirm}
                className="flex-1"
                disabled={content?.isProcessing || (content?.userBalance !== undefined && content.userBalance < content.price)}
              >
                {content?.isProcessing ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'Pay with SkillCoins'
                )}
              </Button>
            </div>
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