import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';


const CommunityFeedCard = ({ post, onLike, onComment, onShare }) => {
  const [isLiked, setIsLiked] = React.useState(post?.isLiked || false);
  const [likeCount, setLikeCount] = React.useState(post?.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    if (onLike) onLike(post);
  };

  return (
    <div className="bg-card rounded-3xl p-4 md:p-6 shadow-warm hover-lift transition-smooth">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
          <Image
            src={post?.authorAvatar}
            alt={post?.authorAvatarAlt}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-heading font-semibold text-sm md:text-base text-foreground truncate">
              {post?.authorName}
            </h3>
            {post?.isVerified && (
              <Icon name="BadgeCheck" size={16} color="var(--color-primary)" />
            )}
          </div>
          <p className="text-xs md:text-sm text-muted-foreground caption">{post?.timeAgo}</p>
        </div>
      </div>
      <p className="text-sm md:text-base text-foreground leading-relaxed mb-4">
        {post?.content}
      </p>
      {post?.achievement && (
        <div className="flex items-center gap-3 p-3 md:p-4 bg-success/10 rounded-2xl mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-success flex items-center justify-center flex-shrink-0">
            <Icon name="Trophy" size={24} color="var(--color-success-foreground)" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-success-foreground mb-1">
              Achievement Unlocked!
            </p>
            <p className="text-sm md:text-base font-semibold text-foreground truncate">
              {post?.achievement}
            </p>
          </div>
        </div>
      )}
      {post?.skillTags && post?.skillTags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post?.skillTags?.map((tag, index) => (
            <span
              key={index}
              className="px-2 md:px-3 py-1 bg-secondary rounded-full text-xs md:text-sm font-medium text-secondary-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center gap-4 md:gap-6 pt-4 border-t border-border">
        <button
          onClick={handleLike}
          className="flex items-center gap-2 text-muted-foreground hover:text-error transition-smooth press-scale"
        >
          <Icon
            name={isLiked ? 'Heart' : 'Heart'}
            size={20}
            color={isLiked ? 'var(--color-error)' : 'currentColor'}
            className={isLiked ? 'fill-current' : ''}
          />
          <span className="text-xs md:text-sm font-medium data-text">{likeCount}</span>
        </button>

        <button
          onClick={() => onComment && onComment(post)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth press-scale"
        >
          <Icon name="MessageCircle" size={20} />
          <span className="text-xs md:text-sm font-medium data-text">{post?.comments}</span>
        </button>

        <button
          onClick={() => onShare && onShare(post)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-smooth press-scale"
        >
          <Icon name="Share2" size={20} />
          <span className="text-xs md:text-sm font-medium">Share</span>
        </button>
      </div>
    </div>
  );
};

export default CommunityFeedCard;