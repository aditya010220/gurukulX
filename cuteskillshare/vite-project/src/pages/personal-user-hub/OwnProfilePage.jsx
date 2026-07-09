import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import OwnProfileCard from './components/OwnProfileCard';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const OwnProfilePage = () => {
  const convexUser = useQuery(api.users.getCurrent);
  const updateProfile = useMutation(api.users.updateProfile);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    location: '',
    skills: '',
    learningGoals: '',
    github: '',
    linkedin: '',
    twitter: '',
  });

  const [saving, setSaving] = useState(false);

  // Initialize form data when user is loaded or modal is opened
  const handleOpenEdit = () => {
    if (convexUser) {
      setFormData({
        name: convexUser.name || '',
        title: convexUser.title || '',
        location: convexUser.location || '',
        skills: (convexUser.skills || []).join(', '),
        learningGoals: (convexUser.learningGoals || []).join(', '),
        github: convexUser.github || '',
        linkedin: convexUser.linkedin || '',
        twitter: convexUser.twitter || '',
      });
      setIsEditModalOpen(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Parse comma-separated skills/goals into array of trimmed strings
      const skillsArray = formData.skills
        ? formData.skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];
      const learningGoalsArray = formData.learningGoals
        ? formData.learningGoals.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      await updateProfile({
        name: formData.name,
        title: formData.title,
        location: formData.location,
        skills: skillsArray,
        learningGoals: learningGoalsArray,
        github: formData.github,
        linkedin: formData.linkedin,
        twitter: formData.twitter,
      });

      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!convexUser) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto relative">
      <OwnProfileCard
        bannerImage={convexUser.bannerImage}
        profileImage={convexUser.avatar}
        fullName={convexUser.name || 'User'}
        title={convexUser.title || 'Learning Enthusiast'}
        company={convexUser.company || ''}
        location={convexUser.location || ''}
        website={convexUser.website || ''}
        joinedDate={`Joined ${new Date(convexUser._creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`}
        about={convexUser.learningGoals?.[0] ? `Looking to learn: ${convexUser.learningGoals.join(', ')}` : 'Passionate about learning and sharing knowledge'}
        stats={{
          coursesEnrolled: 12,
          coursesCompleted: 8,
          coursesInProgress: 4,
          totalLearningHours: 156,
        }}
        github={convexUser.github || ''}
        linkedin={convexUser.linkedin || ''}
        twitter={convexUser.twitter || ''}
        skills={convexUser.skills || []}
        interests={convexUser.learningGoals || []}
        onEditProfile={handleOpenEdit}
        onShareProfile={() => alert('Share profile link copied to clipboard!')}
      />

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-background/85 backdrop-blur-sm"
            onClick={() => setIsEditModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-card rounded-3xl border border-border shadow-warm-xl overflow-hidden animate-scale-in p-6 md:p-8">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-muted hover:bg-border flex items-center justify-center transition-smooth"
              aria-label="Close"
            >
              <Icon name="X" size={20} />
            </button>

            <h3 className="text-xl md:text-2xl font-heading font-semibold text-foreground mb-6 flex items-center gap-2">
              <Icon name="User" className="text-primary" />
              Edit Profile Details
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  label="Full Name"
                  id="name"
                  name="name"
                  required
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Input
                  label="Title"
                  id="title"
                  name="title"
                  placeholder="e.g. Full Stack Developer, Student"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Input
                  label="Location"
                  id="location"
                  name="location"
                  placeholder="e.g. San Francisco, CA"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Input
                  label="GitHub Username"
                  id="github"
                  name="github"
                  placeholder="e.g. github_username"
                  value={formData.github}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Input
                  label="LinkedIn Profile"
                  id="linkedin"
                  name="linkedin"
                  placeholder="e.g. linkedin_username"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Input
                  label="Twitter / X handle"
                  id="twitter"
                  name="twitter"
                  placeholder="e.g. twitter_username"
                  value={formData.twitter}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-border mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnProfilePage;
