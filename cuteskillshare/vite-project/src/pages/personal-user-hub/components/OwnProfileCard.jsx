import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProgressBar = ({ width = 80, label = '' }) => (
  <div className="flex flex-col gap-1">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: `${width}%` }}></div>
    </div>
  </div>
);

const OwnProfileCard = ({
  profileImage,
  fullName = 'John Doe',
  title = 'Full Stack Developer',
  company = 'Tech Corp',
  location = 'San Francisco, USA',
  website = 'johndoe.com',
  joinedDate = 'Joined 25 Jun 2025',
  about = 'Passionate about learning and sharing knowledge. Building amazing products and experiences.',
  stats = {
    coursesEnrolled: 12,
    coursesCompleted: 8,
    coursesInProgress: 4,
    totalLearningHours: 156,
  },
  skills = ['React', 'Node.js', 'TypeScript', 'Tailwind CSS', 'MongoDB'],
  interests = ['AI', 'Web Development', 'UI/UX', 'DevOps', 'Open Source'],
  onEditProfile,
  onShareProfile,
}) => {
  return (
    <div className="w-full space-y-6">
      {/* Main Profile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Sidebar - Profile Card & Social Links */}
        <div className="space-y-4">
          {/* Profile Card */}
          <div className="bg-card rounded-2xl shadow-warm-lg border border-border/50 overflow-hidden p-6 text-center">
            {/* Profile Image */}
            <div className="relative group mb-4 flex justify-center">
              <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-warm-lg ring-4 ring-card overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <Icon name="User" size={80} color="var(--color-primary-foreground)" />
                )}
              </div>
              {/* Edit overlay */}
              <button
                onClick={() => console.log('Edit profile image')}
                className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-primary shadow-warm-md flex items-center justify-center text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity border-2 border-card"
                title="Edit profile image"
              >
                <Icon name="Camera" size={18} color="currentColor" />
              </button>
            </div>

            {/* Name & Title */}
            <h1 className="text-2xl font-heading font-bold text-foreground mb-2">{fullName}</h1>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            {location && <p className="text-sm text-muted-foreground mb-4">{location}</p>}

            {/* Action Buttons */}
            <div className="flex gap-3 flex-col sm:flex-row">
              <Button
                onClick={onEditProfile}
                variant="default"
                size="sm"
                className="flex-1"
              >
                Follow
              </Button>
              <Button
                onClick={onShareProfile}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Message
              </Button>
            </div>
          </div>

          {/* Social Links Card */}
          <div className="bg-card rounded-2xl shadow-warm-lg border border-border/50 overflow-hidden">
            <div className="divide-y divide-border/30">
              {/* Website */}
              {website && (
                <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <Icon name="Globe" size={20} color="var(--color-warning)" />
                  <p className="text-sm text-foreground truncate">{website}</p>
                </div>
              )}

              {/* GitHub */}
              <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <Icon name="Github" size={20} color="#333333" />
                <p className="text-sm text-foreground">github</p>
              </div>

              {/* Twitter */}
              <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <Icon name="Twitter" size={20} color="#55acee" />
                <p className="text-sm text-foreground">@username</p>
              </div>

              {/* LinkedIn */}
              <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <Icon name="Linkedin" size={20} color="#0A66C2" />
                <p className="text-sm text-foreground">linkedin</p>
              </div>

              {/* Email */}
              <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <Icon name="Mail" size={20} color="var(--color-primary)" />
                <p className="text-sm text-foreground truncate">{fullName.toLowerCase().replace(/\s/g, '')}@email.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Content - User Details & Progress */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* User Details Card */}
          <div className="bg-card rounded-2xl shadow-warm-lg border border-border/50 p-6">
            {/* Full Name */}
            <div className="flex mb-6 pb-6 border-b border-border/30">
              <div className="w-1/3">
                <p className="text-sm font-semibold text-foreground">Full Name</p>
              </div>
              <div className="w-2/3">
                <p className="text-sm text-muted-foreground">{fullName}</p>
              </div>
            </div>

            {/* Title */}
            <div className="flex mb-6 pb-6 border-b border-border/30">
              <div className="w-1/3">
                <p className="text-sm font-semibold text-foreground">Title</p>
              </div>
              <div className="w-2/3">
                <p className="text-sm text-muted-foreground">{title}</p>
              </div>
            </div>

            {/* Company */}
            {company && (
              <div className="flex mb-6 pb-6 border-b border-border/30">
                <div className="w-1/3">
                  <p className="text-sm font-semibold text-foreground">Company</p>
                </div>
                <div className="w-2/3">
                  <p className="text-sm text-muted-foreground">{company}</p>
                </div>
              </div>
            )}

            {/* Location */}
            {location && (
              <div className="flex mb-6 pb-6 border-b border-border/30">
                <div className="w-1/3">
                  <p className="text-sm font-semibold text-foreground">Location</p>
                </div>
                <div className="w-2/3">
                  <p className="text-sm text-muted-foreground">{location}</p>
                </div>
              </div>
            )}

            {/* Website */}
            {website && (
              <div className="flex mb-6 pb-6 border-b border-border/30">
                <div className="w-1/3">
                  <p className="text-sm font-semibold text-foreground">Website</p>
                </div>
                <div className="w-2/3">
                  <p className="text-sm text-muted-foreground">{website}</p>
                </div>
              </div>
            )}

            {/* Joined Date */}
            {joinedDate && (
              <div className="flex">
                <div className="w-1/3">
                  <p className="text-sm font-semibold text-foreground">Joined</p>
                </div>
                <div className="w-2/3">
                  <p className="text-sm text-muted-foreground">{joinedDate}</p>
                </div>
              </div>
            )}
          </div>

          {/* Progress Cards - Two Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Learning Progress Card */}
            <div className="bg-card rounded-2xl shadow-warm-lg border border-border/50 p-6">
              <h3 className="text-sm font-semibold text-foreground mb-6">
                <span className="text-primary italic mr-2">📚</span>Learning Progress
              </h3>
              <div className="space-y-4">
                <ProgressBar width={Math.round((stats.coursesCompleted / stats.coursesEnrolled) * 100)} label="Courses Completed" />
                <ProgressBar width={75} label="Frontend Skills" />
                <ProgressBar width={85} label="Backend Skills" />
                <ProgressBar width={60} label="DevOps & Tools" />
                <ProgressBar width={70} label="Projects Completed" />
              </div>
            </div>

            {/* Skills Progress Card */}
            <div className="bg-card rounded-2xl shadow-warm-lg border border-border/50 p-6">
              <h3 className="text-sm font-semibold text-foreground mb-6">
                <span className="text-accent italic mr-2">⭐</span>Skills Progress
              </h3>
              <div className="space-y-4">
                <ProgressBar width={90} label="React" />
                <ProgressBar width={85} label="Node.js" />
                <ProgressBar width={88} label="TypeScript" />
                <ProgressBar width={82} label="CSS/Tailwind" />
                <ProgressBar width={75} label="Databases" />
              </div>
            </div>
          </div>

          {/* About Section */}
          {about && (
            <div className="bg-card rounded-2xl shadow-warm-lg border border-border/50 p-6">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{about}</p>
            </div>
          )}

          {/* Skills & Interests Section */}
          <div className="space-y-6">
            {/* Skills */}
            {skills && skills.length > 0 && (
              <div className="bg-card rounded-2xl shadow-warm-lg border border-border/50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="Sparkles" size={18} color="var(--color-primary)" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-primary/15 text-primary rounded-full text-sm font-medium hover:bg-primary/25 transition-colors cursor-pointer"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {interests && interests.length > 0 && (
              <div className="bg-card rounded-2xl shadow-warm-lg border border-border/50 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="Heart" size={18} color="var(--color-accent)" />
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Interests</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {interests.map((interest, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-secondary/15 text-secondary rounded-full text-sm font-medium hover:bg-secondary/25 transition-colors cursor-pointer"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnProfileCard;
