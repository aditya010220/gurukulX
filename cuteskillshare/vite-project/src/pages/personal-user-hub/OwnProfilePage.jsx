import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import OwnProfileCard from './components/OwnProfileCard';

const OwnProfilePage = ({ onEditProfile, onShareProfile }) => {
  const convexUser = useQuery(api.users.getCurrent);

  if (!convexUser) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <OwnProfileCard
        bannerImage={convexUser.bannerImage}
        profileImage={convexUser.avatar}
        fullName={convexUser.name || 'User'}
        title={convexUser.title || 'Learning Enthusiast'}
        company={convexUser.company || ''}
        location={convexUser.location || ''}
        website={convexUser.website || ''}
        joinedDate={`Joined ${new Date(convexUser._creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`}
        about={convexUser.learningGoals?.[0] || 'Passionate about learning and sharing knowledge'}
        stats={{
          coursesEnrolled: 12,
          coursesCompleted: 8,
          coursesInProgress: 4,
          totalLearningHours: 156,
        }}
        skills={convexUser.skills || ['React', 'Node.js', 'TypeScript']}
        interests={convexUser.learningGoals || ['Web Development', 'AI', 'DevOps']}
        onEditProfile={onEditProfile}
        onShareProfile={onShareProfile}
      />
    </div>
  );
};

export default OwnProfilePage;
